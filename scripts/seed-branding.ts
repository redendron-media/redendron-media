/**
 * Puts the site chrome's artwork into the CMS.
 *
 * The logos lived in /public, which meant changing them was a code change and
 * a deploy. They belong in the media library like everything else, with the
 * files on disk kept only as the fallback the components use if the CMS has
 * nothing selected.
 *
 *   npx tsx scripts/seed-branding.ts
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { getPayload } from 'payload'

import config from '../payload.config'

const ASSETS = [
  {
    field: 'logoLight',
    file: 'public/logo/logolight.svg',
    alt: 'Redendron Media',
    legacyId: 'brand-logo-light',
  },
  {
    field: 'logoDark',
    file: 'public/logo/logodark.svg',
    alt: 'Redendron Media',
    legacyId: 'brand-logo-dark',
  },
] as const

const payload = await getPayload({ config })

const settings: Record<string, number | string> = {}

for (const asset of ASSETS) {
  // legacyId is unique, so re-running this points at the same document
  // instead of stacking duplicates in the library.
  const existing = await payload.find({
    collection: 'media',
    where: { legacyId: { equals: asset.legacyId } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs.length) {
    settings[asset.field] = existing.docs[0].id
    payload.logger.info(`${asset.field}: already in library (${existing.docs[0].filename})`)
    continue
  }

  const abs = path.resolve(process.cwd(), asset.file)
  const doc = await payload.create({
    collection: 'media',
    overrideAccess: true,
    data: { alt: asset.alt, legacyId: asset.legacyId },
    file: {
      data: await readFile(abs),
      name: path.basename(abs),
      mimetype: 'image/svg+xml',
      size: (await readFile(abs)).byteLength,
    },
  })
  settings[asset.field] = doc.id
  payload.logger.info(`${asset.field}: uploaded ${doc.filename}`)
}

// Only fill fields that are still empty - never overwrite a logo someone has
// deliberately chosen in the admin panel.
const current = (await payload.findGlobal({ slug: 'site-settings' })) as unknown as Record<string, unknown>
const next: Record<string, unknown> = {}
for (const [field, id] of Object.entries(settings)) {
  if (!current[field]) next[field] = id
}

if (Object.keys(next).length) {
  await payload.updateGlobal({ slug: 'site-settings', data: next, overrideAccess: true })
  payload.logger.info(`Site settings updated: ${Object.keys(next).join(', ')}`)
} else {
  payload.logger.info('Site settings already point at logos; left alone.')
}

process.exit(0)
