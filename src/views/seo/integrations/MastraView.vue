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
  'Give a Mastra agent the Posta MCP server as a tool source and post to eight social networks from any TypeScript app, Mastra Workflow step, or Mastra Cloud deployment. Or wrap the REST API with createTool() and Zod.'

useHead({
  title: 'Mastra Social Media: Posta MCP & Tools for Mastra Agents | Posta',
  meta: [
    { name: 'description', content: description },
    {
      name: 'keywords',
      content:
        'mastra social media, mastra agent social media, mastra mcp social, mastra tool social media, mastra workflow social, mastra typescript agent, mastra integration, posta mastra',
    },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'article' },
    { property: 'og:url', content: 'https://getposta.app/integrations/mastra' },
    { property: 'og:title', content: 'Mastra + Posta: Social Media for Mastra Agents | Posta' },
    { property: 'og:description', content: description },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Mastra + Posta | Posta' },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [{ rel: 'canonical', href: 'https://getposta.app/integrations/mastra' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How do I let a Mastra agent post to social media?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Two paths: (1) Use Mastra\'s MCPClient to load the Posta MCP server and pass the resulting toolsets to your Agent; (2) Define a typed tool with createTool() and a Zod input schema that POSTs to the Posta REST API.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does this work in Mastra Workflows?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes — a Workflow step can either call the Agent (which has Posta tools), or invoke Posta directly through a step that wraps the REST API. Both compose with .then(), .branch(), and .parallel().',
            },
          },
          {
            '@type': 'Question',
            name: 'Mastra Cloud or self-hosted?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Either. The REST API wrapper runs anywhere fetch works. The MCP stdio transport runs in any Node-capable Mastra deployment.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can the agent learn the Posta tools without re-prompting?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes — that\'s the value of MCP. Tool definitions live in the server; the Mastra agent introspects them at startup and the model picks the right call without prompt-engineered docs.',
            },
          },
        ],
      }),
    },
    breadcrumbJsonLd([
      { name: 'Home', url: 'https://getposta.app/' },
      { name: 'Integrations', url: 'https://getposta.app/integrations' },
      { name: 'Mastra', url: 'https://getposta.app/integrations/mastra' },
    ]),
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>Mastra Social Media: Posta MCP &amp; Tools for Mastra Agents</h1>
      <p class="hero-sub">
        Give a Mastra agent the Posta MCP server as a tool source and post to eight social networks
        from any TypeScript app, Mastra Workflow step, or Mastra Cloud deployment. Or wrap the REST
        API with <code>createTool()</code> and Zod.
      </p>
    </section>

    <section class="content-section">
      <h2>Why Posta + Mastra?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">First-class MCP client</div>
          <div class="feature-body">Mastra ships an <code>MCPClient</code>. Point it at the Posta server and every Posta tool drops into your Agent.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Typed tools end-to-end</div>
          <div class="feature-body">Mastra's <code>createTool()</code> takes Zod input/output schemas. Define a Posta posting tool once; every Agent and Workflow that uses it gets the same type safety.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Workflows compose Posta calls</div>
          <div class="feature-body">A Mastra Workflow can chain steps: research, draft, schedule via Posta — branching, parallel, all typed.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Closed loop via webhooks</div>
          <div class="feature-body">HMAC callbacks fire on publish/fail. Trigger a follow-up Workflow that reads engagement and decides the next post.</div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2>Path 1 — Posta MCP via Mastra MCPClient (recommended)</h2>
      <p>
        Mastra's MCP client loads any MCP server's tools and exposes them as a toolset on your
        Agent.
      </p>
      <pre class="code-block" v-pre><code>npm i @mastra/core @mastra/mcp @ai-sdk/anthropic

// src/mastra/index.ts
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

const publisher = new Agent({
  name: 'social-publisher',
  instructions: "Draft and schedule social posts. Match each platform's voice.",
  model: anthropic('claude-sonnet-4-6'),
  tools: await mcp.getTools(),
})

