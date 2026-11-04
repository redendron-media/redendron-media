'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState } from 'react'

import { bookStrategyCall, loadAvailability } from '@/app/(frontend)/free-strategy-call/actions'
import { trackEvent } from '@/components/chrome/analytics'
import { useMotion } from '@/components/motion/motion-provider'
import {
  strategyCallSchema,
  type AvailabilityDay,
  type BookingResult,
  type StrategyCallInput,
} from '@/lib/strategy-call-schema'
import { cn } from '@/lib/utils'

/**
 * The free strategy call booking dialog, and the context every "Book" button
 * on the page opens it through. One dialog per page: the sticky bar, the hero
 * and every inline call to action all lead to the same form.
 */

const BookingContext = createContext<{ open: (from: string) => void }>({ open: () => {} })

export const useBooking = () => useContext(BookingContext)

const TZ = 'Asia/Kolkata'

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false)
  const { lenis } = useMotion()

  const open = useCallback((from: string) => {
    setOpen(true)
    trackEvent('strategy_call_open', { cta: from })
  }, [])

  // Lenis drives the page from window wheel events; left running, scrolling
  // inside the dialog would scroll the page behind it instead.
  useEffect(() => {
    if (!isOpen) return
    lenis?.stop()
    return () => lenis?.start()
  }, [isOpen, lenis])

  return (
    <BookingContext.Provider value={useMemo(() => ({ open }), [open])}>
      {children}
      <Dialog.Root open={isOpen} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="booking-overlay fixed inset-0 z-[100] bg-ink/70 backdrop-blur-sm" />
          <Dialog.Content
            data-lenis-prevent
            aria-describedby={undefined}
            className={cn(
              'booking-sheet fixed z-[101] flex flex-col overflow-y-auto overscroll-contain bg-paper text-ink shadow-(--shadow-card-lift) outline-none',
              // A sheet from the bottom on a phone - the thumb is already there.
              'inset-x-0 bottom-0 max-h-[94dvh] rounded-t-2xl',
              'sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[90dvh] sm:w-[min(44rem,calc(100vw-3rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl'
            )}
          >
            {isOpen && <BookingForm onDone={() => setOpen(false)} />}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </BookingContext.Provider>
  )
}

/** Any "Book" button. `from` says which one, for analytics. */
export function BookCallButton({
  from,
  children = 'Book my free strategy call',
  className,
  tone = 'accent',
}: {
  from: string
  children?: React.ReactNode
  className?: string
  tone?: 'accent' | 'paper'
}) {
  const { open } = useBooking()
  return (
    <button
      type="button"
      onClick={() => open(from)}
      className={cn(
        'group relative inline-flex min-h-14 items-center justify-center gap-3 overflow-hidden px-7 py-4 text-body font-medium',
        tone === 'accent' ? 'bg-oxblood text-paper' : 'bg-paper text-ink',
        className
      )}
    >
      <span
        className={cn(
          'relative z-10 flex items-center gap-3 transition-colors duration-300',
          tone === 'paper' && 'group-hover:text-paper'
        )}
      >
        {children}
        <span aria-hidden className="transition-transform duration-300 ease-brand group-hover:translate-x-1">
          &rarr;
        </span>
      </span>
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 origin-bottom scale-y-0 transition-transform duration-400 ease-brand group-hover:scale-y-100',
          tone === 'accent' ? 'bg-ink' : 'bg-oxblood'
        )}
      />
    </button>
  )
}

// ---------------------------------------------------------------- form --

type Draft = Omit<StrategyCallInput, 'slot'> & { slot: string }

const EMPTY: Draft = { name: '', business: '', email: '', phone: '', info: '', slot: '', website2: '' }

const timeFmt = (timeZone: string) =>
  new Intl.DateTimeFormat('en-IN', { timeZone, hour: 'numeric', minute: '2-digit' })

