/**
 * Blog content — single source of truth.
 *
 * Posts are authored here as typed data (no markdown pipeline). Everything that
 * needs to know about blog posts reads from this module:
 *   - src/views/seo/BlogIndexView.vue  (the /blog index)
 *   - src/views/seo/BlogPostView.vue   (each /blog/:slug page)
 *   - scripts/prerender.ts             (derives the routes to pre-render)
 *   - scripts/generate-seo.ts          (injects sitemap.xml + llms.txt entries)
 *
 * To publish a post: add one `BlogPost` to `blogPosts` below and rebuild
 * (`npm run build:seo`). Routing, prerendering, sitemap, and llms.txt update
 * automatically. Keep `description` ≤ 160 chars (used as the meta description
 * and the index excerpt). Body text-bearing blocks (p / quote / ul / ol items)
 * may contain trusted inline HTML (e.g. <a>, <strong>).
 */

export interface BlogBlock {
  type: 'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'quote' | 'code' | 'pdf'
  text?: string // h2 | h3 | p | quote | pdf (caption)
  items?: string[] // ul | ol
  code?: string // code
  lang?: string // code (display hint)
  src?: string // pdf (file path)
  poster?: string // pdf (preview image)
}

export interface BlogPost {
  slug: string
  title: string
  /** ≤160 chars. Meta description + index excerpt. */
  description: string
  /** ISO date, e.g. '2026-06-01'. */
  date: string
  /** ISO date of last edit; defaults to `date`. */
  updated?: string
  author: string
  tags: string[]
  /** Absolute or root-relative OG image; defaults to the brand OG image. */
  ogImage?: string
  body: BlogBlock[]
}

export const DEFAULT_OG_IMAGE = 'https://getposta.app/assets/posta_og_image.png'
export const SITE_URL = 'https://getposta.app'

