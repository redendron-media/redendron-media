'use client'

import { useEffect, useRef, useState, useTransition } from 'react'

import { submitLead, type SubmitResult } from '@/app/(frontend)/get-a-quote/actions'
import { ChipGroup, Field, TextArea } from '@/components/forms/fields'
import { useMotion } from '@/components/motion/motion-provider'
import { GhostButton, GhostLink, PrimaryButton } from '@/components/ui/cta'
import {
  BUDGET_OPTIONS,
  REFERRAL_OPTIONS,
  SERVICES_UNSURE,
  TIMELINE_OPTIONS,
  stepOneSchema,
  stepThreeSchema,
  stepTwoSchema,
  type LeadInput,
} from '@/lib/lead-schema'
import { cn } from '@/lib/utils'

const STEPS = [
  { title: 'You', note: 'Who we would be working with.' },
  { title: 'The work', note: 'What you are trying to move.' },
  { title: 'The shape', note: 'What it needs to fit inside.' },
]

type Draft = Partial<LeadInput>

/**
 * Three steps, one form object.
 *
 * Each step validates its own slice with the same schema the server will use,
 * so a step never advances on data the server would then reject. Nothing is
 * sent until the last step: a half-finished enquiry is not a lead, and the
 * visitor has not agreed to be contacted yet.
 */
