import 'server-only'

import { busyBetween, calendarConfigured, type Interval } from '@/lib/google-calendar'
import { payload } from '@/lib/payload'
import type { Availability, AvailabilityDay, Slot } from '@/lib/strategy-call-schema'

/**
 * When the free strategy call can be booked.
 *
 * Four 45-minute calls a day, India time: 11:00, 12:30, 14:00 and 15:30.
 * The gaps between them leave room to prepare and write up. India has no
 * daylight saving, so the offset is a constant rather than a timezone lookup.
 */
export const CALL_RULES = {
  timeZone: 'Asia/Kolkata',
  offset: '+05:30',
  offsetMinutes: 330,
  /** 0 = Sunday. Monday to Friday. */
  weekdays: [1, 2, 3, 4, 5],
  /** Start times, in minutes after midnight. */
  starts: [11 * 60, 12 * 60 + 30, 14 * 60, 15 * 60 + 30],
  length: 45,
  /** How far ahead the picker reaches. */
  horizonDays: 14,
  /** Nobody can book a slot starting sooner than this - the audit needs preparing. */
  minNoticeMinutes: 4 * 60,
} as const

const pad = (n: number) => String(n).padStart(2, '0')

/** Today's date in India, as YYYY-MM-DD. */
function localDate(at: number, plusDays = 0) {
  const shifted = new Date(at + CALL_RULES.offsetMinutes * 60_000 + plusDays * 86_400_000)
  return shifted.toISOString().slice(0, 10)
}

/** Every slot the rules allow over the horizon, ignoring the calendar. */
export function ruleSlots(now = Date.now()): AvailabilityDay[] {
  const days: AvailabilityDay[] = []
  for (let d = 0; d <= CALL_RULES.horizonDays; d++) {
    const date = localDate(now, d)
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay()
    if (!(CALL_RULES.weekdays as readonly number[]).includes(weekday)) continue

    const slots: Slot[] = []
    for (const m of CALL_RULES.starts) {
      const at = (mins: number) => `${date}T${pad(Math.floor(mins / 60))}:${pad(mins % 60)}:00${CALL_RULES.offset}`
      slots.push({
        start: new Date(at(m)).toISOString(),
        end: new Date(at(m + CALL_RULES.length)).toISOString(),
      })
    }
    days.push({ date, slots })
  }
  return days
}

/** True if this exact start time is one the rules offer. */
export function isRuleSlot(startIso: string, now = Date.now()): Slot | null {
  const start = Date.parse(startIso)
  for (const day of ruleSlots(now)) {
    for (const slot of day.slots) if (Date.parse(slot.start) === start) return slot
  }
  return null
}

const overlaps = (a: Interval, b: Interval) => a.start < b.end && b.start < a.end

/**
 * Slots held by bookings the calendar does not know about yet.
 *
 * A booking that reached Google is busy time there, so it is covered by the
 * free/busy read - and deleting that event in Calendar frees the slot on the
 * site without anyone touching the admin panel. A booking that did not reach
 * Google ("Needs confirming") only exists here, so it holds its slot here.
 * So does anything booked in the last few minutes, which covers two people
 * taking the same slot in the moment before the calendar reflects either.
 */
async function heldSlots(from: Date): Promise<Interval[]> {
  const p = await payload()
  const recent = new Date(Date.now() - 15 * 60_000).toISOString()
  const { docs } = await p.find({
    collection: 'leads',
    overrideAccess: true,
    limit: 200,
    depth: 0,
    pagination: false,
    where: {
      and: [
        { source: { equals: 'strategy-call' } },
        { 'booking.start': { greater_than_equal: from.toISOString() } },
        {
          or: [
            { 'booking.status': { equals: 'requested' } },
            {
              and: [
                { 'booking.status': { equals: 'booked' } },
                { createdAt: { greater_than_equal: recent } },
              ],
            },
          ],
        },
      ],
    },
    select: { booking: true },
  })
  return docs
    .map((d) => d.booking)
    .filter((b): b is { start: string; end: string } => Boolean(b?.start && b?.end))
    .map((b) => ({ start: Date.parse(b.start), end: Date.parse(b.end) }))
}

export type Taken = { busy: Interval[]; calendarError?: string }

/** Everything that blocks a slot, from the calendar and from our own records. */
export async function takenBetween(from: Date, to: Date): Promise<Taken> {
  const [calendar, held] = await Promise.all([
    busyBetween(from, to).then(
      (busy) => ({ busy, error: undefined as string | undefined }),
      (err: unknown) => ({ busy: [] as Interval[], error: err instanceof Error ? err.message : String(err) })
    ),
    heldSlots(from),
  ])
  if (calendar.error) console.error('[strategy-call] calendar read failed:', calendar.error)
  return { busy: [...calendar.busy, ...held], calendarError: calendar.error }
}

export async function getAvailability(now = Date.now()): Promise<Availability> {
  const days = ruleSlots(now)
  const earliest = now + CALL_RULES.minNoticeMinutes * 60_000
  const last = days.at(-1)?.slots.at(-1)?.end
  const { busy } = await takenBetween(new Date(now), new Date(last ?? now + 86_400_000))

  return {
    timeZone: CALL_RULES.timeZone,
    days: days.map((day) => ({
      date: day.date,
      slots: day.slots.filter((slot) => {
        const range = { start: Date.parse(slot.start), end: Date.parse(slot.end) }
        return range.start >= earliest && !busy.some((b) => overlaps(range, b))
      }),
    })),
  }
}

/** Re-checks one slot at the moment of booking. */
export async function slotIsFree(slot: Slot, now = Date.now()) {
  const range = { start: Date.parse(slot.start), end: Date.parse(slot.end) }
  if (range.start < now + CALL_RULES.minNoticeMinutes * 60_000) return { free: false }
  const { busy, calendarError } = await takenBetween(new Date(range.start), new Date(range.end))
  return { free: !busy.some((b) => overlaps(range, b)), calendarError }
}

export { calendarConfigured }
