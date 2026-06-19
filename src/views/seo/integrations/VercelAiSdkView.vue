<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import type { WaitingListSource } from '@/services'

const waitingListSource = ref<WaitingListSource>('seo-api')

const description =
  'Add Posta as a tool to a Vercel AI SDK agent and post to eight social networks from any Next.js app, Edge Function, or Node server. MCP via experimental_createMCPClient, or a typed tool() wrapper around the REST API.'

useHead({
  title: 'Vercel AI SDK Social Media: Posta as a Tool in Next.js & Edge | Posta',
  meta: [
    { name: 'description', content: description },
    {
      name: 'keywords',
      content:
        'vercel ai sdk social media, vercel ai sdk tool social, vercel ai sdk mcp, ai sdk social media, next.js social media agent, vercel ai post social media, generateText tool social, ai sdk linkedin, posta vercel',
    },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'article' },
    { property: 'og:url', content: 'https://getposta.app/integrations/vercel-ai-sdk' },
    { property: 'og:title', content: 'Vercel AI SDK + Posta: Social Media as a Tool | Posta' },
    { property: 'og:description', content: description },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Vercel AI SDK + Posta | Posta' },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [{ rel: 'canonical', href: 'https://getposta.app/integrations/vercel-ai-sdk' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How do I let a Vercel AI SDK agent post to social media?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Two paths: (1) Load the Posta MCP server via experimental_createMCPClient and pass the resulting tools into generateText / streamText; (2) Define a typed tool() with a Zod schema that POSTs to the Posta REST API.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does it work in Edge Functions and Next.js API routes?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The REST API wrapper runs anywhere Node fetch works — Edge Functions, Route Handlers, Server Actions, plain Node. The MCP approach needs a Node runtime for the stdio transport; use SSE/HTTP MCP transport if you need Edge.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I use the AI SDK\'s streamText with Posta tools?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Pass the Posta tools to streamText\'s tools option and stream the agent\'s response back to the browser; tool calls land on the server, the published-post confirmation flows back as a tool result the UI can render.',
            },
          },
          {
            '@type': 'Question',
            name: 'TypeScript or JavaScript?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Either. The Vercel AI SDK is TypeScript-first; examples on this page are TypeScript.',
            },
          },
        ],
      }),
    },
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>Vercel AI SDK Social Media: Posta as a Tool</h1>
      <p class="hero-sub">
        Add Posta as a tool to a Vercel AI SDK agent and post to eight social networks from any
        Next.js app, Edge Function, or Node server. MCP via <code>experimental_createMCPClient</code>,
        or a typed <code>tool()</code> wrapper around the REST API.
      </p>
    </section>

    <section class="content-section">
      <h2>Why Posta + Vercel AI SDK?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">First-class TypeScript</div>
          <div class="feature-body">Define Posta calls with Zod schemas and let the AI SDK enforce parameter types end-to-end.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Stream from a chat UI</div>
          <div class="feature-body">Use <code>streamText</code> to stream the agent's response to the browser while Posta executes the tool call server-side.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Edge or Node, your call</div>
          <div class="feature-body">The REST wrapper runs anywhere fetch works. The MCP path uses Node stdio by default; SSE/HTTP transport works for Edge.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Closed loop via webhooks</div>
          <div class="feature-body">HMAC callbacks fire on publish/fail. Pipe them into a Route Handler that triggers the next AI SDK turn.</div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2>Path 1 — Posta MCP via experimental_createMCPClient</h2>
      <p>
        The AI SDK exposes an experimental MCP client that loads any MCP server's tools and hands
        them to <code>generateText</code> or <code>streamText</code>.
      </p>
      <pre class="code-block" v-pre><code>// app/api/post/route.ts
import { anthropic } from '@ai-sdk/anthropic'
import { experimental_createMCPClient as createMCPClient, generateText } from 'ai'
import { Experimental_StdioMCPTransport as StdioTransport } from 'ai/mcp-stdio'

export async function POST(req: Request) {
  const { prompt } = await req.json()

  const mcp = await createMCPClient({
    transport: new StdioTransport({
      command: 'npx',
      args: ['-y', 'posta-mcp'],
      env: { POSTA_API_TOKEN: process.env.POSTA_API_TOKEN! },
    }),
  })
  const tools = await mcp.tools()

  try {
    const result = await generateText({
      model: anthropic('claude-sonnet-4-6'),
      tools,
      prompt,
    })
    return Response.json({ text: result.text })
  } finally {
    await mcp.close()
  }
}</code></pre>
    </section>

    <section class="content-section">
      <h2>Path 2 — Define a typed tool() around the REST API</h2>
      <p>
        Simpler when you want one deterministic call exposed to the model. Zod gives the AI SDK a
        typed schema; the model knows exactly what shape to call.
      </p>
      <pre class="code-block" v-pre><code>import { openai } from '@ai-sdk/openai'
import { generateText, tool } from 'ai'
import { z } from 'zod'

