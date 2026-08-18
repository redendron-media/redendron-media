'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

import { useMotion } from '@/components/motion/motion-provider'
import { gsap } from '@/lib/gsap'

const LINES = ['Brands built', 'to outlast', 'the trend cycle.']

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const { reduced } = useMotion()

  useEffect(() => {
    const el = root.current
    if (!el || reduced) return

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

      // The hero copy deliberately does NOT fade or drift on scroll. It stays
      // fully legible for the whole sticky range - the morph behind it is the
      // thing that changes.
    }, el)

    return () => ctx.revert()
  }, [reduced])

  return (
    // Two viewport heights: one to read the hero, one more of pinned hold
    // before it releases. Three was a screen and a half of scrolling with
    // nothing moving, which reads as the page being stuck rather than as a
    // hold. The morph no longer needs the length either - it is paced against
    // the stages carousel now, not against the hero.
    // `data-morph-hero` is how SiteBackdrop finds where the sequence ends.
    <section
      ref={root}
      data-morph-hero
      className={reduced ? 'relative min-h-[92svh]' : 'relative h-[200svh]'}
    >
      {/* Sticky so the type stays in frame for the whole morph. The top
          padding is generous on purpose: the headline is display-scale, and
          at 1440 the block was running up under the fixed header. */}
      <div className="sticky top-0 flex h-svh items-end overflow-hidden pb-16 pt-44 lg:pb-24 lg:pt-52">
        <div data-hero-inner className="gutter relative w-full">
          <p data-hero-fade className="eyebrow text-accent">
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
            <p data-hero-fade className="max-w-lg text-lead text-muted">
              We don&rsquo;t chase trends. We build brands rooted in truth, strategy and craft
              &mdash; born in Sikkim, built for global relevance.
            </p>

            <div data-hero-fade className="flex flex-wrap items-center gap-4">
              <Link
                href="/get-a-quote"
                className="group relative overflow-hidden bg-ink px-8 py-4 text-small text-paper"
              >
                <span className="relative z-10">Start a project</span>
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-accent transition-transform duration-400 ease-brand group-hover:scale-y-100" />
              </Link>
              <Link
                href="/work"
                className="group inline-flex items-center gap-2 border-b hairline-2 pb-1 text-small transition-colors hover:border-accent hover:text-accent"
              >
                See our work
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

      </div>
    </section>
  )
}
