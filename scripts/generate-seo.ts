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
import { readFileSync, writeFileSync, existsSync, statSync } from 'fs'
import { resolve } from 'path'
import { sortedPosts, postPlainText, SITE_URL } from '../src/data/blog'
import { sortedWorkflows } from '../src/data/workflows'

const DIST = resolve(process.cwd(), 'dist')
const START = '<!-- BLOG:START -->'
const END = '<!-- BLOG:END -->'

function injectBetweenMarkers(file: string, block: string, start = START, end = END): void {
  const path = resolve(DIST, file)
  if (!existsSync(path)) {
    console.warn(`[generate-seo] skip (missing): ${file}`)
    return
  }
  const content = readFileSync(path, 'utf-8')
  const s = content.indexOf(start)
  const e = content.indexOf(end)
  if (s === -1 || e === -1 || e < s) {
    console.warn(`[generate-seo] markers (${start}) not found in ${file}; leaving unchanged`)
    return
  }
  const before = content.slice(0, s + start.length)
  const after = content.slice(e)
  writeFileSync(path, `${before}\n${block}\n${after}`, 'utf-8')
  console.log(`[generate-seo] updated ${file} between ${start}`)
}

const WF_START = '<!-- WORKFLOWS:START -->'
const WF_END = '<!-- WORKFLOWS:END -->'

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

// === Workflows ============================================================
const wfNewest = sortedWorkflows[0]?.updated ?? newest

const wfSitemapBlock = [
  '  <url>',
  `    <loc>${SITE_URL}/workflows</loc>`,
  `    <lastmod>${wfNewest}</lastmod>`,
  '    <changefreq>weekly</changefreq>',
  '    <priority>0.8</priority>',
  '  </url>',
  ...sortedWorkflows.flatMap((w) => [
    '  <url>',
    `    <loc>${SITE_URL}/workflows/${w.slug}</loc>`,
    `    <lastmod>${w.updated}</lastmod>`,
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.7</priority>',
    '  </url>',
  ]),
].join('\n')

const wfLlmsBlock = [
  '## n8n Workflows',
  '',
  `- [n8n Workflows](${SITE_URL}/workflows) — Ready-to-import n8n templates for automating Posta.`,
  ...sortedWorkflows.map((w) => `- [${w.title}](${SITE_URL}/workflows/${w.slug}) — ${w.description}`),
].join('\n')

const wfLlmsFullBlock = [
  '## n8n Workflows',
  '',
  'Ready-to-import n8n workflow templates that automate Posta (downloadable JSON).',
  '',
  ...sortedWorkflows.flatMap((w) => [
    `### ${w.title}`,
    w.description,
    `URL: ${SITE_URL}/workflows/${w.slug} — JSON: ${SITE_URL}${w.jsonFile} — Difficulty: ${w.difficulty}. Tags: ${w.tags.join(', ')}.`,
    '',
  ]),
]
  .join('\n')
  .trimEnd()

injectBetweenMarkers('sitemap.xml', wfSitemapBlock, WF_START, WF_END)
injectBetweenMarkers('llms.txt', wfLlmsBlock, WF_START, WF_END)
injectBetweenMarkers('llms-full.txt', wfLlmsFullBlock, WF_START, WF_END)

// --- feed.xml: RSS 2.0 feed of blog posts (for automation/workflows) ------
const escapeXml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const rfc822 = (iso: string): string => new Date(`${iso}T00:00:00Z`).toUTCString()

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

// A post's dedicated image, if it has one (the default brand OG image is not
// treated as "available" — the feed only carries real per-post artwork).
function imageInfo(ogImage?: string): { url: string; type: string; length: number } | null {
  if (!ogImage) return null
  const ext = (ogImage.toLowerCase().match(/\.[a-z0-9]+(?:\?|$)/)?.[0] || '').replace(/\?.*/, '')
  const type = MIME_BY_EXT[ext] || 'image/png'
  let length = 0
  if (ogImage.startsWith(`${SITE_URL}/`)) {
    try {
      length = statSync(resolve(DIST, ogImage.slice(SITE_URL.length + 1))).size
    } catch {
      length = 0
    }
  }
  return { url: ogImage, type, length }
}

const feedItems = sortedPosts
  .map((p) => {
    const img = imageInfo(p.ogImage)
    return [
      '    <item>',
      `      <title>${escapeXml(p.title)}</title>`,
      `      <link>${SITE_URL}/blog/${p.slug}</link>`,
      `      <guid isPermaLink="true">${SITE_URL}/blog/${p.slug}</guid>`,
      `      <pubDate>${rfc822(p.updated || p.date)}</pubDate>`,
      `      <description>${escapeXml(p.description)}</description>`,
      ...p.tags.map((t) => `      <category>${escapeXml(t)}</category>`),
      ...(img
        ? [
            `      <enclosure url="${escapeXml(img.url)}" type="${img.type}" length="${img.length}" />`,
            `      <media:content url="${escapeXml(img.url)}" medium="image" type="${img.type}" />`,
          ]
        : []),
      `      <content:encoded><![CDATA[${postPlainText(p)}]]></content:encoded>`,
      '    </item>',
    ].join('\n')
  })
  .join('\n')

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">
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
