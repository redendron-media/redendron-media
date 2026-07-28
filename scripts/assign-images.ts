/**
 * Routes named image files into the right CMS field.
 *
 * Drop files into `incoming/` and run:
 *   npx tsx scripts/assign-images.ts
 *
 * Naming convention - the prefix decides the destination:
 *
 *   service-<slug>.jpg          -> Services.previewImage  (accordion hover art)
 *   case-<slug>-cover.jpg       -> CaseStudies.coverImage (grid + share card)
 *   case-<slug>-hero.jpg        -> CaseStudies.heroImage  (full-bleed header)
 *   case-<slug>-01.jpg  (02...) -> appended to that study's body as a gallery
 *   post-<slug>.jpg             -> Posts.coverImage
 *   package-<slug>.jpg          -> Packages.coverImage
 *   client-<name>.svg           -> Clients.logo
 *   og-default.jpg              -> SiteSettings.defaultOgImage
 *
 * Slugs are the ones in the CMS, e.g. `service-websites.jpg`,
 * `case-zor-sports-cover.jpg`. Anything unrecognised is reported, never
 * guessed at, so a typo surfaces instead of silently landing somewhere wrong.
 */
import { readdir } from 'node:fs/promises'
import path from 'node:path'

import config from '@payload-config'
import { getPayload } from 'payload'

const INCOMING = path.join(process.cwd(), 'incoming')

/** Marks the gallery this script manages, so re-runs replace rather than stack. */
const AUTO_GALLERY = 'Screens (auto)'

type Target =
  | { kind: 'field'; collection: string; slug: string; field: string }
  | { kind: 'gallery'; collection: string; slug: string; order: number }
  | { kind: 'global'; global: string; field: string }

/** Work out where a filename belongs. Returns null if the name is unknown. */
function route(filename: string): Target | null {
  const base = filename.replace(/\.[a-z0-9]+$/i, '')

  if (base === 'og-default') {
    return { kind: 'global', global: 'site-settings', field: 'defaultOgImage' }
  }

  let m = base.match(/^service-(.+)$/)
  if (m) return { kind: 'field', collection: 'services', slug: m[1], field: 'previewImage' }

  m = base.match(/^case-(.+)-(cover|hero)$/)
  if (m) {
    return {
      kind: 'field',
      collection: 'case-studies',
      slug: m[1],
      field: m[2] === 'cover' ? 'coverImage' : 'heroImage',
    }
  }

  m = base.match(/^case-(.+)-(\d{1,2})$/)
  if (m) {
    return { kind: 'gallery', collection: 'case-studies', slug: m[1], order: Number(m[2]) }
  }

  m = base.match(/^post-(.+)$/)
  if (m) return { kind: 'field', collection: 'posts', slug: m[1], field: 'coverImage' }

  m = base.match(/^package-(.+)$/)
  if (m) return { kind: 'field', collection: 'packages', slug: m[1], field: 'coverImage' }

  m = base.match(/^client-(.+)$/)
  if (m) return { kind: 'field', collection: 'clients', slug: m[1], field: 'logo' }

  return null
}

