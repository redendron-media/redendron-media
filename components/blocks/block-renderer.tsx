import Image from 'next/image'

import { RichText } from '@/components/blocks/rich-text'
import { BeforeAfter } from '@/components/blocks/before-after'
import { Reveal } from '@/components/motion/reveal'
import { ParallaxImage } from '@/components/motion/parallax-image'
import { asMedia, type MediaLike } from '@/lib/payload'
import { cn } from '@/lib/utils'

/**
 * Renders the composable block list from Payload.
 *
 * Every block an editor can add in the CMS has a case here. An unknown
 * blockType renders nothing rather than throwing, so adding a block type to
 * the config can never take down a live page before the front end catches up.
 */

const WIDTH: Record<string, string> = {
  contained: 'gutter mx-auto w-full max-w-4xl',
  wide: 'gutter mx-auto w-full max-w-6xl',
  full: 'w-full',
}

const src = (media: MediaLike | null, size: 'card' | 'wide' | 'hero' = 'wide') =>
  media?.sizes?.[size]?.url || media?.url || null

type Block = Record<string, unknown> & { blockType?: string; id?: string }

export function BlockRenderer({ blocks }: { blocks?: Block[] | null }) {
  if (!Array.isArray(blocks) || !blocks.length) return null

  return (
    <div className="flex flex-col gap-16 lg:gap-28">
      {blocks.map((block, i) => (
        <BlockSwitch key={(block.id as string) ?? i} block={block} index={i} />
      ))}
    </div>
  )
}

