'use client'

import { useEffect, useRef } from 'react'

import { useMotion } from '@/components/motion/motion-provider'
import { gsap } from '@/lib/gsap'

export type Step = { title: string; desc: string }

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
          <p className="eyebrow text-oxblood">How we work</p>
          <h2 className="mt-5 max-w-2xl text-h1 font-bold">
            Four stages. In this order, for a reason.
          </h2>
        </div>

        <div
          ref={track}
          className="flex gap-6 overflow-x-auto px-5 pb-4 lg:w-max lg:gap-10 lg:overflow-visible lg:px-16 lg:pb-0"
        >
          {steps.map((step, i) => (
            <article
              key={step.title}
              // Raised card: a light surface lifted off the page ground with a
              // layered shadow, so the sequence reads as objects moving
              // through space rather than text sliding sideways.
              className="group relative flex w-[80vw] shrink-0 flex-col rounded-lg bg-paper-dim/60 p-8 shadow-(--shadow-card) ring-1 ring-ink/5 backdrop-blur-sm transition-[transform,box-shadow] duration-500 ease-brand hover:-translate-y-1.5 hover:shadow-(--shadow-card-lift) sm:w-[55vw] lg:h-104 lg:w-[32vw] lg:p-10"
            >
              <span className="eyebrow text-oxblood tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-6 text-h2 font-bold">{step.title}</h3>
              <p className="mt-5 max-w-md text-body text-ink-muted">{step.desc}</p>

              {/* Hairline that draws across on hover - a small reward for
                  pointing at the card. */}
              <span className="mt-auto block h-px w-full origin-left scale-x-0 bg-oxblood transition-transform duration-700 ease-brand group-hover:scale-x-100" />
            </article>
          ))}

          {/* Trailing spacer so the last card clears the viewport edge. */}
          <div aria-hidden className="hidden w-[16vw] shrink-0 lg:block" />
        </div>
      </div>
    </section>
  )
}
