import Image from 'next/image'
import Link from 'next/link'

import { ApproachScroll } from '@/components/home/approach-scroll'
import { ClientMarquee } from '@/components/home/client-marquee'
import { Hero } from '@/components/home/hero'
import { ServicesAccordion, type ServiceRow } from '@/components/home/services-accordion'
import { WorkGrid } from '@/components/home/work-grid'
import { Reveal } from '@/components/motion/reveal'
import { ScrollStatement } from '@/components/motion/scroll-statement'
import { branding } from '@/constants/branding'
import {
  asMedia,
  getClients,
  getFeaturedCaseStudies,
  getPosts,
  getServices,
  getTestimonials,
} from '@/lib/payload'

export default async function HomePage() {
  const [services, studies, clients, testimonials, posts] = await Promise.all([
    getServices(),
    getFeaturedCaseStudies(4),
    getClients(),
    getTestimonials(3),
    getPosts(3),
  ])

  const serviceRows: ServiceRow[] = services.map((s) => {
    const media = asMedia(s.previewImage)
    const url = media?.sizes?.card?.url || media?.url
    return {
      slug: s.slug!,
      title: s.title,
      tagline: s.tagline,
      summary: s.summary,
      image: url ? { url, alt: media?.alt || '' } : null,
    }
  })

  const logos = clients
    .map((c) => {
      const media = asMedia(c.logo)
      return media?.url ? { id: String(c.id), name: c.name, url: media.url } : null
    })
    .filter(Boolean) as { id: string; name: string; url: string }[]

  return (
    <>
      <Hero />

      <section className="border-y border-ink/10 py-8">
        <ClientMarquee logos={logos} />
      </section>

      {/* Positioning statement - the scroll-driven moment that sets the tone. */}
      <section className="gutter py-28 lg:py-44">
        <ScrollStatement
          eyebrow="What we believe"
          text="Most brands are not invisible. They are unclear. We make the decision the market has been waiting for you to make — then we build everything else on top of it."
        />
      </section>

      {/* Pinned horizontal scroll sequence - vertical input, sideways motion. */}
      <ApproachScroll steps={branding.map((b) => ({ title: b.title, desc: b.desc }))} />

      {/* Services */}
      <section className="py-20 lg:py-28">
        <Reveal className="gutter mb-14 flex flex-wrap items-end justify-between gap-6 lg:mb-20">
          <div>
            <p className="eyebrow text-oxblood">What we do</p>
            <h2 className="mt-5 max-w-2xl text-h1 font-bold">
              Six disciplines, one continuous argument.
            </h2>
          </div>
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 border-b border-ink/30 pb-1 text-small transition-colors hover:border-oxblood hover:text-oxblood"
          >
            All services
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </Link>
        </Reveal>

        <ServicesAccordion services={serviceRows} />
      </section>

      {/* Selected work */}
      <section className="gutter py-20 lg:py-32">
        <Reveal className="mb-14 flex flex-wrap items-end justify-between gap-6 lg:mb-20">
          <div>
            <p className="eyebrow text-oxblood">Selected work</p>
            <h2 className="mt-5 max-w-2xl text-h1 font-bold">Proof, not promises.</h2>
          </div>
          <Link
            href="/work"
            className="group inline-flex items-center gap-2 border-b border-ink/30 pb-1 text-small transition-colors hover:border-oxblood hover:text-oxblood"
          >
            All case studies
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </Link>
        </Reveal>

        <WorkGrid studies={studies} />
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="inverted py-24 lg:py-36">
          <div className="gutter">
            <Reveal>
              <p className="eyebrow text-paper/45">In their words</p>
            </Reveal>
            <Reveal stagger className="mt-14 grid gap-12 lg:grid-cols-3 lg:gap-10">
              {testimonials.map((t) => (
                <figure key={t.id} className="flex flex-col">
                  <span aria-hidden className="text-display-3 leading-none text-oxblood">
                    &ldquo;
                  </span>
                  <blockquote className="mt-4 flex-1 text-lead leading-snug text-paper/90">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-8 border-t border-paper/15 pt-5 text-small">
                    <span className="font-medium text-paper">{t.author}</span>
                    {(t.role || t.company) && (
                      <span className="mt-1 block text-paper/50">
                        {[t.role, t.company].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </figcaption>
                </figure>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* Journal */}
      {posts.length > 0 && (
        <section className="gutter py-24 lg:py-32">
          <Reveal className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-oxblood">Journal</p>
              <h2 className="mt-5 text-h1 font-bold">Thinking out loud.</h2>
            </div>
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 border-b border-ink/30 pb-1 text-small transition-colors hover:border-oxblood hover:text-oxblood"
            >
              All writing
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                &rarr;
              </span>
            </Link>
          </Reveal>

          <Reveal stagger className="grid gap-10 lg:grid-cols-3">
            {posts.map((post) => {
              const cover = asMedia(post.coverImage)
              const src = cover?.sizes?.card?.url || cover?.url
              const category =
                typeof post.category === 'object' && post.category ? post.category.title : null
              return (
                <article key={post.id}>
                  <Link href={`/blog/${post.slug}`} className="group block">
                    <div className="relative aspect-3/2 overflow-hidden bg-bone">
                      {src && (
                        <Image
                          src={src}
                          alt={cover?.alt || ''}
                          fill
                          sizes="(min-width: 1024px) 33vw, 100vw"
                          className="object-cover transition-transform duration-900 ease-brand group-hover:scale-[1.05]"
                        />
                      )}
                    </div>
                    <p className="eyebrow mt-6 text-ink-muted">
                      {[category, post.readingTime ? `${post.readingTime} min read` : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    <h3 className="mt-3 text-h3 font-bold transition-colors group-hover:text-oxblood">
                      {post.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-small text-ink-muted">{post.excerpt}</p>
                  </Link>
                </article>
              )
            })}
          </Reveal>
        </section>
      )}
    </>
  )
}