export const mastra = new Mastra({ agents: { publisher } })

// later:
const res = await publisher.generate(
  'Draft a LinkedIn post and a Bluesky post about our v2 launch and schedule both for tomorrow 9am CET.'
)
console.log(res.text)</code></pre>
    </section>

    <section class="content-section">
      <h2>Path 2 — createTool() around the REST API</h2>
      <p>
        Use when you want one deterministic call exposed to the agent — no MCP transport, no tool
        discovery.
      </p>
      <pre class="code-block" v-pre><code>import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

const POSTA = 'https://api.getposta.app'
const headers = () => ({
  'Authorization': `Bearer ${process.env.POSTA_API_TOKEN}`,
  'Content-Type': 'application/json',
})

export const schedulePost = createTool({
  id: 'schedule-post',
  description: 'Create a Posta draft on the given social accounts and schedule it. scheduledAt is ISO 8601.',
  inputSchema: z.object({
    caption: z.string(),
    socialAccountIds: z.array(z.number()),
    scheduledAt: z.string(),
    mediaIds: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({ id: z.string(), scheduledAt: z.string() }),
  execute: async ({ context }) => {
    // Step 1 — create the draft
    const createRes = await fetch(`${POSTA}/v1/posts`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        caption: context.caption,
        socialAccountIds: context.socialAccountIds,
        ...(context.mediaIds?.length ? { mediaIds: context.mediaIds } : {}),
      }),
    })
    if (!createRes.ok) throw new Error(`Posta create ${createRes.status}`)
    const { id } = await createRes.json()

    // Step 2 — schedule it
    const scheduleRes = await fetch(`${POSTA}/v1/posts/${id}/schedule`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ scheduledAt: context.scheduledAt }),
    })
    if (!scheduleRes.ok) throw new Error(`Posta schedule ${scheduleRes.status}`)
    return { id, scheduledAt: context.scheduledAt }
  },
})</code></pre>
    </section>

    <section class="content-section">
      <h2>Common patterns</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">Workflow: research → draft → schedule</div>
          <div class="feature-body">Three Mastra Workflow steps, each typed, the last one calling Posta to schedule the per-platform captions.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Parallel platform fan-out</div>
          <div class="feature-body">Workflow <code>.parallel()</code> runs per-platform sub-workflows that draft and schedule independently.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Agent network as a posting team</div>
          <div class="feature-body">A LinkedIn specialist, a Bluesky specialist, a YouTube Shorts specialist — each an Agent with Posta tools — coordinated by an Agent Network.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Webhook-triggered Workflow run</div>
          <div class="feature-body">An HTTP endpoint receives Posta webhooks, verifies HMAC, and kicks off a follow-up Workflow run.</div>
        </div>
      </div>
    </section>

    <section class="content-section faq-section">
      <h2>Frequently asked questions</h2>
      <div class="faq-grid">
        <div class="faq-item">
          <div class="faq-q">How do I let a Mastra agent post to social media?</div>
          <div class="faq-a">
            Load the <RouterLink to="/mcp-social-media-server">Posta MCP server</RouterLink> via
            Mastra's <code>MCPClient</code> (recommended), or wrap the REST API with
            <code>createTool()</code> and Zod. Code for both above.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Does it work in Mastra Workflows?</div>
          <div class="faq-a">
            Yes. A Workflow step can call the Agent or invoke a Posta-wrapping tool directly. Both
            compose with <code>.then()</code>, <code>.branch()</code>, <code>.parallel()</code>.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Mastra Cloud or self-hosted?</div>
          <div class="faq-a">
            Either. REST wrapper runs anywhere fetch works; MCP stdio transport runs in any
            Node-capable Mastra deployment.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Will the agent learn the Posta tools without prompting?</div>
          <div class="faq-a">
            Yes — that's the value of MCP. Tool definitions live in the server; Mastra introspects
            them at startup.
          </div>
        </div>
      </div>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Wire Posta into your next Mastra agent"
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
