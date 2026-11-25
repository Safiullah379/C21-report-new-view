import { chromium, expect } from '@playwright/test'
import { readFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const path = resolve(process.argv[2] || 'exports/zonhack-demo.html')
const html = await readFile(path, 'utf8')
const screenshotDir = resolve(process.env.DEMO_SCREENSHOT_DIR || 'test-results/standalone')
await mkdir(screenshotDir, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined, headless: true })
try {
  // The Cloud browser blocks file:// navigation by managed policy. Fulfill only
  // this one HTML document in memory; all networking stays disabled throughout.
  const context = await browser.newContext({ offline: true, viewport: { width: 1440, height: 1000 } })
  const page = await context.newPage(), errors = [], external = []
  page.on('pageerror', error => errors.push(error.message))
  await context.route('**/*', async route => {
    if (route.request().url() === 'http://127.0.0.1:3117/zonhack-demo.html') await route.fulfill({ contentType: 'text/html', body: html })
    else { external.push(route.request().url()); await route.abort() }
  })
  await page.goto('http://127.0.0.1:3117/zonhack-demo.html')
  await expect(page.locator('.year-chart')).toHaveCount(6)
  await expect(page.locator('.kpi-card, .table-panel')).toHaveCount(0)
  await expect(page.locator('canvas').first()).toBeVisible()
  await page.getByRole('button',{name:'Weekly',exact:true}).click()
  await expect(page.locator('.year-chart-canvas').first()).toHaveAttribute('aria-label',/by week/)
  await page.getByRole('button',{name:'Monthly',exact:true}).click()
  await page.screenshot({ path: resolve(screenshotDir, 'zonhack-html-preview.png'), fullPage: true })
  await page.getByRole('button', {name:'Date and year comparison',exact:true}).click()
  await expect(page.getByRole('button',{name:'Apply comparison',exact:false})).toBeInViewport()
  await page.screenshot({path:resolve(screenshotDir, 'zonhack-graphs-preview.png'),fullPage:false})
  await page.setViewportSize({width:730,height:900})
  if (!(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))) throw new Error('Tablet Overview overflows')
  await page.setViewportSize({width:390,height:844})
  await expect(page.getByRole('button',{name:'Apply comparison',exact:false})).toBeInViewport()
  await page.getByRole('button',{name:'Close date panel',exact:true}).click()
  await expect(page.locator('.comparison-date-panel')).toHaveCount(0)
  await page.setViewportSize({width:1440,height:1000})

  for (const name of ['Performance Explorer', 'Sales Analytics', 'Advertising', 'Profitability', 'Products', 'Inventory', 'Reporting Center', 'My Saved Views', 'Workspace Settings']) {
    await page.getByRole('navigation').getByRole('button', { name: name === 'My Saved Views' ? /My Saved Views/ : name, exact: name !== 'My Saved Views' }).click()
    await expect(page.getByRole('heading', { name, exact: true }).first()).toBeVisible()
  }
  await page.getByRole('navigation').getByRole('button', { name: 'Performance Explorer', exact: true }).click()
  await page.getByRole('combobox', { name: 'Brand', exact: true }).selectOption('Northline')
  await expect(page.locator('.loading-banner')).toHaveCount(0)
  await expect(page.locator('.report-scroll tbody tr')).toHaveCount(2)
  await page.getByRole('combobox', { name: 'Product universe' }).fill('BOTTLE')
  await expect(page.getByRole('option').filter({ hasText: 'BOTTLE-32' })).toBeVisible()
  await page.getByRole('button', { name: 'Done', exact: true }).click()
  await page.getByRole('textbox', { name: 'View name', exact: true }).fill('Offline Northline')
  await page.getByRole('button', { name: 'Save view', exact: false }).click()
  await expect(page.getByText('View saved in this browser.')).toBeVisible()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export data', exact: false }).click()
  const file = await download
  if (file.suggestedFilename() !== 'zonhack-demo-report.csv') throw new Error('CSV download failed')
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Brand', exact: true })).toHaveValue('Northline')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('.kpi-card')).toHaveCount(6)
  if (!(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))) throw new Error('Mobile page overflows')
  if (errors.length || external.length) throw new Error(JSON.stringify({ errors, external }))
  console.log('PASS: standalone HTML, embedded charts, all ten screens, brand/product filters, saved views, CSV, reload persistence, mobile width. Networking disabled; zero external asset requests and zero page errors.')
} finally { await browser.close() }
