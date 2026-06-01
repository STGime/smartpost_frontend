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
import { sortedPosts, postPlainText, SITE_URL } from '../src/data/blog'

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
  `- [Blog RSS feed](${SITE_URL}/feed.xml) — Subscribe to new posts.`,
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

// --- feed.xml: RSS 2.0 feed of blog posts (for automation/workflows) ------
const escapeXml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const rfc822 = (iso: string): string => new Date(`${iso}T00:00:00Z`).toUTCString()

const feedItems = sortedPosts
  .map((p) =>
    [
      '    <item>',
      `      <title>${escapeXml(p.title)}</title>`,
      `      <link>${SITE_URL}/blog/${p.slug}</link>`,
      `      <guid isPermaLink="true">${SITE_URL}/blog/${p.slug}</guid>`,
      `      <pubDate>${rfc822(p.updated || p.date)}</pubDate>`,
      `      <description>${escapeXml(p.description)}</description>`,
      ...p.tags.map((t) => `      <category>${escapeXml(t)}</category>`),
      `      <content:encoded><![CDATA[${postPlainText(p)}]]></content:encoded>`,
      '    </item>',
    ].join('\n'),
  )
  .join('\n')

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Posta Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Guides and updates on social media scheduling, automation, and posting from the API, CLI, and AI agents.</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${rfc822(newest)}</lastBuildDate>
${feedItems}
  </channel>
</rss>
`
writeFileSync(resolve(DIST, 'feed.xml'), feed, 'utf-8')
console.log(`[generate-seo] wrote feed.xml (${sortedPosts.length} item(s))`)

console.log('[generate-seo] Done.')
