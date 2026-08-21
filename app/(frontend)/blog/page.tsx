import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Reveal } from '@/components/motion/reveal'
import { asMedia, getPosts } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Journal',
  description:
    'Writing on brand strategy, design and marketing from the Redendron Media team.',
  alternates: { canonical: '/blog' },
}

export default async function BlogPage() {
  const posts = await getPosts(24)
  const [lead, ...rest] = posts

  return (
    <>
      <section className="gutter pb-14 pt-40 lg:pb-20 lg:pt-52">
        <Reveal>
          <p className="eyebrow text-accent">Journal</p>
          <h1 className="mt-7 max-w-4xl text-display-2 font-bold">Thinking out loud.</h1>
          <p className="mt-8 max-w-xl text-lead text-muted">
            Arguments we have had with ourselves, written down. Mostly about brand, and
            about why most of what gets called strategy is decoration.
          </p>
        </Reveal>
      </section>

      {posts.length === 0 ? (
        <section className="gutter pb-32">
          <p className="text-lead text-muted">Nothing published yet. Shortly.</p>
        </section>
      ) : (
        <section className="gutter pb-24 lg:pb-32">
          {/* The most recent post gets the width. A grid of equal cards makes
              everything look equally optional. */}
          <Reveal>
            <PostCard post={lead} featured />
          </Reveal>

          {rest.length > 0 && (
            <Reveal stagger className="mt-16 grid gap-x-10 gap-y-14 border-t hairline pt-16 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </Reveal>
          )}
        </section>
      )}
    </>
  )
}

function PostCard({
  post,
  featured = false,
}: {
  post: Awaited<ReturnType<typeof getPosts>>[number]
  featured?: boolean
}) {
  const cover = asMedia(post.coverImage)
  const src = featured
    ? cover?.sizes?.hero?.url || cover?.url
    : cover?.sizes?.card?.url || cover?.url
  const category =
    typeof post.category === 'object' && post.category ? post.category.title : null

  return (
    <article>
      <Link
        href={`/blog/${post.slug}`}
        className={`group block ${featured ? 'lg:grid lg:grid-cols-2 lg:items-center lg:gap-14' : ''}`}
      >
        <div
          className={`relative overflow-hidden bg-bone ${featured ? 'aspect-16/10' : 'aspect-3/2'}`}
        >
          {src && (
            <Image
              src={src}
              alt={cover?.alt || ''}
              fill
              priority={featured}
              sizes={featured ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 33vw, 100vw'}
              className="object-cover transition-transform duration-900 ease-brand group-hover:scale-[1.04]"
            />
          )}
        </div>
        <div className={featured ? 'lg:pl-2' : ''}>
          <p className="eyebrow mt-6 text-muted">
            {[category, post.readingTime ? `${post.readingTime} min read` : null]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <h2
            className={`mt-3 font-bold transition-colors group-hover:text-accent ${featured ? 'text-h1' : 'text-h3'}`}
          >
            {post.title}
          </h2>
          <p className={`mt-3 text-muted ${featured ? 'max-w-xl text-lead' : 'line-clamp-3 text-small'}`}>
            {post.excerpt}
          </p>
        </div>
      </Link>
    </article>
  )
}
