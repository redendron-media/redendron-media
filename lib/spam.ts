import 'server-only'

import { createHmac } from 'node:crypto'

/**
 * Spam defences for the enquiry form.
 *
 * The rule throughout: never throw a submission away on suspicion. A form is
 * the only way a stranger can reach this business, and a filter that silently
 * eats a real enquiry costs far more than one that lets a bot through. So
 * anything questionable is still written to the database - it is just marked
 * as spam, which keeps it out of the inbox and out of the CRM while leaving
 * it there to be read and reclassified.
 *
 * Only the two signals no human can trip - the honeypot, and a submission
 * that arrives faster than the form can be filled in - are treated as certain.
 */

const secret = () => process.env.PAYLOAD_SECRET || 'dev-only-insecure-secret-change-me'

const sign = (value: string) =>
  createHmac('sha256', secret()).update(value).digest('base64url').slice(0, 24)

/**
 * A signed timestamp handed to the form when the page renders.
 *
 * Signed so the age cannot simply be rewritten by whatever is posting, which
 * is the whole value of the timing check. It carries no information about the
 * visitor - it is a clock reading and a signature over it.
 */
export function issueFormToken(): string {
  const issued = Date.now().toString(36)
  return `${issued}.${sign(issued)}`
}

/** Milliseconds since the token was issued, or null if it is not ours. */
export function formTokenAge(token: unknown): number | null {
  if (typeof token !== 'string') return null
  const [issued, signature] = token.split('.')
  if (!issued || !signature || sign(issued) !== signature) return null
  const at = parseInt(issued, 36)
  if (!Number.isFinite(at)) return null
  return Date.now() - at
}

/** Nobody completes three steps of this form in under four seconds. */
const MIN_FILL_MS = 4_000
/** A token older than a day is likelier to be replayed than kept open. */
const MAX_TOKEN_AGE_MS = 24 * 60 * 60 * 1000

const PHRASES = [
  'seo service',
  'seo expert',
  'backlink',
  'guest post',
  'link building',
  'first page of google',
  'rank your website',
  'crypto',
  'bitcoin',
  'forex',
  'casino',
  'viagra',
  'payday loan',
  'work from home',
  'make money fast',
  'increase traffic',
  'bulk email',
  'telegram',
  'whatsapp me',
]

const urls = (s: string) => (s.match(/https?:\/\/|www\.[a-z0-9-]+\./gi) || []).length

export type Assessment = { score: number; reasons: string[]; certain: boolean }

/**
 * Weigh a submission. The thresholds are deliberately forgiving: a real
 * enquiry that mentions a competitor's SEO agency and links two case studies
 * should still land in the inbox.
 */
export function assess(input: {
  name: string
  company?: string
  businessDescription: string
  projectGoals: string
  website?: string
  tokenAge: number | null
}): Assessment {
  const reasons: string[] = []
  let score = 0

  // Timing. The only heuristic here that a person cannot plausibly trip.
  if (input.tokenAge === null) {
    score += 3
    reasons.push('form token missing or not issued by us')
  } else if (input.tokenAge < MIN_FILL_MS) {
    return {
      score: 10,
      reasons: [`submitted ${Math.round(input.tokenAge)}ms after the form loaded`],
      certain: true,
    }
  } else if (input.tokenAge > MAX_TOKEN_AGE_MS) {
    score += 1
    reasons.push('form token older than a day')
  }

  // A link in the name field. There is no innocent version of this.
  if (urls(input.name) > 0) {
    score += 4
    reasons.push('link in the name field')
  }

  const body = `${input.businessDescription}\n${input.projectGoals}`
  const linkCount = urls(body) + urls(input.company || '')
  const words = body.trim().split(/\s+/).filter(Boolean).length
  if (linkCount >= 4) {
    score += 2
    reasons.push(`${linkCount} links in the message`)
  } else if (linkCount >= 2) {
    score += 1
    reasons.push(`${linkCount} links in the message`)
  }
  // Density, not count. Four links inside a real brief is someone citing
  // their references; four links and six words is a drop. Keyed at three so
  // an enquirer who pastes their current site and a competitor's is never
  // caught by it.
  if (linkCount >= 3 && words < 40) {
    score += 2
    reasons.push('links with almost no message around them')
  }

  const haystack = `${input.name} ${input.company || ''} ${body}`.toLowerCase()
  const hits = PHRASES.filter((p) => haystack.includes(p))
  if (hits.length) {
    // One mention is a conversation; three is a pitch.
    score += hits.length >= 3 ? 4 : hits.length === 2 ? 2 : 1
    reasons.push(`sales phrases: ${hits.slice(0, 4).join(', ')}`)
  }

  // Bots commonly paste the same block into every textarea.
  const a = input.businessDescription.trim()
  const b = input.projectGoals.trim()
  if (a.length > 20 && a === b) {
    score += 2
    reasons.push('both long answers are identical')
  }

  const letters = body.replace(/[^a-z]/gi, '')
  if (letters.length > 40) {
    const caps = (body.match(/[A-Z]/g) || []).length / letters.length
    if (caps > 0.6) {
      score += 1
      reasons.push('mostly capitals')
    }
  }

  return { score, reasons, certain: false }
}

/** At or above this, the lead is filed as spam rather than announced. */
export const SPAM_THRESHOLD = 4
