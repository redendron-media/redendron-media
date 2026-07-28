import Image from 'next/image'
import Link from 'next/link'

import { ApproachScroll } from '@/components/home/approach-scroll'
import { ClientMarquee } from '@/components/home/client-marquee'
import { Hero } from '@/components/home/hero'
import { ServicesAccordion, type ServiceRow } from '@/components/home/services-accordion'
import { TestimonialSlider } from '@/components/home/testimonial-slider'
import { WorkGrid } from '@/components/home/work-grid'
import { Reveal } from '@/components/motion/reveal'
import { ZoomReveal } from '@/components/motion/zoom-reveal'
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
    getTestimonials(6),
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

      {/* `data-ground` hands the section's colour to the fixed ground layer,
          so the whole frame crossfades instead of a coloured block sliding
          past - and the particle field stays visible through it. */}
      <section data-ground="dim" className="border-y hairline bg-paper-dim py-8">
        <ClientMarquee logos={logos} />
      </section>

      {/* Positioning statement - the hardest contrast on the page, landing
          immediately after the hero morph resolves. */}
      <section data-ground="ink" className="on-ink gutter py-32 lg:py-52">
        <ScrollStatement
          eyebrow="What we believe"
          text="Most brands are not invisible. They are unclear. We make the decision the market has been waiting for you to make — then we build everything else on top of it."
        />
      </section>

      {/* Pinned horizontal scroll sequence - vertical input, sideways motion. */}
      <div data-ground="dim" data-morph-anchor="funnel" className="bg-paper-dim">
        <ApproachScroll steps={branding.map((b) => ({ title: b.title, desc: b.desc }))} />
      </div>

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
            className="group inline-flex items-center gap-2 border-b hairline-2 pb-1 text-small transition-colors hover:border-oxblood hover:text-oxblood"
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
            className="group inline-flex items-center gap-2 border-b hairline-2 pb-1 text-small transition-colors hover:border-oxblood hover:text-oxblood"
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

        <ZoomReveal mode="in" amount={0.06}>
          <WorkGrid studies={studies} />
        </ZoomReveal>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section data-ground="ink" className="on-ink py-24 lg:py-32">
          <div className="gutter">
            <Reveal>
              <p className="eyebrow text-faint">In their words</p>
            </Reveal>
            <Reveal className="mt-12">
              <TestimonialSlider
                quotes={testimonials.map((t) => ({
                  id: String(t.id),
                  quote: t.quote,
                  author: t.author,
                  role: t.role,
                  company: t.company,
                }))}
              />
            </Reveal>
          </div>
        </section>
      )}

      {/* Journal */}
      {posts.length > 0 && (
        <section data-ground="dim" className="gutter bg-paper-dim py-24 lg:py-32">
          <Reveal className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-oxblood">Journal</p>
              <h2 className="mt-5 text-h1 font-bold">Thinking out loud.</h2>
            </div>
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 border-b hairline-2 pb-1 text-small transition-colors hover:border-oxblood hover:text-oxblood"
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
                    <p className="eyebrow mt-6 text-muted">
                      {[category, post.readingTime ? `${post.readingTime} min read` : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    <h3 className="mt-3 text-h3 font-bold transition-colors group-hover:text-oxblood">
                      {post.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-small text-muted">{post.excerpt}</p>
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
