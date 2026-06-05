/**
 * n8n workflow templates — single source of truth.
 *
 * Authored here as typed data (mirrors src/data/blog.ts). Everything reads from
 * this module:
 *   - src/views/seo/WorkflowIndexView.vue   (the /workflows index)
 *   - src/views/seo/WorkflowDetailView.vue  (each /workflows/:slug page)
 *   - scripts/prerender.ts                  (derives routes to pre-render)
 *   - scripts/generate-seo.ts               (injects sitemap.xml + llms.txt entries)
 *
 * The downloadable JSON files live in public/assets/workflows/<slug>.json and are
 * produced by scripts/sanitize-workflows.ts from smartpost_backend/examples.
 * Keep `description` ≤ 160 chars (meta description + index excerpt). Body
 * text-bearing blocks may contain trusted inline HTML (<a>, <strong>).
 */
import { SITE_URL, DEFAULT_OG_IMAGE } from './blog'

export { SITE_URL, DEFAULT_OG_IMAGE }

export interface WorkflowBlock {
  type: 'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'code'
  text?: string // h2 | h3 | p
  items?: string[] // ul | ol
  code?: string // code
  lang?: string // code (display hint)
}

export interface WorkflowCredential {
  name: string
  url?: string
}

export interface Workflow {
  slug: string
  title: string
  /** ≤160 chars. Meta description + index excerpt. */
  description: string
  /** ISO date of last update. */
  updated: string
  tags: string[]
  /** One-line value prop shown on cards. */
  summary: string
  /** Ordered node-chain labels, rendered as pills. */
  nodeChain: string[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  setupTime: string
  requiredCredentials: WorkflowCredential[]
  /** e.g. "Professional" when a step needs a paid Posta plan. */
  requiredPlan?: string
  /** Root-relative path to the importable workflow JSON. */
  jsonFile: string
  /** Optional related blog post slug. */
  relatedBlogSlug?: string
  ogImage?: string
  body: WorkflowBlock[]
}

const POSTA_CRED: WorkflowCredential = { name: 'Posta API token', url: 'https://www.getposta.app' }
const DEEPSEEK_CRED: WorkflowCredential = { name: 'DeepSeek API key', url: 'https://platform.deepseek.com' }
const FAL_CRED: WorkflowCredential = { name: 'fal.ai API key', url: 'https://fal.ai' }

export const workflows: Workflow[] = [
  {
    slug: 'blog-to-social-media',
    title: 'Share new blog posts to social media automatically',
    description:
      'An n8n workflow that reads your blog RSS feed, builds a post with the article image, and schedules it across your connected social accounts via Posta.',
    updated: '2026-06-05',
    tags: ['Blog', 'RSS', 'Scheduling', 'Automation'],
    summary: 'Turn every new blog post into a scheduled social post with its image.',
    nodeChain: ['RSS Read', 'Get accounts', 'Download image', 'Upload media', 'Merge', 'Create post', 'Schedule'],
    difficulty: 'Beginner',
    setupTime: '~10 min',
    requiredCredentials: [POSTA_CRED],
    jsonFile: '/assets/workflows/blog-to-social-media.json?v=2',
    body: [
      {
        type: 'p',
        text: 'Whenever you publish a new article, this workflow reads it from your blog RSS feed, downloads the article image, and creates a scheduled social media post across one or more connected accounts — all through the <a href="/developers">Posta API</a>. It’s the simplest of the templates and a great starting point.',
      },
      { type: 'h2', text: 'How it works' },
      {
        type: 'ol',
        items: [
          '<strong>RSS Read</strong> — point it at your blog feed (e.g. <code>https://getposta.app/feed.xml</code>). It emits the latest items with title, link, and image.',
          '<strong>Get many social accounts</strong> (Posta) — returns your connected accounts. Take the <code>id</code> values to tell the next steps where to post. IDs are stable until you disconnect an account.',
          '<strong>HTTP Request</strong> — download the article image: set the image URL, then Options → Response → <em>Response Format = File</em>, output into the field <code>data</code>.',
          '<strong>Upload media</strong> (Posta) — uploads the <code>data</code> field to Posta, which scales the image per platform (e.g. 9:16 for TikTok) and uses face-aware cropping. Works for videos too.',
          '<strong>Merge</strong> — combine the Upload media output (the media id) with the RSS item (the text), mode <em>Combine</em> by <em>position</em>.',
          '<strong>Create a post</strong> (Posta) — set at least one social account id, a caption, optional tags and per-platform settings, and the media id. Created as a draft by default.',
          '<strong>Schedule a post</strong> (Posta) — schedule the draft for a future date/time (the template uses an example date you should change).',
        ],
      },
      { type: 'h2', text: 'Tips' },
      {
        type: 'ul',
        items: [
          'Swap the Manual Trigger for a <strong>Schedule Trigger</strong> (e.g. hourly) to fully automate it, and add a Remove Duplicates step so you only post genuinely new items.',
          'Add multiple account ids to cross-post; expand <strong>Platform Configurations</strong> on Create post for per-network tweaks (Instagram reels, TikTok privacy, etc.).',
          'Prefer publishing immediately? Replace <em>Schedule a post</em> with <em>Publish Now</em>.',
        ],
      },
    ],
  },
  {
    slug: 'blog-to-linkedin-carousel',
    title: 'Turn a blog post into a LinkedIn carousel',
    description:
      'An n8n workflow that summarizes a new blog post into a 5-slide LinkedIn carousel PDF — AI text (DeepSeek) over AI backgrounds (fal.ai), assembled by Posta.',
    updated: '2026-06-05',
    tags: ['LinkedIn', 'Carousel', 'AI', 'fal.ai', 'DeepSeek'],
    summary: 'Summarize an article into a swipeable LinkedIn carousel PDF, end to end.',
    nodeChain: ['RSS Read', 'DeepSeek (5 slides)', 'fal.ai backgrounds', 'theme_color', 'Generate Carousel PDF', 'Create LinkedIn post'],
    difficulty: 'Intermediate',
    setupTime: '~20 min',
    requiredCredentials: [POSTA_CRED, DEEPSEEK_CRED, FAL_CRED],
    requiredPlan: 'Professional',
    jsonFile: '/assets/workflows/blog-to-linkedin-carousel.json?v=2',
    relatedBlogSlug: 'article-to-linkedin-carousel',
    body: [
      {
        type: 'p',
        text: 'LinkedIn carousels (swipeable PDF “document” posts) are some of the highest-engagement content on the platform — but tedious to make by hand. This workflow summarizes a new blog post into 5 slides with an LLM, generates a background per slide, and has Posta composite the text and build the PDF. See the full write-up in <a href="/blog/article-to-linkedin-carousel">From article to LinkedIn carousel</a>.',
      },
      { type: 'h2', text: 'How it works' },
      {
        type: 'ol',
        items: [
          '<strong>RSS Read</strong> → <strong>Latest post</strong> (Code) — read your blog feed and pick the most recent article.',
          '<strong>Basic LLM Chain</strong> with the <strong>DeepSeek Chat Model</strong> — summarize the article into copy for 5 slides (title + body each) plus caption hashtags. Edit the prompt for a different slide count.',
          '<strong>Parse</strong> (Code) → <strong>Split Out</strong> — parse the model’s JSON and split it into one item per slide.',
          '<strong>Generate media using AI model</strong> (fal.ai) — generate an abstract background per slide (the template uses Recraft V3).',
          '<strong>Re-assemble</strong> (Code) — recombine into a slides array of <code>{ media_id, title, body }</code>.',
          '<strong>theme_color</strong> (Set) — set one color used across every slide so the deck looks cohesive.',
          '<strong>Generate Text Carousel PDF</strong> (Posta) — composites the text over each background and builds the PDF. Optionally set a <strong>Logo Media ID</strong> to brand every slide.',
          '<strong>Create a post</strong> (Posta) — attach the generated PDF to a LinkedIn document post.',
        ],
      },
      { type: 'h2', text: 'Requirements' },
      {
        type: 'p',
        text: 'The text-carousel endpoint is a <strong>Professional-plan</strong> Posta feature. You’ll also need a DeepSeek key (any LLM works — swap the chat model) and a fal.ai key for backgrounds.',
      },
      { type: 'h2', text: 'Tips' },
      {
        type: 'ul',
        items: [
          'Background style is set entirely by the fal prompt — deep, single-hue gradients read best behind the white slide text.',
          'Upload a logo once and pass its media id as <code>logo_media_id</code> to brand every slide.',
          'Swap the trigger for a Schedule Trigger to auto-publish a carousel for each new post.',
        ],
      },
    ],
  },
  {
    slug: 'product-launch-campaign',
    title: 'Run a 5-day product launch campaign',
    description:
      'An n8n workflow that turns a product into a 5-day, multi-platform launch campaign — per-platform captions written by AI and scheduled across every connected account via Posta.',
    updated: '2026-06-05',
    tags: ['E-commerce', 'Campaign', 'AI', 'Scheduling', 'DeepSeek'],
    summary: 'Generate a 5-day, per-platform launch campaign from a single product.',
    nodeChain: ['Fetch product', 'DeepSeek captions', 'Get accounts', 'Dedupe platforms', 'Expand to 5 days', 'Create scheduled posts'],
    difficulty: 'Intermediate',
    setupTime: '~20 min',
    requiredCredentials: [POSTA_CRED, DEEPSEEK_CRED],
    jsonFile: '/assets/workflows/product-launch-campaign.json?v=2',
    body: [
      {
        type: 'p',
        text: 'Launching a product? This workflow builds a 5-day campaign across every platform you’ve connected, with captions and hashtags tailored to each network’s format, all scheduled in advance through Posta.',
      },
      { type: 'h2', text: 'How it works' },
      {
        type: 'ol',
        items: [
          '<strong>HTTP Request</strong> — fetch the product (poll an endpoint, or swap in a webhook so your store tells the workflow what’s new).',
          '<strong>Basic LLM Chain</strong> (DeepSeek) — write a caption and tags per platform type, so TikTok, LinkedIn, etc. each get format-appropriate copy.',
          '<strong>Get many social accounts</strong> (Posta) → <strong>Filter</strong> — keep only active accounts.',
          '<strong>Remove Duplicates</strong> — collapse to one post per <em>platform type</em> (one for TikTok, one for LinkedIn…), not one per account.',
          '<strong>Merge</strong> → <strong>Expand to days</strong> (Code) — fan the campaign out across the next 5 days.',
          '<strong>Merge on platform</strong> — re-attach accounts so every instance of a platform (e.g. multiple TikTok accounts) gets its own post.',
          '<strong>Create a post</strong> (Posta) — create posts with account ids, captions, and schedule times. Draft is off, so Posta schedules them for future publishing. A parallel branch downloads the product image, uploads it, and attaches the media id.',
        ],
      },
      { type: 'h2', text: 'Tips' },
      {
        type: 'ul',
        items: [
          'Change the day count or cadence in the <strong>Expand to days</strong> Code node.',
          'Use a webhook trigger from your store (Shopify, etc.) so a new product kicks off the campaign automatically.',
          'Leave posts as drafts (flip the Create post setting) if you want to review before they go out.',
        ],
      },
    ],
  },
  {
    slug: 'youtube-to-social-media',
    title: 'Promote your latest YouTube video everywhere',
    description:
      'An n8n workflow that reads your YouTube channel feed, grabs the latest video and thumbnail, and drafts AI-written promo posts across every connected platform via Posta.',
    updated: '2026-06-05',
    tags: ['YouTube', 'RSS', 'AI', 'Cross-posting', 'DeepSeek'],
    summary: 'Auto-draft promo posts for your newest YouTube video on every platform.',
    nodeChain: ['YouTube feed', 'Latest video', 'Upload thumbnail', 'DeepSeek captions', 'Dedupe platforms', 'Create draft posts'],
    difficulty: 'Intermediate',
    setupTime: '~20 min',
    requiredCredentials: [POSTA_CRED, DEEPSEEK_CRED],
    jsonFile: '/assets/workflows/youtube-to-social-media.json?v=2',
    body: [
      {
        type: 'p',
        text: 'New video out? This workflow reads your YouTube channel’s RSS feed, pulls the latest video and its thumbnail, writes a promo caption per platform, and creates draft posts across all your connected accounts so you can review and publish.',
      },
      { type: 'h2', text: 'How it works' },
      {
        type: 'ol',
        items: [
          '<strong>HTTP Request</strong> — download the YouTube channel RSS feed. (n8n’s RSS node strips fields, so the template uses an HTTP Request.)',
          '<strong>XML</strong> → <strong>Code</strong> — convert the feed to JSON and build a structured object for the <em>latest video only</em> (a one-line <code>slice(0, 1)</code> you can widen).',
          '<strong>HTTP Request</strong> — download the video thumbnail(s) → <strong>Upload media</strong> (Posta) to scale them per platform.',
          '<strong>Get many social accounts</strong> → <strong>Filter</strong> (active) → <strong>Remove Duplicates</strong> — one post per platform type.',
          '<strong>Basic LLM Chain</strong> (DeepSeek) — write a promo caption; a small Code node tags each with its platform.',
          '<strong>Merge</strong> (all combinations) — create a post for each active account, attaching the uploaded thumbnail.',
          '<strong>Create a post</strong> (Posta) — posts are created as <em>drafts</em> so you can review before publishing or scheduling.',
        ],
      },
      { type: 'h2', text: 'Tips' },
      {
        type: 'ul',
        items: [
          'Find your channel feed URL: <code>https://www.youtube.com/feeds/videos.xml?channel_id=YOUR_CHANNEL_ID</code>.',
          'Widen the <code>slice(0, 1)</code> in the Code node to promote several recent videos at once.',
          'Flip Create post out of draft (and add a Schedule step) to fully automate publishing.',
        ],
      },
    ],
  },
]

/** Newest-first — used by the index and SEO generators. */
export const sortedWorkflows: Workflow[] = [...workflows].sort((a, b) =>
  b.updated.localeCompare(a.updated),
)

export function getWorkflow(slug: string): Workflow | undefined {
  return workflows.find((w) => w.slug === slug)
}

/** Plain-text rendering of a workflow body (for JSON-LD / LLM text). */
export function workflowPlainText(w: Workflow): string {
  return w.body
    .map((b) => {
      if (b.type === 'code') return b.code ?? ''
      if (b.type === 'ul' || b.type === 'ol')
        return (b.items ?? []).map((i) => i.replace(/<[^>]+>/g, '')).join('\n')
      return (b.text ?? '').replace(/<[^>]+>/g, '')
    })
    .filter(Boolean)
    .join('\n\n')
}
