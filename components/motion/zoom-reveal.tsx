'use client'

import { useEffect, useRef } from 'react'

import { useMotion } from '@/components/motion/motion-provider'
import { gsap } from '@/lib/gsap'

type Props = {
  children: React.ReactNode
  className?: string
  /** 'in' settles from oversized to true size; 'out' pushes away as it leaves. */
  mode?: 'in' | 'out' | 'through'
  /** Peak scale departure from 1. 0.08 = 8%. */
  amount?: number
}

/**
 * Scroll-driven scale, for optical depth.
 *
 * 'in'      starts oversized and settles to 1 as it enters - the section
 *           arrives from in front of the viewer.
 * 'out'     sits at 1 and recedes slightly as it leaves.
 * 'through' does both, so the element passes the viewer.
 *
 * Scale only, always paired with a subtle opacity change. No layout property
 * is animated, so this stays on the compositor and never reflows.
 */
export function ZoomReveal({ children, className, mode = 'in', amount = 0.07 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { reduced } = useMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return

    const inner = el.firstElementChild
    if (!inner) return

    const ctx = gsap.context(() => {
      if (mode === 'in') {
        gsap.fromTo(
          inner,
          { scale: 1 + amount, opacity: 0.55 },
          {
            scale: 1,
            opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 32%', scrub: 0.7 },
          }
        )
      } else if (mode === 'out') {
        gsap.fromTo(
          inner,
          { scale: 1, opacity: 1 },
          {
            scale: 1 - amount,
            opacity: 0.45,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'bottom 78%', end: 'bottom top', scrub: 0.7 },
          }
        )
      } else {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.7 },
        })
        tl.fromTo(
          inner,
          { scale: 1 + amount, opacity: 0.6 },
          { scale: 1, opacity: 1, ease: 'none' }
        ).to(inner, { scale: 1 - amount * 0.6, opacity: 0.5, ease: 'none' })
      }
    }, el)

    return () => ctx.revert()
  }, [reduced, mode, amount])

  return (
    <div ref={ref} className={className}>
      <div className="will-change-transform">{children}</div>
    </div>
  )
}
