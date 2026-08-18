'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useMotion } from '@/components/motion/motion-provider'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { morph } from '@/lib/morph-store'

// WebGL never renders on the server and is never in the initial bundle.
const MorphField = dynamic(() => import('@/components/motion/morph-field'), { ssr: false })

/**
 * The page's ground, the field that lives on it, and the pacing of both.
 *
 * Ground and field are fixed to the viewport, so the particle form keeps
 * running behind every section instead of scrolling away with the hero, and
 * section colour changes crossfade the whole frame rather than sliding a
 * coloured block past.
 *
 * Sections opt in by tagging themselves `data-ground="dim|deep|cream|ink"`.
 * Anything untagged is the default paper. The tagged sections still carry a
 * real background class as a fallback; `html[data-backdrop='on']` - set from
 * here, only once this component is alive - is what makes them transparent.
 * If the JS never runs, the page keeps its solid bands and stays legible.
 */

const GROUNDS: Record<string, string> = {
  paper: '#f4f2ed',
  dim: '#ebe8e1',
  deep: '#e0dcd3',
  cream: '#fdfad5',
  ink: '#0b0a08',
}

const INK = '#0b0a08'
const PAPER = '#f4f2ed'
// Oxblood is unreadable on ink, so the dark ground gets the brighter cut.
const ACCENT = '#81120f'
const ACCENT_DARK = '#a3211d'

/**
 * Routes where the particle field does not run.
 *
 * The ground and its crossfade stay - those are the page's colour, not
 * decoration. What goes is the field itself, on pages whose job is to be read
 * or filled in rather than felt: the packages, where the argument is the
 * copy, and the quote form, where anything moving behind an input is a
 * distraction from the one thing we want the visitor to finish.
 */
const NO_FIELD = ['/packages', '/get-a-quote']

const fieldAllowed = (pathname: string) =>
  !NO_FIELD.some((base) => pathname === base || pathname.startsWith(`${base}/`))

/** Labels the formations, so the animation carries meaning, not decoration. */
const STAGES = [
  { label: 'The kernel', note: 'One idea worth owning.' },
  { label: 'The core', note: 'That idea, resolved into structure.' },
  { label: 'The reach', note: 'Structure, deployed to market.' },
]

