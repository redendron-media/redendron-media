import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BlockRenderer } from '@/components/blocks/block-renderer'
import { Reveal } from '@/components/motion/reveal'
import { ZoomReveal } from '@/components/motion/zoom-reveal'
import { PrimaryLink } from '@/components/ui/cta'
import { asMedia, getPostBySlug, getPosts } from '@/lib/payload'

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const posts = await getPosts(50)
  return posts.map((p) => ({ slug: p.slug! }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}

  const seo = post.seo || {}
  const share = asMedia(seo.image) || asMedia(post.coverImage)
  const ogUrl = share?.sizes?.og?.url || share?.url

  return {
    title: seo.title || post.title,
    description: seo.description || post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      title: seo.title || post.title,
      description: seo.description || post.excerpt,
      publishedTime: post.publishedAt || undefined,
      images: ogUrl ? [{ url: ogUrl, width: 1200, height: 630 }] : undefined,
    },
  }
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const cover = asMedia(post.coverImage)
  const coverUrl = cover?.sizes?.hero?.url || cover?.url
  const author = typeof post.author === 'object' && post.author ? post.author : null
  const category =
    typeof post.category === 'object' && post.category ? post.category.title : null
  const others = (await getPosts(4)).filter((p) => p.slug !== slug).slice(0, 3)

  const published = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <article>
      <header className="gutter pb-14 pt-40 lg:pb-20 lg:pt-52">
        <Reveal>
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-small text-muted transition-colors hover:text-accent"
          >
            <span
              aria-hidden
              className="transition-transform duration-300 ease-brand group-hover:-translate-x-1"
            >
              &larr;
            </span>
            All writing
          </Link>

          <p className="eyebrow mt-10 text-accent">
            {[category, post.readingTime ? `${post.readingTime} min read` : null]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {/* Narrower than the other page headers: this one is the opening of
              a read, not a poster. */}
          <h1 className="mt-6 max-w-3xl text-display-3 font-bold">{post.title}</h1>
          <p className="mt-8 max-w-2xl text-lead text-muted">{post.excerpt}</p>

          {(author || published) && (
            <p className="mt-10 text-small text-muted">
              {[author?.name, published].filter(Boolean).join(' · ')}
            </p>
          )}
        </Reveal>
      </header>

      {coverUrl && (
        <ZoomReveal className="gutter" mode="in" amount={0.05}>
          <div className="relative aspect-16/9 w-full overflow-hidden rounded-md bg-bone shadow-(--shadow-card)">
            <Image
              src={coverUrl}
              alt={cover?.alt || post.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </ZoomReveal>
      )}

      {Array.isArray(post.body) && post.body.length > 0 && (
        <div className="py-16 lg:py-24">
          <BlockRenderer blocks={post.body as never} />
        </div>
      )}

      <section className="gutter border-t hairline py-20 lg:py-28">
        <Reveal className="flex flex-wrap items-end justify-between gap-8">
          <h2 className="max-w-xl text-h1 font-bold">
            Got a version of this problem yourself?
          </h2>
          <PrimaryLink href="/get-a-quote">Start a project</PrimaryLink>
        </Reveal>

        {others.length > 0 && (
          <Reveal stagger className="mt-20 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((other) => (
              <Link key={other.id} href={`/blog/${other.slug}`} className="group block">
                <p className="eyebrow text-muted">Also in the journal</p>
                <h3 className="mt-3 text-h3 font-bold transition-colors group-hover:text-accent">
                  {other.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-small text-muted">{other.excerpt}</p>
              </Link>
            ))}
          </Reveal>
        )}
      </section>
    </article>
  )
}
