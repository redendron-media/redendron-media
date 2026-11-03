/**
 * Finds or creates the "Free Strategy Call" contact list in Brevo and prints
 * its id. The site does the same lookup on the first booking, so this is
 * only for having the list in place (and its id to hand) before then.
 *
 *   node --env-file=.env scripts/brevo-strategy-list.mjs
 */
const API = process.env.BREVO_API_BASE || 'https://api.brevo.com/v3'
const NAME = 'Free Strategy Call'
const key = process.env.BREVO_API_KEY?.trim()
if (!key) {
  console.error('BREVO_API_KEY is not set')
  process.exit(1)
}

const call = async (method, path, body) => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'content-type': 'application/json', 'api-key': key },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${text.slice(0, 300)}`)
  return text ? JSON.parse(text) : {}
}

for (let offset = 0; offset < 2000; offset += 50) {
  const page = await call('GET', `/contacts/lists?limit=50&offset=${offset}`)
  const match = page.lists?.find((l) => l.name.trim().toLowerCase() === NAME.toLowerCase())
  if (match) {
    console.log(`"${NAME}" already exists: list id ${match.id}`)
    process.exit(0)
  }
  if (!page.lists?.length || page.lists.length < 50) break
}

const folders = await call('GET', '/contacts/folders?limit=10&offset=0')
const folderId = folders.folders?.[0]?.id ?? (await call('POST', '/contacts/folders', { name: 'Website' })).id
const created = await call('POST', '/contacts/lists', { name: NAME, folderId })
console.log(`Created "${NAME}": list id ${created.id} (folder ${folderId})`)
