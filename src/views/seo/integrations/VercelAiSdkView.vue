<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import { breadcrumbJsonLd } from '@/composables/breadcrumbJsonLd'
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
    breadcrumbJsonLd([
      { name: 'Home', url: 'https://getposta.app/' },
      { name: 'Integrations', url: 'https://getposta.app/integrations' },
      { name: 'Vercel AI SDK', url: 'https://getposta.app/integrations/vercel-ai-sdk' },
    ]),
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

const POSTA = 'https://api.getposta.app'
const HEADERS = {
  'Authorization': `Bearer ${process.env.POSTA_API_TOKEN}`,
  'Content-Type': 'application/json',
}

const schedulePost = tool({
  description: 'Create a Posta draft on the given social accounts and schedule it.',
  parameters: z.object({
    caption: z.string().describe('Post caption'),
    socialAccountIds: z.array(z.number()).describe('Posta social_account IDs to publish to'),
    scheduledAt: z.string().describe('ISO 8601 timestamp'),
    mediaIds: z.array(z.string()).optional().describe('Optional Posta media IDs'),
  }),
  execute: async ({ caption, socialAccountIds, scheduledAt, mediaIds }) => {
    // Step 1 — create the draft
    const createRes = await fetch(`${POSTA}/v1/posts`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        caption,
        socialAccountIds,
        ...(mediaIds?.length ? { mediaIds } : {}),
      }),
    })
    if (!createRes.ok) throw new Error(`Posta create ${createRes.status}`)
    const { id } = await createRes.json()

    // Step 2 — schedule it
    const scheduleRes = await fetch(`${POSTA}/v1/posts/${id}/schedule`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ scheduledAt }),
    })
    if (!scheduleRes.ok) throw new Error(`Posta schedule ${scheduleRes.status}`)
    return { id, scheduledAt }
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
.hero {
  padding-bottom: 40px;
}

h1 {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--text);
  margin-bottom: 16px;
}

.hero-sub {
  font-size: 16px;
  color: var(--fg-2);
  max-width: 68ch;
  line-height: 1.65;
}

.content-section,
.faq-section {
  border-top: 1px solid var(--line);
  padding: 36px 0;
}

.content-section h2,
.faq-section h2 {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.015em;
  color: var(--text);
  margin-bottom: 14px;
}

.content-section p {
  font-size: 15px;
  color: var(--fg-2);
  line-height: 1.65;
  max-width: 68ch;
  margin-bottom: 14px;
}

.content-section p:last-child {
  margin-bottom: 0;
}

.hero-sub a,
.content-section p a,
.content-section li a,
.faq-a a {
  color: var(--text);
  text-decoration: underline;
  text-decoration-color: var(--line-strong);
  text-underline-offset: 3px;
  transition: color 0.15s, text-decoration-color 0.15s;
}

.hero-sub a:hover,
.content-section p a:hover,
.content-section li a:hover,
.faq-a a:hover {
  color: var(--signal);
  text-decoration-color: var(--signal);
}

.hero-sub code,
.content-section p code,
.feature-body code,
.faq-a code {
  font-family: var(--font-mono);
  font-size: 0.86em;
  color: var(--text);
  background: var(--ink-2);
  border: 1px solid var(--line);
  border-radius: 2px;
  padding: 1px 5px;
  overflow-wrap: anywhere;
}

.code-block {
  margin: 16px 0 4px;
  padding: 16px;
  background: var(--ink-1);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
  color: var(--text);
}

.code-block code {
  font-family: inherit;
  white-space: pre;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  margin-top: 16px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.feature-card {
  background: var(--ink-0);
  padding: 20px;
}

.feature-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text);
  margin-bottom: 6px;
}

.feature-body {
  font-size: 14px;
  color: var(--fg-2);
  line-height: 1.6;
}

.faq-grid {
  max-width: 68ch;
  border-top: 1px solid var(--line);
}

.faq-item {
  padding: 18px 0;
  border-bottom: 1px solid var(--line);
}

.faq-q {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text);
  margin-bottom: 6px;
}

.faq-a {
  font-size: 15px;
  color: var(--fg-2);
  line-height: 1.65;
}

@media (max-width: 640px) {
  .features-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
