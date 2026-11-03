'use server'

import { randomUUID } from 'node:crypto'
import { headers } from 'next/headers'

import { sendEmail, strategyCallListId, upsertContact, type SyncResult } from '@/lib/brevo'
import { calendarConfigured, createEvent, type CreatedEvent } from '@/lib/google-calendar'
import { payload } from '@/lib/payload'
import { assess, formTokenAge, issueFormToken, SPAM_THRESHOLD } from '@/lib/spam'
import { CALL_RULES, getAvailability, isRuleSlot, ruleSlots, slotIsFree } from '@/lib/strategy-call'
import {
  strategyCallSchema,
  type Availability,
  type BookingResult,
  type StrategyCallInput,
} from '@/lib/strategy-call-schema'

/**
 * Open slots, plus a fresh form token.
 *
 * The token is issued here rather than baked into the page, because the page
 * is cached: a token minted at render time would be hours old by the time an
 * ad visitor opened the dialog, and the timing check would mean nothing.
 */
export async function loadAvailability(): Promise<Availability & { token: string; error?: string }> {
  const token = issueFormToken()
  try {
    return { ...(await getAvailability()), token }
  } catch (err) {
    // The database is the one thing the picker cannot work without. Show
    // nothing bookable rather than slots that might already be taken.
    console.error('[strategy-call] availability failed', err)
    return {
      token,
      timeZone: CALL_RULES.timeZone,
      days: ruleSlots().map((d) => ({ date: d.date, slots: [] })),
      error: 'We could not load the calendar. Please try again in a moment.',
    }
  }
}

const escape = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const row = (label: string, value?: unknown) =>
  value
    ? `<tr><td style="padding:6px 16px 6px 0;color:#514c45;vertical-align:top;white-space:nowrap">${escape(
        label
      )}</td><td style="padding:6px 0">${escape(value).replace(/\n/g, '<br>')}</td></tr>`
    : ''

/** "Wednesday, 5 November · 11:45 am IST" */
const when = (iso: string) =>
  `${new Intl.DateTimeFormat('en-IN', {
    timeZone: CALL_RULES.timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(iso))} · ${new Intl.DateTimeFormat('en-IN', {
    timeZone: CALL_RULES.timeZone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))} IST`

/**
 * Book a call.
 *
 * Same order as the quote form, for the same reason: the lead is written to
 * our database before anything external is attempted, so a Google or Brevo
 * failure can cost a calendar invite or a CRM row but never the lead. If the
 * calendar write fails, the slot is still held on the site and the lead is
 * marked "Needs confirming" so someone follows up by hand.
 */
