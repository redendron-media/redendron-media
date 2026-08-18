import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BlockRenderer } from '@/components/blocks/block-renderer'
import { Reveal } from '@/components/motion/reveal'
import { ZoomReveal } from '@/components/motion/zoom-reveal'
import { PrimaryLink } from '@/components/ui/cta'
import { asMedia, getServiceBySlug, getServices } from '@/lib/payload'

type Params = { params: Promise<{ slug: string }> }

/**
 * A service, on its own page.
 *
 * There is deliberately no `/services` index: the nav and the footer send
 * people straight here, because an index listing six services is a page
 * nobody wants to be on. Everything a visitor needs to move on - the other
 * services, the packages, the quote form - is at the bottom of this one.
 */

export async function generateStaticParams() {
  const services = await getServices()
  return services.map((s) => ({ slug: s.slug! }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) return {}

  const seo = service.seo || {}
  const share = asMedia(seo.image) || asMedia(service.previewImage)
  const ogUrl = share?.sizes?.og?.url || share?.url

  return {
    title: seo.title || service.title,
    description: seo.description || service.summary,
    alternates: { canonical: `/services/${slug}` },
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'website',
      title: seo.title || service.title,
      description: seo.description || service.summary,
      images: ogUrl ? [{ url: ogUrl, width: 1200, height: 630 }] : undefined,
    },
  }
}

export default async function ServicePage({ params }: Params) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) notFound()

  const cover = asMedia(service.previewImage)
  const coverUrl = cover?.sizes?.hero?.url || cover?.url

  const deliverables = service.deliverables || []
  const process = service.process || []
  const faqs = service.faqs || []
  const others = (await getServices()).filter((s) => s.slug !== slug)

  // Packages are a relationship, so they arrive either as ids or as full
  // documents depending on depth. Only the resolved ones are renderable.
  const packages = (Array.isArray(service.relatedPackages) ? service.relatedPackages : []).filter(
    (p): p is Exclude<typeof p, string | number> => typeof p === 'object' && p !== null
  )

  return (
    <article>
      <header className="gutter pb-14 pt-40 lg:pb-20 lg:pt-52">
        <Reveal>
          <p className="eyebrow text-accent">What we do</p>
          <h1 className="mt-7 max-w-4xl text-display-2 font-bold">{service.title}</h1>
          {service.tagline && (
            <p className="mt-6 max-w-3xl text-lead text-accent">{service.tagline}</p>
          )}
          <p className="mt-8 max-w-2xl text-lead text-muted">{service.summary}</p>
        </Reveal>
      </header>

      {coverUrl && (
        <ZoomReveal className="gutter" mode="in" amount={0.05}>
          <div className="relative aspect-16/9 w-full overflow-hidden rounded-md bg-bone shadow-(--shadow-card)">
            <Image
              src={coverUrl}
              alt={cover?.alt || service.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </ZoomReveal>
      )}

      {deliverables.length > 0 && (
        <section className="gutter py-24 lg:py-32">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow text-accent">What you get</p>
            </Reveal>
            <Reveal stagger className="lg:col-span-8">
              {deliverables.map((d, i) => (
                <div key={d.id ?? i} className="border-t hairline pt-6 [&+&]:mt-10">
                  <h2 className="text-h3 font-bold">{d.item}</h2>
                  {d.detail && <p className="mt-3 max-w-2xl text-body text-muted">{d.detail}</p>}
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* The engagement, step by step. Same raised-card language as the
          homepage stages, so "how we work" reads the same wherever you meet
          it. */}
      {process.length > 0 && (
        <section data-ground="dim" className="gutter bg-paper-dim py-24 lg:py-32">
          <Reveal>
            <p className="eyebrow text-accent">How it runs</p>
            <h2 className="mt-5 max-w-2xl text-h1 font-bold">
              {process.length} stages. In this order, for a reason.
            </h2>
          </Reveal>

          <Reveal stagger className="mt-16 grid gap-8 lg:grid-cols-2">
            {process.map((step, i) => (
              <article
                key={step.id ?? i}
                className="group relative flex flex-col rounded-lg bg-(--ground) p-8 shadow-(--shadow-card) ring-1 ring-current/5 transition-[transform,box-shadow] delay-150 duration-700 ease-brand hover:-translate-y-1.5 hover:shadow-(--shadow-card-lift) lg:p-10"
              >
                <div className="flex items-baseline justify-between gap-6">
                  <span className="eyebrow text-accent tabular-nums">
                    Stage {String(i + 1).padStart(2, '0')}
                  </span>
                  {step.duration && <span className="text-small text-muted">{step.duration}</span>}
                </div>
                <h3 className="mt-6 text-h2 font-bold">{step.title}</h3>
                <p className="mt-5 text-body text-muted">{step.description}</p>
                <span className="mt-auto block h-2 w-full origin-left scale-x-0 bg-accent transition-transform delay-200 duration-900 ease-brand group-hover:scale-x-100" />
              </article>
            ))}
          </Reveal>
        </section>
      )}

      {/* Anything editorial added in the CMS renders here. */}
      {Array.isArray(service.body) && service.body.length > 0 && (
        <div className="py-8">
          <BlockRenderer blocks={service.body as never} />
        </div>
      )}

      {faqs.length > 0 && (
        <section className="gutter py-24 lg:py-32">
          <div className="grid gap-14 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <p className="eyebrow text-accent">Questions</p>
            </Reveal>
            <div className="lg:col-span-8">
              {faqs.map((faq, i) => (
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

      <section className="gutter border-t hairline py-20 lg:py-28">
        <Reveal className="flex flex-wrap items-end justify-between gap-8">
          <h2 className="max-w-xl text-h1 font-bold">
            Right shape? Tell us where the business actually is.
          </h2>
          <PrimaryLink href="/get-a-quote">Start a project</PrimaryLink>
        </Reveal>

        {packages.length > 0 && (
          <Reveal stagger className="mt-20 grid gap-10 lg:grid-cols-2">
            {packages.map((pkg) => (
              <Link key={pkg.id} href={`/packages/${pkg.slug}`} className="group block">
                <p className="eyebrow text-muted">Where this sits</p>
                <h3 className="mt-3 text-h2 font-bold transition-colors group-hover:text-accent">
                  {pkg.title}
                </h3>
                <p className="mt-3 max-w-lg text-small text-muted">{pkg.positioning}</p>
              </Link>
            ))}
          </Reveal>
        )}

        {others.length > 0 && (
          <div className="mt-20 border-t hairline pt-10">
            <p className="eyebrow text-muted">Other services</p>
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              {others.map((other) => (
                <li key={other.id}>
                  <Link
                    href={`/services/${other.slug}`}
                    className="text-h4 font-medium transition-colors hover:text-accent"
                  >
                    {other.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </article>
  )
}
