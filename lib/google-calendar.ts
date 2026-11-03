import 'server-only'

import { createSign } from 'node:crypto'

/**
 * Google Calendar over plain REST: free/busy for the slot picker, and event
 * creation for a booking. No googleapis dependency - two endpoints do not
 * justify a 100MB package.
 *
 * Two ways to authenticate, chosen by which variables are set:
 *
 *   OAuth (recommended): GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET,
 *   GOOGLE_OAUTH_REFRESH_TOKEN. Acts as the calendar's owner, so the lead is
 *   added as a guest, gets Google's own invite, and the event carries a Meet
 *   link. `node scripts/google-calendar-auth.mjs` produces the refresh token.
 *
 *   Service account: GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_KEY,
 *   with the calendar shared to that address ("Make changes to events"). A
 *   service account cannot invite guests or create Meet links unless it is
 *   granted domain-wide delegation and GOOGLE_CALENDAR_IMPERSONATE names the
 *   user to act as - without that, the event is created on the calendar and
 *   the lead is told about it by email instead.
 *
 * GOOGLE_CALENDAR_ID picks the calendar; it defaults to the authorising
 * user's primary calendar.
 */

const SCOPE = 'https://www.googleapis.com/auth/calendar'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const API = 'https://www.googleapis.com/calendar/v3'

type Mode =
  | { kind: 'oauth'; clientId: string; clientSecret: string; refreshToken: string }
  | { kind: 'service-account'; email: string; key: string; subject?: string }

function mode(): Mode | null {
  const env = process.env
  if (env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET && env.GOOGLE_OAUTH_REFRESH_TOKEN) {
    return {
      kind: 'oauth',
      clientId: env.GOOGLE_OAUTH_CLIENT_ID.trim(),
      clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET.trim(),
      refreshToken: env.GOOGLE_OAUTH_REFRESH_TOKEN.trim(),
    }
  }
  if (env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    return {
      kind: 'service-account',
      email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL.trim(),
      // Pasted into a dashboard, the key's newlines usually arrive as "\n".
      key: env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'),
      subject: env.GOOGLE_CALENDAR_IMPERSONATE?.trim() || undefined,
    }
  }
  return null
}

export const calendarConfigured = () => mode() !== null

/** Whether events can carry guests and a Meet link. */
const canInvite = (m: Mode) => m.kind === 'oauth' || Boolean(m.subject)

const calendarId = () => process.env.GOOGLE_CALENDAR_ID?.trim() || 'primary'

let cached: { token: string; expires: number } | null = null

const b64url = (input: string | Buffer) =>
  Buffer.from(input).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')

async function accessToken(m: Mode): Promise<string> {
  if (cached && cached.expires > Date.now() + 60_000) return cached.token

  let body: URLSearchParams
  if (m.kind === 'oauth') {
    body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: m.clientId,
      client_secret: m.clientSecret,
      refresh_token: m.refreshToken,
    })
  } else {
    const now = Math.floor(Date.now() / 1000)
    const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    const claims = b64url(
      JSON.stringify({
        iss: m.email,
        scope: SCOPE,
        aud: TOKEN_URL,
        iat: now,
        exp: now + 3600,
        ...(m.subject ? { sub: m.subject } : {}),
      })
    )
    const signer = createSign('RSA-SHA256')
    signer.update(`${header}.${claims}`)
    const signature = b64url(signer.sign(m.key))
    body = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claims}.${signature}`,
    })
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
    signal: AbortSignal.timeout(8000),
  })
  const json = (await res.json().catch(() => ({}))) as {
    access_token?: string
    expires_in?: number
    error?: string
    error_description?: string
  }
  if (!res.ok || !json.access_token) {
    throw new Error(`Google auth failed: ${json.error || res.status} ${json.error_description || ''}`.trim())
  }
  cached = { token: json.access_token, expires: Date.now() + (json.expires_in ?? 3600) * 1000 }
  return cached.token
}

async function google<T>(m: Mode, path: string, init: { method: string; body?: unknown }): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: init.method,
    headers: {
      authorization: `Bearer ${await accessToken(m)}`,
      'content-type': 'application/json',
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(10_000),
    cache: 'no-store',
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Google Calendar ${res.status}: ${text.slice(0, 400)}`)
  return (text ? JSON.parse(text) : {}) as T
}

export type Interval = { start: number; end: number }

/**
 * Busy time on the booking calendar between two instants. Anything on the
 * calendar counts - a booked call, a meeting typed in by hand, a block of
 * leave - which is what keeps the site in step with the calendar.
 */
export async function busyBetween(from: Date, to: Date): Promise<Interval[]> {
  const m = mode()
  if (!m) return []
  const id = calendarId()
  const json = await google<{
    calendars?: Record<string, { busy?: { start: string; end: string }[]; errors?: { reason: string }[] }>
  }>(m, '/freeBusy', {
    method: 'POST',
    body: { timeMin: from.toISOString(), timeMax: to.toISOString(), items: [{ id }] },
  })
  // The response is keyed by the resolved id, which for 'primary' is the
  // account's email - so take the only entry rather than looking it up.
  const entry = json.calendars?.[id] ?? Object.values(json.calendars ?? {})[0]
  if (entry?.errors?.length) {
    throw new Error(`Google Calendar free/busy: ${entry.errors.map((e) => e.reason).join(', ')}`)
  }
  return (entry?.busy ?? []).map((b) => ({ start: Date.parse(b.start), end: Date.parse(b.end) }))
}

export type CreatedEvent = { id: string; htmlLink?: string; meetLink?: string; invited: boolean }

export async function createEvent(input: {
  start: string
  end: string
  timeZone: string
  summary: string
  description: string
  attendee: { email: string; name: string }
  requestId: string
}): Promise<CreatedEvent> {
  const m = mode()
  if (!m) throw new Error('Google Calendar is not configured')
  const invite = canInvite(m)

  const query = new URLSearchParams({
    sendUpdates: invite ? 'all' : 'none',
    conferenceDataVersion: invite ? '1' : '0',
  })
  const event = await google<{
    id: string
    htmlLink?: string
    hangoutLink?: string
    conferenceData?: { entryPoints?: { entryPointType: string; uri: string }[] }
  }>(m, `/calendars/${encodeURIComponent(calendarId())}/events?${query}`, {
    method: 'POST',
    body: {
      summary: input.summary,
      description: input.description,
      start: { dateTime: input.start, timeZone: input.timeZone },
      end: { dateTime: input.end, timeZone: input.timeZone },
      ...(invite
        ? {
            attendees: [{ email: input.attendee.email, displayName: input.attendee.name }],
            conferenceData: {
              createRequest: {
                requestId: input.requestId,
                conferenceSolutionKey: { type: 'hangoutsMeet' },
              },
            },
          }
        : {}),
      reminders: { useDefault: true },
    },
  })

  const video = event.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri
  return { id: event.id, htmlLink: event.htmlLink, meetLink: video || event.hangoutLink, invited: invite }
}
