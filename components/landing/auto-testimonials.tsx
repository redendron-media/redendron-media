'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { useMotion } from '@/components/motion/motion-provider'
import { cn } from '@/lib/utils'

export type Testimonial = {
  id: string
  quote: string
  author: string
  role?: string | null
  company?: string | null
}

/** How long each card holds before the strip moves on. */
const HOLD_MS = 10_000

/** Where a card sits in the strip's scroll range, allowing for the snap padding. */
const cardScrollLeft = (track: HTMLElement, card: HTMLElement) =>
  card.offsetLeft - track.offsetLeft - (parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0)

/**
 * Testimonials that advance on their own.
 *
 * Built on scroll-snap, so a swipe on a phone is native and needs no library;
 * the timer only ever asks the strip to scroll to the next card. Each card
 * holds for ten seconds with the remaining time shown as a bar, so a reader
 * can see it is about to move rather than having it pulled away mid-sentence.
 *
 * It pauses whenever someone could be reading closely or is not looking at
 * all: a finger or pointer on the strip, keyboard focus inside it, the strip
 * scrolled out of view, or the tab in the background. Under reduced motion it
 * never advances on its own.
 */
export function AutoTestimonials({ items }: { items: Testimonial[] }) {
  const { reduced } = useMotion()
  const track = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(false)

  const goTo = useCallback((index: number) => {
    const el = track.current
    if (!el) return
    const card = el.children[index] as HTMLElement | undefined
    if (!card) return
    el.scrollTo({ left: cardScrollLeft(el, card), behavior: 'smooth' })
  }, [])

  // Which card is in front, kept honest during a manual swipe.
  useEffect(() => {
    const el = track.current
    if (!el) return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const cards = Array.from(el.querySelectorAll<HTMLElement>(':scope > figure'))
        const left = el.scrollLeft
        let best = 0
        const distance = (c: HTMLElement) => Math.abs(cardScrollLeft(el, c) - left)
        cards.forEach((c, i) => {
          if (distance(c) < distance(cards[best])) best = i
        })
        setActive(best)
      })
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const el = track.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.4 })
    io.observe(el)
    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const running = !reduced && visible && !paused && items.length > 1

  useEffect(() => {
    if (!running) return
    const id = window.setTimeout(() => goTo(active + 1 < items.length ? active + 1 : 0), HOLD_MS)
    // Keyed on `active`, so a manual swipe to a new card restarts the hold.
    return () => window.clearTimeout(id)
  }, [running, active, items.length, goTo])

  if (!items.length) return null

  return (
    <div
      onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => window.setTimeout(() => setPaused(false), 1500)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        ref={track}
        role="region"
        aria-roledescription="carousel"
        aria-label="What our clients say"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-5 px-5 pb-2 [scrollbar-width:none] sm:gap-6 lg:scroll-pl-16 lg:px-16 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((t, i) => (
          <figure
            key={t.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${items.length}`}
            className="relative flex w-[86vw] shrink-0 snap-start flex-col overflow-hidden rounded-xl bg-paper p-7 text-ink sm:w-[60vw] sm:p-10 lg:w-[38vw]"
          >
            <span aria-hidden className="text-display-3 leading-none text-oxblood">
              &ldquo;
            </span>
            <blockquote className="mt-2 flex-1 text-lead leading-snug">{t.quote}</blockquote>
            <figcaption className="mt-8 border-t hairline pt-5">
              <span className="block text-body font-bold">{t.author}</span>
              {(t.role || t.company) && (
                <span className="mt-1 block text-small text-ink-muted">
                  {[t.role, t.company].filter(Boolean).join(', ')}
                </span>
              )}
            </figcaption>
            {/* The hold, made visible. Mounted fresh on whichever card is in
                front, so it always starts from empty. */}
            {i === active && running && (
              <span
                aria-hidden
                className="testimonial-hold absolute inset-x-0 bottom-0 h-1 origin-left bg-oxblood"
                style={{ animationDuration: `${HOLD_MS}ms` }}
              />
            )}
          </figure>
        ))}
        <span aria-hidden className="w-1 shrink-0 lg:w-12" />
      </div>

      {items.length > 1 && (
        <div className="gutter mt-8 flex items-center gap-2.5" role="tablist" aria-label="Choose testimonial">
          {items.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Testimonial ${i + 1}`}
              onClick={() => goTo(i)}
              className="flex h-11 items-center"
            >
              <span
                className={cn(
                  'block h-1.5 rounded-full transition-all duration-400 ease-brand',
                  i === active ? 'w-8 bg-paper' : 'w-1.5 bg-paper/35'
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
