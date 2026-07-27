'use client'

import Lenis from 'lenis'
import { usePathname } from 'next/navigation'
import { createContext, useContext, useEffect, useRef, useState } from 'react'

import { gsap, ScrollTrigger } from '@/lib/gsap'

type MotionState = {
  /** True when the visitor has asked for reduced motion, or the device is weak. */
  reduced: boolean
  lenis: Lenis | null
}

const MotionContext = createContext<MotionState>({ reduced: true, lenis: null })

export const useMotion = () => useContext(MotionContext)

/**
 * Owns smooth scrolling and the single ScrollTrigger ticker.
 *
 * Everything animated on the site reads `reduced` from here rather than
 * querying the media query independently, so there is exactly one place that
 * decides whether the site moves.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = useState(true) // assume reduced until proven otherwise
  const lenisRef = useRef<Lenis | null>(null)
  const [, force] = useState(0)
  const pathname = usePathname()

  // Decide once whether this visitor gets motion at all.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const weak =
      (navigator.hardwareConcurrency ?? 8) <= 4 ||
      // @ts-expect-error - deviceMemory is Chromium-only
      (navigator.deviceMemory ?? 8) <= 4

    const decide = () => setReduced(query.matches || (coarse && weak))
    decide()
    query.addEventListener('change', decide)
    return () => query.removeEventListener('change', decide)
  }, [])

  useEffect(() => {
    if (reduced) {
      lenisRef.current?.destroy()
      lenisRef.current = null
      return
    }

    const lenis = new Lenis({
      duration: 1.1,
      // Matches --ease-expo, so smooth scroll and CSS share a feel.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    })
    lenisRef.current = lenis
    force((n) => n + 1)

    // One ticker drives both libraries; two RAF loops would jitter.
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reduced])

  // A client-side navigation leaves stale triggers measured against the old
  // document height.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true })
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 180)
    return () => window.clearTimeout(id)
  }, [pathname])

  return (
    <MotionContext.Provider value={{ reduced, lenis: lenisRef.current }}>
      {children}
    </MotionContext.Provider>
  )
}
