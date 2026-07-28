'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { useMotion } from '@/components/motion/motion-provider'
import { gsap, ScrollTrigger } from '@/lib/gsap'

// WebGL never renders on the server and is never in the initial bundle. If it
// fails to load, the hero is unaffected - the type is the hero.
const HeroCanvas = dynamic(() => import('@/components/home/hero-canvas'), {
  ssr: false,
})

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
  const [showCanvas, setShowCanvas] = useState(false)
  const [stage, setStage] = useState(0)

  // Written by ScrollTrigger, read by the render loop. Deliberately a ref -
  // routing 60fps scroll through React state would re-render the whole hero.
  const progress = useRef(0)

  useEffect(() => {
    if (reduced) return
    const id = window.setTimeout(() => setShowCanvas(true), 350)
    return () => window.clearTimeout(id)
  }, [reduced])

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

      // The morph runs over roughly two viewport heights of scroll, so each
      // formation gets time to be read rather than flashing past.
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: '+=200%',
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress * 2
          const next = self.progress < 0.34 ? 0 : self.progress < 0.72 ? 1 : 2
          setStage((current) => (current === next ? current : next))
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

    return () => ctx.revert()
  }, [reduced])

  return (
    // Three viewport heights of scroll length: one to read the hero, two for
    // the morph to run through its three formations while the inner panel
    // stays pinned. Under reduced motion the extra height is not needed.
    <section
      ref={root}
      className={reduced ? 'relative min-h-[92svh]' : 'relative h-[300svh]'}
    >
      {/* Sticky so the form stays in frame for the whole morph while the page
          scrolls past it. */}
      <div className="sticky top-0 flex h-svh items-end overflow-hidden pb-16 pt-40 lg:pb-24">
        {showCanvas && (
          <div className="absolute inset-0 -z-10" aria-hidden>
            <HeroCanvas progressRef={progress} />
          </div>
        )}

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
        {showCanvas && (
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
