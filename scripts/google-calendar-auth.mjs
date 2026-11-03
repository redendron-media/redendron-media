/**
 * One-time: gets the refresh token the site uses to read and write the
 * booking calendar (see lib/google-calendar.ts).
 *
 *   node --env-file=.env scripts/google-calendar-auth.mjs
 *
 * Reads GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET from .env. The
 * client must be a "Desktop app" OAuth client from Google Cloud Console, so a
 * loopback redirect to this machine is allowed. Sign in as the account that
 * owns the calendar bookings should land on.
 *
 * The refresh token is written into .env as GOOGLE_OAUTH_REFRESH_TOKEN and
 * never printed - it is a long-lived credential for that calendar, and a
 * terminal's scrollback is not a place to leave one.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'

/** Sets KEY=value in .env, replacing an existing line or appending one. */
function saveToEnv(key, value) {
  const lines = readFileSync('.env', 'utf8').split('\n')
  const at = lines.findIndex((l) => l.replace(/^\s*#?\s*/, '').startsWith(`${key}=`))
  if (at >= 0) lines[at] = `${key}=${value}`
  else lines.push(`${key}=${value}`)
  writeFileSync('.env', lines.join('\n'))
}

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
if (!clientId || !clientSecret) {
  console.error('Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET first.')
  process.exit(1)
}

const PORT = 53682
const redirect = `http://127.0.0.1:${PORT}`
const consent = new URL('https://accounts.google.com/o/oauth2/v2/auth')
consent.search = new URLSearchParams({
  client_id: clientId,
  redirect_uri: redirect,
  response_type: 'code',
  scope: 'https://www.googleapis.com/auth/calendar',
  // offline + consent is what makes Google hand back a refresh token.
  access_type: 'offline',
  prompt: 'consent',
}).toString()

const server = createServer(async (req, res) => {
  const code = new URL(req.url, redirect).searchParams.get('code')
  if (!code) {
    res.end('No code in the redirect. Try again.')
    return
  }
  const token = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirect,
      grant_type: 'authorization_code',
    }),
  }).then((r) => r.json())

  if (!token.refresh_token) {
    res.end('Google did not return a refresh token - see the terminal.')
    // Only the error fields: the response can carry an access token.
    console.error('No refresh token:', token.error || '', token.error_description || '')
  } else {
    saveToEnv('GOOGLE_OAUTH_REFRESH_TOKEN', token.refresh_token)
    res.end('Done - the token is saved in .env. You can close this tab.')
    console.log(`Saved GOOGLE_OAUTH_REFRESH_TOKEN to .env (scope: ${token.scope}).`)
  }
  server.close()
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Open this URL and sign in with the calendar's account:\n\n${consent}\n`)
})
