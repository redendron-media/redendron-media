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
  | { status: 'failed'; error: string; duplicates?: string[] }

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
    return {
      status: 'failed',
      error: `${res.status} ${detail.slice(0, 400)}`,
      duplicates: duplicateIdentifiers(res.status, detail),
    }
  } catch (err) {
    return { status: 'failed', error: err instanceof Error ? err.message : String(err) }
  }
}

/**
 * Which unique attributes Brevo refused the write over.
 *
 * `duplicate_parameter` used to be treated as success on the reasoning that a
 * contact which already exists is the normal case for a returning enquirer.
 * That reasoning was wrong: with `updateEnabled: true` an existing email comes
 * back 204, so this error is almost always about a *different* contact already
 * owning the phone number - two people on one company switchboard is enough.
 * Brevo then writes nothing at all, and we were recording it as synced.
 */
function duplicateIdentifiers(status: number, detail: string): string[] | undefined {
  if (status !== 400 || !detail.includes('duplicate_parameter')) return undefined
  try {
    const ids = JSON.parse(detail)?.metadata?.duplicate_identifiers
    if (Array.isArray(ids) && ids.length) return ids.map(String)
  } catch {}
  return ['unknown']
}

/** A JSON read or write that returns the parsed body, or throws. */
async function request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const apiKey = key()
  if (!apiKey) throw new Error('BREVO_API_KEY is not set')
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'content-type': 'application/json', 'api-key': apiKey },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(8000),
    cache: 'no-store',
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 300)}`)
  return (text ? JSON.parse(text) : {}) as T
}

export const STRATEGY_CALL_LIST = 'Free Strategy Call'

let listIdCache: number | null = null

/**
 * The id of the "Free Strategy Call" list, creating it on first use.
 *
 * Found by name rather than configured, so there is nothing to copy across
 * from the Brevo dashboard - BREVO_STRATEGY_LIST_ID still wins if set. Brevo
 * will not create a list outside a folder, so it goes in the first folder
 * the account has, or a new "Website" folder if there are none.
 */
export async function strategyCallListId(): Promise<number> {
  const configured = Number(process.env.BREVO_STRATEGY_LIST_ID)
  if (Number.isFinite(configured) && configured > 0) return configured
  if (listIdCache) return listIdCache

  for (let offset = 0; offset < 2000; offset += 50) {
    const page = await request<{ lists?: { id: number; name: string }[]; count?: number }>(
      'GET',
      `/contacts/lists?limit=50&offset=${offset}`
    )
    const match = page.lists?.find((l) => l.name.trim().toLowerCase() === STRATEGY_CALL_LIST.toLowerCase())
    if (match) return (listIdCache = match.id)
    if (!page.lists?.length || page.lists.length < 50) break
  }

  const folders = await request<{ folders?: { id: number }[] }>('GET', '/contacts/folders?limit=10&offset=0')
  const folderId =
    folders.folders?.[0]?.id ??
    (await request<{ id: number }>('POST', '/contacts/folders', { name: 'Website' })).id
  const created = await request<{ id: number }>('POST', '/contacts/lists', {
    name: STRATEGY_CALL_LIST,
    folderId,
  })
  return (listIdCache = created.id)
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
  /** Lists to add the contact to, on top of BREVO_LIST_ID. */
  lists?: number[]
}): Promise<SyncResult> {
  const listId = Number(process.env.BREVO_LIST_ID)
  const [firstName, ...rest] = input.name.split(' ')

  const attributes = {
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
  }
  const lists = [...(Number.isFinite(listId) && listId > 0 ? [listId] : []), ...(input.lists ?? [])]
  const listIds = lists.length ? [...new Set(lists)] : undefined

  const first = await call('/contacts', {
    email: input.email,
    updateEnabled: true,
    attributes,
    listIds,
  })

  // Brevo enforces one contact per phone number. When someone else already
  // holds this one, it refuses the whole write - so the enquirer would be
  // missing from the CRM entirely over a field we do not need there. Retry
  // without it: the number is on the lead in Payload regardless.
  if (first.status === 'failed' && first.duplicates?.includes('SMS') && attributes.SMS) {
    const retry = await call('/contacts', {
      email: input.email,
      updateEnabled: true,
      attributes: { ...attributes, SMS: undefined },
      listIds,
    })
    if (retry.status === 'synced') return retry
    return {
      status: 'failed',
      error: `phone already on another contact, and the retry without it also failed: ${
        retry.status === 'failed' ? retry.error : retry.reason
      }`,
    }
  }

  return first
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
