/**
 * Seeds the short case studies in scripts/case-study-content.mjs, with their
 * images from incoming/ (case-<slug>-cover, -hero, -01, -02 ...).
 *
 *   npx tsx scripts/seed-case-studies.ts
 *
 * Idempotent: each study is found by slug and updated in place, and an image
 * whose file is already in the media library is reused rather than uploaded
 * again. The cover has to be attached on creation - the collection requires
 * it - which is why this does its own images instead of leaving them to
 * assign-images.ts.
 */
import { readdir } from 'node:fs/promises'
import path from 'node:path'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import { shortCaseStudies } from './case-study-content.mjs'
import { paragraphsToLexical } from './lib/lexical.mjs'

const INCOMING = path.join(process.cwd(), 'incoming')

/** Same name assign-images.ts gives its gallery, so the two never stack. */
const AUTO_GALLERY = 'Screens (auto)'

async function mediaFor(payload: Payload, filename: string, alt: string) {
  // Uploads are converted to WebP on the way in, so the stored name keeps
  // the base and swaps the extension.
  const stored = filename.replace(/\.[a-z]+$/i, '.webp')
  // If a file of that name already sat in the local media folder, Payload
  // stored it under the next free name instead: "x-01" becomes "x-2" and
  // "x-cover" becomes "x-cover-1". Match that too, or a re-run uploads twice.
  const base = stored.replace(/\.webp$/, '')
  const counted = base.match(/^(.*)-(\d+)$/)
  const renamed = `${counted ? `${counted[1]}-${Number(counted[2]) + 1}` : `${base}-1`}.webp`
  const found = await payload.find({
    collection: 'media',
    where: { filename: { in: [stored, renamed] } },
    limit: 1,
    overrideAccess: true,
    depth: 0,
  })
  if (found.docs[0]) return found.docs[0].id
  const created = await payload.create({
    collection: 'media',
    data: { alt },
    filePath: path.join(INCOMING, filename),
    overrideAccess: true,
  })
  return created.id
}

async function main() {
  const payload = await getPayload({ config })

  const files = await readdir(INCOMING)
  const services = await payload.find({ collection: 'services', limit: 50, overrideAccess: true, depth: 0 })
  const serviceIds = new Map(services.docs.map((s) => [s.slug, s.id]))

  for (const seed of shortCaseStudies) {
    let testimonial: number | string | undefined
    if (seed.testimonialFrom) {
      const found = await payload.find({
        collection: 'testimonials',
        where: { author: { equals: seed.testimonialFrom } },
        limit: 1,
        overrideAccess: true,
        depth: 0,
      })
      testimonial = found.docs[0]?.id
    }

    const existing = (
      await payload.find({
        collection: 'case-studies',
        where: { slug: { equals: seed.slug } },
        limit: 1,
        overrideAccess: true,
        depth: 0,
      })
    ).docs[0]

    const own = (part: string) => files.find((f) => f.replace(/\.[a-z]+$/i, '') === `case-${seed.slug}-${part}`)
    const coverFile = own('cover')
    if (!coverFile) throw new Error(`incoming/case-${seed.slug}-cover.* is missing - the collection requires a cover`)
    const heroFile = own('hero')
    const galleryFiles = files.filter((f) => new RegExp(`^case-${seed.slug}-\\d{2}\\.`).test(f)).sort()

    const coverImage = await mediaFor(payload, coverFile, `${seed.client} — ${seed.title}`)
    const heroImage = heroFile ? await mediaFor(payload, heroFile, `${seed.client} — ${seed.title}`) : undefined
    const galleryIds = []
    for (const [i, f] of galleryFiles.entries()) {
      galleryIds.push(await mediaFor(payload, f, `${seed.client} — work sample ${i + 1}`))
    }
    // A gallery needs two or more; a lone image gets the single-image block.
    const gallery =
      galleryIds.length > 1
        ? [
            {
              blockType: 'gallery',
              blockName: AUTO_GALLERY,
              layout: galleryIds.length === 2 ? 'grid-2' : 'offset',
              images: galleryIds.map((image) => ({ image })),
            },
          ]
        : galleryIds.map((image) => ({ blockType: 'image', blockName: AUTO_GALLERY, image, width: 'wide' }))

    const data = {
      title: seed.title,
      client: seed.client,
      slug: seed.slug,
      summary: seed.summary,
      industry: seed.industry,
      year: seed.year,
      tags: seed.tags.map((tag: string) => ({ tag })),
      services: seed.services.map((s: string) => serviceIds.get(s)).filter(Boolean),
      challenge: seed.challenge,
      approach: seed.approach,
      outcome: seed.outcome,
      metrics: seed.metrics,
      coverImage,
      heroImage,
      body: [
        ...seed.body.map((section: { heading: string; paragraphs: string[] }) => ({
          blockType: 'richText',
          heading: section.heading,
          content: paragraphsToLexical(section.paragraphs),
          width: 'contained',
        })),
        ...gallery,
      ],
      testimonial,
      featured: true,
      // Mid-year of the project, so the work list reads in the order it was done.
      publishedAt: existing?.publishedAt || new Date(`${seed.year}-06-30T00:00:00Z`).toISOString(),
      _status: 'published',
    }

    if (existing) {
      await payload.update({
        collection: 'case-studies',
        id: existing.id,
        data: data as never,
        overrideAccess: true,
      })
      payload.logger.info(`Updated ${seed.slug}`)
    } else {
      await payload.create({ collection: 'case-studies', data: data as never, overrideAccess: true })
      payload.logger.info(`Created ${seed.slug}`)
    }
  }

  payload.logger.info(`${shortCaseStudies.length} case studies seeded.`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
