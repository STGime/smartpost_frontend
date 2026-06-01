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
  type: 'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'quote' | 'code'
  text?: string // h2 | h3 | p | quote
  items?: string[] // ul | ol
  code?: string // code
  lang?: string // code (display hint)
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