function BlockSwitch({ block, index }: { block: Block; index: number }) {
  switch (block.blockType) {
    case 'richText': {
      const width = WIDTH[(block.width as string) ?? 'contained']
      return (
        <Reveal as="section" className={width}>
          {block.eyebrow ? <p className="eyebrow mb-4 text-oxblood">{block.eyebrow as string}</p> : null}
          {block.heading ? (
            <h2 className="mb-6 max-w-3xl text-h2 font-bold">{block.heading as string}</h2>
          ) : null}
          <RichText data={block.content} />
        </Reveal>
      )
    }

    case 'image': {
      const media = asMedia(block.image)
      const url = src(media, 'hero')
      if (!url) return null
      const width = WIDTH[(block.width as string) ?? 'contained']
      const inner = (
        <figure className={width}>
          <div className="relative aspect-16/9 overflow-hidden bg-bone">
            <Image
              src={url}
              alt={media?.alt || ''}
              fill
              sizes={block.width === 'full' ? '100vw' : '(min-width: 1024px) 72rem, 100vw'}
              className="object-cover"
            />
          </div>
          {block.caption ? (
            <figcaption className="mt-3 text-small text-muted">
              {block.caption as string}
            </figcaption>
          ) : null}
        </figure>
      )
      return block.parallax ? <ParallaxImage>{inner}</ParallaxImage> : <Reveal>{inner}</Reveal>
    }

    case 'gallery': {
      const images = ((block.images as Array<{ image: unknown; caption?: string }>) || [])
        .map((entry) => ({ media: asMedia(entry.image), caption: entry.caption }))
        .filter((e) => e.media?.url)
      if (!images.length) return null

      const layout = (block.layout as string) ?? 'grid-2'

      if (layout === 'scroll') {
        return (
          <div className="w-full overflow-x-auto pb-4">
            <div className="gutter flex gap-6">
              {images.map((entry, i) => (
                <figure key={i} className="w-[78vw] shrink-0 sm:w-[46vw] lg:w-[34vw]">
                  <div className="relative aspect-4/3 overflow-hidden bg-bone">
                    <Image
                      src={src(entry.media, 'card')!}
                      alt={entry.media?.alt || ''}
                      fill
                      sizes="34vw"
                      className="object-cover"
                    />
                  </div>
                  {entry.caption && (
                    <figcaption className="mt-3 text-small text-muted">
                      {entry.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        )
      }

      return (
        <Reveal
          stagger
          className={cn(
            'gutter mx-auto grid w-full max-w-6xl gap-6',
            layout === 'grid-3' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
          )}
        >
          {images.map((entry, i) => (
            <figure
              key={i}
              // Staggered layout nudges alternate items down so a grid of
              // similar crops does not read as a contact sheet.
              className={cn(layout === 'offset' && i % 2 === 1 && 'sm:mt-16')}
            >
              <div className="relative aspect-4/3 overflow-hidden bg-bone">
                <Image
                  src={src(entry.media, 'card')!}
                  alt={entry.media?.alt || ''}
                  fill
                  sizes="(min-width: 640px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
              {entry.caption && (
                <figcaption className="mt-3 text-small text-muted">{entry.caption}</figcaption>
              )}
            </figure>
          ))}
        </Reveal>
      )
    }

    case 'split': {
      const media = asMedia(block.image)
      const url = src(media, 'card')
      const imageLeft = block.imageSide === 'left'
      return (
        <Reveal as="section" className="gutter mx-auto w-full max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className={cn(imageLeft && 'lg:order-2')}>
              {block.eyebrow ? (
                <p className="eyebrow mb-4 text-oxblood">{block.eyebrow as string}</p>
              ) : null}
              {block.heading ? (
                <h2 className="mb-5 text-h2 font-bold">{block.heading as string}</h2>
              ) : null}
              <RichText data={block.content} />
            </div>
            {url && (
              <div
                className={cn(
                  'relative aspect-4/3 overflow-hidden bg-bone',
                  imageLeft && 'lg:order-1',
                  Boolean(block.sticky) && 'lg:sticky lg:top-28'
                )}
              >
                <Image
                  src={url}
                  alt={media?.alt || ''}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </Reveal>
      )
    }

    case 'stats': {
      const stats = (block.stats as Array<{ value: string; label: string; detail?: string }>) || []
      if (!stats.length) return null
      return (
        <section className="inverted py-20 lg:py-28">
          <div className="gutter mx-auto max-w-6xl">
            {block.heading ? (
              <Reveal>
                <p className="eyebrow mb-12 text-faint">{block.heading as string}</p>
              </Reveal>
            ) : null}
            <Reveal
              stagger
              className={cn(
                'grid gap-10',
                stats.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : `sm:grid-cols-${stats.length}`
              )}
            >
              {stats.map((stat, i) => (
                <div key={i} className="border-t hairline-2 pt-6">
                  <p className="text-display-3 font-bold leading-none text-oxblood">{stat.value}</p>
                  <p className="mt-4 text-body">{stat.label}</p>
                  {stat.detail && (
                    <p className="mt-1 text-small text-faint">{stat.detail}</p>
                  )}
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      )
    }

    case 'pullQuote': {
      const avatar = asMedia(block.avatar)
      return (
        <Reveal as="section" className="gutter mx-auto w-full max-w-4xl">
          <figure className="border-l-2 border-oxblood pl-8">
            <blockquote className="text-display-3 font-bold leading-tight tracking-tight">
              &ldquo;{block.quote as string}&rdquo;
            </blockquote>
            {Boolean(block.attribution || block.role) && (
              <figcaption className="mt-8 flex items-center gap-4 text-small">
                {avatar?.url && (
                  <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-bone">
                    <Image src={avatar.url} alt="" fill sizes="44px" className="object-cover" />
                  </span>
                )}
                <span>
                  <span className="block font-medium">{block.attribution as string}</span>
                  {block.role ? (
                    <span className="block text-muted">{block.role as string}</span>
                  ) : null}
                </span>
              </figcaption>
            )}
          </figure>
        </Reveal>
      )
    }

    case 'beforeAfter': {
      const before = asMedia(block.before)
      const after = asMedia(block.after)
      if (!before?.url || !after?.url) return null
      return (
        <Reveal className="gutter mx-auto w-full max-w-5xl">
          <BeforeAfter
            before={{ url: src(before, 'wide')!, alt: before.alt || '' }}
            after={{ url: src(after, 'wide')!, alt: after.alt || '' }}
            beforeLabel={(block.beforeLabel as string) || 'Before'}
            afterLabel={(block.afterLabel as string) || 'After'}
          />
          {block.caption ? (
            <p className="mt-3 text-small text-muted">{block.caption as string}</p>
          ) : null}
        </Reveal>
      )
    }

    case 'video': {
      const poster = asMedia(block.poster)
      const file = asMedia(block.file)
      const width = WIDTH[(block.width as string) ?? 'wide']

      if (block.source === 'embed' && block.url) {
        return (
          <Reveal className={width}>
            <div className="relative aspect-16/9 overflow-hidden bg-ink">
              <iframe
                src={toEmbedUrl(block.url as string)}
                title={(block.caption as string) || 'Video'}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </Reveal>
        )
      }

      if (!file?.url) return null
      return (
        <Reveal className={width}>
          <video
            controls
            playsInline
            preload="metadata"
            poster={poster?.url || undefined}
            className="w-full bg-ink"
          >
            <source src={file.url} />
          </video>
          {block.caption ? (
            <p className="mt-3 text-small text-muted">{block.caption as string}</p>
          ) : null}
        </Reveal>
      )
    }

    case 'callout': {
      const tone = (block.tone as string) ?? 'accent'
      return (
        <Reveal className="gutter mx-auto w-full max-w-4xl">
          <p
            className={cn(
              'border-l-2 py-2 pl-8 text-lead',
              tone === 'accent' && 'border-oxblood text-ink',
              tone === 'muted' && 'hairline-2 text-muted',
              tone === 'inverted' && 'border-oxblood bg-ink px-8 py-8 text-paper'
            )}
          >
            {block.text as string}
          </p>
        </Reveal>
      )
    }

    default:
      return null
  }
}

/** Normalise a YouTube or Vimeo watch URL into its embeddable form. */
function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
      return `https://www.youtube-nocookie.com/embed/${u.searchParams.get('v')}`
    }
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube-nocookie.com/embed${u.pathname}`
    }
    if (u.hostname.includes('vimeo.com') && !u.pathname.startsWith('/video')) {
      return `https://player.vimeo.com/video${u.pathname}`
    }
    return url
  } catch {
    return url
  }
}
