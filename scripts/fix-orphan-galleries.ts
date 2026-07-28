/**
 * One-off repair: strips untagged gallery blocks from the authored case
 * studies.
 *
 * The first run of assign-images.ts appended galleries with no blockName.
 * A later run added the `Screens (auto)` tag so re-runs replace rather than
 * stack, but the original untagged block had nothing to match against and
 * survived, leaving two galleries on each study.
 *
 *   npx tsx scripts/fix-orphan-galleries.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const AUTO_GALLERY = 'Screens (auto)'
const SLUGS = ['zor-sports', 'quadraplus']

async function main() {
  const payload = await getPayload({ config })

  for (const slug of SLUGS) {
    const { docs } = await payload.find({
      collection: 'case-studies',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (!docs.length) continue

    const doc = docs[0] as { id: number | string; body?: unknown[] }
    const body = Array.isArray(doc.body) ? doc.body : []

    // Keep everything except galleries that carry no blockName - those are the
    // orphans from before the tag existed. Tagged galleries and any block an
    // editor added by hand survive.
    const cleaned = body.filter((b) => {
      const block = b as { blockType?: string; blockName?: string }
      return !(block.blockType === 'gallery' && !block.blockName)
    })

    if (cleaned.length === body.length) {
      payload.logger.info(`${slug}: nothing to strip (${body.length} blocks)`)
      continue
    }

    await payload.update({
      collection: 'case-studies',
      id: doc.id,
      data: { body: cleaned } as never,
      overrideAccess: true,
    })
    payload.logger.info(
      `${slug}: ${body.length} -> ${cleaned.length} blocks (${body.length - cleaned.length} orphan gallery removed)`
    )
  }

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