function BookingForm({ onDone }: { onDone: () => void }) {
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [days, setDays] = useState<AvailabilityDay[] | null>(null)
  const [day, setDay] = useState<string | null>(null)
  const [token, setToken] = useState<string>()
  const [loadError, setLoadError] = useState<string>()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState<Extract<BookingResult, { ok: true }> | null>(null)

  const refresh = useCallback(async (keepDay = true) => {
    const result = await loadAvailability()
    setToken((t) => t ?? result.token)
    setLoadError(result.error)
    setDays(result.days)
    setDay((current) => {
      const stillThere = keepDay && result.days.find((d) => d.date === current && d.slots.length)
      return stillThere ? current : (result.days.find((d) => d.slots.length)?.date ?? null)
    })
    // A slot that vanished while the dialog was open is no longer selectable.
    setDraft((d) =>
      d.slot && !result.days.some((x) => x.slots.some((s) => s.start === d.slot)) ? { ...d, slot: '' } : d
    )
  }, [])

  // Load on open, and keep it current while the dialog stays up - a slot
  // someone else takes, or one added to the calendar, drops out on its own.
  useEffect(() => {
    refresh(false)
    const id = window.setInterval(() => refresh(), 60_000)
    return () => window.clearInterval(id)
  }, [refresh])

  const localZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, [])
  const showLocal = localZone !== TZ && localZone !== 'Asia/Calcutta'
  const ist = useMemo(() => timeFmt(TZ), [])
  const local = useMemo(() => timeFmt(localZone), [localZone])

  const set = (key: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDraft((d) => ({ ...d, [key]: e.target.value }))
    if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(undefined)
    const parsed = strategyCallSchema.safeParse(draft)
    if (!parsed.success) {
      const next: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0])
        if (!next[key]) next[key] = issue.message
      }
      setErrors(next)
      return
    }

    setPending(true)
    const result = await bookStrategyCall(parsed.data, token).catch(
      (): BookingResult => ({ ok: false, error: 'Something went wrong. Please try again.' })
    )
    setPending(false)

    if (result.ok) {
      setDone(result)
      // GA4's recommended lead event, so it can be marked as a key event.
      trackEvent('generate_lead', { form: 'strategy_call', confirmed: result.confirmed })
      return
    }
    setFormError(result.error)
    if (result.fields) setErrors(result.fields)
    if (result.slotTaken) refresh()
  }

  if (done) return <Confirmation result={done} name={draft.name} onDone={onDone} />

  const selected = days?.find((d) => d.date === day)

  return (
    <form onSubmit={submit} noValidate className="flex flex-col">
      <header className="sticky top-0 z-10 flex items-start justify-between gap-6 border-b hairline bg-paper px-5 pb-5 pt-6 sm:px-8 sm:pt-8">
        <div>
          <p className="eyebrow text-oxblood">Free · 45 minutes · Google Meet</p>
          <Dialog.Title className="mt-3 text-h3 font-bold">Book your free strategy call</Dialog.Title>
        </div>
        <Dialog.Close
          aria-label="Close"
          className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-h4 text-muted transition-colors hover:bg-paper-dim hover:text-ink"
        >
          &times;
        </Dialog.Close>
      </header>

      <div className="grid grid-cols-2 gap-x-4 gap-y-6 px-5 py-6 sm:gap-x-6 sm:px-8 sm:py-8">
        <Input label="Name" autoComplete="name" value={draft.name} onChange={set('name')} error={errors.name} />
        <Input
          label="Business name"
          autoComplete="organization"
          value={draft.business}
          onChange={set('business')}
          error={errors.business}
        />
        <Input
          label="Business email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={draft.email}
          onChange={set('email')}
          error={errors.email}
        />
        <Input
          label="Phone number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+91"
          value={draft.phone}
          onChange={set('phone')}
          error={errors.phone}
        />
        <div className="col-span-2">
          <Input
            as="textarea"
            label="Additional info"
            optional
            placeholder="Your website, what you sell, what is not working yet…"
            value={draft.info}
            onChange={set('info')}
            error={errors.info}
          />
        </div>

        {/* Honeypot: off-screen, out of the tab order, ignored by autofill. */}
        <input
          type="text"
          name="website2"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          value={draft.website2}
          onChange={set('website2')}
          className="absolute -left-[9999px] h-px w-px opacity-0"
        />

        {/* min-w-0: a fieldset defaults to min-content, so the scrolling day
            row would otherwise stretch it past the sheet. */}
        <fieldset className="col-span-2 min-w-0">
          <legend className="text-small text-muted">
            Pick a time <span className="text-faint">· India time (IST)</span>
          </legend>

          {!days ? (
            <div className="mt-3 space-y-3" aria-busy>
              <div className="h-16 animate-pulse rounded-lg bg-paper-dim" />
              <div className="h-24 animate-pulse rounded-lg bg-paper-dim" />
            </div>
          ) : (
            <>
              <div
                role="radiogroup"
                aria-label="Day"
                className="-mx-5 mt-3 flex snap-x gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:-mx-8 sm:px-8"
              >
                {days.map((d) => {
                  const date = new Date(`${d.date}T12:00:00+05:30`)
                  const full = d.slots.length === 0
                  const active = d.date === day
                  return (
                    <button
                      key={d.date}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      disabled={full}
                      onClick={() => setDay(d.date)}
                      className={cn(
                        'flex min-w-17 shrink-0 snap-start flex-col items-center rounded-lg border px-3 py-2.5 transition-colors',
                        active
                          ? 'border-ink bg-ink text-paper'
                          : 'hairline-2 bg-paper-lift hover:border-ink',
                        full && 'pointer-events-none opacity-40'
                      )}
                    >
                      <span className="text-eyebrow uppercase tracking-[0.12em]">
                        {date.toLocaleDateString('en-IN', { weekday: 'short', timeZone: TZ })}
                      </span>
                      <span className="mt-1 text-h4 font-bold leading-none">
                        {date.toLocaleDateString('en-IN', { day: 'numeric', timeZone: TZ })}
                      </span>
                      <span className="mt-1 text-eyebrow">
                        {full ? 'Full' : date.toLocaleDateString('en-IN', { month: 'short', timeZone: TZ })}
                      </span>
                    </button>
                  )
                })}
              </div>

              {selected && selected.slots.length > 0 ? (
                <div role="radiogroup" aria-label="Time" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {selected.slots.map((slot) => {
                    const at = new Date(slot.start)
                    const active = draft.slot === slot.start
                    return (
                      <button
                        key={slot.start}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => {
                          setDraft((d) => ({ ...d, slot: slot.start }))
                          setErrors(({ slot: _, ...rest }) => rest)
                        }}
                        className={cn(
                          'rounded-lg border px-2 py-3 text-center transition-colors',
                          active
                            ? 'border-oxblood bg-oxblood text-paper'
                            : 'hairline-2 bg-paper-lift hover:border-oxblood'
                        )}
                      >
                        <span className="block text-body font-medium">{ist.format(at)}</span>
                        {showLocal && (
                          <span className={cn('block text-eyebrow', active ? 'text-paper/80' : 'text-faint')}>
                            {local.format(at)} yours
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-4 text-small text-muted">
                  {loadError ||
                    'Every slot in the next two weeks is taken. Email team@redendron.com and we will find you a time.'}
                </p>
              )}
            </>
          )}
          {errors.slot && (
            <p role="alert" className="mt-3 text-small text-oxblood">
              {errors.slot}
            </p>
          )}
        </fieldset>
      </div>

      <footer className="sticky bottom-0 border-t hairline bg-paper px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-8 sm:pb-8">
        {formError && (
          <p role="alert" className="mb-3 text-small text-oxblood">
            {formError}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="group relative flex min-h-14 w-full items-center justify-center gap-3 overflow-hidden bg-oxblood px-6 py-4 text-body font-medium text-paper disabled:opacity-70"
        >
          <span className="relative z-10">{pending ? 'Booking…' : 'Book my free call'}</span>
          {!pending && (
            <span aria-hidden className="relative z-10">
              &rarr;
            </span>
          )}
          <span className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-400 ease-brand group-hover:scale-y-100" />
        </button>
        <p className="mt-3 text-center text-eyebrow normal-case tracking-normal text-faint">
          Free, no obligation. Your details stay with us —{' '}
          <a href="/privacy-policy" target="_blank" className="underline underline-offset-2">
            privacy policy
          </a>
          .
        </p>
      </footer>
    </form>
  )
}

function Input({
  label,
  error,
  optional,
  as,
  className,
  ...props
}: {
  label: string
  error?: string
  optional?: boolean
  as?: 'textarea'
} & React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  const field = cn(
    // 16px minimum, or iOS zooms the page on focus.
    'mt-2 w-full border-b hairline-2 bg-transparent pb-2 pt-1 text-body outline-none transition-colors placeholder:text-faint focus:border-oxblood aria-[invalid=true]:border-oxblood',
    className
  )
  const shared = {
    id,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `${id}-error` : undefined,
    className: field,
  }
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-small text-muted">
        {label}
        {optional && <span className="text-faint"> (optional)</span>}
      </label>
      {as === 'textarea' ? (
        <textarea rows={3} {...shared} {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input {...shared} {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-small text-oxblood">
          {error}
        </p>
      )}
    </div>
  )
}

function Confirmation({
  result,
  name,
  onDone,
}: {
  result: Extract<BookingResult, { ok: true }>
  name: string
  onDone: () => void
}) {
  const at = new Date(result.start)
  const day = at.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ })
  return (
    <div className="flex flex-col items-start px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 sm:p-10">
      <span
        aria-hidden
        className="flex h-14 w-14 items-center justify-center rounded-full bg-oxblood text-h3 text-paper"
      >
        &#10003;
      </span>
      <Dialog.Title className="mt-6 text-h2 font-bold">
        {result.confirmed ? `You're booked, ${name.split(' ')[0]}.` : `Got it, ${name.split(' ')[0]}.`}
      </Dialog.Title>
      <p className="mt-4 text-lead">
        {day} at {timeFmt(TZ).format(at)} IST
      </p>
      <p className="mt-4 max-w-md text-body text-muted">
        {result.confirmed
          ? 'A calendar invite with the Google Meet link is on its way to your inbox. Before the call we will look at your brand the way your customers do, so the 45 minutes go on what to change.'
          : 'Your slot is held. We will confirm it by email shortly with the meeting link.'}
      </p>
      {result.meetLink && (
        <a
          href={result.meetLink}
          target="_blank"
          rel="noreferrer"
          className="mt-6 border-b hairline-2 pb-1 text-small hover:border-oxblood hover:text-oxblood"
        >
          Google Meet link &rarr;
        </a>
      )}
      <button
        type="button"
        onClick={onDone}
        className="mt-10 min-h-12 w-full bg-ink px-6 py-3 text-body text-paper sm:w-auto"
      >
        Done
      </button>
    </div>
  )
}
