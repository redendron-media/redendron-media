'use client'

import { useEffect, useRef } from 'react'

import { useMotion } from '@/components/motion/motion-provider'
import { gsap } from '@/lib/gsap'

/**
 * Drifts its content against the scroll.
 *
 * The overflow clip lives on the wrapper and the movement on an inner element
 * scaled slightly past 100%, so the image never exposes an edge at either end
 * of the travel.
 */
export function ParallaxImage({
  children,
  amount = 12,
}: {
  children: React.ReactNode
  /** Total travel as a percentage of the element height. */
  amount?: number
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const { reduced } = useMotion()

  useEffect(() => {
    const el = wrap.current
    if (!el || reduced) return

    const inner = el.firstElementChild
    if (!inner) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner,
        { yPercent: -amount / 2 },
        {
          yPercent: amount / 2,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
          },
        }
      )
    }, el)

    return () => ctx.revert()
  }, [reduced, amount])

  return (
    <div ref={wrap} className="overflow-hidden">
      <div style={reduced ? undefined : { scale: 1 + amount / 100 }}>{children}</div>
    </div>
  )
}
