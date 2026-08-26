import type { EmailAdapter } from 'payload'

/**
 * Payload's outbound mail, over the Brevo REST API.
 *
 * Deliberately not SMTP. SMTP would mean a second set of Brevo credentials to
 * create, store and rotate - host, port, login, key - to reach the same
 * service the enquiry form already talks to with one API key that is already
 * set and already verified working. It is also better behaved on serverless:
 * a plain HTTPS request with a timeout, rather than a connection that has to
 * be opened, negotiated and torn down inside a function invocation.
 *
 * Only Payload's own account mail goes through here - password resets and
 * verification. The enquiry form has its own path in lib/brevo.ts.
 *
 * Returns an adapter only when a key is present, so local development with no
 * credentials keeps Payload's default behaviour of logging mail to the
 * console instead of failing to boot.
 */

const API = process.env.BREVO_API_BASE || 'https://api.brevo.com/v3'

/** Nodemailer-shaped addresses arrive as a string, an object, or a list. */
function toRecipients(value: unknown): { email: string; name?: string }[] {
  const list = Array.isArray(value) ? value : [value]
  return list
    .map((entry) => {
      if (typeof entry === 'string') {
        // "Name <a@b.com>" or a bare address.
        const match = entry.match(/^\s*(.*?)\s*<([^>]+)>\s*$/)
        if (match) return { email: match[2], name: match[1] || undefined }
        return { email: entry.trim() }
      }
      if (entry && typeof entry === 'object' && 'address' in entry) {
        const e = entry as { address: string; name?: string }
        return { email: e.address, name: e.name || undefined }
      }
      return null
    })
    .filter((v): v is { email: string; name?: string } => Boolean(v?.email))
}

export function brevoEmailAdapter(): EmailAdapter | undefined {
  const apiKey = process.env.BREVO_API_KEY?.trim()
  if (!apiKey) return undefined

  const defaultFromAddress = process.env.LEAD_FROM_EMAIL || 'team@redendron.com'
  const defaultFromName = 'Redendron Media'

  return ({ payload }) => ({
    name: 'brevo',
    defaultFromAddress,
    defaultFromName,
    async sendEmail(message) {
      const to = toRecipients(message.to)
      if (!to.length) {
        payload.logger.error('[email] refusing to send with no recipient')
        return
      }

      const from = toRecipients(message.from)[0]
      const body = {
        sender: {
          email: from?.email || defaultFromAddress,
          name: from?.name || defaultFromName,
        },
        to,
        subject: message.subject || '',
        htmlContent: typeof message.html === 'string' ? message.html : undefined,
        textContent: typeof message.text === 'string' ? message.text : undefined,
      }

      try {
        const res = await fetch(`${API}/smtp/email`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'api-key': apiKey },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(8000),
        })
        if (!res.ok) {
          const detail = await res.text().catch(() => '')
          // Logged rather than thrown: a failed password-reset email should
          // not surface as a 500 from the admin panel, and the reason is
          // more useful in the log than in a stack trace.
          payload.logger.error(
            `[email] Brevo rejected "${body.subject}" for ${to[0].email}: ${res.status} ${detail.slice(0, 300)}`
          )
          return
        }
        payload.logger.info(`[email] sent "${body.subject}" to ${to[0].email}`)
      } catch (err) {
        payload.logger.error(
          `[email] could not reach Brevo: ${err instanceof Error ? err.message : String(err)}`
        )
      }
    },
  })
}
