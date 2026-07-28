'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { useMotion } from '@/components/motion/motion-provider'
import { cn } from '@/lib/utils'

export type ServiceRow = {
  slug: string
  title: string
  tagline?: string | null
  summary: string
  image?: { url: string; alt: string; width?: number; height?: number } | null
}

/**
 * Services as an accordion of oversized rows. Hovering a row floats a preview
 * of that service alongside the cursor and dims the others.
 *
 * The preview is driven by a rAF lerp writing transforms directly, not by
 * React state per pointer event - re-rendering on mousemove would drop frames.
 */
export function ServicesAccordion({ services }: { services: ServiceRow[] }) {
  const [active, setActive] = useState<number | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const { reduced } = useMotion()

  useEffect(() => {
    if (reduced) return
    const preview = previewRef.current
    const list = listRef.current
    if (!preview || !list) return

    const pos = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    let raf = 0
    let seeded = false

    const onMove = (e: PointerEvent) => {
      const rect = list.getBoundingClientRect()
      // The preview parks in the right-hand third and only drifts with the
      // cursor. Centring it on the pointer put it straight over the service
      // titles and made them unreadable on hover.
      const anchor = rect.width * 0.80
      const drift = ((e.clientX - rect.left) / rect.width - 0.5) * 60
      target.x = anchor + drift
      target.y = e.clientY - rect.top
      if (!seeded) {
        pos.x = target.x
        pos.y = target.y
        seeded = true
      }
    }

    const tick = () => {
      // Trailing lerp gives the preview weight; matching the cursor exactly
      // reads as cheap.
      pos.x += (target.x - pos.x) * 0.1
      pos.y += (target.y - pos.y) * 0.12
      preview.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(tick)
    }

    list.addEventListener('pointermove', onMove)
    raf = requestAnimationFrame(tick)
    return () => {
      list.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  const showPreview = !reduced && active !== null && services[active]?.image

  return (
    <div className="relative">
      <ul
        ref={listRef}
        className="relative border-t hairline"
        onPointerLeave={() => setActive(null)}
      >
        {services.map((service, i) => {
          const isActive = active === i
          const isOpen = expanded === i
          return (
            <li
              key={service.slug}
              className="border-b hairline"
              onPointerEnter={() => setActive(i)}
            >
              <Link
                href={`/services/${service.slug}`}
                className="group block py-7 lg:py-9"
                // Dim every row except the hovered one.
                style={{
                  opacity: active === null || isActive ? 1 : 0.35,
                  transition: 'opacity 400ms cubic-bezier(0.22,1,0.36,1)',
                }}
              >
                {/* The right third is reserved for the floating preview, so
                    everything textual stays in the left half. The tagline sits
                    under the title rather than opposite it - inline, it slid
                    behind the preview image. */}
                <div className="gutter flex items-start justify-between gap-8 lg:justify-start">
                  <div className="flex items-baseline gap-5 lg:gap-10">
                    <span className="eyebrow mt-3 text-muted tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="flex items-baseline gap-5">
                        <h3
                          className={cn(
                            'text-h1 font-bold transition-transform duration-500 ease-brand',
                            isActive && 'lg:translate-x-2'
                          )}
                        >
                          {service.title}
                        </h3>
                        <span
                          aria-hidden
                          className={cn(
                            'hidden text-h3 text-oxblood transition-all duration-500 ease-brand lg:inline',
                            isActive ? 'translate-x-3 opacity-100' : 'translate-x-0 opacity-0'
                          )}
                        >
                          &rarr;
                        </span>
                      </div>

                      {/* Reserves its own height so hovering never reflows the
                          row and shifts the rows below it. */}
                      <p
                        className="hidden max-w-md text-small text-muted transition-opacity duration-400 lg:block"
                        style={{ opacity: isActive ? 1 : 0 }}
                      >
                        {service.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Mobile: the preview cannot follow a cursor, so the row
                      expands in place instead. */}
                  <button
                    type="button"
                    className="text-h3 text-oxblood lg:hidden"
                    aria-expanded={isOpen}
                    aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${service.title}`}
                    onClick={(e) => {
                      e.preventDefault()
                      setExpanded(isOpen ? null : i)
                    }}
                  >
                    <span
                      className={cn(
                        'block transition-transform duration-400',
                        isOpen && 'rotate-45'
                      )}
                    >
                      +
                    </span>
                  </button>
                </div>

                <div
                  className="gutter grid overflow-hidden transition-[grid-template-rows] duration-500 ease-brand lg:hidden"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="min-h-0">
                    <p className="pb-2 pt-5 text-small text-muted">{service.summary}</p>
                    {service.image && (
                      <div className="relative mt-4 aspect-16/10 w-full overflow-hidden rounded">
                        <Image
                          src={service.image.url}
                          alt=""
                          fill
                          sizes="100vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Floating preview, desktop only. aria-hidden: it duplicates the link
          text and adds nothing for a screen reader. */}
      <div
        ref={previewRef}
        aria-hidden
        className={cn(
          // Landscape 16:10. Website and campaign work is horizontal, and a
          // portrait crop was cutting the interesting part out of every
          // preview. Upload landscape art to Services -> Preview Image.
          'pointer-events-none absolute left-0 top-0 z-20 hidden aspect-16/10 w-96 overflow-hidden rounded-md shadow-(--shadow-card-lift) lg:block xl:w-112',
          'transition-[opacity,scale] duration-500 ease-brand',
          showPreview ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
      >
        {services.map((service, i) =>
          service.image ? (
            <Image
              key={service.slug}
              src={service.image.url}
              alt=""
              fill
              sizes="448px"
              className={cn(
                'object-cover transition-opacity duration-400',
                active === i ? 'opacity-100' : 'opacity-0'
              )}
            />
          ) : null
        )}
      </div>
    </div>
  )
}