export const blogPosts: BlogPost[] = [
  {
    slug: 'post-to-social-media-from-your-terminal',
    title: 'How to post to social media from your terminal (Claude Code, MCP & CLI)',
    description:
      'Three ways to schedule and publish social posts without leaving the command line: the Posta Claude Code skill, the posta-mcp MCP server, and the REST API.',
    date: '2026-06-01',
    updated: '2026-06-01',
    author: 'Posta Team',
    tags: ['Developers', 'CLI', 'Automation', 'MCP'],
    ogImage: 'https://getposta.app/assets/blog/post-to-social-media-from-your-terminal.jpg',
    body: [
      {
        type: 'p',
        text: 'Most social schedulers assume you live in a browser tab. Posta does too — but it also exposes the same publishing engine to the command line, so you can draft, schedule, and publish to eight networks without ever leaving your editor. This guide covers the three developer surfaces and when to reach for each.',
      },
      {
        type: 'h2',
        text: 'Why post from the terminal?',
      },
      {
        type: 'p',
        text: 'If you already write content in Markdown, generate captions with an LLM, or keep a content calendar in code, the round-trip through a web UI is friction. Driving Posta from the terminal means you can script a whole week of posts, wire publishing into CI, or let an AI agent manage your queue — all against the same accounts, plan limits, and analytics as the web app.',
      },
      {
        type: 'h2',
        text: 'Three developer surfaces',
      },
      {
        type: 'h3',
        text: '1. The Claude Code / OpenClaw skill',
      },
      {
        type: 'p',
        text: 'The <a href="https://github.com/STGime/posta-skill">Posta skill</a> turns Claude Code (or any OpenClaw agent) into a social media command center. You talk to it in natural language — “generate an image and schedule it to LinkedIn and Bluesky for 9am tomorrow” — and it calls Posta under the hood. Install it from <a href="https://clawhub.ai/STGime/posta">ClawHub</a> for OpenClaw, or from the GitHub repo as a Claude Code plugin. See the <a href="/cli-social-media-posting">CLI posting guide</a> for the full walkthrough.',
      },
      {
        type: 'h3',
        text: '2. The MCP server (posta-mcp)',
      },
      {
        type: 'p',
        text: 'Prefer a tool that speaks the <strong>Model Context Protocol</strong>? <a href="https://www.npmjs.com/package/posta-mcp">posta-mcp</a> exposes Posta’s tools to any MCP client — Claude Desktop, Cursor, Windsurf, VS Code, or Zed. One npm install, one API token, and your assistant can list accounts, upload media, create posts, and check analytics. Add it to your client config:',
      },
      {
        type: 'code',
        lang: 'json',
        code: `{
  "mcpServers": {
    "posta": {
      "command": "npx",
      "args": ["-y", "posta-mcp"],
      "env": { "POSTA_API_TOKEN": "posta_your_token_here" }
    }
  }
}`,
      },
      {
        type: 'h3',
        text: '3. The REST API',
      },
      {
        type: 'p',
        text: 'When you want full control — a custom script, a backend job, a Zapier/n8n step — go straight to the <a href="/developers">REST API</a>. Bearer-token auth, an OpenAPI spec, and outbound webhooks. Creating a post is a single request:',
      },
      {
        type: 'code',
        lang: 'bash',
        code: `curl -X POST https://api.getposta.app/v1/posts \\
  -H "Authorization: Bearer posta_your_token" \\
  -H "Content-Type: application/json" \\
  -d '{"caption":"Hello from my terminal","socialAccountIds":[123]}'`,
      },
      {
        type: 'h2',
        text: 'A three-step workflow',
      },
      {
        type: 'p',
        text: 'Whichever surface you pick, the flow is the same:',
      },
      {
        type: 'ol',
        items: [
          '<strong>Connect</strong> your accounts once in the Posta dashboard and generate an API token (Settings → API tokens; tokens start with <code>posta_</code>).',
          '<strong>Create</strong> a post — caption, media, and target account ids. Upload media from a URL or a local file first if you need it.',
          '<strong>Schedule or publish</strong> — set an ISO timestamp to schedule, or publish immediately to every target platform at once.',
        ],
      },
      {
        type: 'h2',
        text: 'Which one should you use?',
      },
      {
        type: 'ul',
        items: [
          '<strong>Skill</strong> — you live in Claude Code / OpenClaw and want natural-language posting from your terminal.',
          '<strong>MCP server</strong> — you use Claude Desktop, Cursor, Windsurf, VS Code, or Zed and want Posta as a set of typed tools.',
          '<strong>REST API</strong> — you’re writing your own script or integration and want maximum control.',
        ],
      },
      {
        type: 'p',
        text: 'All three run through the same authentication and plan enforcement as the web app, so your account limits and analytics stay consistent no matter how you post. Start with a <a href="/signup">14-day free trial</a> — no credit card required.',
      },
    ],
  },
  {
    slug: 'article-to-linkedin-carousel',
    title: 'From article to LinkedIn carousel: how Posta builds document posts from text',
    description:
      'How to turn an article into a polished LinkedIn carousel PDF — AI-written slides and AI-generated backgrounds from your own pipeline (the Posta Claude Code skill, or an n8n workflow), with Posta rendering crisp text over each background and assembling the PDF in one API call.',
    date: '2026-06-04',
    updated: '2026-06-04',
    author: 'Posta Team',
    tags: ['Product', 'LinkedIn', 'Automation', 'AI'],
    ogImage: 'https://getposta.app/assets/blog/article-to-linkedin-carousel.jpg',
    body: [
      {
        type: 'p',
        text: 'LinkedIn carousels — the swipeable PDF “document” posts — are some of the highest-engagement content on the platform. They’re also tedious to make: design each slide in a tool like Canva, export a PDF, and upload it by hand. Posta removes the hardest part: hand it slide copy and a background image per slide, and it renders the text on top and returns a ready-to-post PDF in one API call. Pair that with an LLM and an image model — wired up in the Posta Claude Code skill or an n8n workflow — and the whole article-to-carousel pipeline runs end to end.',
      },
      {
        type: 'h2',
        text: 'Why carousels punch above their weight',
      },
      {
        type: 'p',
        text: 'A carousel turns one idea into a sequence of swipes, so a reader spends more time on your post — and dwell time is exactly what the feed rewards. The catch has always been production cost: every slide is a small design job. That friction is why most people post a plain text update instead. Remove the friction and carousels become a default format, not a special occasion.',
      },
      {
        type: 'h2',
        text: 'Where Posta fits in the pipeline',
      },
      {
        type: 'p',
        text: 'Posta handles the one genuinely hard step: compositing readable slide text over each background and stitching the slides into a PDF. The AI pieces run in your own automation — the Posta Claude Code skill, or an n8n workflow — which hands Posta the finished slide copy and backgrounds. End to end, the pipeline looks like this:',
      },
      {
        type: 'ul',
        items: [
          'In your workflow, an <strong>LLM</strong> turns your article into 5–10 punchy slides — a hook, the key points, and a call to action — plus hashtags for the caption.',
          'In your workflow, a fast <strong>image model</strong> generates an on-brand background for each slide, which you upload to Posta.',
          '<strong>Posta composites the slide text over each background</strong> and stitches the slides into a PDF — this is the part Posta does.',
          'Your workflow attaches the PDF to a <strong>scheduled LinkedIn document post</strong> (also via Posta).',
        ],
      },
      {
        type: 'h2',
        text: 'How it works under the hood',
      },
      {
        type: 'h3',
        text: '1. The LLM writes the slides',
      },
      {
        type: 'p',
        text: 'Long-form prose doesn’t fit a carousel — you need short, scannable lines. An LLM (we use DeepSeek, but any model works) condenses the source article into a structured list of slides, each with a title and a one- or two-line body. This very post is the kind of input that flows in at the top of the pipeline.',
      },
      {
        type: 'h3',
        text: '2. Cheap backgrounds, not stock photos',
      },
      {
        type: 'p',
        text: 'Each slide gets an abstract background from a fast text-to-image model (for example fal.ai’s FLUX schnell). Backgrounds are deliberately decorative — dark gradients and soft shapes — so they set a mood without fighting the text, and they cost a fraction of a cent each.',
      },
      {
        type: 'h3',
        text: '3. Rendering readable text on top — the hard part',
      },
      {
        type: 'p',
        text: 'Diffusion models can’t draw legible text, so Posta renders it separately and composites it. It builds an SVG text layer — title up top, body below — with a white fill, a dark outline, and a subtle top-and-bottom gradient scrim, then rasterizes it with <code>sharp</code> and lays it over the background. The outline and scrim are what keep text readable no matter what colors the background throws at it. No headless browser, no external rendering service — just image processing.',
      },
      {
        type: 'h3',
        text: '4. Assembled into a PDF',
      },
      {
        type: 'p',
        text: 'Each finished slide becomes one 1080×1080 page in a PDF — LinkedIn’s document/carousel format. Posta stores it as a document media item and hands back a media ID you attach to a post, exactly like any other media.',
      },
      {
        type: 'h2',
        text: 'One API call',
      },
      {
        type: 'p',
        text: 'Once the backgrounds are uploaded, the whole deck is a single request to the <a href="/developers">REST API</a>:',
      },
      {
        type: 'code',
        lang: 'bash',
        code: `curl -X POST https://api.getposta.app/v1/media/generate-text-carousel-pdf \\
  -H "Authorization: Bearer posta_your_token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "slides": [
      { "media_id": "<bg-1>", "title": "Turn articles into carousels", "body": "AI writes the slides, Posta builds the PDF." },
      { "media_id": "<bg-2>", "title": "Readable on any background", "body": "Outlined text + a scrim keep it legible." },
      { "media_id": "<bg-3>", "title": "Create once. Post everywhere.", "body": "Start free at getposta.app" }
    ],
    "title": "Launch deck",
    "logo_media_id": "<logo>"
  }'`,
      },
      {
        type: 'p',
        text: 'The optional <code>logo_media_id</code> is another uploaded image you own — it’s rendered in the bottom-right of every slide. You get back a <code>media_id</code> for the generated PDF, plus a thumbnail and a download URL. Attach that media ID to a LinkedIn post and you’re done.',
      },
      {
        type: 'pdf',
        // ?v bump busts the immutable CDN/browser cache when the file is swapped
        // in place (same filename). Increment when replacing the PDF/thumbnail.
        src: '/assets/blog/linkedin-carousel-example.pdf?v=3',
        poster: '/assets/blog/linkedin-carousel-example-thumb.jpg?v=3',
        text: 'A real 5-slide carousel produced by this exact endpoint — swipe through it or download the PDF.',
      },
      {
        type: 'h2',
        text: 'Wire it up in n8n (no code)',
      },
      {
        type: 'p',
        text: 'The Posta <a href="https://www.npmjs.com/package/n8n-nodes-posta">n8n community node</a> exposes this as a <strong>Media → Generate Text Carousel PDF</strong> operation, so you can build the whole pipeline visually:',
      },
      {
        type: 'ul',
        items: [
          'Read an article (RSS or HTTP).',
          'Generate the slide copy with your LLM of choice.',
          'Generate a background per slide and upload each to Posta.',
          'Generate Text Carousel PDF → Create Post on LinkedIn.',
        ],
      },
      {
        type: 'p',
        text: 'The same capability is available three ways: the <a href="/developers">REST API</a>, the Posta <a href="/cli-social-media-posting">Claude Code skill</a>, and the n8n node — so it fits whether you’re scripting, prompting, or building no-code flows.',
      },
      {
        type: 'h2',
        text: 'Try it',
      },
      {
        type: 'p',
        text: 'Carousels stop being a chore once the rendering is one API call away. Wire up your pipeline — in the Posta Claude Code skill or an n8n workflow — and let it turn your next blog post into a deck. Start with a <a href="/signup">14-day free trial</a> — no credit card required.',
      },
    ],
  },
  {
    slug: 'share-blog-posts-to-social-media-automatically',
    title: 'Share every new blog post to social media automatically (n8n + Posta)',
    description:
      'Build an n8n workflow that reads your blog RSS feed and schedules a social post — with the article image — across all your channels through Posta.',
    date: '2026-06-05',
    updated: '2026-06-05',
    author: 'Posta Team',
    tags: ['Automation', 'n8n', 'RSS', 'Scheduling'],
    ogImage: 'https://getposta.app/assets/blog/share-blog-posts-to-social.jpg',
    body: [
      {
        type: 'p',
        text: 'You just hit publish on a new article — now you have to tell everyone, on every network, one post at a time. This n8n workflow does it for you: it watches your blog’s RSS feed and, for each new post, builds and schedules a social update with the article’s image across all your connected accounts via <a href="/developers">Posta</a>. It’s the simplest automation to set up and a great first taste of pairing n8n with Posta.',
      },
      { type: 'h2', text: 'What it does' },
      {
        type: 'ul',
        items: [
          'Reads your blog <strong>RSS feed</strong> and picks up new articles.',
          'Downloads the article image and uploads it to Posta, which <strong>auto-scales it per platform</strong> (e.g. 9:16 for TikTok) with face-aware cropping.',
          'Creates one post across one or many accounts and <strong>schedules</strong> it for the time you choose.',
        ],
      },
      { type: 'h2', text: 'How it works' },
      {
        type: 'ol',
        items: [
          '<strong>RSS Read</strong> — point it at your feed (e.g. <code>https://getposta.app/feed.xml</code>).',
          '<strong>Get many social accounts</strong> (Posta) — grab the account IDs you want to post to.',
          '<strong>HTTP Request</strong> — download the article image as a file.',
          '<strong>Upload media</strong> (Posta) — upload it; per-platform scaling starts automatically.',
          '<strong>Merge</strong> — combine the media ID with the article text by position.',
          '<strong>Create a post</strong> → <strong>Schedule a post</strong> (Posta) — set caption, accounts, and a publish time.',
        ],
      },
      { type: 'h2', text: 'Get the template' },
      {
        type: 'p',
        text: 'Don’t build it by hand — <a href="/workflows/blog-to-social-media">import the ready-made workflow</a> (download the JSON or use n8n’s “Import from URL”), connect your <a href="/signup">Posta account</a>, and you’re live. Swap the manual trigger for a Schedule Trigger to run it on autopilot. Browse all our <a href="/workflows">n8n templates</a> for more.',
      },
    ],
  },
  {
    slug: 'automate-a-product-launch-campaign',
    title: 'Automate a 5-day product launch campaign across every platform',
    description:
      'An n8n workflow that turns a single product into a 5-day, multi-platform launch campaign — AI writes per-network captions and Posta schedules them all.',
    date: '2026-06-05',
    updated: '2026-06-05',
    author: 'Posta Team',
    tags: ['Automation', 'n8n', 'E-commerce', 'AI'],
    ogImage: 'https://getposta.app/assets/blog/product-launch-campaign.jpg',
    body: [
      {
        type: 'p',
        text: 'A launch isn’t one post — it’s a drumbeat across several days and every channel, each with copy that fits the platform. Doing that by hand is a chore. This n8n workflow takes a single product and spins up a <strong>5-day launch campaign</strong> across all your connected accounts, with captions tailored per network, all scheduled in advance through <a href="/developers">Posta</a>.',
      },
      { type: 'h2', text: 'What it does' },
      {
        type: 'ul',
        items: [
          'Pulls in a product (poll an endpoint, or trigger from a store webhook).',
          'Uses an <strong>LLM to write captions + hashtags per platform type</strong>, so TikTok and LinkedIn each read right.',
          'Posts to <strong>one post per platform</strong> across your active accounts, scheduled over the next 5 days.',
        ],
      },
      { type: 'h2', text: 'How it works' },
      {
        type: 'ol',
        items: [
          '<strong>HTTP Request</strong> — fetch the product details.',
          '<strong>LLM (DeepSeek)</strong> — generate platform-specific captions and tags.',
          '<strong>Get accounts → Filter → Remove Duplicates</strong> — one post per platform type across active accounts.',
          '<strong>Expand to days</strong> (Code) — fan the campaign out over 5 days.',
          '<strong>Upload media</strong> (Posta) — attach the product image (auto-scaled per platform).',
          '<strong>Create a post</strong> (Posta) — schedule each post for its day.',
        ],
      },
      { type: 'h2', text: 'Get the template' },
      {
        type: 'p',
        text: '<a href="/workflows/product-launch-campaign">Import the ready-made workflow</a>, add your Posta and LLM credentials, and adjust the day count or cadence in one Code node. Hook it to a store webhook (Shopify, etc.) so a new product kicks off the campaign automatically. See all our <a href="/workflows">n8n templates</a>. New here? <a href="/signup">Start free</a>.',
      },
    ],
  },
  {
    slug: 'promote-youtube-videos-on-social-media',
    title: 'Promote your latest YouTube video everywhere, automatically',
    description:
      'An n8n workflow that reads your YouTube feed, grabs the newest video and thumbnail, and drafts AI-written promo posts across every platform via Posta.',
    date: '2026-06-05',
    updated: '2026-06-05',
    author: 'Posta Team',
    tags: ['Automation', 'n8n', 'YouTube', 'AI'],
    ogImage: 'https://getposta.app/assets/blog/youtube-video-promotion.jpg',
    body: [
      {
        type: 'p',
        text: 'A new video deserves more than one post on one network. This n8n workflow reads your YouTube channel feed, pulls the latest video and its thumbnail, writes a promo caption for each platform, and creates <strong>draft posts</strong> across all your connected accounts via <a href="/developers">Posta</a> — so you review and publish instead of starting from a blank box.',
      },
      { type: 'h2', text: 'What it does' },
      {
        type: 'ul',
        items: [
          'Reads your YouTube channel <strong>RSS feed</strong> and picks the newest video.',
          'Downloads the <strong>thumbnail</strong> and uploads it to Posta (auto-scaled per platform).',
          'Uses an <strong>LLM</strong> to write a promo caption per platform, created as drafts for review.',
        ],
      },
      { type: 'h2', text: 'How it works' },
      {
        type: 'ol',
        items: [
          '<strong>HTTP Request</strong> — fetch the channel feed <code>https://www.youtube.com/feeds/videos.xml?channel_id=YOUR_CHANNEL_ID</code> (HTTP, since n8n’s RSS node strips fields).',
          '<strong>XML → Code</strong> — parse to JSON and build a structured object for the latest video.',
          '<strong>HTTP → Upload media</strong> (Posta) — download and upload the thumbnail.',
          '<strong>Get accounts → Filter → Remove Duplicates</strong> — one post per platform type.',
          '<strong>LLM (DeepSeek)</strong> — write a promo caption per platform.',
          '<strong>Create a post</strong> (Posta) — created as drafts so you can review before publishing.',
        ],
      },
      { type: 'h2', text: 'Get the template' },
      {
        type: 'p',
        text: '<a href="/workflows/youtube-to-social-media">Import the ready-made workflow</a>, connect your Posta and LLM credentials, and set your channel feed URL. Flip the posts out of draft (and add a Schedule step) to fully automate it. Explore all our <a href="/workflows">n8n templates</a> — or <a href="/signup">start a free trial</a>.',
      },
    ],
  },
]

/** Posts newest-first — used by the index and SEO generators. */
export const sortedPosts: BlogPost[] = [...blogPosts].sort((a, b) =>
  b.date.localeCompare(a.date),
)

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}

/** Plain-text rendering of a post body (used for JSON-LD articleBody / LLM text). */
export function postPlainText(post: BlogPost): string {
  return post.body
    .map((b) => {
      if (b.type === 'code') return b.code ?? ''
      if (b.type === 'ul' || b.type === 'ol')
        return (b.items ?? []).map((i) => i.replace(/<[^>]+>/g, '')).join('\n')
      return (b.text ?? '').replace(/<[^>]+>/g, '')
    })
    .filter(Boolean)
    .join('\n\n')
}
