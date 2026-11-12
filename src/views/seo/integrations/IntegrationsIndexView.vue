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
.feature-body code {
  font-family: var(--font-mono);
  font-size: 0.86em;
  color: var(--text);
  background: var(--ink-2);
  border: 1px solid var(--line);
  border-radius: 2px;
  padding: 1px 5px;
  overflow-wrap: anywhere;
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

.link-card {
  display: block;
  text-decoration: none;
  color: inherit;
  transition: background-color 0.15s;
}

.link-card:hover {
  background: var(--ink-1);
}

.link-card .feature-title {
  transition: color 0.15s;
}

.link-card:hover .feature-title {
  color: var(--signal);
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

@media (max-width: 640px) {
  .features-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
