import Image from 'next/image'
import Link from 'next/link'

import { asMedia, type MediaLike } from '@/lib/payload'
import type { CaseStudy } from '@/cms/payload-types'

const pickSrc = (media: MediaLike | null) => media?.sizes?.card?.url || media?.url || null

/**
 * Selected work as a horizontal card strip.
 *
 * The same object language as the stages carousel - a raised card on the page
 * ground, lifting on a pointer that means it - so the two sequences on the
 * home page read as one system rather than two unrelated components. The grid
 * still exists and is still the right thing on /work, where the job is to
 * show everything at once rather than to offer a few.
 *
 * `scroll-pl` is not decoration: snap-start aligns a card to the snapport
 * edge and ignores padding, so without it the browser parks the first card
 * flush against the screen while the heading above stays indented.
 */
export function WorkSlider({ studies }: { studies: CaseStudy[] }) {
  if (!studies.length) return null

  return (
    <ul
      data-work-track
      className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-pl-5 px-5 pb-4 [scrollbar-width:none] lg:scroll-pl-16 lg:gap-10 lg:px-16"
    >
      {studies.map((study, i) => {
        const cover = asMedia(study.coverImage)
        const src = pickSrc(cover)
        const meta = [study.client, study.industry].filter(Boolean).join(' · ')

        return (
          <li key={study.id} className="flex">
            <Link
              href={`/work/${study.slug}`}
              className="group flex w-[80vw] shrink-0 snap-start flex-col overflow-hidden rounded-lg bg-paper-dim/60 shadow-(--shadow-card) ring-1 ring-ink/5 backdrop-blur-sm transition-[transform,box-shadow] delay-150 duration-700 ease-brand hover:-translate-y-1.5 hover:shadow-(--shadow-card-lift) sm:w-[55vw] lg:w-[32vw]"
            >
              <div className="relative aspect-16/10 overflow-hidden bg-bone">
                {src && (
                  <Image
                    src={src}
                    alt={cover?.alt || study.title}
                    fill
                    sizes="(min-width: 1024px) 32vw, (min-width: 640px) 55vw, 80vw"
                    priority={i === 0}
                    className="object-cover transition-transform duration-900 ease-brand group-hover:scale-[1.04]"
                  />
                )}
                <div className="absolute inset-0 bg-accent opacity-0 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-15" />
              </div>

              <div className="flex flex-1 flex-col p-8 lg:p-10">
                {meta && <p className="eyebrow text-accent">{meta}</p>}
                <h3 className="mt-5 text-h3 font-bold transition-colors duration-300 group-hover:text-accent">
                  {study.title}
                </h3>
                {study.summary && (
                  <p className="mt-4 line-clamp-3 text-small text-muted">{study.summary}</p>
                )}

                {/* Same hairline reward as the stages cards, and the same job:
                    confirm the card is a target without adding a button. The
                    gap is the wrapper's padding, never the rule's own - a
                    background paints the padding box, so a padded 1px span
                    renders as a thick bar. */}
                <div className="mt-auto pt-8">
                  <span className="block h-px w-full origin-left scale-x-0 bg-accent transition-transform delay-200 duration-900 ease-brand group-hover:scale-x-100" />
                </div>
              </div>
            </Link>
          </li>
        )
      })}

      {/* Trailing spacer so the last card can clear the viewport edge. */}
      <li aria-hidden className="hidden w-[16vw] shrink-0 lg:block" />
    </ul>
  )
}
