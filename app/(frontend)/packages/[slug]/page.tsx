import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BlockRenderer } from '@/components/blocks/block-renderer'
import { Reveal } from '@/components/motion/reveal'
import { ZoomReveal } from '@/components/motion/zoom-reveal'
import { PrimaryLink } from '@/components/ui/cta'
import { asMedia, getPackageBySlug, getPackages } from '@/lib/payload'

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const packages = await getPackages()
  return packages.map((p) => ({ slug: p.slug! }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const pkg = await getPackageBySlug(slug)
  if (!pkg) return {}

  const seo = pkg.seo || {}
  const share = asMedia(seo.image) || asMedia(pkg.coverImage)
  const ogUrl = share?.sizes?.og?.url || share?.url

  return {
    title: seo.title || pkg.title,
    description: seo.description || pkg.summary,
    alternates: { canonical: `/packages/${slug}` },
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'website',
      title: seo.title || pkg.title,
      description: seo.description || pkg.summary,
      images: ogUrl ? [{ url: ogUrl, width: 1200, height: 630 }] : undefined,
    },
  }
}

export default async function PackagePage({ params }: Params) {
  const { slug } = await params
  const pkg = await getPackageBySlug(slug)
  if (!pkg) notFound()

  const cover = asMedia(pkg.coverImage)
  const coverUrl = cover?.sizes?.hero?.url || cover?.url

  const others = (await getPackages()).filter((p) => p.slug !== slug)
  const stages = pkg.stages || []
  const proof = pkg.proof || []
  const includes = pkg.includes || []

  return (
    <article>
      <header className="gutter pb-14 pt-40 lg:pb-20 lg:pt-52">
        <Reveal>
          <Link
            href="/packages"
            className="group inline-flex items-center gap-2 text-small text-muted transition-colors hover:text-accent"
          >
            <span
              aria-hidden
              className="transition-transform duration-300 ease-brand group-hover:-translate-x-1"
            >
              &larr;
            </span>
            All packages
          </Link>

          <h1 className="mt-10 max-w-4xl text-display-2 font-bold">{pkg.title}</h1>
          {pkg.positioning && (
            <p className="mt-6 max-w-3xl text-lead text-accent">{pkg.positioning}</p>
          )}
          <p className="mt-8 max-w-2xl text-lead text-muted">{pkg.summary}</p>

          {(pkg.priceLabel || pkg.timeline) && (
            <dl className="mt-12 flex flex-wrap gap-x-16 gap-y-6">
              {pkg.priceLabel && (
                <div>
                  <dt className="eyebrow text-muted">Investment</dt>
                  <dd className="mt-2 text-h3 font-bold">{pkg.priceLabel}</dd>
                </div>
              )}
              {pkg.timeline && (
                <div>
                  <dt className="eyebrow text-muted">Timeline</dt>
                  <dd className="mt-2 text-h3 font-bold">{pkg.timeline}</dd>
                </div>
              )}
            </dl>
          )}
        </Reveal>
      </header>

      {coverUrl && (
        <ZoomReveal className="gutter" mode="in" amount={0.05}>
          <div className="relative aspect-16/9 w-full overflow-hidden rounded-md bg-bone shadow-(--shadow-card)">
            <Image
              src={coverUrl}
              alt={cover?.alt || pkg.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </ZoomReveal>
      )}

      {/* What this actually is */}
      {(pkg.whatsIncluded || includes.length > 0) && (
        <section className="gutter py-24 lg:py-32">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow text-accent">What&rsquo;s included</p>
            </Reveal>
            <div className="lg:col-span-8">
              {pkg.whatsIncluded && (
                <Reveal>
                  <p className="max-w-3xl text-lead leading-snug">{pkg.whatsIncluded}</p>
                </Reveal>
              )}
              {includes.length > 0 && (
                <Reveal stagger className="mt-14 grid gap-px overflow-hidden">
                  {includes.map((inc) => (
                    <div key={inc.id} className="border-t hairline pt-6">
                      <h3 className="text-h3 font-bold">{inc.item}</h3>
                      {inc.detail && (
                        <p className="mt-3 max-w-2xl text-body text-muted">{inc.detail}</p>
                      )}
                    </div>
                  ))}
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* The sequence. Same raised-card language as the homepage stages, so
          "how we work" reads the same wherever you meet it. */}
      {stages.length > 0 && (
        <section data-ground="dim" className="gutter bg-paper-dim py-24 lg:py-32">
          <Reveal>
            <p className="eyebrow text-accent">How it runs</p>
            <h2 className="mt-5 max-w-2xl text-h1 font-bold">
              {stages.length} stages. In this order, for a reason.
            </h2>
          </Reveal>

          <Reveal stagger className="mt-16 grid gap-8 lg:grid-cols-2">
            {stages.map((stage, i) => (
              <article
                key={stage.id ?? i}
                className="group relative flex flex-col rounded-lg bg-(--ground) p-8 shadow-(--shadow-card) ring-1 ring-current/5 transition-[transform,box-shadow] delay-150 duration-700 ease-brand hover:-translate-y-1.5 hover:shadow-(--shadow-card-lift) lg:p-10"
              >
                <span className="eyebrow text-accent tabular-nums">
                  Stage {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-6 text-h2 font-bold">{stage.title}</h3>
                <p className="mt-5 text-body text-muted">{stage.desc}</p>
                {/* A bar, not a block. `pt-8` on a 1px span made the
                    background paint the padding box too, so the "hairline"
                    rendered 33px thick; the gap above it is `mt-auto`'s job
                    anyway. */}
                <span className="mt-auto block h-2 w-full origin-left scale-x-0 bg-accent transition-transform delay-200 duration-900 ease-brand group-hover:scale-x-100" />
              </article>
            ))}
          </Reveal>
        </section>
      )}

      {/* Proof */}
      {proof.length > 0 && (
        <section data-ground="ink" className="on-ink gutter py-24 lg:py-32">
          <Reveal>
            <p className="eyebrow text-faint">Why trust us with this</p>
          </Reveal>
          <Reveal stagger className="mt-14 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {proof.map((p, i) => (
              <div key={p.id ?? i} className="border-t hairline-2 pt-6">
                <p className="text-display-3 font-bold leading-none text-accent">{p.value}</p>
                <p className="mt-4 text-h4 font-medium">{p.label}</p>
                {p.detail && <p className="mt-3 text-small text-muted">{p.detail}</p>}
              </div>
            ))}
          </Reveal>
        </section>
      )}

      {/* Anything editorial added in the CMS renders here. */}
      {Array.isArray(pkg.body) && pkg.body.length > 0 && (
        <div className="py-8">
          <BlockRenderer blocks={pkg.body as never} />
        </div>
      )}

      {(pkg.faqs?.length ?? 0) > 0 && (
        <section className="gutter py-24 lg:py-32">
          <div className="grid gap-14 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow text-accent">Questions</p>
            </Reveal>
            <div className="lg:col-span-8">
              {pkg.faqs!.map((faq, i) => (
                <details key={faq.id ?? i} className="group border-b hairline py-6">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-8 text-h4 font-medium marker:hidden">
                    {faq.question}
                    <span
                      aria-hidden
                      className="mt-1 shrink-0 text-accent transition-transform duration-400 ease-brand group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-4 max-w-2xl text-body text-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA + the other packages, so the page always has a next step. */}
      <section className="gutter border-t hairline py-20 lg:py-28">
        <Reveal className="flex flex-wrap items-end justify-between gap-8">
          <h2 className="max-w-xl text-h1 font-bold">
            Right shape? Tell us where the business actually is.
          </h2>
          <PrimaryLink href="/get-a-quote">Start a project</PrimaryLink>
        </Reveal>

        {others.length > 0 && (
          <Reveal stagger className="mt-20 grid gap-10 lg:grid-cols-2">
            {others.map((other) => (
              <Link key={other.id} href={`/packages/${other.slug}`} className="group block">
                <p className="eyebrow text-muted">Also available</p>
                <h3 className="mt-3 text-h2 font-bold transition-colors group-hover:text-accent">
                  {other.title}
                </h3>
                <p className="mt-3 max-w-lg text-small text-muted">{other.positioning}</p>
              </Link>
            ))}
          </Reveal>
        )}
      </section>
    </article>
  )
}
