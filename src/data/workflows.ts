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
    ogImage: 'https://getposta.app/assets/workflows/og/blog-to-social-media.jpg',
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
    ogImage: 'https://getposta.app/assets/workflows/og/blog-to-linkedin-carousel.jpg',
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
    ogImage: 'https://getposta.app/assets/workflows/og/product-launch-campaign.jpg',
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
    ogImage: 'https://getposta.app/assets/workflows/og/youtube-to-social-media.jpg',
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
  {
    slug: 'notion-content-calendar-to-posta',
    title: 'Schedule a Notion content calendar to social media',
    description:
      'An n8n workflow that reads approved rows from a Notion content calendar and schedules them across your social accounts via Posta — status synced back to Notion.',
    updated: '2026-06-20',
    tags: ['Notion', 'Content calendar', 'Scheduling', 'Automation'],
    summary: 'Publish approved rows from a Notion calendar on time, synced back to Notion.',
    nodeChain: ['Schedule (15 min)', 'Notion: get rows', 'Filter approved & due', 'Create post', 'Schedule post', 'Notion: mark scheduled'],
    difficulty: 'Intermediate',
    setupTime: '~15 min',
    requiredCredentials: [POSTA_CRED, { name: 'Notion API key', url: 'https://www.notion.so/my-integrations' }],
    jsonFile: '/assets/workflows/notion-content-calendar-to-posta.json',
    body: [
      {
        type: 'p',
        text: 'Keep your editorial calendar in Notion and let n8n do the publishing. Every 15 minutes this workflow reads the rows you’ve marked <strong>Approved</strong>, and for any whose scheduled time has arrived it creates and schedules the post across your connected accounts through the <a href="/developers">Posta API</a> — then writes the status and the Posta post URL back into the same Notion row. It’s the cleanest way to manage drafts where your team already works.',
      },
      { type: 'h2', text: 'How it works' },
      {
        type: 'ol',
        items: [
          '<strong>Schedule Trigger</strong> — runs every 15 minutes (tighten or loosen to taste).',
          '<strong>Get approved &amp; due rows</strong> (Notion) — returns the pages in your content-calendar database.',
          '<strong>Approved &amp; due now</strong> (Filter) — keeps only rows where <code>Status = Approved</code> and <code>Scheduled At</code> is within the next 15 minutes.',
          '<strong>Create a post</strong> (Posta) — uses the row’s <code>Social Accounts</code> (a multi-select of Posta account ids) and <code>Caption</code> to create the post as a draft.',
          '<strong>Schedule a post</strong> (Posta) — schedules that draft for the row’s <code>Scheduled At</code> time.',
          '<strong>Mark row Scheduled</strong> (Notion) — flips <code>Status</code> to <em>Scheduled</em> and writes the Posta post URL back. Because the row is no longer <em>Approved</em>, the next run skips it — so nothing posts twice.',
        ],
      },
      { type: 'h2', text: 'Set up your Notion database' },
      {
        type: 'ul',
        items: [
          '<strong>Caption</strong> (Text) — the post body.',
          '<strong>Social Accounts</strong> (Multi-select) — each option’s name is a Posta social account id (grab them from the <em>Get many social accounts</em> Posta node).',
          '<strong>Scheduled At</strong> (Date, with time) — when the post should go live.',
          '<strong>Status</strong> (Select) — at least <code>Approved</code> and <code>Scheduled</code>.',
          '<strong>Posta URL</strong> (URL) — written back automatically after scheduling.',
        ],
      },
      { type: 'h2', text: 'Tips' },
      {
        type: 'ul',
        items: [
          'Prefer <strong>Airtable</strong>? Swap the two Notion nodes for Airtable <em>Search</em> + <em>Update record</em> — the field mapping is identical. The Airtable trigger is mature and a common starting point.',
          'Want per-platform voices? Add a <code>Regenerate With AI</code> checkbox column and route checked rows through an OpenAI node that rewrites the caption per network before <em>Create a post</em>.',
          'Attaching media? Upload it to Posta first (the <em>Upload media</em> node) and pass the returned id via <strong>Additional Fields → Media IDs</strong> on Create post.',
        ],
      },
    ],
  },
  {
    slug: 'linkedin-cross-post-to-bluesky-threads',
    title: 'Mirror a LinkedIn post to Bluesky and Threads',
    description:
      'A webhook-driven n8n workflow: when a LinkedIn post publishes, Posta fires a signed webhook and this template drafts compressed Bluesky and Threads versions.',
    updated: '2026-06-20',
    tags: ['Bluesky', 'Threads', 'Cross-post', 'Webhook', 'AI'],
    summary: 'Publish once on LinkedIn; auto-draft Bluesky and Threads versions.',
    nodeChain: ['Posta webhook', 'Verify HMAC', 'Get post', 'LLM compress', 'Create Bluesky', 'Create Threads', 'Slack ping'],
    difficulty: 'Intermediate',
    setupTime: '~10 min',
    requiredCredentials: [POSTA_CRED, { name: 'OpenAI API key', url: 'https://platform.openai.com' }],
    jsonFile: '/assets/workflows/linkedin-cross-post-to-bluesky-threads.json',
    body: [
      {
        type: 'p',
        text: 'The X→Bluesky migration left a lot of people wanting “post once, mirror everywhere.” This workflow does it the clean way — driven by <a href="/developers">Posta’s outbound webhooks</a>, not a leaky cron poll. When a LinkedIn post goes live, Posta sends a signed <code>post.published</code> webhook; the workflow verifies it, fetches the caption, and uses an LLM to compress it into a Bluesky and a Threads draft for you to review.',
      },
      { type: 'h2', text: 'How it works' },
      {
        type: 'ol',
        items: [
          '<strong>Posta webhook</strong> — receives <code>post.published</code> (point a Posta outbound webhook scoped to LinkedIn at this node’s URL).',
          '<strong>Verify signature</strong> (Code) — checks <code>HMAC-SHA256(secret, "{X-Posta-Timestamp}.{rawBody}")</code> in constant time and stops on mismatch.',
          '<strong>Get LinkedIn post</strong> — fetches the published post’s caption from the Posta API.',
          '<strong>Compress per network</strong> (LLM) — returns a Bluesky variant (≤300 chars) and a Threads variant, links preserved, LinkedIn opener dropped.',
          '<strong>Create Bluesky / Threads drafts</strong> (Posta) — created as drafts so nothing publishes without your say-so.',
          '<strong>Slack review ping</strong> — posts both Posta dashboard links so you can review and publish from one place.',
        ],
      },
      { type: 'h2', text: 'Verifying the webhook' },
      {
        type: 'p',
        text: 'Posta signs each delivery as <code>HMAC-SHA256(secret, "{timestamp}.{body}")</code> and sends <code>X-Posta-Signature</code>, <code>X-Posta-Timestamp</code>, and <code>X-Posta-Event</code> headers. The Code node enables the Webhook’s <em>Raw Body</em> option and verifies the bytes that were signed — never a re-serialized copy.',
      },
      { type: 'h2', text: 'Tips' },
      {
        type: 'ul',
        items: [
          'Set the Bluesky and Threads Posta account ids on the two Create-post nodes (grab them from the <em>Get many social accounts</em> Posta node).',
          'Want it fully hands-off? Drop the “draft” intent so the mirrored posts publish immediately instead of waiting for review.',
          'Add more targets by duplicating a Create-post node and pointing it at another account id.',
        ],
      },
    ],
  },
  {
    slug: 'posta-webhook-ai-comment-reply',
    title: 'Auto-reply to comments with AI (LinkedIn + TikTok)',
    description:
      'A webhook-driven n8n workflow that drafts brand-voice replies to new LinkedIn and TikTok comments with an LLM — review-first, using Posta’s comments API.',
    updated: '2026-06-20',
    tags: ['Comments', 'AI', 'Webhook', 'LinkedIn', 'TikTok'],
    summary: 'Draft AI replies to new comments; auto-post once you trust it.',
    nodeChain: ['Posta webhook', 'Verify HMAC', 'Wait 30m', 'Get comments', 'Filter unreplied', 'LLM draft', 'Reply / Slack'],
    difficulty: 'Advanced',
    setupTime: '~20 min',
    requiredCredentials: [POSTA_CRED, { name: 'OpenAI API key', url: 'https://platform.openai.com' }],
    jsonFile: '/assets/workflows/posta-webhook-ai-comment-reply.json',
    body: [
      {
        type: 'p',
        text: 'Posta’s comments inbox covers <strong>LinkedIn and TikTok</strong> — and exposes a reply API most schedulers simply don’t have. This workflow turns that into engagement: when a post publishes, it waits for the first comments, drafts a warm brand-voice reply with an LLM, and either posts it or routes it to Slack for a human. It’s the closed-loop pattern from <a href="/developers">Posta’s webhooks</a>, made real.',
      },
      { type: 'h2', text: 'How it works' },
      {
        type: 'ol',
        items: [
          '<strong>Posta webhook</strong> — receives <code>post.published</code>; the Code node verifies the HMAC signature.',
          '<strong>Wait 30 min</strong> — give the first comments time to land before checking.',
          '<strong>Get comments</strong> — reads the post’s comments from the Posta comments API.',
          '<strong>Unreplied only</strong> (Filter) — drops comments you’ve already answered (tighten this to match question-shaped comments if you like).',
          '<strong>Draft reply</strong> (LLM) — 2–3 sentences in your brand voice; returns <code>ESCALATE</code> for anything negative or sensitive.',
          '<strong>Auto-reply enabled?</strong> (IF) — when <code>AUTO_REPLY=true</code> and not escalated, <strong>Post reply</strong> publishes it; otherwise <strong>Slack for review</strong> sends it to a human.',
        ],
      },
      { type: 'h2', text: 'Review-first by design' },
      {
        type: 'p',
        text: 'Leave <code>AUTO_REPLY</code> unset for the first week — every draft goes to Slack so you can sanity-check the voice. Flip it to <code>true</code> once you trust it. The <code>ESCALATE</code> guard keeps the bot away from sensitive threads even after that.',
      },
      { type: 'h2', text: 'Scope' },
      {
        type: 'p',
        text: 'The comments inbox and reply API are <strong>LinkedIn and TikTok</strong> only — that’s where Posta currently reads and writes comments.',
      },
    ],
  },
  {
    slug: 'trending-topics-daily-ai-post',
    title: 'Post daily about trending topics with AI',
    description:
      'A scheduled n8n workflow: Perplexity finds today’s trending angles, an LLM writes per-platform captions, and Posta schedules a daily post on each network.',
    updated: '2026-06-20',
    tags: ['AI', 'Perplexity', 'Scheduling', 'Daily'],
    summary: 'Turn daily trends into scheduled per-platform posts (drafts first).',
    nodeChain: ['Schedule 8am', 'Perplexity trends', 'LLM captions', 'Fan out', 'Create post', 'Schedule post'],
    difficulty: 'Advanced',
    setupTime: '~30 min',
    requiredCredentials: [
      POSTA_CRED,
      { name: 'OpenAI API key', url: 'https://platform.openai.com' },
      { name: 'Perplexity API key', url: 'https://www.perplexity.ai/settings/api' },
    ],
    jsonFile: '/assets/workflows/trending-topics-daily-ai-post.json',
    body: [
      {
        type: 'p',
        text: 'The “AI fills my content calendar daily” pattern, done with Posta as the publishing rail. Each morning Perplexity surfaces what’s trending in your niche, an LLM picks the best angle and drafts a caption tuned to each network, and Posta schedules one post per platform for its peak hour.',
      },
      {
        type: 'p',
        text: '<strong>Drafts only by default.</strong> Posts are created as drafts and scheduled — review them each morning before they ship. Don’t graduate to auto-publish until you trust the output.',
      },
      { type: 'h2', text: 'How it works' },
      {
        type: 'ol',
        items: [
          '<strong>Every day at 8am</strong> (Schedule) — kicks off the run in your timezone.',
          '<strong>Trending angles</strong> (Perplexity) — asks for three specific angles in your <code>CONTENT_NICHE</code>.',
          '<strong>Per-platform captions</strong> (LLM) — picks the best angle and returns a LinkedIn, Bluesky, and Threads caption as JSON.',
          '<strong>Fan out to platforms</strong> (Code) — emits one item per network with its account id, caption, and peak-hour schedule time.',
          '<strong>Create a post</strong> → <strong>Schedule a post</strong> (Posta) — one draft per network, scheduled for that platform’s peak hour.',
        ],
      },
      { type: 'h2', text: 'Add an AI image' },
      {
        type: 'p',
        text: 'Optional: generate an image (DALL·E / Runware / fal.ai), upload it with the Posta <em>Upload media</em> node, and pass the returned id via Create post’s <strong>Additional Fields → Media IDs</strong>. Posta produces the per-network crops automatically.',
      },
      { type: 'h2', text: 'Setup' },
      {
        type: 'p',
        text: 'Four credentials: Posta, OpenAI, and Perplexity API keys, plus your social account ids in the <em>Fan out</em> node. Set <code>CONTENT_NICHE</code> to your topic and adjust the per-platform peak hours to your audience.',
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
