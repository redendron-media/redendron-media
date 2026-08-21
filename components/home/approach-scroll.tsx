'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { useMotion } from '@/components/motion/motion-provider'
import { gsap } from '@/lib/gsap'

export type Step = { title: string; desc: string }

/** Square control, sized to the 44px minimum tap target. */
function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center border border-(--on-ground) text-small transition-[opacity,background-color,color] duration-300 ease-brand disabled:opacity-25 enabled:active:bg-accent enabled:active:text-paper enabled:active:border-accent"
    >
      {children}
    </button>
  )
}

/**
 * Pinned horizontal scroll sequence.
 *
 * The section pins and the track translates sideways as the visitor keeps
 * scrolling down - vertical input, horizontal motion. This is scroll-driven
 * rather than scroll-jacked: the page never takes over the scroll or changes
 * its speed, so the gesture stays exactly as predictable as it was.
 *
 * Under reduced motion, or on narrow screens where pinning fights mobile
 * browser chrome, it falls back to an ordinary horizontal swipe strip.
 */
export function ApproachScroll({ steps }: { steps: Step[] }) {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const { reduced } = useMotion()
  // Only meaningful on the narrow layout, where the track is a real
  // overflow-x strip rather than a pinned GSAP tween.
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  // Swiping is discoverable to some people and invisible to others. On a
  // phone the cards give no hint that there are four of them, so the strip
  // gets explicit controls rather than relying on the gesture being guessed.
  const page = useCallback((direction: 1 | -1) => {
    const el = track.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-stages-card]')
    // Card width plus the gap, so a press lands the next card where the last
    // one was rather than drifting by a few pixels each time.
    const gap = parseFloat(getComputedStyle(el).columnGap || '0') || 0
    const step = card ? card.offsetWidth + gap : el.clientWidth * 0.8
    el.scrollBy({ left: step * direction, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const el = track.current
    if (!el) return
    const onScroll = () => {
      // The track is padded, so a strip scrolled fully left rests at the
      // first card's offset rather than at zero.
      const first = el.querySelector<HTMLElement>('[data-stages-card]')
      setAtStart(el.scrollLeft <= (first?.offsetLeft ?? 0) + 4)
      setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 4)
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    const el = section.current
    const inner = track.current
    if (!el || !inner || reduced) return
    if (!window.matchMedia('(min-width: 1024px)').matches) return

    const ctx = gsap.context(() => {
      const distance = () => inner.scrollWidth - window.innerWidth

      gsap.to(inner, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          // Scroll length equals the horizontal distance, so the mapping
          // between wheel travel and sideways travel is 1:1 and never feels
          // sticky or over-fast.
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      })
    }, el)

    return () => ctx.revert()
  }, [reduced])

  return (
    <section
      ref={section}
      className="relative overflow-hidden py-20 lg:h-svh lg:py-0"
      aria-label="How we work"
    >
      <div className="lg:flex lg:h-full lg:flex-col lg:justify-center">
        <div className="gutter mb-12 lg:mb-16">
          <p className="eyebrow text-accent">How we work</p>
          <h2 className="mt-5 max-w-2xl text-h1 font-bold">
            Four stages. In this order, for a reason.
          </h2>
        </div>

        {/* Tagged so SiteBackdrop can work out which vertical scroll offset
            puts a given card in the middle of the frame - the morph's funnel
            is timed to the last one. */}
        <div
          ref={track}
          data-stages-track
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 [scrollbar-width:none] lg:w-max lg:snap-none lg:gap-10 lg:overflow-visible lg:px-16 lg:pb-0"
        >
          {steps.map((step, i) => (
            <article
              key={step.title}
              data-stages-card
              // Raised card: a light surface lifted off the page ground with a
              // layered shadow, so the sequence reads as objects moving
              // through space rather than text sliding sideways.
              // The lift is deliberately unhurried - a short delay plus a long
              // ease, so brushing past a card does not make the whole row
              // twitch. It only responds to a pointer that means it.
              className="group relative flex w-[80vw] shrink-0 snap-start flex-col rounded-lg bg-paper-dim/60 p-8 shadow-(--shadow-card) ring-1 ring-ink/5 backdrop-blur-sm transition-[transform,box-shadow] delay-150 duration-700 ease-brand hover:-translate-y-1.5 hover:shadow-(--shadow-card-lift) sm:w-[55vw] lg:h-104 lg:w-[32vw] lg:p-10"
            >
              <span className="eyebrow text-accent tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-6 text-h2 font-bold">{step.title}</h3>
              <p className="mt-5 max-w-md text-body text-muted">{step.desc}</p>

              {/* Hairline that draws across on hover - a small reward for
                  pointing at the card. */}
              <span className="mt-auto block h-px w-full origin-left scale-x-0 bg-accent transition-transform delay-200 duration-900 ease-brand group-hover:scale-x-100" />
            </article>
          ))}

          {/* Trailing spacer so the last card clears the viewport edge. */}
          <div aria-hidden className="hidden w-[16vw] shrink-0 lg:block" />
        </div>

        {/* Narrow-screen controls. Hidden on desktop, where the pinned
            scroll sequence is the interaction. */}
        <div className="gutter mt-8 flex items-center gap-3 lg:hidden">
          <StepButton label="Previous stage" disabled={atStart} onClick={() => page(-1)}>
            &larr;
          </StepButton>
          <StepButton label="Next stage" disabled={atEnd} onClick={() => page(1)}>
            &rarr;
          </StepButton>
          <p aria-hidden className="ml-2 text-small text-muted">
            Swipe or step through
          </p>
        </div>
      </div>
    </section>
  )
}
