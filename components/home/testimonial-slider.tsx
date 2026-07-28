'use client'

import { useCallback, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

export type Quote = {
  id: string
  quote: string
  author: string
  role?: string | null
  company?: string | null
}

/**
 * Testimonials, two per slide.
 *
 * Three across made the section unnecessarily tall, because the tallest quote
 * sets the height for the whole row. Two per slide keeps the block short and
 * lets longer quotes breathe.
 *
 * Slides are laid out with CSS scroll-snap rather than transforms, so it works
 * without JS, handles touch natively, and stays keyboard and screen-reader
 * navigable.
 */
export function TestimonialSlider({ quotes }: { quotes: Quote[] }) {
  const perSlide = 2
  const slides: Quote[][] = []
  for (let i = 0; i < quotes.length; i += perSlide) {
    slides.push(quotes.slice(i, i + perSlide))
  }

  const [active, setActive] = useState(0)
  const [node, setNode] = useState<HTMLDivElement | null>(null)

  const goTo = useCallback(
    (index: number) => {
      if (!node) return
      const clamped = Math.max(0, Math.min(slides.length - 1, index))
      node.scrollTo({ left: node.clientWidth * clamped, behavior: 'smooth' })
    },
    [node, slides.length]
  )

  // Track which slide is in view so the dots stay honest during a manual swipe.
  useEffect(() => {
    if (!node) return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        setActive(Math.round(node.scrollLeft / Math.max(1, node.clientWidth)))
      })
    }
    node.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      node.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [node])

  if (!slides.length) return null

  return (
    <div>
      <div
        ref={setNode}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="region"
        aria-roledescription="carousel"
        aria-label="Client testimonials"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className="grid w-full shrink-0 snap-start gap-10 lg:grid-cols-2 lg:gap-14"
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${i + 1} of ${slides.length}`}
            // Keeps off-screen slides out of the tab order. React 19 takes
            // `inert` as a real boolean; an empty string is treated as false
            // and warns.
            inert={i !== active}
          >
            {slide.map((q) => (
              <figure key={q.id} className="flex flex-col">
                <span aria-hidden className="text-display-3 leading-none text-oxblood">
                  &ldquo;
                </span>
                <blockquote className="mt-3 flex-1 text-lead leading-snug text-paper/90">
                  {q.quote}
                </blockquote>
                <figcaption className="mt-8 border-t border-paper/15 pt-5 text-small">
                  <span className="font-medium text-paper">{q.author}</span>
                  {(q.role || q.company) && (
                    <span className="mt-1 block text-paper/50">
                      {[q.role, q.company].filter(Boolean).join(', ')}
                    </span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="mt-12 flex items-center justify-between gap-6 border-t border-paper/15 pt-6">
          <div className="flex gap-2.5" role="tablist" aria-label="Choose slide">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-400 ease-brand',
                  i === active ? 'w-8 bg-oxblood' : 'w-1.5 bg-paper/30 hover:bg-paper/60'
                )}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              disabled={active === 0}
              aria-label="Previous testimonials"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/25 text-paper transition-colors duration-300 hover:border-oxblood hover:text-oxblood disabled:pointer-events-none disabled:opacity-30"
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              disabled={active === slides.length - 1}
              aria-label="Next testimonials"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/25 text-paper transition-colors duration-300 hover:border-oxblood hover:text-oxblood disabled:pointer-events-none disabled:opacity-30"
            >
              &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
