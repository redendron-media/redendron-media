'use client'

import Image from 'next/image'
import { useCallback, useRef } from 'react'

export type CaseCard = {
  id: string
  slug?: string | null
  client: string
  industry?: string | null
  title: string
  image?: { url: string; alt: string } | null
  metric?: { value: string; label: string } | null
}

/**
 * Case studies as a swipeable strip, each card leading with the number.
 *
 * On an ad landing page the reader is deciding whether we get results, not
 * browsing a portfolio, so the result is the headline and the client name is
 * the caption. Deliberately not links: every exit from this page is a lost
 * booking, and the whole story is not what this page is selling.
 */
export function CaseCarousel({ cards }: { cards: CaseCard[] }) {
  const track = useRef<HTMLUListElement>(null)

  const nudge = useCallback((dir: 1 | -1) => {
    const el = track.current
    const card = el?.querySelector('li')
    if (!el || !card) return
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 16), behavior: 'smooth' })
  }, [])

  if (!cards.length) return null

  return (
    <div>
      <ul
        ref={track}
        aria-label="Client results"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-5 px-5 pb-4 [scrollbar-width:none] lg:scroll-pl-16 lg:gap-6 lg:px-16 [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((card, i) => (
          <li
            key={card.id}
            className="flex w-[82vw] shrink-0 snap-start flex-col overflow-hidden rounded-xl bg-paper-lift shadow-(--shadow-card) ring-1 ring-ink/5 sm:w-[52vw] lg:w-[30vw]"
          >
            <div className="relative aspect-4/3 overflow-hidden bg-bone">
              {card.image && (
                <Image
                  src={card.image.url}
                  alt={card.image.alt}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 52vw, 82vw"
                  priority={i === 0}
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex flex-1 flex-col p-6 lg:p-8">
              {card.metric ? (
                <>
                  <p className="text-display-3 font-bold text-oxblood">{card.metric.value}</p>
                  <p className="mt-2 text-body">{card.metric.label}</p>
                </>
              ) : (
                <p className="text-h3 font-bold">{card.title}</p>
              )}
              <p className="eyebrow mt-auto pt-6 text-ink-muted">
                {[card.client, card.industry].filter(Boolean).join(' · ')}
              </p>
            </div>
          </li>
        ))}
        <li aria-hidden className="w-1 shrink-0 lg:w-10" />
      </ul>

      {cards.length > 1 && (
        <div className="gutter mt-6 hidden justify-end gap-3 lg:flex">
          {(['Previous', 'Next'] as const).map((label, i) => (
            <button
              key={label}
              type="button"
              aria-label={`${label} case study`}
              onClick={() => nudge(i === 0 ? -1 : 1)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-ink transition-colors hover:bg-ink hover:text-paper"
            >
              <span aria-hidden>{i === 0 ? '←' : '→'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
