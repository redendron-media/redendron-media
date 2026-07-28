'use client'

import { useEffect, useMemo, useRef } from 'react'

import { useMotion } from '@/components/motion/motion-provider'
import { gsap } from '@/lib/gsap'

/**
 * A large statement whose words brighten from muted to full ink as it scrolls
 * through the viewport.
 *
 * The whole sentence is always present and readable - this animates colour
 * only, so it never withholds content, and a screen reader or crawler sees one
 * continuous string.
 */
export function ScrollStatement({ text, eyebrow }: { text: string; eyebrow?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { reduced } = useMotion()

  const words = useMemo(() => text.split(' '), [text])

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-word]',
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.5,
          scrollTrigger: {
            trigger: el,
            start: 'top 78%',
            end: 'bottom 55%',
            scrub: 0.5,
          },
        }
      )
    }, el)

    return () => ctx.revert()
  }, [reduced])

  return (
    <div ref={ref}>
      {eyebrow && <p className="eyebrow mb-8 text-accent">{eyebrow}</p>}
      {/* display-3 rather than display-2: at display-2 the sentence filled the
          viewport and read as shouting instead of stating. */}
      <p className="max-w-4xl text-display-3 font-bold leading-[1.12] tracking-tight">
        {words.map((word, i) => (
          <span key={`${word}-${i}`} data-word className="inline-block">
            {word}
            {i < words.length - 1 && ' '}
          </span>
        ))}
      </p>
    </div>
  )
}