export function QuoteForm({ serviceOptions = [] }: { serviceOptions?: string[] }) {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>({ referral: [], services: [] })
  // Whatever is published in the CMS, plus an honest way out for someone who
  // does not yet know what they need.
  const services = [...serviceOptions, SERVICES_UNSURE]
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()
  const panel = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const { lenis } = useMotion()

  /**
   * Bring the form back into view whenever the step changes.
   *
   * Not a nicety - without it the page silently dumps you in the footer.
   * Step three is much shorter than step two, so advancing collapses the
   * document from ~2460px to ~1830px; the browser clamps the scroll position
   * to the new maximum, and if you were near the button you are now at the
   * bottom of the page looking at the footer with no idea what happened.
   */
  const stepRef = useRef(step)
  useEffect(() => {
    if (stepRef.current === step) return
    stepRef.current = step
    const el = root.current
    if (!el) return
    // Clear of the fixed header, which would otherwise cover the progress row.
    const offset = -120
    if (lenis) lenis.scrollTo(el, { offset, duration: 0.8 })
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: 'smooth' })
  }, [step, lenis])

  // Same problem, larger: the success screen is a fraction of the form's
  // height, so the collapse is bigger still.
  useEffect(() => {
    if (!done) return
    if (lenis) lenis.scrollTo(0, { duration: 0.8 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [done, lenis])

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setErrors((e) => (e[key as string] ? { ...e, [key as string]: '' } : e))
  }

  const validate = (schema: typeof stepOneSchema | typeof stepTwoSchema | typeof stepThreeSchema) => {
    const result = schema.safeParse(draft)
    if (result.success) {
      setErrors({})
      return true
    }
    const next: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const key = issue.path.join('.')
      if (key && !next[key]) next[key] = issue.message
    }
    setErrors(next)
    // Move focus to the panel so the error is announced and the first bad
    // field is in view, rather than silently failing below the fold.
    panel.current?.focus()
    return false
  }

  const next = () => {
    const schema = step === 0 ? stepOneSchema : stepTwoSchema
    if (validate(schema)) setStep((s) => s + 1)
  }

  const submit = () => {
    if (!validate(stepThreeSchema)) return
    setFormError(null)
    startTransition(async () => {
      const result: SubmitResult = await submitLead(draft as LeadInput)
      if (result.ok) {
        setDone(true)
        return
      }
      setFormError(result.error)
      if (result.fields) setErrors(result.fields)
    })
  }

  if (done) {
    return (
      <div className="max-w-xl py-10">
        <p className="eyebrow text-accent">Received</p>
        <h2 className="mt-6 text-display-3 font-bold">
          Thanks &mdash; that is enough to work with.
        </h2>
        <p className="mt-6 text-lead text-muted">
          Someone will read the whole brief and reply within one working day. There is a
          confirmation in your inbox in the meantime.
        </p>
        <div className="mt-12 flex flex-wrap gap-4">
          <GhostLink href="/work">See our work</GhostLink>
        </div>
      </div>
    )
  }

  return (
    <div ref={root}>
      {/* Progress. A real ordered list, so the position is not colour-only. */}
      <ol className="grid gap-px sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            aria-current={i === step ? 'step' : undefined}
            className={cn(
              'border-t-2 pt-4 transition-colors duration-500 ease-brand',
              i === step ? 'border-accent' : i < step ? 'border-current' : 'hairline-2'
            )}
          >
            <p className={cn('eyebrow tabular-nums', i === step ? 'text-accent' : 'text-faint')}>
              {String(i + 1).padStart(2, '0')} · {s.title}
            </p>
            <p className="mt-2 text-small text-muted">{s.note}</p>
          </li>
        ))}
      </ol>

      <div
        ref={panel}
        tabIndex={-1}
        className="mt-14 outline-none"
        aria-live="polite"
        // Re-keying on step restarts the entrance, so each panel arrives
        // rather than swapping in place.
        key={step}
      >
        <div className="animate-[step-in_600ms_cubic-bezier(0.22,1,0.36,1)_both] space-y-10">
          {step === 0 && (
            <>
              <div className="grid gap-10 sm:grid-cols-2">
                <Field
                  label="Your name"
                  placeholder="Jane Okonkwo"
                  autoComplete="name"
                  value={draft.name ?? ''}
                  error={errors.name}
                  onChange={(e) => set('name', e.target.value)}
                />
                <Field
                  label="Email"
                  type="email"
                  placeholder="jane@company.com"
                  autoComplete="email"
                  value={draft.email ?? ''}
                  error={errors.email}
                  onChange={(e) => set('email', e.target.value)}
                />
                <Field
                  label="Phone"
                  type="tel"
                  placeholder="+44 7700 900000"
                  autoComplete="tel"
                  hint="Optional. Include your country code."
                  value={draft.phone ?? ''}
                  error={errors.phone}
                  onChange={(e) => set('phone', e.target.value)}
                />
                <Field
                  label="Company"
                  placeholder="Optional"
                  autoComplete="organization"
                  value={draft.company ?? ''}
                  error={errors.company}
                  onChange={(e) => set('company', e.target.value)}
                />
              </div>

              <ChipGroup
                legend="Where did you hear about us?"
                name="referral"
                multiple
                options={REFERRAL_OPTIONS}
                value={draft.referral ?? []}
                error={errors.referral}
                onChange={(v) => set('referral', v as LeadInput['referral'])}
              />

              {draft.referral?.includes('Other') && (
                <Field
                  label="Tell us where"
                  placeholder="A newsletter, a friend, a conference…"
                  value={draft.referralOther ?? ''}
                  error={errors.referralOther}
                  onChange={(e) => set('referralOther', e.target.value)}
                />
              )}
            </>
          )}

          {step === 1 && (
            <>
              <TextArea
                label="Briefly, what does the business do?"
                placeholder="We make small-batch skincare and sell direct, mostly to people who already know the category…"
                value={draft.businessDescription ?? ''}
                error={errors.businessDescription}
                onChange={(e) => set('businessDescription', e.target.value)}
              />
              <Field
                label="Website"
                placeholder="https://example.com"
                hint="Optional — if there is one yet."
                autoComplete="url"
                value={draft.website ?? ''}
                error={errors.website}
                onChange={(e) => set('website', e.target.value)}
              />
              <ChipGroup
                legend="What are you interested in?"
                name="services"
                multiple
                options={services}
                value={draft.services ?? []}
                error={errors.services}
                onChange={(v) => set('services', v as LeadInput['services'])}
              />
              <TextArea
                label="What would you like our help with, and how would you know it worked?"
                placeholder="We need positioning we can actually hold, and a site that does not undersell the product. Success is…"
                rows={4}
                value={draft.projectGoals ?? ''}
                error={errors.projectGoals}
                onChange={(e) => set('projectGoals', e.target.value)}
              />
              <ChipGroup
                legend="When would you want to start?"
                name="timeline"
                options={TIMELINE_OPTIONS}
                value={draft.timeline ?? ''}
                error={errors.timeline}
                onChange={(v) => set('timeline', v as LeadInput['timeline'])}
              />
            </>
          )}

          {step === 2 && (
            <>
              <ChipGroup
                legend="What budget are you working with?"
                name="budget"
                options={BUDGET_OPTIONS}
                value={draft.budget ?? ''}
                error={errors.budget}
                onChange={(v) => set('budget', v as LeadInput['budget'])}
              />
              <p className="max-w-xl text-small text-muted">
                We ask because it changes the honest answer, not because a bigger number
                buys a better one. If none of these fit, say so on the call.
              </p>

              {/* Honeypot. Hidden from people and from assistive tech; bots
                  fill it and the submission is dropped server-side. */}
              <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
                <label>
                  Do not fill this in
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={draft.website2 ?? ''}
                    onChange={(e) => set('website2', e.target.value)}
                  />
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      {formError && (
        <p role="alert" className="mt-10 border-l-2 border-accent pl-4 text-small text-accent">
          {formError}
        </p>
      )}

      <div className="mt-14 flex items-center justify-between gap-6 border-t hairline pt-8">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || pending}
          className="text-small text-muted transition-colors hover:text-accent disabled:pointer-events-none disabled:opacity-30"
        >
          &larr; Back
        </button>

        {step < 2 ? (
          <GhostButton type="button" onClick={next}>
            Continue
          </GhostButton>
        ) : (
          <PrimaryButton type="button" onClick={submit} disabled={pending}>
            {pending ? 'Sending…' : 'Send the brief'}
          </PrimaryButton>
        )}
      </div>
    </div>
  )
}