export async function bookStrategyCall(raw: StrategyCallInput, formToken?: string): Promise<BookingResult> {
  const parsed = strategyCallSchema.safeParse(raw)
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.')
      if (key && !fields[key]) fields[key] = issue.message
    }
    return { ok: false, error: 'Some details need another look.', fields }
  }
  const data = parsed.data

  const slot = isRuleSlot(data.slot)
  if (!slot) {
    return { ok: false, slotTaken: true, error: 'That time is no longer available. Please pick another.' }
  }

  // Honeypot: look successful, store nothing.
  if (data.website2) return { ok: true, confirmed: false, ...slot }

  const verdict = assess({
    name: data.name,
    company: data.business,
    businessDescription: data.info || '',
    projectGoals: '',
    tokenAge: formTokenAge(formToken),
  })
  if (verdict.certain) return { ok: true, confirmed: false, ...slot }
  const isSpam = verdict.score >= SPAM_THRESHOLD

  let free: Awaited<ReturnType<typeof slotIsFree>>
  try {
    free = await slotIsFree(slot)
  } catch (err) {
    console.error('[strategy-call] slot check failed', err)
    return { ok: false, error: 'We could not check that time just now. Please try again.' }
  }
  if (!free.free) {
    return {
      ok: false,
      slotTaken: true,
      error: 'Someone just booked that time. Please pick another slot.',
    }
  }

  const head = await headers()
  const p = await payload()

  let leadId: number | string
  try {
    const lead = await p.create({
      collection: 'leads',
      overrideAccess: true,
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.business,
        message: data.info || undefined,
        source: 'strategy-call',
        status: isSpam ? 'spam' : 'new',
        booking: {
          start: slot.start,
          end: slot.end,
          // A flagged lead must not hold a slot a real person could take.
          status: isSpam ? 'cancelled' : 'requested',
        },
        brevo: { status: 'pending' },
        meta: {
          page: head.get('referer') || '/free-strategy-call',
          userAgent: head.get('user-agent') || undefined,
          spamScore: verdict.score,
          spamReasons: verdict.reasons.join('\n') || undefined,
        },
      },
    })
    leadId = lead.id
  } catch (err) {
    console.error('[strategy-call] database write failed', err)
    return {
      ok: false,
      error: 'We could not save that. Please email team@redendron.com and we will book you in directly.',
    }
  }

  // Filed as spam: no calendar event, no CRM contact, no email. It is in the
  // admin panel to be reclassified if the filter got it wrong.
  if (isSpam) {
    console.warn(`[strategy-call] ${leadId} filed as spam (${verdict.score}): ${verdict.reasons.join('; ')}`)
    return { ok: true, confirmed: false, ...slot }
  }

  // ---------------------------------------------------------- calendar --
  let event: CreatedEvent | null = null
  let calendarError: string | undefined
  if (calendarConfigured()) {
    try {
      event = await createEvent({
        start: slot.start,
        end: slot.end,
        timeZone: CALL_RULES.timeZone,
        summary: `Free strategy call — ${data.name} (${data.business})`,
        description: [
          'Booked from redendron.com/free-strategy-call',
          '',
          `Name: ${data.name}`,
          `Business: ${data.business}`,
          `Email: ${data.email}`,
          `Phone: ${data.phone}`,
          data.info ? `\nAdditional info:\n${data.info}` : '',
        ].join('\n'),
        attendee: { email: data.email, name: data.name },
        requestId: randomUUID(),
      })
    } catch (err) {
      calendarError = err instanceof Error ? err.message : String(err)
      console.error('[strategy-call] calendar write failed', calendarError)
    }
  } else {
    calendarError = 'Google Calendar is not configured'
  }

  try {
    await p.update({
      collection: 'leads',
      id: leadId,
      overrideAccess: true,
      data: {
        booking: {
          start: slot.start,
          end: slot.end,
          status: event ? 'booked' : 'requested',
          calendarEventId: event?.id,
          calendarLink: event?.htmlLink,
          meetLink: event?.meetLink,
          error: calendarError,
        },
      },
    })
  } catch (err) {
    console.error('[strategy-call] could not record the calendar result', err)
  }

  // ----------------------------------------------------- brevo + email --
  const slotText = when(slot.start)

  let listId: number | undefined
  let listResult: SyncResult = { status: 'skipped', reason: 'BREVO_API_KEY is not set' }
  if (process.env.BREVO_API_KEY?.trim()) {
    try {
      listId = await strategyCallListId()
      listResult = { status: 'synced' }
    } catch (err) {
      listResult = { status: 'failed', error: err instanceof Error ? err.message : String(err) }
    }
  }

  const [contact, notify, ack] = await Promise.all([
    upsertContact({
      email: data.email,
      name: data.name,
      phone: data.phone,
      company: data.business,
      source: 'Free strategy call',
      lists: listId ? [listId] : undefined,
    }),
    sendEmail({
      to: [{ email: process.env.LEAD_NOTIFY_EMAIL || 'team@redendron.com' }],
      subject: `${event ? 'Strategy call booked' : 'Strategy call — CONFIRM BY HAND'} — ${data.name} (${data.business})`,
      replyTo: { email: data.email, name: data.name },
      html: `
        <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#0b0a08">
          <p style="margin:0 0 8px"><strong>${escape(data.name)}</strong> booked a free strategy call.</p>
          <p style="margin:0 0 20px;font-size:16px"><strong>${escape(slotText)}</strong></p>
          ${
            event
              ? `<p style="margin:0 0 20px">It is on the calendar${event.invited ? ' and they have the invite' : ''}.${
                  event.meetLink ? ` Meet: <a href="${escape(event.meetLink)}">${escape(event.meetLink)}</a>` : ''
                }</p>`
              : `<p style="margin:0 0 20px;color:#81120f"><strong>Not on the calendar</strong> (${escape(
                  calendarError
                )}). The slot is held on the site - add the event and send the invite yourself.</p>`
          }
          <table style="border-collapse:collapse">
            ${row('Email', data.email)}
            ${row('Phone', data.phone)}
            ${row('Business', data.business)}
            ${row('Additional info', data.info)}
          </table>
        </div>`,
    }),
    sendEmail({
      to: [{ email: data.email, name: data.name }],
      subject: `Your free strategy call — ${slotText}`,
      html: `
        <div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#0b0a08">
          <p>Hi ${escape(data.name.split(' ')[0])},</p>
          <p>You are booked in for a free 45-minute strategy call with Redendron Media:</p>
          <p style="font-size:17px"><strong>${escape(slotText)}</strong></p>
          ${
            event?.meetLink
              ? `<p>Join on Google Meet: <a href="${escape(event.meetLink)}">${escape(event.meetLink)}</a><br>
                 A calendar invite is on its way too.</p>`
              : `<p>We will send the meeting link shortly.</p>`
          }
          <p>Before the call we look at ${escape(data.business)} the way a customer would - your site,
             your socials, and the competitors you are up against - so the time goes on what to
             change, not on introductions. If there is anything we should see first, just reply.</p>
          <p>Need a different time? Reply to this email and we will move it.</p>
          <p style="margin-top:28px">— Redendron Media</p>
        </div>`,
    }),
  ])

  await recordSync(leadId, listResult, contact, notify, ack)

  return { ok: true, confirmed: Boolean(event), ...slot, meetLink: event?.meetLink }
}

async function recordSync(id: number | string, ...results: SyncResult[]) {
  const labels = ['list', 'contact', 'notification', 'confirmation']
  const problems = results
    .map((r, i) => (r.status === 'failed' ? `${labels[i]}: ${r.error}` : null))
    .filter(Boolean)
  const status = problems.length ? 'failed' : results[1].status === 'skipped' ? 'skipped' : 'synced'
  try {
    const p = await payload()
    await p.update({
      collection: 'leads',
      id,
      overrideAccess: true,
      data: {
        brevo: {
          status,
          syncedAt: status === 'synced' ? new Date().toISOString() : undefined,
          error: problems.join('\n') || undefined,
        },
      },
    })
  } catch (err) {
    console.error('[strategy-call] could not record sync state', err)
  }
  if (problems.length) console.error('[strategy-call] brevo problems', problems)
}
