'use client'

import { useEffect, useRef } from 'react'

import { useMotion } from '@/components/motion/motion-provider'
import { gsap } from '@/lib/gsap'

type RevealProps = {
  children: React.ReactNode
  className?: string
  /** Stagger direct children instead of moving the wrapper as one piece. */
  stagger?: boolean
  delay?: number
  /** How far it travels, in px. */
  distance?: number
  as?: 'div' | 'section' | 'ul' | 'li' | 'header' | 'footer'
}

/**
 * The workhorse scroll reveal.
 *
 * Content is always in the DOM and readable from first paint - this only
 * animates opacity and transform, so nothing here gates whether text renders
 * or gets indexed.
 *
 * The pre-hide is done in CSS via `[data-motion='on'] [data-reveal]`, set by a
 * blocking script in the layout. Doing it with inline style in an effect would
 * paint the content, then hide it, then fade it back in - a visible flash.
 */
export function Reveal({
  children,
  className,
  stagger = false,
  delay = 0,
  distance = 28,
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const { reduced } = useMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Motion is off: make sure nothing is left hidden by the CSS pre-hide.
    if (reduced) {
      gsap.set(el, { clearProps: 'all', opacity: 1, y: 0 })
      gsap.set(Array.from(el.children), { clearProps: 'all', opacity: 1, y: 0 })
      return
    }

    const targets = stagger ? Array.from(el.children) : [el]

    const ctx = gsap.context(() => {
      // The wrapper itself must be visible before staggering its children.
      if (stagger) gsap.set(el, { opacity: 1 })

      gsap.fromTo(
        targets,
        { opacity: 0, y: distance },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'brand',
          delay,
          stagger: stagger ? 0.08 : 0,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        }
      )
    }, el)

    return () => ctx.revert()
  }, [reduced, stagger, delay, distance])

  return (
    <Tag ref={ref as never} className={className} data-reveal="">
      {children}
    </Tag>
  )
}