export function SiteBackdrop() {
  const { reduced } = useMotion()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [stage, setStage] = useState(-1)
  const showField = mounted && fieldAllowed(pathname)

  useEffect(() => {
    if (reduced) return
    const id = window.setTimeout(() => setMounted(true), 350)
    return () => window.clearTimeout(id)
  }, [reduced])

  // Ground colour. Runs whether or not motion is enabled - the alternation is
  // design, not decoration.
  //
  // The colour is published as two custom properties on <html> rather than
  // written straight onto the layer, so anything that floats above the page -
  // the header, most obviously - can tint itself to whatever it is currently
  // over instead of guessing. The crossfade is a CSS transition on those
  // properties, so there is one source of truth and one timing.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.backdrop = 'on'

    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-ground]'))
    // Whichever tagged section straddles the middle of the viewport owns the
    // ground. A root margin collapsed to a band around 50% means the observer
    // fires only on that crossing, not on every intersection.
    const live = new Set<HTMLElement>()

    const apply = () => {
      const current = sections.find((el) => live.has(el))
      const key = current?.dataset.ground || 'paper'
      const dark = key === 'ink'
      root.dataset.ground = key
      root.style.setProperty('--ground', GROUNDS[key] ?? GROUNDS.paper)
      root.style.setProperty('--on-ground', dark ? PAPER : INK)
      root.style.setProperty('--accent', dark ? ACCENT_DARK : ACCENT)
      morph.dark = dark ? 1 : 0
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement
          if (entry.isIntersecting) live.add(el)
          else live.delete(el)
        }
        apply()
      },
      { rootMargin: '-50% 0px -49% 0px', threshold: 0 }
    )

    sections.forEach((el) => observer.observe(el))
    apply()

    return () => {
      observer.disconnect()
      delete root.dataset.backdrop
      delete root.dataset.ground
    }
  }, [pathname])

  // Pacing.
  //
  // The formations are anchored to real sections rather than to a fixed scroll
  // distance, so each one lasts as long as the content it belongs to. Mapped
  // linearly over a fixed length the sequence resolved long before the reader
  // reached the section it was arguing for.
  useEffect(() => {
    if (reduced || !fieldAllowed(pathname)) return

    // Scroll position -> progress, as an explicit list of keyframes rather
    // than one segment per formation, so each transition can be given as much
    // of the page as it needs regardless of how the sections divide up.
    let stops: Array<[y: number, p: number]> = [
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
    ]

    /**
     * Scroll offset at which the last card of the pinned stages carousel is
     * centred in the frame.
     *
     * The carousel pins and translates its track sideways, so that card's own
     * offsetTop says nothing about when you see it - what matters is how far
     * into the pinned range it arrives. GSAP wraps a pinned section in a
     * `.pin-spacer` whose height is the pin distance, which is exactly the
     * horizontal travel, so the two map onto each other linearly.
     *
     * Returns null when the carousel is not pinned (narrow screens, reduced
     * motion), where the section anchor is the right answer anyway.
     */
    const lastStageCardY = () => {
      const track = document.querySelector<HTMLElement>('[data-stages-track]')
      const spacer = track?.closest<HTMLElement>('.pin-spacer')
      if (!track || !spacer) return null
      const cards = track.querySelectorAll<HTMLElement>('[data-stages-card]')
      const card = cards[cards.length - 1]
      const vw = window.innerWidth
      const travel = track.scrollWidth - vw
      if (!card || travel <= 0) return null
      const centre = card.offsetLeft + card.offsetWidth / 2
      const t = Math.min(1, Math.max(0, (centre - vw / 2) / travel))
      return spacer.offsetTop + t * travel
    }

    const measure = () => {
      const vh = window.innerHeight
      const doc = document.documentElement.scrollHeight - vh
      const q = (sel: string) => document.querySelector<HTMLElement>(sel)

      const hero = q('[data-morph-hero]')
      const funnelAt = q('[data-morph-anchor="funnel"]')
      const galaxyAt = q('[data-morph-anchor="galaxy"]')
      const footer = q('footer')

      // Core lands as the hero's sticky panel releases. From there the core
      // spends the whole stages carousel opening out, and is only a finished
      // funnel by the last card. It then spends everything between there and
      // the journal collapsing back inward into the galaxy, and the rest of
      // the page letting go. Nothing in the sequence resolves quickly.
      const heroRelease = hero ? Math.max(0, hero.offsetTop + hero.offsetHeight - vh) : 0
      const funnelY = Math.max(
        heroRelease + 1,
        lastStageCardY() ??
          (funnelAt
            ? funnelAt.offsetTop + funnelAt.offsetHeight - vh * 0.6
            : heroRelease + Math.max(1, (doc - heroRelease) * 0.4))
      )
      const galaxyY = galaxyAt
        ? Math.max(funnelY + 1, galaxyAt.offsetTop - vh * 0.35)
        : funnelY + Math.max(1, (doc - funnelY) * 0.6)
      // Gone by the time the footer fills the frame, not by the time its top
      // edge appears. Pinning the end to `offsetTop - vh` left the burst a
      // third of a screen to run in, which is not an explosion, it is a cut.
      const footerY = footer
        ? Math.max(galaxyY + 1, Math.min(doc, footer.offsetTop - vh * 0.25))
        : Math.max(galaxyY + 1, doc)

      stops = [
        [0, 0],
        [heroRelease, 1],
        [funnelY, 2],
        [galaxyY, 3],
        [footerY, 4],
      ]
      // Pages with no hero start at the core - there is no kernel moment to
      // earn without one.
      if (!hero) stops[0][0] = -Number.MAX_SAFE_INTEGER
    }

    /** Piecewise-linear scroll -> progress across the keyframes. */
    const toProgress = (y: number) => {
      if (y <= stops[0][0]) return stops[0][1]
      for (let i = 0; i < stops.length - 1; i++) {
        const [y0, p0] = stops[i]
        const [y1, p1] = stops[i + 1]
        if (y <= y1) {
          const span = y1 - y0
          return span <= 0 ? p1 : p0 + ((y - y0) / span) * (p1 - p0)
        }
      }
      return stops[stops.length - 1][1]
    }

    // A ScrollTrigger for the measurement only. Driving progress from its
    // onUpdate looked right and was subtly wrong: the callback stops firing
    // past the trigger's `end`, and `end` is whatever the document height was
    // at the last refresh. When a late layout shift stretched the page (the
    // journal images arriving, most often), the last few hundred pixels of
    // scroll went unreported and the burst froze half-dissipated at the
    // bottom of the page. The ticker has no end.
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onRefresh: measure,
    })

    const update = () => {
      const p = toProgress(window.scrollY)
      morph.progress = p
      // The label annotates the hero's stretch of the sequence and retires
      // as the stages carousel takes over - it sits bottom-right, which is
      // where the cards arrive, and the carousel now owns everything from
      // p = 1 to p = 2.
      const next = p >= 1.25 ? -1 : p < 0.45 ? 0 : p < 0.85 ? 1 : 2
      setStage((current) => (current === next ? current : next))
    }

    measure()
    update()
    gsap.ticker.add(update)

    return () => {
      gsap.ticker.remove(update)
      trigger.kill()
    }
  }, [pathname, reduced])

  // Pointer, for the glow. Tracked on the window because the canvas itself is
  // pointer-events-none and sits behind the whole page.
  useEffect(() => {
    if (reduced) return

    const onMove = (e: PointerEvent) => {
      morph.pointer[0] = (e.clientX / window.innerWidth) * 2 - 1
      morph.pointer[1] = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    const onLeave = () => {
      morph.pointer[0] = 9
      morph.pointer[1] = 9
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [reduced])

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* The ground itself. It reads --ground, which crossfades in CSS. */}
        <div className="absolute inset-0 bg-(--ground)" />
        {showField && (
          <div className="absolute inset-0">
            <MorphField />
          </div>
        )}
      </div>

      {/* Names what the form is doing. Fixed rather than parked in the hero,
          because the sequence now runs well past it. Hidden from assistive
          tech: it annotates a visual that is itself decorative. */}
      {showField && (
        <div
          aria-hidden
          className="pointer-events-none fixed bottom-8 right-5 z-0 hidden text-right transition-opacity duration-700 ease-brand lg:right-16 lg:block"
          style={{ opacity: stage < 0 ? 0 : 1 }}
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
              <p className="eyebrow text-accent">
                {String(i + 1).padStart(2, '0')} · {s.label}
              </p>
              <p className="mt-2 text-small text-(--on-ground) opacity-70">{s.note}</p>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
