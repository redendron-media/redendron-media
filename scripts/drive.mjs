/**
 * Drives the running dev server in Brave (Chromium-based) via playwright-core.
 * No bundled browser download - it points at the locally installed Brave.
 *
 *   node scripts/drive.mjs <task>
 *
 * Tasks: smoke (default) | admin
 */
import { mkdir } from 'node:fs/promises'

import { chromium } from 'playwright-core'

const BRAVE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
const BASE = process.env.BASE_URL || 'http://localhost:3000'
const SHOTS = 'tmp/shots'

const log = (...a) => console.log(...a)

async function run() {
  await mkdir(SHOTS, { recursive: true })

  const browser = await chromium.launch({
    executablePath: BRAVE,
    headless: true,
    args: ['--hide-scrollbars'],
  })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  })
  const page = await context.newPage()

  const consoleErrors = []
  const failedRequests = []
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text())
  })
  page.on('requestfailed', (r) => {
    failedRequests.push(`${r.method()} ${r.url()} - ${r.failure()?.errorText}`)
  })
  page.on('pageerror', (e) => consoleErrors.push(`PAGEERROR: ${e.message}`))

  const task = process.argv[2] || 'smoke'

  if (task === 'hover') {
    log('\n== Hero + services hover ==')
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 120_000 })
    // Let the WebGL layer mount (it is deferred 400ms) and the intro settle.
    await page.waitForTimeout(2600)
    await page.screenshot({ path: `${SHOTS}/hero.png` })

    const canvas = await page.locator('canvas').count()
    log('webgl canvases mounted:', canvas)

    // Scroll the services accordion into view and hover a row.
    const row = page.locator('ul > li', { hasText: 'Websites & Digital Experience' }).first()
    await row.scrollIntoViewIfNeeded()
    await page.waitForTimeout(900)
    await row.hover()
    // Nudge the pointer so the preview's rAF lerp has somewhere to travel.
    const box = await row.boundingBox()
    if (box) {
      await page.mouse.move(box.x + box.width * 0.55, box.y + box.height / 2, { steps: 18 })
    }
    await page.waitForTimeout(1100)

    const preview = page.locator('[aria-hidden="true"]').filter({ has: page.locator('img') })
    log('preview opacity:', await page.evaluate(() => {
      const el = document.querySelector('.pointer-events-none.absolute.left-0.top-0')
      return el ? getComputedStyle(el).opacity : 'not found'
    }))
    log('dimmed rows:', await page.evaluate(() =>
      Array.from(document.querySelectorAll('ul > li > a')).filter(
        (a) => parseFloat(getComputedStyle(a).opacity) < 0.9
      ).length
    ))
    await page.screenshot({ path: `${SHOTS}/services-hover.png` })
  } else if (task === 'admin') {
    log('\n== Admin panel ==')
    await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle', timeout: 120_000 })

    // Log in with the seeded account.
    if (page.url().includes('login')) {
      await page.fill('#field-email', 'team@redendron.com')
      await page.fill('#field-password', 'redendron-dev-2026')
      await page.click('button[type="submit"]')
      await page.waitForURL('**/admin', { timeout: 60_000 })
    }
    await page.waitForTimeout(2500)
    log('url  :', page.url())
    log('title:', await page.title())

    // What collections does the sidebar actually offer?
    const nav = await page.locator('nav a').allInnerTexts()
    log('nav  :', nav.filter(Boolean).join(' | '))
    await page.screenshot({ path: `${SHOTS}/admin-dashboard.png`, fullPage: true })

    // Open the migrated case study and count its blocks.
    await page.goto(`${BASE}/admin/collections/case-studies`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    await page.screenshot({ path: `${SHOTS}/admin-case-studies-list.png`, fullPage: true })

    const firstRow = page.locator('table tbody tr a').first()
    if (await firstRow.count()) {
      await firstRow.click()
      await page.waitForTimeout(3500)
      log('editing:', page.url())
      // Jump to the Body tab where the composable blocks live.
      const bodyTab = page.locator('button.tabs-field__tab-button', { hasText: 'Body' })
      if (await bodyTab.count()) {
        await bodyTab.first().click()
        await page.waitForTimeout(1500)
      }
      await page.screenshot({ path: `${SHOTS}/admin-case-study-blocks.png`, fullPage: true })
      const blocks = await page.locator('.blocks-field__block-pill, .collapsible__header').count()
      log('block rows visible:', blocks)
    }
  } else {
    log('\n== Front end ==')
    for (const path of ['/', '/caseStudies']) {
      const res = await page.goto(`${BASE}${path}`, {
        waitUntil: 'networkidle',
        timeout: 120_000,
      })
      log(`${path.padEnd(14)} -> HTTP ${res?.status()}  final: ${page.url()}`)
    }
    await page.goto(BASE, { waitUntil: 'networkidle' })
    log('title:', await page.title())
    log('h1   :', await page.locator('h1').first().innerText())

    // Scroll the whole page the way a visitor would, so scroll-triggered
    // reveals actually fire. Screenshotting without this captured every
    // below-the-fold section still at opacity 0.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.6
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 220))
      }
      window.scrollTo(0, 0)
      await new Promise((r) => setTimeout(r, 500))
    })

    // Anything still hidden after a full scroll-through is a real bug.
    const stillHidden = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-reveal]')).filter(
        (el) => parseFloat(getComputedStyle(el).opacity) < 0.9
      ).length
    )
    log('reveals still hidden after scroll:', stillHidden)

    // Confirm the design tokens actually reached the browser.
    const tokens = await page.evaluate(() => {
      const s = getComputedStyle(document.body)
      const h1 = document.querySelector('h1')
      return {
        bodyBg: s.backgroundColor,
        bodyColor: s.color,
        fontFamily: s.fontFamily.split(',')[0],
        h1Size: h1 ? getComputedStyle(h1).fontSize : null,
        oxblood: getComputedStyle(document.documentElement)
          .getPropertyValue('--color-oxblood')
          .trim(),
      }
    })
    log('computed:', JSON.stringify(tokens, null, 2))
    await page.screenshot({ path: `${SHOTS}/home.png`, fullPage: true })
  }

  log('\nconsole errors :', consoleErrors.length ? consoleErrors.slice(0, 8) : 'none')
  log('failed requests:', failedRequests.length ? failedRequests.slice(0, 8) : 'none')

  await browser.close()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