const schedulePost = tool({
  description: 'Schedule a social media post to one or many platforms via Posta.',
  parameters: z.object({
    caption: z.string().describe('Post caption'),
    platforms: z.array(z.string()).describe('Platform slugs e.g. ["linkedin","bluesky"]'),
    scheduleFor: z.string().describe('ISO 8601 timestamp'),
  }),
  execute: async ({ caption, platforms, scheduleFor }) => {
    const r = await fetch('https://api.getposta.app/v1/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.POSTA_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ caption, platforms, scheduleFor }),
    })
    if (!r.ok) throw new Error(`Posta ${r.status}`)
    return await r.json()
  },
})

const result = await generateText({
  model: openai('gpt-4o'),
  tools: { schedulePost },
  prompt: 'Schedule a LinkedIn post about our v2 launch for tomorrow 9am CET.',
})</code></pre>
    </section>

    <section class="content-section">
      <h2>Common patterns</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">Chat-UI → Posta tool calls</div>
          <div class="feature-body">A Next.js chat UI streams an agent's response with <code>streamText</code>; tool calls run server-side and publish via Posta.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Server Action campaign scheduler</div>
          <div class="feature-body">A Server Action takes a high-level prompt, runs the agent, and returns the scheduled post IDs to the form.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Webhook Route Handler closes the loop</div>
          <div class="feature-body">A Route Handler receives the Posta webhook, verifies the HMAC, and triggers the next AI SDK call.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Multi-step with stepCountIs / continueAfter</div>
          <div class="feature-body">Use the AI SDK's multi-step loop control to let the agent draft, fetch images, and schedule across multiple platforms in one run.</div>
        </div>
      </div>
    </section>

    <section class="content-section faq-section">
      <h2>Frequently asked questions</h2>
      <div class="faq-grid">
        <div class="faq-item">
          <div class="faq-q">How do I let a Vercel AI SDK agent post to social media?</div>
          <div class="faq-a">
            Load the <RouterLink to="/mcp-social-media-server">Posta MCP server</RouterLink> via
            <code>experimental_createMCPClient</code>, or define a typed <code>tool()</code> with
            Zod that POSTs to the Posta REST API. Code for both above.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Edge Functions or Node?</div>
          <div class="faq-a">
            REST wrapper runs anywhere fetch works (Edge, Node, Route Handlers, Server Actions).
            MCP stdio transport needs Node; SSE/HTTP MCP transport works on Edge.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Does streamText work?</div>
          <div class="faq-a">
            Yes — pass the Posta tools to <code>streamText</code>. Tool calls run server-side, the
            UI streams the conversation.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">TypeScript or JavaScript?</div>
          <div class="faq-a">
            Either; the AI SDK is TypeScript-first. Examples here are TypeScript.
          </div>
        </div>
      </div>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Ship Posta in your next Vercel AI SDK app"
      subtext="14-day free trial. MCP server, Claude Code skill, and n8n node are free and open source."
      :source="waitingListSource"
    />
  </SeoPageLayout>
</template>

<style scoped>
.hero { margin-bottom: 40px; }
h1 { font-size: clamp(2rem, 3.3vw, 2.8rem); line-height: 1.08; letter-spacing: -0.04em; margin-bottom: 16px; }
.hero-sub { font-size: 16px; color: var(--muted); max-width: 720px; line-height: 1.6; }
.hero-sub code, .feature-body code, .faq-a code, .content-section p code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.9em; background: rgba(148, 163, 184, 0.12); padding: 1px 4px; border-radius: 4px; }
.content-section { margin-bottom: 36px; }
.content-section h2 { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
.content-section p { font-size: 14px; color: var(--muted); line-height: 1.7; max-width: 760px; margin-bottom: 14px; }
.code-block { margin: 12px 0 18px; padding: 14px; border-radius: 10px; background: rgba(2, 6, 23, 0.85); border: 1px solid rgba(148, 163, 184, 0.25); overflow-x: auto; font-size: 12px; line-height: 1.55; color: #cbd5e1; }
.code-block code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; white-space: pre; }
.features-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
.feature-card { border-radius: 14px; border: 1px solid rgba(148, 163, 184, 0.4); background: rgba(15, 23, 42, 0.85); padding: 14px; }
.feature-title { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.feature-body { font-size: 12px; color: var(--muted); line-height: 1.5; }
.faq-grid { display: grid; gap: 16px; margin-top: 14px; }
.faq-item { border-radius: 14px; border: 1px solid rgba(148, 163, 184, 0.4); background: rgba(15, 23, 42, 0.85); padding: 14px; }
.faq-q { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
.faq-a { font-size: 12px; color: var(--muted); line-height: 1.6; }
.faq-a a { color: var(--text); text-decoration: underline; text-underline-offset: 2px; }
@media (max-width: 600px) { .features-grid { grid-template-columns: minmax(0, 1fr); } }
</style>
