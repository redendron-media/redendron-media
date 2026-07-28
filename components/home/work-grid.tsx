import Image from 'next/image'
import Link from 'next/link'

import { Reveal } from '@/components/motion/reveal'
import { asMedia, type MediaLike } from '@/lib/payload'
import type { CaseStudy } from '@/cms/payload-types'

const pickSrc = (media: MediaLike | null, preferred: 'card' | 'wide' = 'wide') =>
  media?.sizes?.[preferred]?.url || media?.url || null

export function WorkGrid({ studies }: { studies: CaseStudy[] }) {
  if (!studies.length) return null

  return (
    <ul className="grid gap-x-8 gap-y-16 lg:grid-cols-2">
      {studies.map((study, i) => {
        const cover = asMedia(study.coverImage)
        const src = pickSrc(cover)
        // First card runs full width so a short portfolio still reads as
        // deliberate rather than sparse.
        const featured = i === 0 && studies.length !== 2

        return (
          <li key={study.id} className={featured ? 'lg:col-span-2' : undefined}>
            <Reveal>
              <Link href={`/work/${study.slug}`} className="group block">
                <div
                  className={`relative overflow-hidden bg-bone ${
                    featured ? 'aspect-16/9' : 'aspect-4/3'
                  }`}
                >
                  {src && (
                    <Image
                      src={src}
                      alt={cover?.alt || study.title}
                      fill
                      sizes={featured ? '100vw' : '(min-width: 1024px) 50vw, 100vw'}
                      priority={i === 0}
                      className="object-cover transition-transform duration-900 ease-brand group-hover:scale-[1.04]"
                    />
                  )}
                  {/* Oxblood wash on hover, tying the grid to the palette. */}
                  <div className="absolute inset-0 bg-accent opacity-0 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-15" />
                </div>

                <div className="mt-6 flex items-start justify-between gap-6">
                  <div>
                    <p className="eyebrow text-muted">
                      {[study.client, study.industry].filter(Boolean).join(' · ')}
                    </p>
                    <h3
                      className={`mt-3 font-bold ${featured ? 'text-h1' : 'text-h3'} max-w-2xl`}
                    >
                      {study.title}
                    </h3>
                    {featured && study.summary && (
                      <p className="mt-4 max-w-xl text-body text-muted">{study.summary}</p>
                    )}
                  </div>
                  <span
                    aria-hidden
                    className="mt-2 shrink-0 text-h3 text-accent transition-transform duration-500 ease-brand group-hover:translate-x-2"
                  >
                    &rarr;
                  </span>
                </div>
              </Link>
            </Reveal>
          </li>
        )
      })}
    </ul>
  )
}
