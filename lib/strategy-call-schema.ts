import { z } from 'zod'

/**
 * The free strategy call form. One schema for the dialog and the server
 * action, the same arrangement as the quote form.
 */
export const strategyCallSchema = z.object({
  name: z.string().trim().min(2, 'Please tell us your name').max(120),
  business: z.string().trim().min(2, 'What is the business called?').max(160),
  email: z.email('Enter a valid email address').max(200),
  // Required here, unlike the quote form: a booked call needs a way to reach
  // someone who cannot find the meeting link.
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s().-]{6,19}$/, 'Enter a valid phone number, with country code'),
  info: z.string().trim().max(2000).optional(),
  /** ISO start of the chosen slot. The server checks it against the rules. */
  slot: z.iso.datetime({ offset: true, message: 'Pick a time for the call' }),
  /** Honeypot. Real people never see it. */
  website2: z.string().max(0).optional(),
})

export type StrategyCallInput = z.infer<typeof strategyCallSchema>

export type Slot = { start: string; end: string }
export type AvailabilityDay = { date: string; slots: Slot[] }
export type Availability = { days: AvailabilityDay[]; timeZone: string }

export type BookingResult =
  | {
      ok: true
      /** True when the event is on the calendar; false when it is held for confirmation. */
      confirmed: boolean
      start: string
      end: string
      meetLink?: string
    }
  | { ok: false; error: string; fields?: Record<string, string>; slotTaken?: boolean }
