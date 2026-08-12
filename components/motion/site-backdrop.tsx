'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useMotion } from '@/components/motion/motion-provider'
import { ScrollTrigger } from '@/lib/gsap'
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

/** Labels the formations, so the animation carries meaning, not decoration. */
const STAGES = [
  { label: 'The kernel', note: 'One idea worth owning.' },
  { label: 'The core', note: 'That idea, resolved into structure.' },
  { label: 'The reach', note: 'Structure, deployed to market.' },
]

export function SiteBackdrop() {
  const { reduced } = useMotion()
  const pathname = usePathname()
  const [showField, setShowField] = useState(false)
  const [stage, setStage] = useState(-1)

  useEffect(() => {
    if (reduced) return
    const id = window.setTimeout(() => setShowField(true), 350)
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
    if (reduced) return

    let stops = [0, 1, 2, 3, 4]

    const measure = () => {
      const vh = window.innerHeight
      const doc = document.documentElement.scrollHeight - vh
      const q = (sel: string) => document.querySelector<HTMLElement>(sel)

      const hero = q('[data-morph-hero]')
      const funnelAt = q('[data-morph-anchor="funnel"]')
      const galaxyAt = q('[data-morph-anchor="galaxy"]')
      const footer = q('footer')

      // Core lands as the hero's sticky panel releases; funnel as the stages
      // sequence arrives; the galaxy takes the whole services stretch to
      // form; the burst runs from there and is gone by the footer.
      const heroRelease = hero ? Math.max(0, hero.offsetTop + hero.offsetHeight - vh) : 0
      const funnelY = funnelAt
        ? Math.max(heroRelease + 1, funnelAt.offsetTop - vh * 0.4)
        : heroRelease + Math.max(1, (doc - heroRelease) * 0.45)
      const galaxyY = galaxyAt
        ? Math.max(funnelY + 1, galaxyAt.offsetTop - vh * 0.3)
        : funnelY + Math.max(1, (doc - funnelY) * 0.4)
      const endY = footer
        ? Math.max(galaxyY + 1, footer.offsetTop - vh)
        : Math.max(galaxyY + 1, doc)

      stops = [0, heroRelease, funnelY, galaxyY, endY]
      // Pages with no hero start at the core - there is no kernel moment to
      // earn without one.
      if (!hero) stops[0] = -Number.MAX_SAFE_INTEGER
    }

    /** Piecewise-linear scroll -> progress, one segment per formation. */
    const toProgress = (y: number) => {
      if (y <= stops[1]) {
        const span = stops[1] - stops[0]
        return span <= 0 ? 1 : Math.max(0, (y - stops[0]) / span)
      }
      for (let i = 1; i < stops.length - 1; i++) {
        if (y <= stops[i + 1]) return i + (y - stops[i]) / (stops[i + 1] - stops[i])
      }
      return stops.length - 1
    }

    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onRefresh: measure,
      onUpdate: (self) => {
        const p = toProgress(self.scroll())
        morph.progress = p
        // The label annotates the sequence, so it retires the moment the
        // funnel lands rather than following the spiral down the page - it
        // sits bottom-right, which is where the stages cards arrive.
        const next = p >= 2 ? -1 : p < 0.72 ? 0 : p < 1.62 ? 1 : 2
        setStage((current) => (current === next ? current : next))
      },
    })
    measure()
    morph.progress = toProgress(window.scrollY)

    return () => trigger.kill()
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
