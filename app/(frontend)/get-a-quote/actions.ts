'use server'

import { headers } from 'next/headers'

import { sendEmail, upsertContact, type SyncResult } from '@/lib/brevo'
import { leadSchema, type LeadInput } from '@/lib/lead-schema'
import { payload } from '@/lib/payload'

export type SubmitResult =
  | { ok: true }
  | { ok: false; error: string; fields?: Record<string, string> }

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

/**
 * Submit an enquiry.
 *
 * Order matters and is the whole point: the lead is written to our own
 * database first and the response is decided by that write alone. Brevo sync
 * and the notification email happen afterwards and can fail without the
 * visitor ever seeing an error - their enquiry is already safe, and the
 * failure is recorded on the lead so it can be retried rather than lost.
 *
 * The old route did the opposite. It posted straight to Brevo, stored nothing,
 * and returned a 500 when Brevo was unhappy, so an outage silently dropped
 * enquiries.
 */
export async function submitLead(raw: LeadInput): Promise<SubmitResult> {
  const parsed = leadSchema.safeParse(raw)
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.')
      if (key && !fields[key]) fields[key] = issue.message
    }
    return { ok: false, error: 'Some answers need another look.', fields }
  }

  const data = parsed.data

  // Honeypot: silently accept so a bot learns nothing, but store nothing.
  if (data.website2) return { ok: true }

  const head = await headers()
  const referral = [
    ...data.referral.filter((r) => r !== 'Other'),
    ...(data.referral.includes('Other') && data.referralOther ? [data.referralOther] : []),
  ]

  let leadId: string | number
  try {
    const p = await payload()
    const lead = await p.create({
      collection: 'leads',
      // The collection is admins-only by design; public submissions come
      // through here rather than by opening up create access.
      overrideAccess: true,
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        company: data.company || undefined,
        website: data.website || undefined,
        source: 'quote',
        status: 'new',
        budget: data.budget,
        timeline: data.timeline,
        businessDescription: data.businessDescription,
        projectGoals: data.projectGoals,
        services: data.services,
        referral,
        brevo: { status: 'pending' },
        meta: {
          page: head.get('referer') || '/get-a-quote',
          userAgent: head.get('user-agent') || undefined,
        },
      },
    })
    leadId = lead.id
  } catch (err) {
    console.error('[lead] database write failed', err)
    return {
      ok: false,
      error:
        'We could not save that. Please email team@redendron.com directly and we will pick it up.',
    }
  }

  // Everything past this point is best-effort.
  const summary = `
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#0b0a08">
      <p style="margin:0 0 20px"><strong>${escape(data.name)}</strong> sent a quote request.</p>
      <table style="border-collapse:collapse">
        ${row('Email', data.email)}
        ${row('Phone', data.phone)}
        ${row('Company', data.company)}
        ${row('Website', data.website)}
        ${row('Interested in', data.services.join(', '))}
        ${row('Budget', data.budget)}
        ${row('Timeline', data.timeline)}
        ${row('Heard via', referral.join(', '))}
        ${row('Business', data.businessDescription)}
        ${row('Goals', data.projectGoals)}
      </table>
    </div>`

  const [contact, notify, ack] = await Promise.all([
    upsertContact({
      email: data.email,
      name: data.name,
      phone: data.phone,
      company: data.company,
      budget: data.budget,
      services: data.services,
      source: 'Quote form',
    }),
    sendEmail({
      to: [{ email: process.env.LEAD_NOTIFY_EMAIL || 'team@redendron.com' }],
      subject: `Quote request — ${data.name}${data.company ? ` (${data.company})` : ''}`,
      html: summary,
      // So hitting reply in the inbox goes straight back to the enquirer.
      replyTo: { email: data.email, name: data.name },
    }),
    sendEmail({
      to: [{ email: data.email, name: data.name }],
      subject: 'We have your brief — Redendron Media',
      html: `
        <div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#0b0a08">
          <p>Hi ${escape(data.name.split(' ')[0])},</p>
          <p>Thanks — we have your brief and someone will read it properly rather than
             skim it. Expect a reply within one working day.</p>
          <p>If anything changed since you sent it, just reply to this email.</p>
          <p style="margin-top:28px">— Redendron Media</p>
        </div>`,
    }),
  ])

  await recordSync(leadId, contact, notify, ack)
  return { ok: true }
}

/**
 * Write back what actually happened, so a failed sync is visible in the admin
 * panel and retryable instead of a line in a log nobody reads.
 */
async function recordSync(
  id: string | number,
  contact: SyncResult,
  notify: SyncResult,
  ack: SyncResult
) {
  const problems = [
    contact.status === 'failed' ? `contact: ${contact.error}` : null,
    notify.status === 'failed' ? `notification: ${notify.error}` : null,
    ack.status === 'failed' ? `acknowledgement: ${ack.error}` : null,
  ].filter(Boolean)

  const status = problems.length
    ? 'failed'
    : contact.status === 'skipped'
      ? 'skipped'
      : 'synced'

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
    console.error('[lead] could not record sync state', err)
  }

  if (problems.length) console.error('[lead] brevo problems', problems)
}
