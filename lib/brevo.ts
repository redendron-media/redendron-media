import 'server-only'

/**
 * Brevo, wrapped so a failure is data rather than an exception.
 *
 * The old route awaited three Brevo calls in sequence and returned a 500 if
 * any of them failed - which meant a Brevo outage looked, to the visitor, like
 * their enquiry had not gone through. It had not gone anywhere at all: nothing
 * was stored locally. Here the lead is already in the database before any of
 * this runs, so every function returns a result instead of throwing and the
 * caller records what happened on the lead.
 */

// Overridable so the integration can be exercised against a local stub -
// otherwise the only way to test the request shape is to send real mail.
const API = process.env.BREVO_API_BASE || 'https://api.brevo.com/v3'

export type SyncResult =
  | { status: 'synced' }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; error: string }

const key = () => process.env.BREVO_API_KEY?.trim()

async function call(path: string, body: unknown): Promise<SyncResult> {
  const apiKey = key()
  if (!apiKey) return { status: 'skipped', reason: 'BREVO_API_KEY is not set' }

  try {
    const res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify(body),
      // Never let a slow third party hold a form submission open.
      signal: AbortSignal.timeout(8000),
    })

    if (res.ok || res.status === 204) return { status: 'synced' }

    const detail = await res.text().catch(() => '')
    // A contact that already exists is not a failure - it is the normal case
    // for a returning enquirer.
    if (res.status === 400 && detail.includes('duplicate_parameter')) {
      return { status: 'synced' }
    }
    return { status: 'failed', error: `${res.status} ${detail.slice(0, 400)}` }
  } catch (err) {
    return { status: 'failed', error: err instanceof Error ? err.message : String(err) }
  }
}

/** Create or update the contact, and add it to the list if one is configured. */
export async function upsertContact(input: {
  email: string
  name: string
  phone?: string
  company?: string
  budget?: string
  services?: string[]
  source: string
}): Promise<SyncResult> {
  const listId = Number(process.env.BREVO_LIST_ID)
  const [firstName, ...rest] = input.name.split(' ')

  return call('/contacts', {
    email: input.email,
    updateEnabled: true,
    attributes: {
      FIRSTNAME: firstName,
      LASTNAME: rest.join(' ') || undefined,
      // Brevo rejects SMS values that are not in international format, and
      // the number is optional anyway, so only send a well-formed one.
      SMS: input.phone?.startsWith('+') ? input.phone.replace(/[^\d+]/g, '') : undefined,
      COMPANY: input.company || undefined,
      BUDGET: input.budget || undefined,
      // Brevo has no list-typed contact attribute, so this is a joined string.
      SERVICES: input.services?.length ? input.services.join(', ') : undefined,
      SOURCE: input.source,
    },
    listIds: Number.isFinite(listId) && listId > 0 ? [listId] : undefined,
  })
}

/** Plain transactional email. No template ID, so nothing breaks when one is edited. */
export async function sendEmail(input: {
  to: { email: string; name?: string }[]
  subject: string
  html: string
  replyTo?: { email: string; name?: string }
}): Promise<SyncResult> {
  const from = {
    email: process.env.LEAD_FROM_EMAIL || 'team@redendron.com',
    name: 'Redendron Media',
  }
  return call('/smtp/email', {
    sender: from,
    to: input.to,
    replyTo: input.replyTo,
    subject: input.subject,
    htmlContent: input.html,
  })
}
