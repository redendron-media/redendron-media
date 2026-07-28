/**
 * Renders the mockups in mockups/ and captures case-study imagery from them.
 *
 * These are design mockups authored for the case studies, not screenshots of
 * the clients' live production sites. Output lands in incoming/ using the
 * naming convention that scripts/assign-images.ts routes from, so the two
 * steps chain:
 *
 *   node scripts/shoot-mockups.mjs && npx tsx scripts/assign-images.ts
 */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright-core'

const BRAVE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
const OUT = path.join(process.cwd(), 'incoming')

/** Each shot: a viewport, and either a full-page or a clipped region. */
const TARGETS = [
  {
    file: 'zor-sports.html',
    slug: 'zor-sports',
    shots: [
      { name: 'cover', width: 1600, height: 900, clip: { y: 0, height: 900 } },
      { name: 'hero', width: 1600, height: 900, clip: { y: 0, height: 900 } },
      { name: '01', width: 1600, height: 1000, clip: { y: 1010, height: 900 } },
      { name: '02', width: 1600, height: 1000, clip: { y: 1900, height: 900 } },
    ],
  },
  {
    file: 'quadraplus.html',
    slug: 'quadraplus',
    shots: [
      { name: 'cover', width: 1600, height: 900, clip: { y: 0, height: 900 } },
      { name: 'hero', width: 1600, height: 900, clip: { y: 0, height: 900 } },
      { name: '01', width: 1600, height: 1000, clip: { y: 980, height: 860 } },
      { name: '02', width: 1600, height: 1000, clip: { y: 1820, height: 900 } },
    ],
  },
]

async function main() {
  await mkdir(OUT, { recursive: true })

  const browser = await chromium.launch({
    executablePath: BRAVE,
    headless: true,
    args: ['--hide-scrollbars', '--force-color-profile=srgb'],
  })

  for (const target of TARGETS) {
    const url = pathToFileURL(path.join(process.cwd(), 'mockups', target.file)).href

    for (const shot of target.shots) {
      const context = await browser.newContext({
        viewport: { width: shot.width, height: shot.height },
        // 2x so the captures stay crisp when Payload resizes them.
        deviceScaleFactor: 2,
        isMobile: Boolean(shot.mobile),
        hasTouch: Boolean(shot.mobile),
      })
      const page = await context.newPage()
      await page.goto(url, { waitUntil: 'networkidle' })
      // Let webfonts settle before capture.
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(350)

      const out = path.join(OUT, `case-${target.slug}-${shot.name}.png`)
      if (shot.clip) {
        const pageHeight = await page.evaluate(() => document.body.scrollHeight)
        const height = Math.min(shot.clip.height, Math.max(0, pageHeight - shot.clip.y))
        // fullPage is required for any clip that reaches past the viewport -
        // without it the clip rect is measured against the visible area only
        // and anything below the fold errors as "outside the image".
        await page.screenshot({
          path: out,
          fullPage: true,
          clip: { x: 0, y: shot.clip.y, width: shot.width, height },
        })
      } else {
        await page.screenshot({ path: out, fullPage: !shot.mobile })
      }

      console.log(`${path.basename(out)}  ${shot.width}x${shot.clip?.height ?? shot.height}`)
      await context.close()
    }
  }

  await browser.close()
  console.log(`\nWrote to incoming/. Run: npx tsx scripts/assign-images.ts`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
