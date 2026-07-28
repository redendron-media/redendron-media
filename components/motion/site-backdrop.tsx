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
 * The page's ground and the field that lives on it.
 *
 * Both are fixed to the viewport, so the particle form keeps running behind
 * every section instead of scrolling away with the hero, and section colour
 * changes crossfade the whole frame rather than sliding a coloured block past.
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

export function SiteBackdrop() {
  const { reduced } = useMotion()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [showField, setShowField] = useState(false)

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

    setMounted(true)

    return () => {
      observer.disconnect()
      delete root.dataset.backdrop
      delete root.dataset.ground
    }
  }, [pathname])

  // Tail: how far past the hero the visitor has read. Drives the dispersal.
  useEffect(() => {
    if (reduced) return

    // Reset for the new route before anything measures.
    morph.tail = 0
    morph.inHero = false
    morph.progress = 2

    const heroEnd = () => {
      const hero = document.querySelector<HTMLElement>('[data-morph-hero]')
      if (!hero) return 0
      return Math.max(0, hero.offsetTop + hero.offsetHeight - window.innerHeight)
    }

    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: () => `top+=${heroEnd()} top`,
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        morph.tail = self.progress
      },
    })

    return () => trigger.kill()
  }, [pathname, reduced])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* The ground itself. It reads --ground, which crossfades in CSS. */}
      <div className="absolute inset-0 bg-(--ground)" data-mounted={mounted || undefined} />
      {showField && (
        <div className="absolute inset-0">
          <MorphField />
        </div>
      )}
    </div>
  )
}
