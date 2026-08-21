/**
 * Imports the legacy Sanity export into Payload, and seeds the content the old
 * site never had (services, real blog posts, site settings).
 *
 * Idempotent: every entity is looked up by a natural key first, so re-running
 * updates rather than duplicating.
 *
 *   npx payload run scripts/import-payload.ts
 *
 * Requires scripts/export-sanity.mjs to have been run first.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import config from '@payload-config'
import { getPayload } from 'payload'

import { paragraphsToLexical, portableTextToLexical } from './lib/lexical.mjs'
import { blogPosts, caseStudySeeds, serviceSeeds } from './seed-content.mjs'

const EXPORT_DIR = path.join(process.cwd(), 'sanity-export')
const ASSET_DIR = path.join(EXPORT_DIR, 'assets')

const readJson = async (file: string) =>
  JSON.parse(await readFile(path.join(EXPORT_DIR, file), 'utf8'))

async function main() {
  const payload = await getPayload({ config })

  const documents = await readJson('documents.json')
  const assets = await readJson('assets.json')
  const byType = (type: string) => documents.filter((d: any) => d._type === type)

  // ---------------------------------------------------------------- users --
  //
  // The convenience password below is fine against a local SQLite file and is
  // a live CMS takeover against anything else. So it is only ever used for
  // SQLite: pointed at a real database, this script refuses to invent a
  // credential and leaves the first admin to Payload's own create-first-user
  // screen, which is reachable exactly once.
  const isLocalFileDb = !/^postgres(ql)?:\/\//.test(process.env.DATABASE_URI || 'file:')
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'team@redendron.com'
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD || (isLocalFileDb ? 'redendron-dev-2026' : null)

  if (!adminPassword) {
    payload.logger.info(
      'Skipping admin user: no SEED_ADMIN_PASSWORD and this is not a local SQLite database. ' +
        'Create the first admin at /admin on the deployed site.'
    )
  } else {
    const existingAdmins = await payload.find({
      collection: 'users',
      where: { email: { equals: adminEmail } },
      limit: 1,
    })
    if (!existingAdmins.docs.length) {
      await payload.create({
        collection: 'users',
        data: { email: adminEmail, password: adminPassword, name: 'Redendron', role: 'admin' },
      })
      payload.logger.info(`Created admin user ${adminEmail}`)
    }
  }

  // ---------------------------------------------------------------- media --
  // Maps the Sanity asset _id (identical to the _ref used inside documents)
  // to the new Payload media id.
  const mediaMap = new Map<string, number | string>()

  for (const asset of assets) {
    const filename = asset.localFilename
    if (!filename) continue

    // Keyed on the Sanity asset id, which is genuinely unique.
    const existing = await payload.find({
      collection: 'media',
      where: { legacyId: { equals: asset._id } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs.length) {
      mediaMap.set(asset._id, existing.docs[0].id)
      continue
    }

    try {
      const created = await payload.create({
        collection: 'media',
        data: {
          legacyId: asset._id,
          alt: asset.altText || asset.title || humanise(asset.originalFilename || ''),
          caption: asset.description || undefined,
        },
        filePath: path.join(ASSET_DIR, filename),
        overrideAccess: true,
      })
      mediaMap.set(asset._id, created.id)
    } catch (err) {
      payload.logger.error(`Media failed: ${filename} - ${(err as Error).message}`)
    }
  }
  // Assert rather than trust: a mis-keyed dedup previously produced 69 media
  // documents from 42 assets, silently pointing case-study images at the
  // wrong files.
  const mediaTotal = await payload.count({ collection: 'media', overrideAccess: true })
  payload.logger.info(`Media: ${mediaMap.size}/${assets.length} mapped, ${mediaTotal.totalDocs} in library`)
  if (mediaMap.size !== assets.length) {
    throw new Error(`Media mapping incomplete: ${mediaMap.size} of ${assets.length}`)
  }

  const mediaFor = (ref?: any): number | string | undefined => {
    const id = typeof ref === 'string' ? ref : ref?.asset?._ref || ref?._ref
    // The old site pointed every package at the same stock placeholder. That
    // is not artwork, and importing it as if it were leaves three grey boxes
    // on the page. Better to render nothing and let real art be dropped in.
    if (typeof id === 'string' && /placeholder/i.test(id)) return undefined
    return id ? mediaMap.get(id) : undefined
  }

  // -------------------------------------------------------------- clients --
  for (const [index, doc] of byType('clientLogo').entries()) {
    const logo = mediaFor(doc.logo)
    if (!logo) continue
    await upsert(payload, 'clients', { name: { equals: doc.name } }, {
      name: doc.name,
      logo,
      order: index,
    })
  }
  payload.logger.info(`Clients: ${byType('clientLogo').length}`)

  // --------------------------------------------------------- testimonials --
  for (const doc of byType('testimonials')) {
    await upsert(payload, 'testimonials', { author: { equals: doc.name } }, {
      quote: doc.testimonial,
      author: doc.name,
      company: doc.company || undefined,
      featured: true,
    })
  }
  payload.logger.info(`Testimonials: ${byType('testimonials').length}`)

  // Photographic assets only - the client logos are flat SVG marks and would
  // read as broken if used as full-bleed preview art.
  const photoPool = assets
    .filter((a: any) => a.mimeType?.startsWith('image/') && a.mimeType !== 'image/svg+xml')
    .map((a: any) => mediaMap.get(a._id))
    .filter(Boolean) as Array<number | string>

  // ------------------------------------------------------------- services --
  const serviceIds = new Map<string, number | string>()
  for (const [index, seed] of serviceSeeds.entries()) {
    const doc = await upsert(payload, 'services', { slug: { equals: seed.slug } }, {
      title: seed.title,
      slug: seed.slug,
      tagline: seed.tagline,
      summary: seed.summary,
      previewImage: photoPool[index % photoPool.length],
      deliverables: seed.deliverables.map((item: string) => ({ item })),
      process: seed.process,
      body: [
        {
          blockType: 'richText',
          eyebrow: 'What this is',
          heading: seed.bodyHeading,
          content: paragraphsToLexical(seed.body),
          width: 'contained',
        },
      ],
      faqs: seed.faqs,
      order: index,
      featured: true,
      _status: 'published',
    }, PRESERVE_IF_SET)
    serviceIds.set(seed.slug, doc.id)
  }
  payload.logger.info(`Services: ${serviceSeeds.length}`)

  // --------------------------------------------------------- case studies --
  for (const doc of byType('caseStudies')) {
    const slug = doc.slug?.current
    if (!slug) continue

    // The legacy schema stored up to eight parallel arrays of
    // contentTitle{n} / contentImages{n} / content{n}. Walk them in order and
    // flatten into the new composable block list.
    const body: any[] = []
    for (let n = 1; n <= 8; n++) {
      const title = doc[`contentTitle${n}`]
      const text = doc[`content${n}`]
      const images = (doc[`contentImages${n}`] || [])
        .map((entry: any) => mediaFor(entry?.images))
        .filter(Boolean)

      if (title || (Array.isArray(text) && text.length)) {
        body.push({
          blockType: 'richText',
          heading: title || undefined,
          content: portableTextToLexical(text || []),
          width: 'contained',
        })
      }

      if (images.length === 1) {
        body.push({ blockType: 'image', image: images[0], width: 'wide', parallax: true })
      } else if (images.length > 1) {
        body.push({
          blockType: 'gallery',
          layout: images.length === 2 ? 'grid-2' : 'offset',
          images: images.map((image: any) => ({ image })),
        })
      }
    }

    // `services` was an array of long prose strings describing deliverables,
    // not a list of service names - it reads as a deliverables list, so that
    // is where it goes.
    const deliverables: string[] = Array.isArray(doc.services) ? doc.services : []
    if (deliverables.length) {
      body.push({
        blockType: 'richText',
        heading: 'What we delivered',
        content: paragraphsToLexical(deliverables),
        width: 'contained',
      })
    }

    await upsert(payload, 'case-studies', { slug: { equals: slug } }, {
      title: doc.title || doc.projectName,
      client: doc.projectName,
      slug,
      summary:
        doc.introduction ||
        `How Redendron helped ${doc.projectName} in ${doc.industry || 'their category'}.`,
      industry: doc.industry || undefined,
      coverImage: mediaFor(doc.coverImage),
      heroImage: mediaFor(doc.coverImage),
      tags: (doc.tags || []).map((tag: string) => ({ tag })),
      services: [serviceIds.get('brand-strategy')].filter(Boolean),
      challenge: doc.mission || undefined,
      approach: doc.impact || undefined,
      outcome: doc.outcome || undefined,
      body,
      featured: true,
      publishedAt: doc._createdAt,
      _status: 'published',
    })
    payload.logger.info(`Case study: ${doc.projectName} - ${body.length} blocks`)
  }

  // -------------------------------------------------- authored case studies --
  // Written from public information on each client's live site. No metrics are
  // seeded - inventing results for named real clients would be a fabrication.
  for (const seed of caseStudySeeds) {
    const body = seed.body.map((section: any) =>
      section.type === 'quote'
        ? {
            blockType: 'pullQuote',
            quote: section.quote,
            attribution: section.attribution,
          }
        : {
            blockType: 'richText',
            heading: section.heading,
            content: paragraphsToLexical(section.paragraphs),
            width: 'contained',
          }
    )

    await upsert(payload, 'case-studies', { slug: { equals: seed.slug } }, {
      title: seed.title,
      client: seed.client,
      slug: seed.slug,
      summary: seed.summary,
      industry: seed.industry,
      year: seed.year,
      coverImage: photoPool[(caseStudySeeds.indexOf(seed) + 3) % photoPool.length],
      tags: seed.tags.map((tag: string) => ({ tag })),
      services: seed.services.map((s: string) => serviceIds.get(s)).filter(Boolean),
      challenge: seed.challenge,
      approach: seed.approach,
      outcome: seed.outcome,
      body,
      featured: true,
      _status: 'published',
    }, PRESERVE_IF_SET)
    payload.logger.info(`Case study: ${seed.client} - ${body.length} blocks`)
  }

  // ------------------------------------------------------------- packages --
  const packageItems = byType('packageItem')
  for (const [index, doc] of packageItems.entries()) {
    const slug = doc.slug?.current
    if (!slug) continue

    // Stages and proof points get their own fields rather than being
    // flattened into rich text: the first pass lost the numbers off the
    // credibility items and the ordering off the stages, and both are the
    // spine of the page.
    await upsert(payload, 'packages', { slug: { equals: slug } }, {
      title: doc.name || doc.title,
      slug,
      positioning: doc.title || undefined,
      summary: doc.description?.slice(0, 280) || doc.name,
      coverImage: mediaFor(doc.coverImage),
      includes: (doc.descpoints || []).map((point: string) => {
        const [item, ...rest] = point.split(':')
        return { item: item.trim(), detail: rest.join(':').trim() || undefined }
      }),
      whatsIncluded: doc.whatsIncluded || undefined,
      stages: (doc.stages || []).map((s: any) => ({ title: s.title, desc: s.desc })),
      proof: (doc.credibility || [])
        .filter((c: any) => c.value)
        .map((c: any) => ({ value: c.value, label: c.title, detail: c.desc })),
      body: [],
      order: index,
      _status: 'published',
      // `body` is deliberately not preserved here: the first import wrote the
      // stages and proof points into it as rich text, and those blocks would
      // otherwise survive and duplicate what the structured fields now render.
    }, PRESERVE_IF_SET.filter((f) => f !== 'body'))
  }
  payload.logger.info(`Packages: ${packageItems.length}`)

  // ----------------------------------------------------------------- blog --
  // The three legacy posts were test fixtures ("Good BLog" by "Noasd"), so
  // they are deliberately not migrated. These are written from scratch.
  const author = await upsert(payload, 'authors', { slug: { equals: 'redendron' } }, {
    name: 'Redendron Media',
    slug: 'redendron',
    role: 'Brand strategy team',
    bio: 'Strategy, identity and marketing, built from Sikkim for brands that intend to last.',
  })

  const coverPool = photoPool.length ? photoPool : [...mediaMap.values()]
  for (const [index, post] of blogPosts.entries()) {
    const category = await upsert(
      payload,
      'categories',
      { slug: { equals: post.categorySlug } },
      { title: post.category, slug: post.categorySlug }
    )

    await upsert(payload, 'posts', { slug: { equals: post.slug } }, {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      coverImage: coverPool[index % coverPool.length],
      author: author.id,
      category: category.id,
      body: post.body.map((section: any) =>
        section.type === 'quote'
          ? { blockType: 'pullQuote', quote: section.quote, attribution: section.attribution }
          : {
              blockType: 'richText',
              heading: section.heading,
              content: paragraphsToLexical(section.paragraphs),
              width: 'contained',
            }
      ),
      publishedAt: post.publishedAt,
      featured: index === 0,
      _status: 'published',
    }, PRESERVE_IF_SET)
  }
  payload.logger.info(`Blog posts: ${blogPosts.length}`)

  // -------------------------------------------------------- site settings --
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'Redendron Media',
      tagline: 'Anti-fragile brands, built from truth, strategy and craft.',
      email: 'team@redendron.com',
    },
  })

  payload.logger.info('Import complete.')
  process.exit(0)
}

/**
 * Create-or-update by a natural key so the script can be re-run safely.
 *
 * `preserve` names fields that must not be clobbered on update when the stored
 * document already has a value. Image fields are seeded with placeholders from
 * the legacy library; once real artwork has been assigned (via
 * scripts/assign-images.ts or by hand in the CMS), re-running this script must
 * not throw it away.
 */
const PRESERVE_IF_SET = ['coverImage', 'heroImage', 'previewImage', 'body', 'seo']

async function upsert(
  payload: any,
  collection: string,
  where: any,
  data: any,
  preserve: string[] = []
) {
  const found = await payload.find({ collection, where, limit: 1, overrideAccess: true })
  if (found.docs.length) {
    const existing = found.docs[0]
    const next = { ...data }
    for (const field of preserve) {
      const current = existing[field]
      const isSet = Array.isArray(current) ? current.length > 0 : Boolean(current)
      if (isSet) delete next[field]
    }
    return payload.update({
      collection,
      id: existing.id,
      data: next,
      overrideAccess: true,
    })
  }
  return payload.create({ collection, data, overrideAccess: true })
}

const humanise = (filename: string) =>
  filename
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim()

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
