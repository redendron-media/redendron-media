'use client'

import { useEffect, useState } from 'react'

import { useMotion } from '@/components/motion/motion-provider'

/**
 * A cream curtain that lifts on first load.
 *
 * Purely additive: it sits above the page, never blocks pointer events for
 * longer than the animation, and is skipped entirely under reduced motion. The
 * page underneath is fully rendered the whole time, so this delays perception,
 * never content.
 */
export function PageEntrance() {
  const { reduced } = useMotion()
  const [done, setDone] = useState(false)
  const [lifted, setLifted] = useState(false)

  useEffect(() => {
    if (reduced) {
      setDone(true)
      return
    }
    const lift = window.setTimeout(() => setLifted(true), 80)
    // Slightly longer than the transition so it cannot be caught mid-lift.
    const remove = window.setTimeout(() => setDone(true), 1250)
    return () => {
      window.clearTimeout(lift)
      window.clearTimeout(remove)
    }
  }, [reduced])

  if (done) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90] bg-paper"
      style={{
        transform: lifted ? 'translateY(-101%)' : 'translateY(0)',
        transition: 'transform 1000ms cubic-bezier(0.76, 0, 0.24, 1)',
      }}
    />
  )
}
