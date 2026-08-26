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
 * Testimonials, two per slide on a wide screen and one on a phone.
 *
 * Three across made the section unnecessarily tall, because the tallest quote
 * sets the height for the whole row. Two per slide keeps the block short and
 * lets longer quotes breathe.
 *
 * On a phone two per slide stacked into one very tall card and the swipe
 * skipped a quote at a time, so the gesture did less than it looked like it
 * should. One per slide gives every testimonial its own swipe.
 *
 * Slides are laid out with CSS scroll-snap rather than transforms, so it works
 * without JS, handles touch natively, and stays keyboard and screen-reader
 * navigable.
 */
/**
 * Oxblood at rest, white once the fill wipes up behind it - the same gesture
 * as the "Start a project" button in the header, so the site has one idea
 * about what a button does rather than one per component.
 */
function NavArrow({
  label,
  glyph,
  onClick,
  disabled,
}: {
  label: string
  glyph: string
  onClick: () => void
  disabled: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-accent transition-colors duration-300 disabled:pointer-events-none disabled:hairline-2 disabled:opacity-30"
    >
      <span
        aria-hidden
        className="relative z-10 text-accent transition-colors duration-300 ease-brand group-hover:text-paper"
      >
        {glyph}
      </span>
      <span className="absolute inset-0 origin-bottom scale-y-0 bg-accent transition-transform duration-300 ease-brand group-hover:scale-y-100" />
    </button>
  )
}

export function TestimonialSlider({ quotes }: { quotes: Quote[] }) {
  // Two is the server-rendered default, so the desktop layout is correct in
  // the first paint and only a phone has to correct itself.
  const [perSlide, setPerSlide] = useState(2)
  const [active, setActive] = useState(0)
  const [node, setNode] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1024px)')
    const apply = () => setPerSlide(wide.matches ? 2 : 1)
    apply()
    wide.addEventListener('change', apply)
    return () => wide.removeEventListener('change', apply)
  }, [])

  const slides: Quote[][] = []
  for (let i = 0; i < quotes.length; i += perSlide) {
    slides.push(quotes.slice(i, i + perSlide))
  }

  // Regrouping changes what slide 3 of 3 even means, so the strip goes back
  // to the start rather than landing somewhere arbitrary.
  useEffect(() => {
    setActive(0)
    node?.scrollTo({ left: 0, behavior: 'auto' })
  }, [perSlide, node])

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
                <span aria-hidden className="text-display-3 leading-none text-accent">
                  &ldquo;
                </span>
                <blockquote className="mt-3 flex-1 text-lead leading-snug text-muted">
                  {q.quote}
                </blockquote>
                <figcaption className="mt-8 border-t hairline pt-5 text-small">
                  <span className="font-medium">{q.author}</span>
                  {(q.role || q.company) && (
                    <span className="mt-1 block text-faint">
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
        <div className="mt-12 flex items-center justify-between gap-6 border-t hairline pt-6">
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
                  i === active ? 'w-8 bg-accent' : 'w-1.5 bg-current opacity-30 hover:opacity-60'
                )}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <NavArrow
              label="Previous testimonials"
              glyph="←"
              onClick={() => goTo(active - 1)}
              disabled={active === 0}
            />
            <NavArrow
              label="Next testimonials"
              glyph="→"
              onClick={() => goTo(active + 1)}
              disabled={active === slides.length - 1}
            />
          </div>
        </div>
      )}
    </div>
  )
}
