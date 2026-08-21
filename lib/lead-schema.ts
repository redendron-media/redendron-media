import { z } from 'zod'

/**
 * One schema, shared by the client form and the server action.
 *
 * The old site validated each step in its own component and then posted an
 * unvalidated merge of all three to the API route, so the server trusted
 * whatever arrived. Here the server re-parses the whole object with the same
 * rules the browser used.
 */

export const REFERRAL_OPTIONS = [
  'Referral',
  'Instagram',
  'LinkedIn',
  'Google',
  'Podcast',
  'Event',
  'Other',
] as const

export const BUDGET_OPTIONS = [
  'Under $1,000',
  '$1,000 – $5,000',
  '$5,000 – $10,000',
  '$10,000 – $25,000',
  '$25,000+',
  'Not sure yet',
] as const

export const TIMELINE_OPTIONS = [
  'As soon as possible',
  'Within a month',
  'This quarter',
  'Just exploring',
] as const

/**
 * Phone is optional, but if given it has to look like a real international
 * number. Deliberately permissive about separators and strict about length:
 * the old form hard-coded +91, which quietly mangled every non-Indian number.
 */
const phone = z
  .string()
  .trim()
  .refine((v) => v === '' || /^\+?[0-9][0-9\s().-]{6,19}$/.test(v), {
    message: 'Enter a valid phone number, including country code',
  })
  .optional()

export const stepOneSchema = z.object({
  name: z.string().trim().min(2, 'Please tell us your name'),
  email: z.email('Enter a valid email address'),
  phone,
  company: z.string().trim().optional(),
  referral: z.array(z.enum(REFERRAL_OPTIONS)).min(1, 'Pick at least one'),
  referralOther: z.string().trim().optional(),
})

export const stepTwoSchema = z.object({
  businessDescription: z
    .string()
    .trim()
    .min(20, 'A sentence or two is enough — we just need the shape of it'),
  website: z
    .string()
    .trim()
    .refine((v) => v === '' || /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/.test(v), {
      message: 'Enter a valid URL, or leave it blank',
    })
    .optional(),
  /**
   * Which services they are after.
   *
   * Free strings rather than a z.enum, because the list is whatever is
   * published in the CMS - an enum here would drift the moment someone adds a
   * service. The values only ever land in our own database and on a Brevo
   * contact attribute, so the bound on length and count is the whole defence
   * that is needed.
   */
  services: z
    .array(z.string().trim().min(1).max(80))
    .min(1, 'Pick at least one — "Not sure yet" is a fine answer')
    .max(12),
  projectGoals: z
    .string()
    .trim()
    .min(20, 'What would success look like? Even roughly.'),
  timeline: z.enum(TIMELINE_OPTIONS, { message: 'Pick a timeline' }),
})

/** Always offered alongside the published services. */
export const SERVICES_UNSURE = 'Not sure yet'

export const stepThreeSchema = z.object({
  budget: z.enum(BUDGET_OPTIONS, { message: 'Pick a range' }),
  /** Honeypot. Real people never see it, so anything in it is a bot. */
  website2: z.string().max(0).optional(),
})

export const leadSchema = stepOneSchema.and(stepTwoSchema).and(stepThreeSchema)

export type StepOne = z.infer<typeof stepOneSchema>
export type StepTwo = z.infer<typeof stepTwoSchema>
export type StepThree = z.infer<typeof stepThreeSchema>
export type LeadInput = z.infer<typeof leadSchema>
