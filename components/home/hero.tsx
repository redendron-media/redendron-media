'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { useMotion } from '@/components/motion/motion-provider'
import { gsap } from '@/lib/gsap'

// WebGL never renders on the server and is never in the initial bundle. If it
// fails to load, the hero is unaffected - the type is the hero.
const HeroCanvas = dynamic(() => import('@/components/home/hero-canvas'), {
  ssr: false,
})

const LINES = ['Brands built', 'to outlast', 'the trend cycle.']

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const { reduced } = useMotion()
  const [showCanvas, setShowCanvas] = useState(false)

  // Only mount WebGL once the page is interactive and motion is wanted, so it
  // never competes with the font and first paint.
  useEffect(() => {
    if (reduced) return
    const id = window.setTimeout(() => setShowCanvas(true), 400)
    return () => window.clearTimeout(id)
  }, [reduced])

  useEffect(() => {
    const el = root.current
    if (!el || reduced) return

    const ctx = gsap.context(() => {
      // Headline lines rise from behind their own mask.
      gsap.set('[data-hero-line] > span', { yPercent: 110 })
      gsap.set('[data-hero-fade]', { opacity: 0, y: 16 })

      const tl = gsap.timeline({ delay: 0.15 })
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

      // The whole block drifts up slightly slower than the scroll.
      gsap.to('[data-hero-inner]', {
        yPercent: -14,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 },
      })
    }, el)

    return () => ctx.revert()
  }, [reduced])

  return (
    <section
      ref={root}
      className="relative flex min-h-[92svh] items-end overflow-hidden pb-16 pt-40 lg:min-h-svh lg:pb-24"
    >
      {showCanvas && (
        <div className="absolute inset-0 -z-10" aria-hidden>
          <HeroCanvas intensity={0.3} />
        </div>
      )}

      <div data-hero-inner className="gutter relative w-full">
        <p data-hero-fade className="eyebrow text-oxblood">
          Brand strategy · Design · Marketing
        </p>

        <h1 className="mt-8 text-display-1 font-bold">
          {LINES.map((line) => (
            // Each line is its own overflow-clip mask so the reveal reads as
            // type rising off the page rather than a generic fade.
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
    </section>
  )
}
