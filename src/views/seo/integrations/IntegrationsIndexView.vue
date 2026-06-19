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
  'Wire Posta into your agent stack: LangChain, CrewAI, OpenAI Agents SDK, Vercel AI SDK, Mastra. Each integration has an MCP-native path and a typed REST tool path.'

useHead({
  title: 'Posta Integrations: LangChain, CrewAI, OpenAI Agents SDK, Vercel AI SDK, Mastra | Posta',
  meta: [
    { name: 'description', content: description },
    {
      name: 'keywords',
      content:
        'posta integrations, agent framework social media, langchain posta, crewai posta, openai agents sdk posta, vercel ai sdk posta, mastra posta, social media agent framework, mcp social media frameworks',
    },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://getposta.app/integrations' },
    { property: 'og:title', content: 'Posta Integrations | Posta' },
    { property: 'og:description', content: description },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Posta Integrations | Posta' },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [{ rel: 'canonical', href: 'https://getposta.app/integrations' }],
  script: [
    breadcrumbJsonLd([
      { name: 'Home', url: 'https://getposta.app/' },
      { name: 'Integrations', url: 'https://getposta.app/integrations' },
    ]),
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>Posta Integrations</h1>
      <p class="hero-sub">
        Wire Posta into your agent stack. Every framework on this page can load the
        <RouterLink to="/mcp-social-media-server">Posta MCP server</RouterLink>
        natively, or call the <RouterLink to="/developers">REST API</RouterLink>
        through a typed tool wrapper.
      </p>
    </section>

    <section class="content-section">
      <h2>Agent frameworks</h2>
      <div class="features-grid">
        <RouterLink to="/integrations/langchain" class="feature-card link-card">
          <div class="feature-title">LangChain →</div>
          <div class="feature-body">Python &amp; JavaScript. <code>langchain-mcp-adapters</code> loads Posta tools into your agent; works with LangGraph.</div>
        </RouterLink>
        <RouterLink to="/integrations/crewai" class="feature-card link-card">
          <div class="feature-title">CrewAI →</div>
          <div class="feature-body">Python. <code>crewai-tools</code> <code>MCPServerAdapter</code> turns Posta into a shared tool surface across every agent in the crew.</div>
        </RouterLink>
        <RouterLink to="/integrations/openai-agents-sdk" class="feature-card link-card">
          <div class="feature-title">OpenAI Agents SDK →</div>
          <div class="feature-body">Python. <code>MCPServerStdio</code> attaches Posta to any agent; <code>@function_tool</code> for one-shot REST.</div>
        </RouterLink>
        <RouterLink to="/integrations/vercel-ai-sdk" class="feature-card link-card">
          <div class="feature-title">Vercel AI SDK →</div>
          <div class="feature-body">TypeScript. <code>experimental_createMCPClient</code> for Next.js / Edge / Node, or a typed Zod <code>tool()</code> for one-shot.</div>
        </RouterLink>
        <RouterLink to="/integrations/mastra" class="feature-card link-card">
          <div class="feature-title">Mastra →</div>
          <div class="feature-body">TypeScript. Mastra <code>MCPClient</code> + <code>createTool()</code> with Zod input/output. Works in Mastra Workflows.</div>
        </RouterLink>
        <RouterLink to="/cli-social-media-posting" class="feature-card link-card">
          <div class="feature-title">Claude Code →</div>
          <div class="feature-body">The Posta Claude Code skill — slash-commands in your terminal, no framework wiring needed.</div>
        </RouterLink>
      </div>
    </section>

    <section class="content-section">
      <h2>Two paths, every framework</h2>
      <p>
        Every integration page on this site documents two paths to Posta:
      </p>
      <div class="features-grid">
        <RouterLink to="/mcp-social-media-server" class="feature-card link-card">
          <div class="feature-title">MCP server (recommended) →</div>
          <div class="feature-body">The framework's MCP loader pulls in every Posta tool with typed schemas. The agent introspects and calls them directly — no prompt-engineered API docs.</div>
        </RouterLink>
        <RouterLink to="/developers" class="feature-card link-card">
          <div class="feature-title">REST API as a typed tool →</div>
          <div class="feature-body">When you want one deterministic call instead of letting the model pick between Posta's full tool surface. Each framework's example shows a real <code>POST /v1/posts</code> + schedule flow.</div>
        </RouterLink>
      </div>
    </section>

    <section class="content-section">
      <h2>Not on this list?</h2>
      <p>
        Anything that can speak MCP works with the Posta MCP server out of the box. Anything that
        can make an HTTP request works with the <RouterLink to="/developers">REST API</RouterLink>.
        The integration pages here are just the most common landing spots.
      </p>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Pick a framework, ship in an afternoon"
      subtext="14-day free trial. MCP server, Claude Code skill, and n8n node are free and open source."
      :source="waitingListSource"
    />
  </SeoPageLayout>
</template>

<style scoped>
.hero { margin-bottom: 40px; }
h1 { font-size: clamp(2rem, 3.3vw, 2.8rem); line-height: 1.08; letter-spacing: -0.04em; margin-bottom: 16px; }
.hero-sub { font-size: 16px; color: var(--muted); max-width: 720px; line-height: 1.6; }
.hero-sub code, .feature-body code, .content-section p code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.9em; background: rgba(148, 163, 184, 0.12); padding: 1px 4px; border-radius: 4px; }
.content-section { margin-bottom: 36px; }
.content-section h2 { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
.content-section p { font-size: 14px; color: var(--muted); line-height: 1.7; max-width: 760px; margin-bottom: 14px; }
.features-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
.feature-card { border-radius: 14px; border: 1px solid rgba(148, 163, 184, 0.4); background: rgba(15, 23, 42, 0.85); padding: 14px; }
.link-card { display: block; text-decoration: none; color: inherit; transition: border-color 0.2s, transform 0.2s; }
.link-card:hover { border-color: rgba(165, 180, 252, 0.5); transform: translateY(-2px); }
.feature-title { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.feature-body { font-size: 12px; color: var(--muted); line-height: 1.5; }
@media (max-width: 600px) { .features-grid { grid-template-columns: minmax(0, 1fr); } }
</style>
