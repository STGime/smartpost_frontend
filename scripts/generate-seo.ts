/**
 * generate-seo.ts — inject blog entries into the built SEO assets.
 *
 * Runs in `build:seo` AFTER `vite build` (which copies public/ -> dist/) and
 * BEFORE prerender. It rewrites the content between the
 *   <!-- BLOG:START --> ... <!-- BLOG:END -->
 * markers inside the dist/ copies of sitemap.xml, llms.txt and llms-full.txt,
 * deriving everything from src/data/blog.ts. The source files in public/ keep
 * empty marker blocks, so git stays clean and the blog data stays the single
 * source of truth.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { sortedPosts, SITE_URL } from '../src/data/blog'

const DIST = resolve(process.cwd(), 'dist')
const START = '<!-- BLOG:START -->'
const END = '<!-- BLOG:END -->'

function injectBetweenMarkers(file: string, block: string): void {
  const path = resolve(DIST, file)
  if (!existsSync(path)) {
    console.warn(`[generate-seo] skip (missing): ${file}`)
    return
  }
  const content = readFileSync(path, 'utf-8')
  const s = content.indexOf(START)
  const e = content.indexOf(END)
  if (s === -1 || e === -1 || e < s) {
    console.warn(`[generate-seo] markers not found in ${file}; leaving unchanged`)
    return
  }
  const before = content.slice(0, s + START.length)
  const after = content.slice(e)
  writeFileSync(path, `${before}\n${block}\n${after}`, 'utf-8')
  console.log(`[generate-seo] updated ${file} (${sortedPosts.length} post(s))`)
}

const newest = sortedPosts[0]?.date ?? '2026-06-01'

// --- sitemap.xml: <url> entries for /blog + each post ---------------------
const sitemapBlock = [
  '  <url>',
  `    <loc>${SITE_URL}/blog</loc>`,
  `    <lastmod>${newest}</lastmod>`,
  '    <changefreq>weekly</changefreq>',
  '    <priority>0.8</priority>',
  '  </url>',
  ...sortedPosts.flatMap((p) => [
    '  <url>',
    `    <loc>${SITE_URL}/blog/${p.slug}</loc>`,
    `    <lastmod>${p.updated || p.date}</lastmod>`,
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.7</priority>',
    '  </url>',
  ]),
].join('\n')

// --- llms.txt: concise markdown link list ---------------------------------
const llmsBlock = [
  '## Blog',
  '',
  `- [Blog](${SITE_URL}/blog) — Guides and updates on social scheduling, automation, and the API/CLI.`,
  ...sortedPosts.map(
    (p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}) — ${p.description}`,
  ),
].join('\n')

// --- llms-full.txt: per-post summary --------------------------------------
const llmsFullBlock = [
  '## Blog',
  '',
  'Articles and guides published on the Posta blog (auto-generated from the blog index).',
  '',
  ...sortedPosts.flatMap((p) => [
    `### ${p.title}`,
    p.description,
    `URL: ${SITE_URL}/blog/${p.slug} — Published ${p.date}. Tags: ${p.tags.join(', ')}.`,
    '',
  ]),
]
  .join('\n')
  .trimEnd()

injectBetweenMarkers('sitemap.xml', sitemapBlock)
injectBetweenMarkers('llms.txt', llmsBlock)
injectBetweenMarkers('llms-full.txt', llmsFullBlock)

console.log('[generate-seo] Done.')
