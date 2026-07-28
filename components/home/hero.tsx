'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { useMotion } from '@/components/motion/motion-provider'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { morph } from '@/lib/morph-store'

const LINES = ['Brands built', 'to outlast', 'the trend cycle.']

/** Labels the three formations, revealed in step with the morph. */
const STAGES = [
  { label: 'The kernel', note: 'One idea worth owning.' },
  { label: 'The core', note: 'That idea, resolved into structure.' },
  { label: 'The reach', note: 'Structure, deployed to market.' },
]

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const { reduced } = useMotion()
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const el = root.current
    if (!el || reduced) return

    // The field itself lives in SiteBackdrop, fixed to the viewport for the
    // whole document. The hero only tells it where in the sequence to be.
    morph.progress = 0
    morph.inHero = true

    const ctx = gsap.context(() => {
      gsap.set('[data-hero-line] > span', { yPercent: 110 })
      gsap.set('[data-hero-fade]', { opacity: 0, y: 16 })

      const tl = gsap.timeline({ delay: 0.1 })
      tl.to('[data-hero-line] > span', {
        yPercent: 0,
        duration: 1.15,
        ease: 'expo.out',
        stagger: 0.085,
      }).to(
        '[data-hero-fade]',
        { opacity: 1, y: 0, duration: 0.8, ease: 'brand', stagger: 0.08 },
        '-=0.65'
      )

      // The morph runs over roughly two viewport heights of scroll, so each
      // formation gets time to be read rather than flashing past.
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: '+=200%',
        scrub: true,
        onUpdate: (self) => {
          morph.progress = self.progress * 2
          const next = self.progress < 0.34 ? 0 : self.progress < 0.72 ? 1 : 2
          setStage((current) => (current === next ? current : next))
        },
        onToggle: (self) => {
          morph.inHero = self.isActive
        },
      })

      // Type drifts up and fades as the form takes over the frame.
      gsap.to('[data-hero-inner]', {
        yPercent: -18,
        opacity: 0.06,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 },
      })
    }, el)

    return () => {
      ctx.revert()
      morph.inHero = false
      morph.progress = 2
    }
  }, [reduced])

  return (
    // Three viewport heights of scroll length: one to read the hero, two for
    // the morph to run through its three formations while the inner panel
    // stays pinned. Under reduced motion the extra height is not needed.
    // `data-morph-hero` is how SiteBackdrop finds where the sequence ends.
    <section
      ref={root}
      data-morph-hero
      className={reduced ? 'relative min-h-[92svh]' : 'relative h-[300svh]'}
    >
      {/* Sticky so the type stays in frame for the whole morph. The top
          padding is generous on purpose: the headline is display-scale, and
          at 1440 the block was running up under the fixed header. */}
      <div className="sticky top-0 flex h-svh items-end overflow-hidden pb-16 pt-44 lg:pb-24 lg:pt-52">
        <div data-hero-inner className="gutter relative w-full">
          <p data-hero-fade className="eyebrow text-oxblood">
            Brand strategy · Design · Marketing
          </p>

          <h1 className="mt-8 text-display-1 font-bold">
            {LINES.map((line) => (
              <span key={line} data-hero-line className="block overflow-hidden">
                <span className="block">{line}</span>
              </span>
            ))}
          </h1>

          <div className="mt-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <p data-hero-fade className="max-w-lg text-lead text-ink-muted">
              We don&rsquo;t chase trends. We build brands rooted in truth, strategy and craft
              &mdash; born in Sikkim, built for global relevance.
            </p>

            <div data-hero-fade className="flex flex-wrap items-center gap-4">
              <Link
                href="/get-a-quote"
                className="group relative overflow-hidden bg-ink px-8 py-4 text-small text-paper"
              >
                <span className="relative z-10">Start a project</span>
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-oxblood transition-transform duration-400 ease-brand group-hover:scale-y-100" />
              </Link>
              <Link
                href="/work"
                className="group inline-flex items-center gap-2 border-b border-ink/30 pb-1 text-small transition-colors hover:border-oxblood hover:text-oxblood"
              >
                See the work
                <span
                  aria-hidden
                  className="transition-transform duration-300 ease-brand group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Names what the form is doing, so the animation carries meaning
            rather than being decoration. Hidden from assistive tech: it
            annotates a visual that is itself decorative. */}
        {!reduced && (
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-8 right-5 hidden text-right lg:right-16 lg:block"
          >
            {STAGES.map((s, i) => (
              <div
                key={s.label}
                className="transition-all duration-700 ease-brand"
                style={{
                  opacity: stage === i ? 1 : 0,
                  transform: stage === i ? 'translateY(0)' : 'translateY(8px)',
                  position: i === 0 ? 'relative' : 'absolute',
                  right: 0,
                  bottom: 0,
                }}
              >
                <p className="eyebrow text-oxblood">
                  {String(i + 1).padStart(2, '0')} · {s.label}
                </p>
                <p className="mt-2 text-small text-ink-muted">{s.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
