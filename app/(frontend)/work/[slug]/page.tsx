import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BlockRenderer } from '@/components/blocks/block-renderer'
import { Reveal } from '@/components/motion/reveal'
import type { Service } from '@/cms/payload-types'
import { asMedia, getCaseStudyBySlug, getFeaturedCaseStudies } from '@/lib/payload'

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const studies = await getFeaturedCaseStudies(50)
  return studies.map((s) => ({ slug: s.slug! }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const study = await getCaseStudyBySlug(slug)
  if (!study) return {}

  const seo = study.seo || {}
  const share = asMedia(seo.image) || asMedia(study.coverImage)
  const ogUrl = share?.sizes?.og?.url || share?.url

  return {
    title: seo.title || `${study.client} — ${study.title}`,
    description: seo.description || study.summary,
    alternates: { canonical: `/work/${slug}` },
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      title: seo.title || study.title,
      description: seo.description || study.summary,
      images: ogUrl ? [{ url: ogUrl, width: 1200, height: 630 }] : undefined,
    },
  }
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params
  const study = await getCaseStudyBySlug(slug)
  if (!study) notFound()

  const hero = asMedia(study.heroImage) || asMedia(study.coverImage)
  const heroUrl = hero?.sizes?.hero?.url || hero?.url
  const accent = study.accentColor || '#81120f'

  const related = (await getFeaturedCaseStudies(4)).filter((s) => s.slug !== slug).slice(0, 2)

  const framing = [
    { label: 'The challenge', value: study.challenge },
    { label: 'Our approach', value: study.approach },
    { label: 'The outcome', value: study.outcome },
  ].filter((f) => f.value)

  // depth:3 resolves the relationship, but the generated type still allows a
  // bare id, so narrow before rendering.
  const services = (Array.isArray(study.services) ? study.services : []).filter(
    (s): s is Service => typeof s === 'object' && s !== null
  )

  return (
    <article
      // Each case study can tint its own page from a colour sampled off the
      // project, falling back to brand oxblood.
      style={{ '--accent': accent } as React.CSSProperties}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: study.title,
            description: study.summary,
            image: heroUrl ? [heroUrl] : undefined,
            datePublished: study.publishedAt,
            author: { '@type': 'Organization', name: 'Redendron Media' },
            publisher: { '@type': 'Organization', name: 'Redendron Media' },
          }),
        }}
      />

      {/* Header */}
      <header className="gutter pb-14 pt-40 lg:pb-20 lg:pt-52">
        <Reveal>
          <p className="eyebrow" style={{ color: 'var(--accent)' }}>
            {[study.client, study.industry, study.year].filter(Boolean).join(' · ')}
          </p>
          <h1 className="mt-7 max-w-5xl text-display-2 font-bold">{study.title}</h1>
          <p className="mt-8 max-w-2xl text-lead text-ink-muted">{study.summary}</p>
        </Reveal>
      </header>

      {heroUrl && (
        <div className="relative aspect-16/9 w-full overflow-hidden bg-bone">
          <Image
            src={heroUrl}
            alt={hero?.alt || study.title}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        </div>
      )}

      {/* Framing + metadata */}
      {(framing.length > 0 || services.length > 0) && (
        <section className="gutter py-20 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-[2fr_1fr] lg:gap-20">
            {framing.length > 0 && (
              <Reveal stagger className="space-y-10">
                {framing.map((item) => (
                  <div key={item.label} className="border-t border-ink/15 pt-6">
                    <p className="eyebrow text-ink-muted">{item.label}</p>
                    <p className="mt-4 max-w-2xl text-lead leading-snug">{item.value}</p>
                  </div>
                ))}
              </Reveal>
            )}

            <Reveal className="space-y-8">
              {services.length > 0 && (
                <div className="border-t border-ink/15 pt-6">
                  <p className="eyebrow text-ink-muted">Services</p>
                  <ul className="mt-4 space-y-2">
                    {services.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={`/services/${s.slug}`}
                          className="text-body transition-colors hover:text-oxblood"
                        >
                          {s.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(study.tags) && study.tags.length > 0 && (
                <div className="border-t border-ink/15 pt-6">
                  <p className="eyebrow text-ink-muted">Focus</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {study.tags.map((t, i) => (
                      <li
                        key={i}
                        className="border border-ink/20 px-3 py-1 text-small text-ink-muted"
                      >
                        {t.tag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Reveal>
          </div>
        </section>
      )}

      {/* Metrics */}
      {Array.isArray(study.metrics) && study.metrics.length > 0 && (
        <section className="inverted py-20 lg:py-28">
          <Reveal stagger className="gutter grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {study.metrics.map((m, i) => (
              <div key={i} className="border-t border-paper/20 pt-6">
                <p className="text-display-3 font-bold leading-none text-oxblood">{m.value}</p>
                <p className="mt-4 text-body text-paper/80">{m.label}</p>
              </div>
            ))}
          </Reveal>
        </section>
      )}

      {/* Body */}
      <div className="py-20 lg:py-28">
        <BlockRenderer blocks={study.body as never} />
      </div>

      {/* Testimonial */}
      {study.testimonial && typeof study.testimonial === 'object' && (
        <section className="gutter py-16 lg:py-24">
          <Reveal>
            <figure className="mx-auto max-w-4xl border-l-2 pl-8" style={{ borderColor: accent }}>
              <blockquote className="text-display-3 font-bold leading-tight tracking-tight">
                &ldquo;{study.testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-8 text-small">
                <span className="font-medium">{study.testimonial.author}</span>
                {(study.testimonial.role || study.testimonial.company) && (
                  <span className="mt-1 block text-ink-muted">
                    {[study.testimonial.role, study.testimonial.company]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                )}
              </figcaption>
            </figure>
          </Reveal>
        </section>
      )}

      {/* Next projects */}
      {related.length > 0 && (
        <section className="gutter border-t border-ink/10 py-20 lg:py-28">
          <Reveal>
            <p className="eyebrow text-oxblood">Next</p>
          </Reveal>
          <Reveal stagger className="mt-12 grid gap-10 lg:grid-cols-2">
            {related.map((next) => {
              const cover = asMedia(next.coverImage)
              const url = cover?.sizes?.card?.url || cover?.url
              return (
                <Link key={next.id} href={`/work/${next.slug}`} className="group block">
                  <div className="relative aspect-16/9 overflow-hidden bg-bone">
                    {url && (
                      <Image
                        src={url}
                        alt={cover?.alt || next.title}
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover transition-transform duration-900 ease-brand group-hover:scale-[1.04]"
                      />
                    )}
                  </div>
                  <p className="eyebrow mt-5 text-ink-muted">{next.client}</p>
                  <h3 className="mt-2 text-h3 font-bold transition-colors group-hover:text-oxblood">
                    {next.title}
                  </h3>
                </Link>
              )
            })}
          </Reveal>
        </section>
      )}
    </article>
  )
}
