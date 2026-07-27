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

  if (task === 'admin') {
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
