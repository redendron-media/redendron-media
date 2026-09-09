/**
 * Re-uploads the brand lockups and points Site Settings at the new files.
 *
 *   npx tsx scripts/refresh-logos.ts
 *
 * The originals carried an SVG drop-shadow filter around the mark. A filter
 * forces the renderer to rasterise that part of the artwork at the filter
 * region's size and then scale the result, so the icon went soft wherever it
 * was drawn larger than its 22px viewBox - which is everywhere, and worst on
 * a high-density phone screen. The paths themselves were untouched.
 *
 * New documents rather than a file swap on the existing ones: blobs are
 * served with a year of cache, so reusing a filename would leave the old
 * artwork in front of anyone who had already loaded it.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { getPayload } from 'payload'

import config from '../payload.config'

const ASSETS = [
  { field: 'logoLight', file: 'public/logo/logolight.svg', legacyId: 'brand-logo-light-v2' },
  { field: 'logoDark', file: 'public/logo/logodark.svg', legacyId: 'brand-logo-dark-v2' },
] as const

async function main() {
  const payload = await getPayload({ config })
  const settings: Record<string, number | string> = {}

  for (const asset of ASSETS) {
    const abs = path.resolve(process.cwd(), asset.file)
    const data = await readFile(abs)

    if (/filter="url\(/.test(data.toString('utf8'))) {
      throw new Error(`${asset.file} still contains a filter reference — not uploading`)
    }

    const existing = await payload.find({
      collection: 'media',
      where: { legacyId: { equals: asset.legacyId } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.docs.length) {
      const doc = await payload.update({
        collection: 'media',
        id: existing.docs[0].id,
        overrideAccess: true,
        data: {},
        file: { data, name: path.basename(abs), mimetype: 'image/svg+xml', size: data.byteLength },
      })
      settings[asset.field] = doc.id
      payload.logger.info(`${asset.field}: replaced ${doc.filename}`)
      continue
    }

    const doc = await payload.create({
      collection: 'media',
      overrideAccess: true,
      data: { alt: 'Redendron Media', legacyId: asset.legacyId },
      file: { data, name: path.basename(abs), mimetype: 'image/svg+xml', size: data.byteLength },
    })
    settings[asset.field] = doc.id
    payload.logger.info(`${asset.field}: uploaded ${doc.filename}`)
  }

  const updated = await payload.updateGlobal({
    slug: 'site-settings',
    overrideAccess: true,
    data: settings,
  })
  payload.logger.info(
    `site settings -> logoLight=${JSON.stringify(settings.logoLight)} logoDark=${JSON.stringify(settings.logoDark)}`
  )
  return updated
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