async function main() {
  const payload = await getPayload({ config })

  let files: string[]
  try {
    files = (await readdir(INCOMING)).filter(
      (f) => /\.(jpe?g|png|webp|avif|svg|gif)$/i.test(f) && !f.startsWith('.')
    )
  } catch {
    payload.logger.error(
      `No incoming/ directory. Create it and drop named images in - see the header of this file for the naming convention.`
    )
    process.exit(1)
  }

  if (!files.length) {
    payload.logger.info('incoming/ is empty. Nothing to do.')
    process.exit(0)
  }

  const unknown: string[] = []
  const missing: string[] = []
  const galleries = new Map<string, Array<{ order: number; id: number | string }>>()
  let assigned = 0

  for (const filename of files.sort()) {
    const target = route(filename)
    if (!target) {
      unknown.push(filename)
      continue
    }

    // Clients are matched on name, everything else on slug.
    const where =
      target.kind !== 'global' && target.collection === 'clients'
        ? { name: { like: (target as { slug: string }).slug.replace(/-/g, ' ') } }
        : { slug: { equals: (target as { slug: string }).slug } }

    if (target.kind !== 'global') {
      const found = (await payload.find({
        collection: target.collection as never,
        where: where as never,
        limit: 1,
        overrideAccess: true,
      })) as { docs: Array<{ id: number | string }> }
      if (!found.docs.length) {
        missing.push(`${filename} -> no ${target.collection} matching "${target.slug}"`)
        continue
      }

      const media = await payload.create({
        collection: 'media',
        data: { alt: altFor(filename) },
        filePath: path.join(INCOMING, filename),
        overrideAccess: true,
      })

      if (target.kind === 'field') {
        await payload.update({
          collection: target.collection as never,
          id: found.docs[0].id,
          data: { [target.field]: media.id } as never,
          overrideAccess: true,
        })
        payload.logger.info(`${filename} -> ${target.collection}/${target.slug}.${target.field}`)
        assigned++
      } else {
        const key = `${target.collection}:${target.slug}`
        const list = galleries.get(key) ?? []
        list.push({ order: target.order, id: media.id })
        galleries.set(key, list)
      }
    } else {
      const media = await payload.create({
        collection: 'media',
        data: { alt: altFor(filename) },
        filePath: path.join(INCOMING, filename),
        overrideAccess: true,
      })
      await payload.updateGlobal({
        slug: target.global as never,
        data: { [target.field]: media.id } as never,
        overrideAccess: true,
      })
      payload.logger.info(`${filename} -> ${target.global}.${target.field}`)
      assigned++
    }
  }

  // Numbered images become one gallery block appended to the study's body.
  for (const [key, items] of galleries) {
    const [collection, slug] = key.split(':')
    const found = await payload.find({
      collection: collection as never,
      where: { slug: { equals: slug } } as never,
      limit: 1,
      overrideAccess: true,
    })
    if (!found.docs.length) continue

    const doc = found.docs[0] as { id: number | string; body?: unknown[] }
    const sorted = items.sort((a, b) => a.order - b.order)

    // Tagged with a blockName so a re-run replaces the previous auto gallery
    // instead of stacking another one onto the body. Blocks an editor added
    // by hand are untouched.
    const existing = (Array.isArray(doc.body) ? doc.body : []).filter(
      (b) => (b as { blockName?: string })?.blockName !== AUTO_GALLERY
    )
    const body = [
      ...existing,
      {
        blockType: 'gallery',
        blockName: AUTO_GALLERY,
        layout: sorted.length === 2 ? 'grid-2' : 'offset',
        images: sorted.map((i) => ({ image: i.id })),
      },
    ]

    await payload.update({
      collection: collection as never,
      id: doc.id,
      data: { body } as never,
      overrideAccess: true,
    })
    payload.logger.info(`${sorted.length} images -> ${collection}/${slug} gallery block`)
    assigned += sorted.length
  }

  payload.logger.info(`\nAssigned ${assigned} of ${files.length} files.`)
  if (missing.length) {
    payload.logger.warn(`\nNo matching document:\n  ${missing.join('\n  ')}`)
  }
  if (unknown.length) {
    payload.logger.warn(
      `\nUnrecognised names (left untouched):\n  ${unknown.join('\n  ')}\n` +
        `Expected one of: service-<slug>, case-<slug>-cover|hero|01.., post-<slug>, package-<slug>, client-<name>, og-default`
    )
  }
  process.exit(0)
}

/** Turn a filename into a reasonable default alt an editor can improve. */
const altFor = (filename: string) =>
  filename
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/^(service|case|post|package|client)-/, '')
    .replace(/-(cover|hero)$/, '')
    .replace(/-\d{1,2}$/, '')
    .replace(/-/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
