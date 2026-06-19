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
  type: 'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'quote' | 'code' | 'pdf' | 'image' | 'video'
  text?: string // h2 | h3 | p | quote | pdf/image/video (caption)
  items?: string[] // ul | ol
  code?: string // code
  lang?: string // code (display hint)
  src?: string // pdf | image (file path)
  poster?: string // pdf (preview image)
  alt?: string // image (alt text)
  videoId?: string // video (YouTube video id)
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
    slug: 'face-aware-smart-cropping',
    title: 'Face-aware smart cropping: how Posta reframes photos for every platform',
    description:
      'Posta detects faces with Google Vision and crops each photo to keep people in frame across 9:16, 1:1, 4:5 and 16:9 — and skips cropping entirely when there are no faces.',
    date: '2026-06-06',
    updated: '2026-06-06',
    author: 'Posta Team',
    tags: ['Product', 'Media', 'Engineering'],
    ogImage: 'https://getposta.app/assets/blog/smart-cropping-face-detection.jpg',
    body: [
      {
        type: 'p',
        text: 'Every network wants a different shape: TikTok and Reels are 9:16, the Instagram feed is 1:1 or 4:5, YouTube is 16:9. Resize one photo to all of them and a naive center crop will happily slice your subject in half. Posta avoids that by <strong>detecting the faces in your media and cropping around them</strong> — automatically, on every upload. Here’s the same photo cropped to 9:16 two ways:',
      },
      {
        type: 'image',
        src: '/assets/blog/smart-crop-before-after.jpg?v=2',
        alt: 'A wide photo of a person on the right of the frame, cropped to 9:16 two ways: a center crop that cuts the person off, and Posta’s smart crop that keeps them framed.',
        text: 'Left: a center crop drops the subject entirely. Right: Posta’s face-aware crop keeps her in frame.',
      },
      { type: 'h2', text: 'Step 1 — Find the faces' },
      {
        type: 'p',
        text: 'When you upload an image, Posta runs it through <strong>Google Cloud Vision</strong> face detection. For each face it doesn’t just take the raw bounding box — it expands the box using key facial landmarks (chin, jaw, lips, forehead, ears) and adds ~10% padding below the chin, so the <em>whole</em> head is captured rather than a tight rectangle that clips foreheads and chins.',
      },
      {
        type: 'p',
        text: 'From all detected faces it computes two things: the <strong>center of mass</strong> (the average center of every face) and the <strong>primary face</strong> (the largest one). Those drive the crop.',
      },
      { type: 'h2', text: 'Step 2 — Crop around them' },
      {
        type: 'p',
        text: 'For each platform’s target ratio, Posta works out the largest crop of that shape that fits the original, then positions it: instead of the geometric center, it <strong>centers the crop on the faces’ center of mass</strong>. It then nudges the window so that <strong>every face stays inside the frame</strong> (with a 10% safe margin) and clamps it to the image edges. One photo, the right framing for each shape:',
      },
      {
        type: 'ul',
        items: [
          '<strong>9:16</strong> — TikTok, Reels, Shorts, Stories',
          '<strong>1:1</strong> — Instagram, Facebook, Threads, LinkedIn square',
          '<strong>4:5</strong> — Instagram & LinkedIn portrait',
          '<strong>16:9 / 1.91:1</strong> — YouTube, X, LinkedIn landscape',
        ],
      },
      { type: 'h2', text: 'No faces? It doesn’t crop at all' },
      {
        type: 'p',
        text: 'Cropping only makes sense when there’s a subject to keep. If Vision finds <strong>no faces</strong>, Posta switches to <strong>resize-to-fit</strong> instead of cropping — so screenshots, product shots, charts, and text graphics keep all their content (nothing important gets sliced off the edges). Pinterest is always treated this way too, since it favors tall, full-image pins over a fixed ratio.',
      },
      { type: 'h2', text: 'It happens automatically' },
      {
        type: 'p',
        text: 'You never configure any of this. Upload once — through the dashboard, the <a href="/developers">API</a>, an <a href="/agents">AI agent</a>, or an <a href="/workflows">n8n workflow</a> — and Posta generates every platform variant with the right framing. The same face-aware logic runs for video, so your Reels and Shorts keep people centered too.',
      },
      {
        type: 'p',
        text: 'Stop reframing the same photo eight times. <a href="/signup">Start a 14-day free trial</a> — no credit card required — and let Posta handle the crops.',
      },
    ],
  },
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
        type: 'video',
        videoId: 'CC-_i6LanLg',
        text: 'Watch: from an article to a finished LinkedIn carousel.',
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
        text: 'Don’t build it from scratch — <a href="/workflows/blog-to-linkedin-carousel">import the ready-made workflow</a> (download the JSON or use n8n’s “Import from URL”), connect your credentials, and run it. Browse all our <a href="/workflows">n8n templates</a>.',
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
      {
        type: 'video',
        videoId: 'Ra9x57asFnk',
        text: 'Watch: blog RSS → scheduled social posts everywhere.',
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
      {
        type: 'video',
        videoId: 'ORQZK_oApIQ',
        text: 'Watch: one product → a scheduled 5-day multi-platform launch.',
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
      {
        type: 'video',
        videoId: 'tTWaYb71YyA',
        text: 'Watch: latest YouTube video → AI promo posts on every platform.',
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
  {
    slug: 'mcp-vs-n8n-vs-claude-code-for-social-media',
    title: 'MCP vs n8n vs Claude Code for social media: which Posta surface do you pick?',
    description:
      'Posta exposes four surfaces — MCP server, Claude Code skill, n8n node, REST API. They look interchangeable but each fits a different shape of agent. A decision guide with code.',
    date: '2026-06-19',
    updated: '2026-06-19',
    author: 'Posta Team',
    tags: ['MCP', 'n8n', 'Claude Code', 'Automation', 'Agents'],
    body: [
      {
        type: 'p',
        text: 'Posta exposes four surfaces an agent (or an automation) can call into: an <a href="/mcp-social-media-server">MCP server</a>, a <a href="/cli-social-media-posting">Claude Code skill</a>, an <a href="/n8n-social-media-node">n8n community node</a>, and the <a href="/developers">public REST API</a>. From a distance they look interchangeable — they all create posts, schedule them, and publish to the same eight networks. They are <em>not</em> interchangeable. Each was built for a different shape of agent, and picking wrong is the difference between an afternoon and a fortnight.',
      },
      {
        type: 'p',
        text: 'This is the decision guide we wish we’d had when we started shipping these. We’ll cover what each surface is, when to reach for it, and — most importantly — how to <strong>combine two or three</strong> in a production setup. Most real Posta deployments use exactly that combination.',
      },
      { type: 'h2', text: 'The shapes, at a glance' },
      {
        type: 'ul',
        items: [
          '<strong>MCP server</strong> — interactive LLM agents (Claude Desktop, Cursor, custom MCP clients).',
          '<strong>Claude Code skill</strong> — terminal-driven agentic work, IDE-side workflows.',
          '<strong>n8n node</strong> — visual, branching pipelines triggered by non-LLM events (RSS, webhooks, schedules).',
          '<strong>REST API + webhooks</strong> — programmatic loops without an LLM in line, or fine control.',
        ],
      },
      { type: 'h2', text: 'When MCP wins' },
      {
        type: 'p',
        text: 'MCP gives the model <em>typed tool definitions</em> it can introspect. The agent learns the right call without prompt-engineered API docs — every Posta capability (<code>createPost</code>, <code>schedulePost</code>, <code>listAccounts</code>, <code>uploadMedia</code>, <code>getPostStatus</code>) shows up in the tool list with a JSON Schema. It’s the right surface when:',
      },
      {
        type: 'ul',
        items: [
          'You’re building an interactive agent — the user (or another agent) talks to a model and the model decides what to do.',
          'You want the agent to discover Posta’s capabilities at runtime, not hard-code them in a prompt.',
          'You’re running a multi-step conversation where the agent needs to reach for several Posta tools across turns.',
        ],
      },
      {
        type: 'p',
        text: 'The install is one config-file entry — see the <a href="/mcp-social-media-server">MCP server page</a> for the exact JSON. Works in Claude Desktop, Claude Code, Cursor, Windsurf, VS Code, Zed, and any custom MCP client.',
      },
      { type: 'h2', text: 'When the Claude Code skill wins' },
      {
        type: 'p',
        text: 'The <a href="/cli-social-media-posting">Posta Claude Code skill</a> is a thin wrapper that turns terminal slash-commands into Posta calls. It’s the right surface when:',
      },
      {
        type: 'ul',
        items: [
          'You live in a terminal or IDE and don’t want to switch context to post.',
          'You want a focused, natural-language wrapper around the common posting workflows — draft, schedule, list, publish — rather than the full MCP tool set.',
          'You’re handing a small autonomy budget to a Claude Code agent and don’t want it to wander into the full Posta API.',
        ],
      },
      {
        type: 'p',
        text: 'You can run both the skill and the MCP server side-by-side. The skill is a UX shortcut; MCP is the underlying mechanism.',
      },
      { type: 'h2', text: 'When n8n wins' },
      {
        type: 'p',
        text: 'The <a href="/n8n-social-media-node">n8n community node</a> turns every Posta endpoint into a typed, drag-and-drop n8n step. Drop it in next to RSS, OpenAI, HTTP, Schedule — wire them up. It’s the right surface when:',
      },
      {
        type: 'ul',
        items: [
          'Your trigger is non-LLM: an RSS feed, a webhook, a calendar event, a database change.',
          'You want visual branching and parallelism your team can read.',
          'You’re building a pipeline where an LLM is <em>one step</em>, not the orchestrator.',
        ],
      },
      {
        type: 'p',
        text: 'Examples: an RSS → LLM caption → Posta schedule flow, or a YouTube channel → Whisper highlight → Posta multi-platform fan-out. Fork any of the <a href="/workflows">ready-made templates</a> to get started.',
      },
      { type: 'h2', text: 'When the REST API wins' },
      {
        type: 'p',
        text: 'The <a href="/developers">public REST API</a> is the lowest common denominator — every other surface ultimately calls it. Reach for it directly when:',
      },
      {
        type: 'ul',
        items: [
          'There’s no LLM in your loop. A deterministic batch script that publishes a daily digest doesn’t need MCP.',
          'You need fine-grained control: idempotency keys, custom retry windows, per-call timeouts.',
          'You’re wrapping Posta in a framework that already has its own tool-calling abstraction (LangChain, CrewAI, Vercel AI SDK, Mastra — each has an <a href="/integrations">integration guide</a>).',
        ],
      },
      {
        type: 'p',
        text: 'And of course: HMAC-signed <strong>outbound webhooks</strong> are the closed-loop half of the REST API. The next post in this series covers them — for now, know that they’re what turns a one-shot script into an autonomous loop.',
      },
      { type: 'h2', text: 'A decision tree' },
      {
        type: 'code',
        lang: 'text',
        code: `Is an LLM driving the decisions?
├─ No  → REST API (or n8n if you want a visual pipeline)
└─ Yes
    │
    Is the agent interactive (chat-style, multi-turn)?
    ├─ No  (one-shot batch / triggered run)
    │   ├─ Trigger is non-LLM event (RSS, webhook, cron)  → n8n
    │   └─ Trigger is in a framework you already use      → REST via that framework's tool wrapper
    │
    └─ Yes
        │
        Where does the agent live?
        ├─ Claude Desktop / Cursor / Windsurf / VS Code / Zed  → MCP
        ├─ Terminal / Claude Code                               → Claude Code skill (+ MCP)
        └─ Custom multi-agent framework                          → MCP via the framework's MCP adapter`,
      },
      { type: 'h2', text: 'Real-world combinations' },
      {
        type: 'p',
        text: 'In practice, every production setup we’ve seen combines at least two surfaces. The patterns:',
      },
      {
        type: 'ul',
        items: [
          '<strong>n8n + REST.</strong> The default for content pipelines — n8n watches a trigger, an LLM step drafts a caption, the Posta node schedules. The "node" is REST under the hood.',
          '<strong>MCP + webhooks.</strong> The default for interactive bots — Claude calls Posta tools to schedule, then HMAC webhooks fire a separate handler when the post goes live. See the <a href="/autonomous-social-media-bot">autonomous bot tutorial</a>.',
          '<strong>Claude Code skill + MCP.</strong> The default for solo developers — slash-commands for the common cases, the MCP server for everything else, both pointed at the same token.',
          '<strong>n8n + MCP.</strong> n8n handles the trigger and orchestration, then calls into an MCP-capable agent for the parts where you want a model to make decisions (subject lines, image picks, posting cadence).',
        ],
      },
      { type: 'h2', text: 'A common anti-pattern' },
      {
        type: 'p',
        text: 'Don’t use MCP for fully deterministic flows. If you know exactly which platforms, captions, and times every post should land at, you don’t need a model picking between tools — wire it through n8n or the REST API directly. MCP is a power tool; reach for it when the agent has to <em>decide</em>, not when it’s carrying out a known recipe.',
      },
      { type: 'h2', text: 'Where to start' },
      {
        type: 'p',
        text: 'If you’re still unsure, follow the decision tree from your trigger. Most teams arrive at one of these starting points:',
      },
      {
        type: 'ul',
        items: [
          'You have an LLM agent already → <a href="/mcp-social-media-server">install the MCP server</a>.',
          'You have an n8n instance already → <a href="/n8n-social-media-node">install the community node</a>.',
          'You live in a terminal → <a href="/cli-social-media-posting">install the Claude Code skill</a>.',
          'You’re building from scratch → start with the <a href="/agentic-social-media-workflows">agentic workflows guide</a>.',
        ],
      },
      {
        type: 'p',
        text: 'All four surfaces share one token. Pick the one that matches your shape today; the others are ready when you grow into them. <a href="/signup">14-day free trial</a>, no credit card.',
      },
    ],
  },
  {
    slug: 'webhook-driven-social-media-agent-loops',
    title: 'Webhook-driven social media agent loops: closing the loop with HMAC',
    description:
      'How HMAC-signed outbound webhooks turn a fire-and-forget posting script into a closed-loop autonomous agent. Patterns, code, and pitfalls.',
    date: '2026-06-19',
    updated: '2026-06-19',
    author: 'Posta Team',
    tags: ['Webhooks', 'Agents', 'Automation', 'Engineering'],
    body: [
      {
        type: 'p',
        text: 'A social posting script that publishes and forgets is fine for newsletter-style cadences. A social <em>agent</em> needs to know whether the post actually went live, on which network, with what URL — and act on that. Polling is the obvious option, and it’s the wrong one: you burn API quota, you stall the next agent turn, and you pay for it in wall-clock latency. Webhooks are the right answer.',
      },
      {
        type: 'p',
        text: 'Posta’s outbound webhooks fire the moment a post’s status changes. Every payload is HMAC-signed. This post is about how to use them to <strong>close the loop</strong> on an agent — what patterns work, what code to write, and what to avoid.',
      },
      { type: 'h2', text: 'Why webhooks beat polling' },
      {
        type: 'ul',
        items: [
          '<strong>Latency.</strong> Webhooks fire within seconds of the platform confirming. Polling on a 30-second interval averages 15 seconds of dead time per check.',
          '<strong>Cost.</strong> Each poll is an API call against your Posta quota and (worse) an LLM round-trip if the agent is the one polling.',
          '<strong>Correctness.</strong> Polling needs you to track "last seen status" per post in your own state. Webhooks ship the new status in the payload.',
        ],
      },
      { type: 'h2', text: 'What you get on a webhook' },
      {
        type: 'p',
        text: 'Every Posta outbound webhook includes: the event name (<code>post.published</code>, <code>post.failed</code>, <code>post.scheduled</code>, etc.), the platform, the platform post ID and URL (when published), the Posta post ID, and a timestamp. The headers carry an <code>x-posta-signature</code> HMAC-SHA256 over the raw body. See the <a href="/developers">developer reference</a> for the full payload schema.',
      },
      { type: 'h2', text: 'The minimum-viable receiver' },
      {
        type: 'p',
        text: 'A 30-line Node receiver that verifies the signature and dispatches by event type:',
      },
      {
        type: 'code',
        lang: 'javascript',
        code: `import { createHmac, timingSafeEqual } from 'node:crypto'
import express from 'express'

const app = express()
app.use(express.json({ verify: (req, _, buf) => { req.raw = buf } }))

app.post('/posta-webhook', (req, res) => {
  const sig = req.headers['x-posta-signature']
  if (!sig) return res.sendStatus(401)
  const expected = createHmac('sha256', process.env.POSTA_WEBHOOK_SECRET)
    .update(req.raw).digest('hex')
  const sigBuf = Buffer.from(sig)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return res.sendStatus(401)
  }

  const { event, platform, platformPostUrl, postId } = req.body
  switch (event) {
    case 'post.published': onPublished(platform, platformPostUrl, postId); break
    case 'post.failed':    onFailed(platform, postId, req.body.error);     break
    default: /* ignore */ ;
  }
  res.sendStatus(200)
})
app.listen(3000)`,
      },
      {
        type: 'p',
        text: 'Three things to notice. (1) The <code>express.json</code> middleware grabs the <em>raw</em> body before parsing, because HMAC has to verify the bytes that were signed, not the re-serialized JSON. (2) An early return on missing signature header prevents a confusing crash when something other than Posta probes the endpoint. (3) The length check before <code>timingSafeEqual</code> dodges a Node throw when buffers differ in length.',
      },
      { type: 'h2', text: 'Pattern 1 — Auto-respond on publish' },
      {
        type: 'p',
        text: 'The most common closed-loop pattern: when LinkedIn fires <code>post.published</code>, hand the URL to your agent and have it draft the first reply or a follow-up Slack note. The webhook handler kicks off a <em>new</em> agent run rather than calling synchronously — keep the webhook handler fast (return 200 quickly) and put the work on a queue.',
      },
      {
        type: 'code',
        lang: 'javascript',
        code: `async function onPublished(platform, url, postId) {
  await queue.push({
    type: 'draft-reply',
    platform, url, postId,
    promptHint: 'Draft a thoughtful first comment on this post',
  })
}`,
      },
      { type: 'h2', text: 'Pattern 2 — Multi-day campaign branching' },
      {
        type: 'p',
        text: 'For a campaign that runs over days, you don’t want to schedule day 5 on day 1 — engagement on day 1 changes what day 5 should say. Webhook-driven branching lets the agent decide day N+1 after day N publishes:',
      },
      {
        type: 'ul',
        items: [
          'Day 1 post fires <code>post.published</code> webhook.',
          'Receiver kicks off agent run with the day-1 metrics so far (or just the URL — agent can fetch).',
          'Agent drafts day-2 post and calls Posta to create it as a scheduled draft.',
          'Repeat.',
        ],
      },
      { type: 'h2', text: 'Pattern 3 — Retry-with-variation' },
      {
        type: 'p',
        text: 'When <code>post.failed</code> fires (rate limits, transient platform errors, content rejections), don’t blind-retry the same payload. Regenerate the caption with a different angle and re-schedule. The Posta queue itself does retry on transient platform errors with exponential backoff, so by the time you see a <code>post.failed</code> webhook the platform has truly refused — variation is the right next step.',
      },
      { type: 'h2', text: 'Pattern 4 — Supervised autonomy with a kill switch' },
      {
        type: 'p',
        text: 'For higher-stakes content, fire a Slack message on every <code>post.scheduled</code> with a deep link to the post in the Posta dashboard (<code>https://getposta.app/app/posts/&lt;postId&gt;</code>). A reviewer can open it, edit, reschedule, or cancel before it goes live. The bot still drafts and schedules autonomously, but no post slips into production without at least the option of a human glance. This is the pattern we recommend for the first week of any new autonomous loop.',
      },
      { type: 'h2', text: 'Pitfalls' },
      {
        type: 'ul',
        items: [
          '<strong>Don’t do work synchronously in the receiver.</strong> Webhook senders time out; if you take 10 seconds to call an LLM in the handler, Posta will retry — and your downstream actions will fire twice.',
          '<strong>Use idempotency keys.</strong> Every webhook payload includes a unique event ID. If your handler is at-least-once (most are), de-duplicate on that ID before acting.',
          '<strong>Verify the signature on the raw body.</strong> Re-serializing the JSON before HMAC will fail intermittently — JSON whitespace and key order are not stable.',
          '<strong>Don’t skip the signature check in dev.</strong> Skipping in dev means you ship the skip to prod. Use a dev secret and verify it the same way.',
          '<strong>Return 200 on duplicates.</strong> If you’ve already processed the event, return 200 — Posta will treat a 4xx as a failure and retry.',
        ],
      },
      { type: 'h2', text: 'Where to go from here' },
      {
        type: 'p',
        text: 'Wire the webhook receiver into an agent loop end-to-end in the <a href="/autonomous-social-media-bot">autonomous social media bot tutorial</a>. For a tour of the broader patterns this fits into, read <a href="/agentic-social-media-workflows">agentic social media workflows</a>. Or just <a href="/signup">grab a Posta token</a> and write your handler.',
      },
    ],
  },
  {
    slug: 'post-to-linkedin-from-terminal-claude-code',
    title: 'Post to LinkedIn from the terminal with Claude Code',
    description:
      'Skip the LinkedIn dashboard. Install the Posta Claude Code skill, run a slash-command in your terminal, ship a post. Setup in 90 seconds.',
    date: '2026-06-19',
    updated: '2026-06-19',
    author: 'Posta Team',
    tags: ['Claude Code', 'CLI', 'LinkedIn', 'Workflow'],
    body: [
      {
        type: 'p',
        text: 'Most "post to LinkedIn" tooling assumes you’ll switch to a browser tab. The <a href="/cli-social-media-posting">Posta Claude Code skill</a> assumes the opposite — that you’re in your terminal anyway, that you’d like to stay there, and that your editor’s agent is the best place to draft. Here’s the 90-second setup and a few patterns that make it worth the install.',
      },
      { type: 'h2', text: 'Setup' },
      {
        type: 'p',
        text: 'You need three things: a Posta account, a connected LinkedIn account, and Claude Code. If you have all three, this is the whole install — one command in Claude Code, pointing at the skill repo:',
      },
      {
        type: 'code',
        lang: 'text',
        code: `# In Claude Code:
/install-skill https://github.com/STGime/posta-skill

# Once installed, Claude can call Posta in natural language —
# no Posta-specific slash-commands required.`,
      },
      {
        type: 'p',
        text: 'The skill is <em>natural-language driven</em>: there are no <code>/posta create</code> or <code>/posta schedule</code> commands to memorize. You ask Claude in plain English ("schedule a LinkedIn post about…") and the skill handles authentication, calls Posta under the hood, and reports back. The full reference is on the <a href="/cli-social-media-posting">CLI posting landing page</a>.',
      },
      { type: 'h2', text: 'Pattern 1 — One-shot draft' },
      {
        type: 'p',
        text: 'You finished a piece of work and want to post about it. The terminal is open, Claude Code is up. Just ask:',
      },
      {
        type: 'code',
        lang: 'text',
        code: `"Draft a LinkedIn post: 'Shipped Posta v2.1 — per-platform caption
limits + batch media endpoint. Matters for anyone running multi-network
automations because…' Save it as a draft so I can review."`,
      },
      {
        type: 'p',
        text: 'Claude takes the prompt, calls Posta to create the draft on LinkedIn, returns the draft ID and a preview URL. Open the URL in a browser when you want to review, or ask Claude to schedule it inline.',
      },
      { type: 'h2', text: 'Pattern 2 — Draft from the repo state' },
      {
        type: 'p',
        text: 'A more agentic pattern: hand Claude Code the repo and ask it to <em>find</em> what’s worth posting:',
      },
      {
        type: 'code',
        lang: 'text',
        code: `"Look at the git log since last Monday. Pick the most ship-worthy
commit. Draft a LinkedIn post about it, schedule it for Tuesday 9am
CET, save as draft so I can review."`,
      },
      {
        type: 'p',
        text: 'Claude reads the log, picks a commit, drafts the post, and calls Posta to schedule it as a draft. You review and approve in the Posta dashboard, or ask Claude to list scheduled drafts and approve from the terminal.',
      },
      { type: 'h2', text: 'Pattern 3 — Carousel from a README' },
      {
        type: 'p',
        text: 'For a longer-form release post: ask Claude to build a LinkedIn carousel directly from a README or CHANGELOG. The skill calls Posta’s carousel endpoint, which composites the slides as a PDF and ships it to LinkedIn’s document API. Walked through end-to-end in the <a href="/workflows/blog-to-linkedin-carousel">blog-to-LinkedIn-carousel workflow</a>.',
      },
      { type: 'h2', text: 'Why not the MCP server?' },
      {
        type: 'p',
        text: 'You can also install the <a href="/mcp-social-media-server">Posta MCP server</a> into Claude Code. The difference: the skill is a focused wrapper around the common posting workflows (draft, schedule, list, publish), tuned for Claude Code specifically. The MCP server exposes Posta’s full tool surface — <code>createPost</code>, <code>schedulePost</code>, <code>listAccounts</code>, <code>getPostStatus</code>, <code>listMedia</code>, <code>uploadMedia</code>, <code>listPosts</code> — to any MCP client, including Claude Code. Most users start with the skill, add the MCP server when they outgrow it.',
      },
      { type: 'h2', text: 'Combine with autonomous mode' },
      {
        type: 'p',
        text: 'Claude Code’s autonomous mode means you can wire the skill into a longer-running task. A common pattern in our repo: a "ship the week" prompt that picks the top three commits, drafts a post per audience (LinkedIn long-form, Bluesky short-form), and schedules all three — without context-switching from the terminal.',
      },
      { type: 'h2', text: 'Where to go from here' },
      {
        type: 'p',
        text: 'The skill is one of four surfaces — see <a href="/blog/mcp-vs-n8n-vs-claude-code-for-social-media">MCP vs n8n vs Claude Code</a> for the decision framework, or jump straight to the <a href="/cli-social-media-posting">CLI posting landing page</a> for the install and full command reference. <a href="/signup">14-day free trial</a> covers all four surfaces and every supported network.',
      },
    ],
  },
  {
    slug: 'langchain-social-media-agent-tutorial',
    title: 'Build a LangChain social media agent: end-to-end tutorial with Posta',
    description:
      'Wire Posta\'s MCP server into a LangGraph agent. End-to-end Python tutorial: draft, schedule, publish across eight networks. Code that runs as-is.',
    date: '2026-06-19',
    updated: '2026-06-19',
    author: 'Posta Team',
    tags: ['LangChain', 'LangGraph', 'Python', 'Agents', 'MCP'],
    body: [
      {
        type: 'p',
        text: 'This tutorial walks through building a working <a href="/integrations/langchain">LangChain</a> agent that can draft and schedule social posts across LinkedIn, Bluesky, Threads, and any other Posta-supported network. The agent uses the <a href="/mcp-social-media-server">Posta MCP server</a> through <code>langchain-mcp-adapters</code> — so it discovers the tools at runtime instead of you writing custom Tool wrappers. Total time: 15 minutes.',
      },
      { type: 'h2', text: 'What you\'ll build' },
      {
        type: 'p',
        text: 'A LangGraph ReAct agent that takes a high-level instruction like <em>"Draft and schedule a LinkedIn post about our v2 launch for tomorrow 9am CET"</em>, picks the right Posta tools, calls them with typed arguments, and reports back with the scheduled post ID and URL. No glue code, no hand-rolled API client.',
      },
      { type: 'h2', text: 'Prerequisites' },
      {
        type: 'ul',
        items: [
          'Python 3.11+ and <code>pip</code>.',
          'A Posta account with at least one connected social account. <a href="/signup">14-day free trial</a>.',
          'A Posta API token (Settings → API in the Posta dashboard).',
          'An Anthropic API key (or OpenAI — sample uses Claude).',
        ],
      },
      { type: 'h2', text: 'Step 1 — Install dependencies' },
      {
        type: 'code',
        lang: 'bash',
        code: `pip install langchain-anthropic langchain-mcp-adapters langgraph`,
      },
      { type: 'h2', text: 'Step 2 — Wire up the MCP client' },
      {
        type: 'p',
        text: '<code>MultiServerMCPClient</code> takes a dict of MCP server configs and exposes them as LangChain tools. Point it at <code>posta-mcp</code> over stdio with your Posta token in the env:',
      },
      {
        type: 'code',
        lang: 'python',
        code: `# posta_agent.py
import asyncio
import os
from langchain_anthropic import ChatAnthropic
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent

async def main():
    client = MultiServerMCPClient({
        "posta": {
            "command": "npx",
            "args": ["-y", "posta-mcp"],
            "env": {"POSTA_API_TOKEN": os.environ["POSTA_API_TOKEN"]},
            "transport": "stdio",
        }
    })
    tools = await client.get_tools()

    agent = create_react_agent(
        ChatAnthropic(model="claude-sonnet-4-6", temperature=0.3),
        tools,
    )

    result = await agent.ainvoke({
        "messages": [(
            "user",
            "Look up my connected accounts. Draft a LinkedIn post "
            "announcing we shipped v2 of our SDK — focus on the new "
            "per-platform caption limits and the batch media endpoint. "
            "Schedule it for tomorrow at 9am CET. Save as a draft "
            "so I can review."
        )]
    })

    for msg in result["messages"]:
        print(f"[{msg.type}] {msg.content}")

asyncio.run(main())`,
      },
      { type: 'h2', text: 'Step 3 — Run it' },
      {
        type: 'code',
        lang: 'bash',
        code: `export POSTA_API_TOKEN=posta_...
export ANTHROPIC_API_KEY=sk-ant-...

python posta_agent.py`,
      },
      {
        type: 'p',
        text: 'On the first run the agent calls <code>listAccounts</code> to enumerate your connected social accounts, picks the LinkedIn one, drafts the caption with Claude, and calls <code>createPost</code> + <code>schedulePost</code> with the right arguments. Each tool call streams back to the agent, which decides the next step.',
      },
      { type: 'h2', text: 'Step 4 — Add LangGraph state for multi-turn campaigns' },
      {
        type: 'p',
        text: 'The ReAct agent is great for one-shot prompts. For multi-day campaigns where you want the agent to react to webhooks between turns, wrap it in a LangGraph <code>StateGraph</code>:',
      },
      {
        type: 'code',
        lang: 'python',
        code: `from typing import TypedDict
from langgraph.graph import StateGraph, END

class CampaignState(TypedDict):
    messages: list
    scheduled_post_ids: list[str]
    published_post_ids: list[str]

graph = StateGraph(CampaignState)

# "draft" node runs the ReAct agent to draft + schedule
graph.add_node("draft", agent_node)

# "wait_for_publish" pauses until a webhook flips a published_post_ids entry
graph.add_node("wait_for_publish", wait_node)

# "draft_followup" runs after publish — drafts the next day's post
graph.add_node("draft_followup", agent_node)

graph.set_entry_point("draft")
graph.add_edge("draft", "wait_for_publish")
graph.add_edge("wait_for_publish", "draft_followup")
graph.add_edge("draft_followup", END)

campaign = graph.compile()`,
      },
      {
        type: 'p',
        text: 'The <code>wait_for_publish</code> node is the closed-loop half: it sleeps until Posta\'s HMAC-signed webhook flips the state. For the webhook receiver pattern, see <a href="/blog/webhook-driven-social-media-agent-loops">webhook-driven social media agent loops</a>.',
      },
      { type: 'h2', text: 'When to use the REST path instead' },
      {
        type: 'p',
        text: 'If your LangChain code is a deterministic chain (not an agent that picks tools), wrapping the Posta REST API in a <code>@tool</code> is simpler than running the MCP server. The two-step shape is documented on the <a href="/integrations/langchain">LangChain integration page</a>: create the draft with <code>socialAccountIds</code>/<code>mediaIds</code>, then <code>POST /v1/posts/:id/schedule</code> with <code>scheduledAt</code>.',
      },
      { type: 'h2', text: 'Pitfalls' },
      {
        type: 'ul',
        items: [
          '<strong>Set <code>temperature</code> low for tool-calling agents.</strong> 0.0–0.3 produces stable arg shapes; 0.7+ will occasionally invent arguments that fail JSON schema validation.',
          '<strong>Always include "save as draft" in the user prompt for the first week.</strong> Until you trust the agent\'s output, schedule everything as drafts and approve manually.',
          '<strong>If a tool call fails, the ReAct loop retries up to <code>recursion_limit</code> times</strong> — keep that bounded (default is 25) to avoid runaway loops on transient platform errors.',
        ],
      },
      { type: 'h2', text: 'Where to go from here' },
      {
        type: 'p',
        text: 'Read the <a href="/integrations/langchain">LangChain integration reference</a> for the full LangGraph wiring. For the comparison with CrewAI and OpenAI Agents SDK, see <a href="/blog/crewai-social-media-agent-tutorial">the CrewAI tutorial</a> and <a href="/blog/openai-agents-sdk-social-media-tutorial">the OpenAI Agents SDK tutorial</a>. For the broader pattern map, see <a href="/agentic-social-media-workflows">agentic social media workflows</a>. <a href="/signup">14-day free trial</a>, no credit card.',
      },
    ],
  },
  {
    slug: 'crewai-social-media-agent-tutorial',
    title: 'Build a CrewAI social media crew: end-to-end tutorial with Posta',
    description:
      'A CrewAI crew with per-platform specialist agents, all sharing the Posta MCP server. End-to-end Python tutorial. Code that runs as-is.',
    date: '2026-06-19',
    updated: '2026-06-19',
    author: 'Posta Team',
    tags: ['CrewAI', 'Python', 'Agents', 'MCP'],
    body: [
      {
        type: 'p',
        text: 'This tutorial builds a working <a href="/integrations/crewai">CrewAI</a> crew that posts to social media. The interesting part: instead of one agent for everything, we wire up <em>per-platform specialist agents</em> — a LinkedIn specialist with a long-form voice, a Bluesky specialist with a short-form voice, a YouTube Shorts specialist tuned for vertical video promos — and let CrewAI orchestrate them. All three share the same <a href="/mcp-social-media-server">Posta MCP server</a> as a tool source.',
      },
      { type: 'h2', text: 'What you\'ll build' },
      {
        type: 'p',
        text: 'A hierarchical CrewAI crew with a research agent that gathers context, a router/manager agent that decides which platforms get a post, and three platform specialists that draft and schedule for their network. All four agents share the Posta MCP server\'s tool set — they reach for the same <code>createPost</code> / <code>schedulePost</code> tools but call them with platform-specific voices.',
      },
      { type: 'h2', text: 'Prerequisites' },
      {
        type: 'ul',
        items: [
          'Python 3.11+ and <code>pip</code>.',
          'A Posta account with LinkedIn, Bluesky, and YouTube connected. <a href="/signup">14-day free trial</a>.',
          'A Posta API token.',
          'An Anthropic or OpenAI API key.',
        ],
      },
      { type: 'h2', text: 'Step 1 — Install dependencies' },
      {
        type: 'code',
        lang: 'bash',
        code: `pip install crewai crewai-tools`,
      },
      { type: 'h2', text: 'Step 2 — Load the Posta tools via MCPServerAdapter' },
      {
        type: 'p',
        text: 'CrewAI\'s <code>MCPServerAdapter</code> loads any MCP server\'s tools and exposes them to the crew. Wrap the Posta server config in a <code>with</code> block so the stdio process gets cleaned up after the crew runs:',
      },
      {
        type: 'code',
        lang: 'python',
        code: `# crew.py
import os
from crewai import Agent, Task, Crew, Process
from crewai_tools import MCPServerAdapter

posta_params = {
    "command": "npx",
    "args": ["-y", "posta-mcp"],
    "env": {"POSTA_API_TOKEN": os.environ["POSTA_API_TOKEN"]},
}

LLM = "anthropic/claude-sonnet-4-6"

with MCPServerAdapter(posta_params) as posta_tools:
    # Three platform specialists — same tool set, different voices.
    linkedin_specialist = Agent(
        role="LinkedIn Specialist",
        goal="Draft long-form, professional, insight-driven LinkedIn posts.",
        backstory="A B2B content strategist with 10 years of LinkedIn-native writing.",
        tools=posta_tools,
        llm=LLM,
        verbose=True,
    )
    bluesky_specialist = Agent(
        role="Bluesky Specialist",
        goal="Draft short, punchy, link-friendly Bluesky posts under 300 chars.",
        backstory="A dev-Twitter veteran who moved to Bluesky early.",
        tools=posta_tools,
        llm=LLM,
        verbose=True,
    )
    shorts_specialist = Agent(
        role="YouTube Shorts Specialist",
        goal="Draft promo posts for vertical-video Shorts with a hook in 5 seconds.",
        backstory="A YouTube creator-economy strategist focused on Shorts pacing.",
        tools=posta_tools,
        llm=LLM,
        verbose=True,
    )

    # Custom manager that orchestrates the specialists. With Process.hierarchical
    # CrewAI uses manager_agent= for a hand-rolled manager (manager_llm= would
    # spin up its own — don't mix). The manager isn't in agents=[] either.
    manager = Agent(
        role="Campaign Manager",
        goal="Decide which platforms get a post and delegate drafting.",
        backstory="A multi-network campaign manager who briefs specialists.",
        llm=LLM,
        allow_delegation=True,
        verbose=True,
    )

    task = Task(
        description=(
            "We shipped v2 of our SDK today: per-platform caption limits, "
            "batch media endpoint, OpenAPI updates. Brief each specialist. "
            "Each should draft and schedule a post for tomorrow 9am CET as "
            "a draft (so we can review)."
        ),
        expected_output="A summary of each scheduled post (platform + draft ID).",
    )

    crew = Crew(
        agents=[linkedin_specialist, bluesky_specialist, shorts_specialist],
        tasks=[task],
        process=Process.hierarchical,
        manager_agent=manager,
    )

    result = crew.kickoff()
    print(result)`,
      },
      { type: 'h2', text: 'Step 3 — Run it' },
      {
        type: 'code',
        lang: 'bash',
        code: `export POSTA_API_TOKEN=posta_...
export ANTHROPIC_API_KEY=sk-ant-...

python crew.py`,
      },
      {
        type: 'p',
        text: 'On the first run the manager agent reads the brief, lists the platforms by calling <code>listAccounts</code> through one of the specialists, and delegates per-platform drafting. Each specialist drafts in its own voice, calls <code>createPost</code> + <code>schedulePost</code> for its platform, and reports back with the Posta draft ID. The hierarchical process serializes the delegations and the manager assembles the final summary.',
      },
      { type: 'h2', text: 'Why per-platform specialists?' },
      {
        type: 'p',
        text: 'You could ask a single agent to "draft for LinkedIn, Bluesky, and YouTube Shorts." It will — and it will produce three nearly-identical posts with different lengths. Per-platform specialists let you bake in platform-specific writing tradition: LinkedIn rewards earnest insight, Bluesky rewards specificity and self-deprecation, Shorts rewards a hook in the first five seconds. The voices shouldn\'t be identical.',
      },
      { type: 'h2', text: 'When to use Flows instead' },
      {
        type: 'p',
        text: 'CrewAI Flows are the right surface when you need explicit control over what runs in what order — non-deterministic delegation can be hard to debug when something goes wrong. The same Posta tools work the same way in Flow steps; the only thing that changes is the orchestration shape.',
      },
      { type: 'h2', text: 'Pitfalls' },
      {
        type: 'ul',
        items: [
          '<strong>Wrap MCPServerAdapter in a <code>with</code> block.</strong> Without it, the stdio process leaks across reruns.',
          '<strong>Cap the manager\'s recursion.</strong> Hierarchical crews can ping-pong delegations forever if you don\'t set a clear <code>expected_output</code> contract.',
          '<strong>Give each specialist its own LLM only if needed.</strong> Setting a cheaper model on the manager and Claude on specialists is a common cost-saving tweak; resist the urge to over-optimize before profiling.',
          '<strong>Always start with "save as draft."</strong> Crew runs are non-deterministic; you want the option to abort before LinkedIn sees a post you don\'t want.',
        ],
      },
      { type: 'h2', text: 'Where to go from here' },
      {
        type: 'p',
        text: 'Read the <a href="/integrations/crewai">CrewAI integration reference</a> for Flow and sequential-process examples. Compare with the LangChain and OpenAI Agents SDK approaches in <a href="/blog/langchain-social-media-agent-tutorial">the LangChain tutorial</a> and <a href="/blog/openai-agents-sdk-social-media-tutorial">the OpenAI Agents SDK tutorial</a>. For the broader pattern map, see <a href="/agentic-social-media-workflows">agentic social media workflows</a>. <a href="/signup">14-day free trial</a>.',
      },
    ],
  },
  {
    slug: 'openai-agents-sdk-social-media-tutorial',
    title: 'Build a social media agent with the OpenAI Agents SDK: end-to-end tutorial',
    description:
      'A router-and-specialist agent setup using the OpenAI Agents SDK and the Posta MCP server. End-to-end Python tutorial with handoffs.',
    date: '2026-06-19',
    updated: '2026-06-19',
    author: 'Posta Team',
    tags: ['OpenAI Agents SDK', 'Python', 'Agents', 'MCP', 'Handoffs'],
    body: [
      {
        type: 'p',
        text: 'This tutorial builds a working <a href="/integrations/openai-agents-sdk">OpenAI Agents SDK</a> agent setup that posts to social media. It uses two of the SDK\'s native features: <strong>MCP server attachment</strong> (so Posta\'s tools are typed and introspectable) and <strong>handoffs</strong> (so a router agent triages the request and delegates to a publisher agent that owns the Posta tools).',
      },
      { type: 'h2', text: 'What you\'ll build' },
      {
        type: 'p',
        text: 'A <em>Router</em> agent that classifies an incoming request (post about a release? share a customer quote? cross-post a YouTube video?) and hands off to one of three specialist agents — Release, Quote, or Repurpose — each holding the Posta MCP server. Each specialist drafts and schedules through Posta in its own voice.',
      },
      { type: 'h2', text: 'Prerequisites' },
      {
        type: 'ul',
        items: [
          'Python 3.11+ and <code>pip</code>.',
          'A Posta account with at least one connected social account. <a href="/signup">14-day free trial</a>.',
          'A Posta API token.',
          'An OpenAI API key.',
        ],
      },
      { type: 'h2', text: 'Step 1 — Install dependencies' },
      {
        type: 'code',
        lang: 'bash',
        code: `pip install openai-agents`,
      },
      { type: 'h2', text: 'Step 2 — Define the specialists' },
      {
        type: 'p',
        text: 'Each specialist gets the same Posta MCP server attached via <code>MCPServerStdio</code> — but with different instructions, so the model picks tool calls that match each agent\'s job:',
      },
      {
        type: 'code',
        lang: 'python',
        code: `# agent.py
import os, asyncio
from agents import Agent, Runner
from agents.mcp import MCPServerStdio

POSTA_MCP_PARAMS = {
    "command": "npx",
    "args": ["-y", "posta-mcp"],
    "env": {"POSTA_API_TOKEN": os.environ["POSTA_API_TOKEN"]},
}

async def main():
    async with MCPServerStdio(params=POSTA_MCP_PARAMS) as posta_mcp:
        release_agent = Agent(
            name="Release",
            instructions=(
                "You announce product releases. Draft a long-form LinkedIn "
                "post AND a short Bluesky post. Schedule both as drafts."
            ),
            mcp_servers=[posta_mcp],
        )
        quote_agent = Agent(
            name="CustomerQuote",
            instructions=(
                "You amplify customer quotes. Draft a single Bluesky post "
                "that quotes the user with attribution and schedules as a draft."
            ),
            mcp_servers=[posta_mcp],
        )
        repurpose_agent = Agent(
            name="Repurpose",
            instructions=(
                "You repurpose long-form content (videos, posts) into "
                "short-form across LinkedIn, Bluesky, and Threads — drafts only."
            ),
            mcp_servers=[posta_mcp],
        )

        router = Agent(
            name="Router",
            instructions=(
                "Classify the user request as a Release, a CustomerQuote, "
                "or a Repurpose, then hand off to the right specialist."
            ),
            handoffs=[release_agent, quote_agent, repurpose_agent],
        )

        result = await Runner.run(
            router,
            input=(
                "We shipped v2 of our SDK today: per-platform caption limits, "
                "batch media endpoint, OpenAPI updates. Get the word out."
            ),
        )
        print(result.final_output)

asyncio.run(main())`,
      },
      { type: 'h2', text: 'Step 3 — Run it' },
      {
        type: 'code',
        lang: 'bash',
        code: `export POSTA_API_TOKEN=posta_...
export OPENAI_API_KEY=sk-...

python agent.py`,
      },
      {
        type: 'p',
        text: 'The Router classifies the input as a Release, hands off to the Release specialist, and the Release specialist calls Posta\'s tools to create the LinkedIn and Bluesky drafts. The handoff carries the input + conversation context; the specialist returns the final answer up the chain.',
      },
      { type: 'h2', text: 'Adding Sessions for multi-turn campaigns' },
      {
        type: 'p',
        text: 'For multi-turn campaigns ("now schedule the day-2 post"), wrap the runs in a session so the agent remembers the campaign state across turns. <code>Session</code> is the abstract base; use the concrete <code>SQLiteSession</code> (or <code>OpenAIConversationsSession</code>) to actually instantiate one:',
      },
      {
        type: 'code',
        lang: 'python',
        code: `from agents import SQLiteSession

async with MCPServerStdio(params=POSTA_MCP_PARAMS) as posta_mcp:
    # ... define agents as above
    session = SQLiteSession("sdk-v2-launch")

    # Day 1
    await Runner.run(router, input="Launch campaign: SDK v2...", session=session)

    # Day 2 — same session, agent knows what day 1 looked like
    await Runner.run(router, input="Schedule the day-2 post following up on yesterday's launch.", session=session)`,
      },
      { type: 'h2', text: 'Closing the loop with webhooks' },
      {
        type: 'p',
        text: 'Pair this with a webhook receiver that triggers a new <code>Runner.run()</code> when Posta fires <code>post.published</code> — that\'s how the agent reacts to platform feedback in real time. See <a href="/blog/webhook-driven-social-media-agent-loops">webhook-driven social media agent loops</a> for the full pattern.',
      },
      { type: 'h2', text: 'Pitfalls' },
      {
        type: 'ul',
        items: [
          '<strong>Attach the MCP server to the agent the handoff lands on, not the router.</strong> If the router holds the MCP server but doesn\'t use it, you pay for an extra tool list in every router prompt.',
          '<strong>Cap <code>max_turns</code>.</strong> Defaults are generous; tool-calling loops can run away when an unfamiliar error shape comes back from Posta.',
          '<strong>Always schedule as drafts for the first week.</strong> Handoff chains are easier to debug when posts haven\'t already shipped.',
          '<strong>Use <code>tool_use_behavior="stop_on_first_tool"</code> for one-shot deterministic flows.</strong> When you want the agent to call exactly one Posta tool and return — not loop — set this.',
        ],
      },
      { type: 'h2', text: 'When to use the Responses API directly instead' },
      {
        type: 'p',
        text: 'The Agents SDK is ergonomic sugar on top of the Responses API + function-tool contract. If you don\'t need handoffs or sessions, registering a function tool that wraps the <a href="/integrations/openai-agents-sdk">Posta REST API</a> directly with the Responses API is one fewer abstraction.',
      },
      { type: 'h2', text: 'Where to go from here' },
      {
        type: 'p',
        text: 'Read the <a href="/integrations/openai-agents-sdk">OpenAI Agents SDK integration reference</a> for the full handoff + sessions wiring. Compare with the LangChain and CrewAI approaches in <a href="/blog/langchain-social-media-agent-tutorial">the LangChain tutorial</a> and <a href="/blog/crewai-social-media-agent-tutorial">the CrewAI tutorial</a>. For the broader pattern map, see <a href="/agentic-social-media-workflows">agentic social media workflows</a>. <a href="/signup">14-day free trial</a>.',
      },
    ],
  },
  {
    slug: 'vercel-ai-sdk-social-media-agent-tutorial',
    title: 'Build a social media agent with the Vercel AI SDK: TypeScript tutorial',
    description:
      'Wire the Posta MCP server into the Vercel AI SDK with experimental_createMCPClient, stream tool calls from a Next.js route, and close the loop with a webhook handler. TypeScript, runnable code.',
    date: '2026-06-19',
    updated: '2026-06-19',
    author: 'Posta Team',
    tags: ['Vercel AI SDK', 'TypeScript', 'Next.js', 'Agents', 'MCP'],
    body: [
      {
        type: 'p',
        text: 'This tutorial builds a working <a href="/integrations/vercel-ai-sdk">Vercel AI SDK</a> agent that posts to social media from a Next.js Route Handler. We use the SDK\'s experimental MCP client to load the <a href="/mcp-social-media-server">Posta MCP server</a>\'s tools, stream the agent\'s response back to the browser, and wire a separate Route Handler to receive Posta\'s HMAC-signed webhooks. Total time: 20 minutes.',
      },
      { type: 'h2', text: 'What you\'ll build' },
      {
        type: 'p',
        text: 'A <code>/api/post</code> Route Handler that takes a prompt and returns the agent\'s streaming response — the agent picks which Posta tools to call, schedules the post, and reports back with the platform post URL once Posta\'s webhook confirms it published. The same setup runs in Node, Edge (for the REST path), Server Actions, or any other Vercel AI SDK surface.',
      },
      { type: 'h2', text: 'Prerequisites' },
      {
        type: 'ul',
        items: [
          'A Next.js 15+ app (or any Node runtime that supports the AI SDK).',
          'A Posta account with at least one connected social account. <a href="/signup">14-day free trial</a>.',
          'A Posta API token (Settings → API).',
          'An Anthropic API key (or any other supported provider).',
        ],
      },
      { type: 'h2', text: 'Step 1 — Install dependencies' },
      {
        type: 'code',
        lang: 'bash',
        code: `npm i ai @ai-sdk/anthropic zod`,
      },
      { type: 'h2', text: 'Step 2 — Load the Posta MCP server' },
      {
        type: 'p',
        text: '<code>experimental_createMCPClient</code> talks to the Posta MCP server over stdio. The tools it returns drop straight into <code>generateText</code> or <code>streamText</code>:',
      },
      {
        type: 'code',
        lang: 'typescript',
        code: `// app/api/post/route.ts
import { anthropic } from '@ai-sdk/anthropic'
import { experimental_createMCPClient as createMCPClient, generateText } from 'ai'
import { Experimental_StdioMCPTransport as StdioTransport } from 'ai/mcp-stdio'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { prompt } = await req.json()

  const mcp = await createMCPClient({
    transport: new StdioTransport({
      command: 'npx',
      args: ['-y', 'posta-mcp'],
      env: { POSTA_API_TOKEN: process.env.POSTA_API_TOKEN! },
    }),
  })

  try {
    const tools = await mcp.tools()
    const result = await generateText({
      model: anthropic('claude-sonnet-4-6'),
      tools,
      prompt,
      maxSteps: 8,
    })
    return Response.json({ text: result.text, steps: result.steps.length })
  } finally {
    await mcp.close()
  }
}`,
      },
      { type: 'h2', text: 'Step 3 — Stream tool calls to the browser' },
      {
        type: 'p',
        text: 'For an interactive UI, swap <code>generateText</code> for <code>streamText</code> and return the stream as a Response. The tool calls still run server-side; the conversation streams to the client:',
      },
      {
        type: 'code',
        lang: 'typescript',
        code: `import { streamText } from 'ai'

// inside the Route Handler:
const tools = await mcp.tools()
const result = streamText({
  model: anthropic('claude-sonnet-4-6'),
  tools,
  prompt,
  maxSteps: 8,
  // Always close the MCP client when the stream completes.
  onFinish: () => mcp.close(),
})
return result.toTextStreamResponse()`,
      },
      { type: 'h2', text: 'Step 4 — Run it' },
      {
        type: 'code',
        lang: 'bash',
        code: `export POSTA_API_TOKEN=posta_...
export ANTHROPIC_API_KEY=sk-ant-...

# Start the dev server
npm run dev

# In another terminal:
curl -X POST http://localhost:3000/api/post \\
  -H "Content-Type: application/json" \\
  -d '{ "prompt": "Draft a LinkedIn post about our v2 release and schedule it for tomorrow 9am CET. Save as draft." }'`,
      },
      { type: 'h2', text: 'Closing the loop with a webhook Route Handler' },
      {
        type: 'p',
        text: 'A second Route Handler receives Posta\'s outbound webhooks. When Posta fires <code>post.published</code>, this handler can kick off a follow-up AI SDK run — draft a reply, fan out to another network, post a Slack note:',
      },
      {
        type: 'code',
        lang: 'typescript',
        code: `// app/api/posta-webhook/route.ts
import { createHmac, timingSafeEqual } from 'node:crypto'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const sig = req.headers.get('x-posta-signature')
  if (!sig) return new Response('missing signature', { status: 401 })

  const raw = await req.text()
  const expected = createHmac('sha256', process.env.POSTA_WEBHOOK_SECRET!)
    .update(raw).digest('hex')
  const sigBuf = Buffer.from(sig)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return new Response('bad signature', { status: 401 })
  }

  const event = JSON.parse(raw)
  if (event.event === 'post.published') {
    // Enqueue a follow-up AI SDK run, e.g. draft a reply
    await enqueueReplyDraft(event.platform, event.platformPostUrl)
  }
  return new Response('ok')
}`,
      },
      {
        type: 'p',
        text: 'The receiver hardening pattern (early-return on missing header, length-check before <code>timingSafeEqual</code>) is the same one walked through in <a href="/blog/webhook-driven-social-media-agent-loops">webhook-driven social media agent loops</a>.',
      },
      { type: 'h2', text: 'When to use the REST path instead' },
      {
        type: 'p',
        text: 'For a single deterministic step in a chain, define a Zod-typed <code>tool()</code> wrapping the Posta REST API directly — no MCP transport, no tool discovery. The shape (two-step <code>POST /v1/posts</code> + <code>POST /v1/posts/:id/schedule</code>) is documented on the <a href="/integrations/vercel-ai-sdk">Vercel AI SDK integration page</a>.',
      },
      { type: 'h2', text: 'Pitfalls' },
      {
        type: 'ul',
        items: [
          '<strong>The Stdio MCP transport needs Node.</strong> Edge runtime won\'t spawn the <code>npx</code> process. If you need Edge, use the REST-API-as-typed-tool path instead.',
          '<strong>Always <code>close()</code> the MCP client.</strong> Wrap in <code>try / finally</code> (or use <code>onFinish</code> for streaming) — leaked stdio processes will pile up.',
          '<strong>Cap <code>maxSteps</code>.</strong> Default is 1; you need more for tool-calling, but unbounded is a runaway risk on transient errors.',
          '<strong>Start with "save as draft" prompts.</strong> Until you trust the agent\'s output, don\'t let it publish directly.',
        ],
      },
      { type: 'h2', text: 'Where to go from here' },
      {
        type: 'p',
        text: 'Read the <a href="/integrations/vercel-ai-sdk">Vercel AI SDK integration reference</a> for the full Zod-tool example. Compare with the Python framework setups in <a href="/blog/langchain-social-media-agent-tutorial">the LangChain tutorial</a> and <a href="/blog/openai-agents-sdk-social-media-tutorial">the OpenAI Agents SDK tutorial</a>, or the TypeScript-native Mastra setup in <a href="/blog/mastra-social-media-agent-tutorial">the Mastra tutorial</a>. <a href="/signup">14-day free trial</a>.',
      },
    ],
  },
  {
    slug: 'mastra-social-media-agent-tutorial',
    title: 'Build a social media agent with Mastra: TypeScript Workflows + MCP',
    description:
      'Wire the Posta MCP server into a Mastra agent and a Mastra Workflow. Per-platform parallel fan-out, typed tools with Zod, and a webhook trigger. TypeScript, runnable code.',
    date: '2026-06-19',
    updated: '2026-06-19',
    author: 'Posta Team',
    tags: ['Mastra', 'TypeScript', 'Workflows', 'Agents', 'MCP'],
    body: [
      {
        type: 'p',
        text: 'This tutorial builds a working <a href="/integrations/mastra">Mastra</a> agent and Workflow that publishes social posts. The interesting part: Mastra\'s typed Workflows let you fan out to platforms in parallel with full input/output typing end-to-end — drafting and scheduling LinkedIn, Bluesky, and Threads concurrently in one Workflow run.',
      },
      { type: 'h2', text: 'What you\'ll build' },
      {
        type: 'p',
        text: 'A Mastra setup with two pieces: (1) a <em>publisher Agent</em> that holds the Posta MCP server\'s tools and can be invoked for one-off prompts, and (2) a <em>launch Workflow</em> that fans out to three platforms in parallel and reports back with the scheduled post IDs.',
      },
      { type: 'h2', text: 'Prerequisites' },
      {
        type: 'ul',
        items: [
          'Node 20+ and a Mastra project (or any TypeScript app).',
          'A Posta account with LinkedIn, Bluesky, and Threads connected. <a href="/signup">14-day free trial</a>.',
          'A Posta API token.',
          'An Anthropic API key.',
        ],
      },
      { type: 'h2', text: 'Step 1 — Install dependencies' },
      {
        type: 'code',
        lang: 'bash',
        code: `npm i @mastra/core @mastra/mcp @ai-sdk/anthropic zod`,
      },
      { type: 'h2', text: 'Step 2 — Load Posta MCP into an Agent' },
      {
        type: 'p',
        text: 'Mastra\'s <code>MCPClient</code> takes a dict of MCP server configs and exposes <code>getTools()</code> for the agent:',
      },
      {
        type: 'code',
        lang: 'typescript',
        code: `// src/mastra/index.ts
import { Mastra } from '@mastra/core/mastra'
import { Agent } from '@mastra/core/agent'
import { MCPClient } from '@mastra/mcp'
import { anthropic } from '@ai-sdk/anthropic'

const mcp = new MCPClient({
  servers: {
    posta: {
      command: 'npx',
      args: ['-y', 'posta-mcp'],
      env: { POSTA_API_TOKEN: process.env.POSTA_API_TOKEN! },
    },
  },
})

export const publisher = new Agent({
  name: 'social-publisher',
  instructions: "Draft and schedule social posts. Match each platform's voice.",
  model: anthropic('claude-sonnet-4-6'),
  tools: await mcp.getTools(),
})

export const mastra = new Mastra({ agents: { publisher } })

// One-off invocation:
const res = await publisher.generate(
  'Draft a LinkedIn post about our v2 launch and schedule it for tomorrow 9am CET. Save as draft.'
)
console.log(res.text)`,
      },
      { type: 'h2', text: 'Step 3 — Fan out across platforms in a Workflow' },
      {
        type: 'p',
        text: 'For a launch campaign, you don\'t want sequential one-by-one drafting — three parallel Workflow steps draft and schedule for LinkedIn, Bluesky, and Threads concurrently. Mastra\'s <code>createStep()</code> + <code>.parallel()</code> handles the orchestration:',
      },
      {
        type: 'code',
        lang: 'typescript',
        code: `import { createWorkflow, createStep } from '@mastra/core/workflows'
import { z } from 'zod'

const platformStep = (platform: string) =>
  createStep({
    id: \`draft-and-schedule-\${platform}\`,
    inputSchema: z.object({ launchSummary: z.string(), scheduledAt: z.string() }),
    outputSchema: z.object({ platform: z.string(), postId: z.string() }),
    execute: async ({ inputData, mastra }) => {
      const publisher = mastra.getAgent('publisher')
      const res = await publisher.generate(
        \`Draft and schedule a \${platform} post about: \${inputData.launchSummary}. \` +
        \`Schedule for \${inputData.scheduledAt} as a draft. Match the \${platform} voice. \` +
        \`Return only the Posta post ID.\`
      )
      return { platform, postId: res.text.trim() }
    },
  })

export const launchWorkflow = createWorkflow({
  id: 'launch-campaign',
  inputSchema: z.object({ launchSummary: z.string(), scheduledAt: z.string() }),
  outputSchema: z.array(z.object({ platform: z.string(), postId: z.string() })),
})
  .parallel([
    platformStep('linkedin'),
    platformStep('bluesky'),
    platformStep('threads'),
  ])
  .commit()`,
      },
      { type: 'h2', text: 'Step 4 — Run the Workflow' },
      {
        type: 'code',
        lang: 'typescript',
        code: `const run = await launchWorkflow.createRunAsync()
const result = await run.start({
  inputData: {
    launchSummary: 'Shipped v2 of the SDK: per-platform caption limits, batch media endpoint, OpenAPI updates.',
    scheduledAt: '2026-06-20T09:00:00+02:00', // tomorrow 9am CET
  },
})
console.log(result)`,
      },
      { type: 'h2', text: 'Closing the loop with a webhook trigger' },
      {
        type: 'p',
        text: 'For closed-loop pipelines (publish → react), expose an HTTP endpoint in your Mastra deployment that receives Posta\'s outbound webhooks and triggers a follow-up Workflow. Verification is HMAC-SHA256; see the verified receiver pattern in <a href="/blog/webhook-driven-social-media-agent-loops">webhook-driven social media agent loops</a>.',
      },
      { type: 'h2', text: 'When to use the REST path instead' },
      {
        type: 'p',
        text: 'For a single deterministic Workflow step that doesn\'t need an LLM, define a typed <code>createTool()</code> wrapping the Posta REST API directly. The two-step shape (<code>POST /v1/posts</code> with <code>socialAccountIds</code>/<code>mediaIds</code>, then <code>POST /v1/posts/:id/schedule</code> with <code>scheduledAt</code>) is documented on the <a href="/integrations/mastra">Mastra integration page</a>.',
      },
      { type: 'h2', text: 'Pitfalls' },
      {
        type: 'ul',
        items: [
          '<strong>Top-level <code>await mcp.getTools()</code> needs ESM.</strong> If you\'re still on CommonJS, wrap the Agent construction in an async init function.',
          '<strong>Mastra Cloud vs self-hosted.</strong> REST wrapper runs anywhere fetch works; MCP stdio transport runs in any Node-capable Mastra deployment.',
          '<strong>Cap parallel platforms.</strong> Three concurrent platform-specific generates × Anthropic concurrency limits → you can hit rate limits fast. For more than ~3 platforms, consider chunking with <code>.foreach()</code>.',
          '<strong>Schedule as drafts for the first week.</strong> Workflow runs are non-deterministic — review before flipping out of draft mode.',
        ],
      },
      { type: 'h2', text: 'Where to go from here' },
      {
        type: 'p',
        text: 'Read the <a href="/integrations/mastra">Mastra integration reference</a> for the full Agent + Workflow wiring and the Zod-tool REST example. Compare with the Vercel AI SDK setup in <a href="/blog/vercel-ai-sdk-social-media-agent-tutorial">the Vercel AI SDK tutorial</a>, or the Python framework setups in <a href="/blog/langchain-social-media-agent-tutorial">LangChain</a> and <a href="/blog/crewai-social-media-agent-tutorial">CrewAI</a>. <a href="/signup">14-day free trial</a>.',
      },
    ],
  },
  {
    slug: 'replace-zapier-social-media-with-n8n-posta',
    title: 'Replace Zapier social media steps with n8n + Posta',
    description:
      'Why teams move social-media automations off Zapier to n8n + Posta: cost per Zap, branching, version control, and outbound webhooks. Migration path and trade-offs.',
    date: '2026-06-19',
    updated: '2026-06-19',
    author: 'Posta Team',
    tags: ['n8n', 'Zapier', 'Automation', 'Migration'],
    body: [
      {
        type: 'p',
        text: 'Zapier is the default for "RSS → social media" automations: easy to set up, runs in the cloud, native triggers for everything. But for serious social-posting pipelines — more than a few hundred runs a month, branching by platform, version control on the flows — the economics flip. Most teams move to <a href="/n8n-social-media-node">n8n + Posta</a> within their first year. This is why, and how.',
      },
      { type: 'h2', text: 'Where Zapier gets expensive' },
      {
        type: 'p',
        text: 'Zapier prices per <em>task</em>, not per Zap. A "fan a blog post out to 8 networks" automation that posts to LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, Bluesky, and Threads is <strong>eight tasks per run</strong> in Zapier accounting. If your blog publishes 30 posts a month and you back-fill across a small library, you can burn through a $73/mo Professional plan\'s 2,000 tasks in a single weekend.',
      },
      {
        type: 'p',
        text: 'On n8n + Posta, the same flow is <em>one</em> n8n run (regardless of how many platforms) and a <em>single</em> Posta call that fans out internally. Pricing on both sides is flat-tier, not per-task.',
      },
      { type: 'h2', text: 'Where Zapier gets brittle' },
      {
        type: 'ul',
        items: [
          '<strong>Branching.</strong> Multi-platform branching with platform-specific captions ("draft a 280-char Bluesky post AND a 3000-char LinkedIn post from the same source") gets you into Paths and chained Zaps — fragile and expensive.',
          '<strong>Loops over RSS items.</strong> Zapier\'s loop semantics are awkward; multi-item RSS triggers often spawn one task per item per platform.',
          '<strong>No native version control.</strong> Zap definitions live in Zapier\'s UI. n8n stores workflows as JSON you can commit to git.',
          '<strong>Limited webhook signing on outbound.</strong> Zapier\'s outbound webhooks don\'t HMAC-sign — so closed-loop pipelines need extra trust scaffolding.',
        ],
      },
      { type: 'h2', text: 'The migration path' },
      {
        type: 'p',
        text: 'For most teams, the migration is straightforward: lift the existing Zap into n8n\'s visual editor, swap the per-platform "Post to LinkedIn / TikTok / Instagram / …" steps for a single Posta node. n8n\'s self-hosted runs free; Cloud is roughly half of Zapier\'s Professional plan at the same execution volume.',
      },
      { type: 'h2', text: 'A concrete example: RSS → multi-platform schedule' },
      {
        type: 'p',
        text: 'The Zap-shape:',
      },
      {
        type: 'code',
        lang: 'text',
        code: `RSS by Zapier            (trigger)
  ↓
ChatGPT                  (caption per platform — multiple Filters / Paths)
  ↓
Post to LinkedIn         (task 1)
Post to Instagram        (task 2)
Post to Bluesky          (task 3)
Post to Threads          (task 4)
... etc.                 (one task per network)

Per run: 1 trigger + N caption steps + N publish tasks = O(N) tasks.`,
      },
      {
        type: 'p',
        text: 'The n8n + Posta shape:',
      },
      {
        type: 'code',
        lang: 'text',
        code: `RSS Trigger              (n8n)
  ↓
OpenAI / Claude          (one or N per-platform captions)
  ↓
Posta: Create Post       (one node — fan-out happens inside Posta)
       socialAccountIds: [42, 99, 17, 12]
       caption: ...
       (or per-platform configs via platformConfigurations)

Per run: 1 trigger + 1 n8n LLM step + 1 Posta call = O(1) n8n executions.`,
      },
      {
        type: 'p',
        text: 'Same outcome, one n8n execution instead of N tasks. The Posta call itself fans out to every connected account in one API request — see the <a href="/n8n-social-media-node">Posta n8n node reference</a> for the typed parameter shape.',
      },
      { type: 'h2', text: 'When to stay on Zapier' },
      {
        type: 'p',
        text: 'Be honest about the trade-off. Zapier still wins when:',
      },
      {
        type: 'ul',
        items: [
          '<strong>Volume is genuinely low</strong> — under ~500 tasks/month and you don\'t want to think about hosting.',
          '<strong>You need integrations Posta and n8n don\'t cover</strong> — Zapier\'s catalog is 5000+; n8n\'s is 400+; Posta covers eight social networks specifically.',
          '<strong>You don\'t want to manage infrastructure</strong> — n8n Cloud is hosted, but self-hosting saves money only if you already have a dev team comfortable with a small VPS.',
        ],
      },
      { type: 'h2', text: 'When to migrate' },
      {
        type: 'p',
        text: 'Most teams hit the migration tipping point when one of these is true:',
      },
      {
        type: 'ul',
        items: [
          'Monthly Zapier bill > $50 and growing — flat-tier n8n + Posta will be cheaper.',
          'You\'re writing Filters / Paths and chaining Zaps to get platform-specific behavior — visual branching in n8n is materially better.',
          'You want to version-control your automations.',
          'You need HMAC-signed outbound webhooks to close the loop with an agent.',
        ],
      },
      { type: 'h2', text: 'Where to start' },
      {
        type: 'p',
        text: 'Fork one of our <a href="/workflows">ready-made n8n templates</a> (the <a href="/workflows/blog-to-social-media">blog-to-social</a> one mirrors the most common Zap shape). Swap in your accounts, run it once, watch the per-run cost compared to your current Zap. <a href="/signup">14-day free Posta trial</a> covers everything except your n8n hosting.',
      },
      { type: 'h2', text: 'Further reading' },
      {
        type: 'p',
        text: 'For the broader picture on which Posta surface to pick (REST API, n8n, MCP, or Claude Code skill), see <a href="/blog/mcp-vs-n8n-vs-claude-code-for-social-media">MCP vs n8n vs Claude Code</a>. For agent-driven extensions of the same flow, see <a href="/agentic-social-media-workflows">agentic social media workflows</a>.',
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
