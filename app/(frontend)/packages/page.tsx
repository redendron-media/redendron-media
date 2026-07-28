import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Reveal } from '@/components/motion/reveal'
import { ScrollStatement } from '@/components/motion/scroll-statement'
import { asMedia, getPackages } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Packages',
  description:
    'Three ways to work with Redendron Media — brand systems, the complete brand build, and a full go-to-market launch.',
  alternates: { canonical: '/packages' },
}

export default async function PackagesPage() {
  const packages = await getPackages()

  return (
    <>
      <section className="gutter pb-16 pt-40 lg:pb-24 lg:pt-52">
        <Reveal>
          <p className="eyebrow text-accent">Packages</p>
          <h1 className="mt-7 max-w-4xl text-display-2 font-bold">
            Three ways in. One standard.
          </h1>
          <p className="mt-8 max-w-xl text-lead text-muted">
            Every engagement starts with the same question &mdash; what decision does your
            market need you to make? These are the three shapes that answer takes.
          </p>
        </Reveal>
      </section>

      {/* The list. Each package is a full-width row rather than a pricing card:
          the differences between them are editorial, not a feature matrix. */}
      <section className="gutter pb-24 lg:pb-32">
        <ul className="border-t hairline">
          {packages.map((pkg, i) => {
            const cover = asMedia(pkg.coverImage)
            const src = cover?.sizes?.card?.url || cover?.url
            return (
              <li key={pkg.id} className="border-b hairline">
                <Link
                  href={`/packages/${pkg.slug}`}
                  className="group grid gap-8 py-12 lg:grid-cols-12 lg:gap-12 lg:py-16"
                >
                  <div className="lg:col-span-1">
                    <span className="eyebrow text-accent tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Two columns rather than a card with a picture slot: the
                      packages have no artwork of their own, and a row that
                      only looks right once someone uploads an image is a row
                      that will look wrong for months. Art, when it exists,
                      sits under the title. */}
                  <div className="lg:col-span-5">
                    <h2 className="text-h1 font-bold transition-colors duration-300 group-hover:text-accent">
                      {pkg.title}
                    </h2>
                    {pkg.positioning && (
                      <p className="mt-4 text-lead text-accent">{pkg.positioning}</p>
                    )}
                    {src && (
                      <div className="relative mt-8 aspect-16/10 overflow-hidden rounded-md bg-bone shadow-(--shadow-card) transition-shadow duration-700 ease-brand group-hover:shadow-(--shadow-card-lift)">
                        <Image
                          src={src}
                          alt={cover?.alt || ''}
                          fill
                          sizes="(min-width: 1024px) 40vw, 100vw"
                          className="object-cover transition-transform duration-900 ease-brand group-hover:scale-[1.04]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-6">
                    <p className="max-w-xl text-lead leading-snug text-muted">{pkg.summary}</p>

                    {(pkg.includes?.length ?? 0) > 0 && (
                      <ul className="mt-10 max-w-xl">
                        {pkg.includes!.map((inc) => (
                          <li key={inc.id} className="border-t hairline py-4">
                            <p className="text-body font-medium">{inc.item}</p>
                            {inc.detail && (
                              <p className="mt-1 text-small text-muted">{inc.detail}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    <span className="mt-10 inline-flex items-center gap-2 border-b hairline-2 pb-1 text-small transition-colors group-hover:border-accent group-hover:text-accent">
                      See what&rsquo;s inside
                      <span
                        aria-hidden
                        className="transition-transform duration-300 ease-brand group-hover:translate-x-1"
                      >
                        &rarr;
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section data-ground="ink" className="on-ink gutter py-28 lg:py-40">
        <ScrollStatement
          eyebrow="Not sure which"
          text="Most people pick the wrong one first. Tell us where the business actually is and we will tell you which of these is honest — even when the answer is none of them."
        />
        <Reveal className="mt-14">
          <Link
            href="/get-a-quote"
            className="group relative inline-block overflow-hidden border border-current px-8 py-4 text-small"
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-(--ground)">
              Start a project
            </span>
            <span className="absolute inset-0 origin-bottom scale-y-0 bg-current transition-transform duration-400 ease-brand group-hover:scale-y-100" />
          </Link>
        </Reveal>
      </section>
    </>
  )
}
