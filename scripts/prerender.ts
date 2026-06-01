import { chromium } from 'playwright'
import { preview } from 'vite'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { sortedPosts } from '../src/data/blog'

const ROUTES = [
  '/',
  '/social-media-scheduler',
  '/instagram-scheduler',
  '/tiktok-scheduler',
  '/auto-post-social-media',
  '/social-media-tools',
  '/cli-social-media-posting',
  '/bluesky-scheduler',
  '/threads-scheduler',
  '/buffer-alternative',
  '/hootsuite-alternative',
  '/compare',
  '/developers',
  '/terms',
  '/privacy',
  '/impressum',
  // Blog: index + one route per post, derived from src/data/blog.ts
  '/blog',
  ...sortedPosts.map((p) => `/blog/${p.slug}`),
]

const DIST_DIR = resolve(process.cwd(), 'dist')

async function prerender() {
  console.log('[prerender] Starting Vite preview server...')
  const server = await preview({
    preview: { port: 4173, strictPort: true },
  })

  const serverUrl = `http://localhost:4173`

  console.log('[prerender] Launching browser...')
  const browser = await chromium.launch()
  const context = await browser.newContext()

  for (const route of ROUTES) {
    const page = await context.newPage()
    const url = `${serverUrl}${route}`
    console.log(`[prerender] Rendering ${route}...`)

    await page.goto(url, { waitUntil: 'networkidle' })

    // Wait for @unhead/vue to inject meta tags
    await page.waitForTimeout(500)

    const html = await page.content()

    // Write to dist/<route>/index.html
    let outputPath: string
    if (route === '/') {
      outputPath = resolve(DIST_DIR, 'index.html')
    } else {
      const routeDir = resolve(DIST_DIR, route.slice(1))
      if (!existsSync(routeDir)) {
        mkdirSync(routeDir, { recursive: true })
      }
      outputPath = resolve(routeDir, 'index.html')
    }

    writeFileSync(outputPath, html, 'utf-8')
    console.log(`[prerender] Wrote ${outputPath}`)

    await page.close()
  }

  await browser.close()
  server.httpServer.close()
  console.log('[prerender] Done! Pre-rendered all routes.')
}

prerender().catch((err) => {
  console.error('[prerender] Error:', err)
  process.exit(1)
})
