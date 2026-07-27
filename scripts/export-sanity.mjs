/**
 * One-shot export of the legacy Sanity dataset to ./sanity-export.
 *
 * The `production` dataset is public, so this needs no token. Run it before
 * Sanity is removed from the project; the output is the input for the Payload
 * import script.
 *
 *   node scripts/export-sanity.mjs
 */
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const PROJECT_ID = 'h5na4piu'
const DATASET = 'production'
const API_VERSION = '2024-02-01'
const OUT_DIR = join(process.cwd(), 'sanity-export')
const ASSET_DIR = join(OUT_DIR, 'assets')

const query = async (groq) => {
  const url =
    `https://${PROJECT_ID}.apicdn.sanity.io/v${API_VERSION}/data/query/${DATASET}` +
    `?query=${encodeURIComponent(groq)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Sanity query failed (${res.status}): ${groq.slice(0, 80)}`)
  const { result } = await res.json()
  return result
}

async function main() {
  // Start clean so a re-run can't leave stale files from a previous attempt.
  await rm(ASSET_DIR, { recursive: true, force: true })
  await mkdir(ASSET_DIR, { recursive: true })

  // Everything except Sanity's internal system documents.
  console.log('Fetching documents...')
  const docs = await query('*[!(_type match "sanity.*") && !(_id in path("drafts.**"))]')
  await writeFile(join(OUT_DIR, 'documents.json'), JSON.stringify(docs, null, 2))

  const byType = docs.reduce((acc, d) => {
    acc[d._type] = (acc[d._type] || 0) + 1
    return acc
  }, {})
  console.log('Documents exported:', byType)

  // Image assets, with their metadata, so alt text and dimensions survive.
  console.log('\nFetching image assets...')
  const assets = await query(
    '*[_type == "sanity.imageAsset"]{_id, url, originalFilename, mimeType, size, altText, title, description, "width": metadata.dimensions.width, "height": metadata.dimensions.height}'
  )
  let ok = 0
  const failed = []
  for (const [i, asset] of assets.entries()) {
    // originalFilename is NOT unique across a dataset - this one has four
    // separate assets called "image.png". Prefix with the asset id (which is
    // unique) so nothing gets silently overwritten, and record the mapping so
    // the import step can still recover the human-readable name.
    const id = asset._id.replace(/^image-/, '')
    const original = asset.originalFilename || `${id}.bin`
    const name = `${id}__${original.replace(/\s+/g, '-')}`
    asset.localFilename = name
    const label = `[${i + 1}/${assets.length}] ${original}`
    try {
      const res = await fetch(asset.url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      await writeFile(join(ASSET_DIR, name), buf)
      console.log(`${label} - ${(buf.length / 1024).toFixed(0)}kb`)
      ok++
    } catch (err) {
      console.error(`${label} - FAILED: ${err.message}`)
      failed.push({ ...asset, error: err.message })
    }
  }

  // Written after the loop so each record carries its localFilename.
  await writeFile(join(OUT_DIR, 'assets.json'), JSON.stringify(assets, null, 2))

  // Guard against the collision bug that silently cost 8 assets on the first
  // run: what is on disk must match what we think we downloaded.
  const onDisk = (await readdir(ASSET_DIR)).length
  console.log(`\nAssets: ${ok}/${assets.length} downloaded, ${onDisk} files on disk`)
  if (onDisk !== ok) {
    throw new Error(`Filename collision: ${ok} downloads produced only ${onDisk} files`)
  }
  if (failed.length) {
    await writeFile(join(OUT_DIR, 'failed-assets.json'), JSON.stringify(failed, null, 2))
    console.error(`${failed.length} failed - see sanity-export/failed-assets.json`)
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
