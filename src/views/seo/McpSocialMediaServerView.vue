<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import type { WaitingListSource } from '@/services'

const waitingListSource = ref<WaitingListSource>('seo-api')

const description =
  'Drop the Posta MCP server into Claude Desktop, Cursor, Windsurf, VS Code, Zed, or any agent that speaks Model Context Protocol and post to LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, Bluesky, and Threads with a single tool call.'

useHead({
  title: 'MCP Server for Social Media — Post to 8 Networks from Claude Desktop, Cursor & Any MCP Client | Posta',
  meta: [
    { name: 'description', content: description },
    {
      name: 'keywords',
      content:
        'mcp social media, mcp social media server, model context protocol social media, mcp server posting, claude desktop social media, cursor social media, windsurf social media, anthropic mcp social, agent tool social media, posta mcp',
    },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://getposta.app/mcp-social-media-server' },
    { property: 'og:title', content: 'The MCP Server for Social Media | Posta' },
    { property: 'og:description', content: description },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'MCP Server for Social Media | Posta' },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [{ rel: 'canonical', href: 'https://getposta.app/mcp-social-media-server' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is an MCP server for social media?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'An MCP (Model Context Protocol) server exposes a set of typed tools to any compatible AI client. The Posta MCP server exposes tools like createPost, schedulePost, listAccounts, and uploadMedia, so an MCP client (Claude Desktop, Cursor, Windsurf, VS Code, Zed) can post to LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, Bluesky, and Threads as native tool calls.',
            },
          },
          {
            '@type': 'Question',
            name: 'Which MCP clients does Posta work with?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Any client that implements the Model Context Protocol — Claude Desktop, Claude Code, Cursor, Windsurf, VS Code with MCP extensions, Zed, and custom agents built on the MCP SDK in TypeScript, Python, or Rust.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I install the Posta MCP server?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Add the Posta MCP server to your client config — Claude Desktop, Claude Code, Cursor, Windsurf, VS Code, Zed all read the same mcpServers JSON shape. Set POSTA_API_TOKEN in the env block, restart the client, and the Posta tools appear in the tool list.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is the MCP server free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. The posta-mcp package is open source and free on npm and GitHub. You only pay for the Posta plan that covers your usage volume, with a 14-day free trial to start.',
            },
          },
          {
            '@type': 'Question',
            name: 'Why use MCP instead of the REST API for an agent?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'MCP tools come with typed schemas the model can introspect, so the agent picks the right call without prompt-engineered API docs. You also get protocol-level streaming and a single transport between agent and tool. For automation pipelines without an LLM in the loop, the REST API is the better fit.',
            },
          },
        ],
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Posta MCP Server',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'macOS, Linux, Windows',
        url: 'https://getposta.app/mcp-social-media-server',
        downloadUrl: 'https://www.npmjs.com/package/posta-mcp',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description: 'Open-source MCP server that exposes Posta as a set of social media tools to Claude Desktop, Cursor, Windsurf, VS Code, Zed and any other MCP-compatible AI client.',
      }),
    },
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>The MCP Server for Social Media</h1>
      <p class="hero-sub">
        Drop the Posta MCP server into Claude Desktop, Cursor, Windsurf, VS Code, Zed — or any
        agent that speaks Model Context Protocol — and post to LinkedIn, TikTok, Instagram, YouTube,
        Pinterest, Facebook, Bluesky, and Threads with a single tool call. Open source, free, on
        npm.
      </p>
    </section>

    <section class="content-section">
      <h2>Install in 30 seconds</h2>
      <p>
        Add the Posta MCP server to your client's MCP config (Claude Desktop, Claude Code, Cursor,
        Windsurf, VS Code, Zed all read the same <code>mcpServers</code> shape). Set your
        <code>POSTA_API_TOKEN</code>, restart the client, and the Posta tools appear in the tool
        list.
      </p>
      <pre class="code-block" v-pre><code>// claude_desktop_config.json (or your client's MCP config)
{
  "mcpServers": {
    "posta": {
      "command": "npx",
      "args": ["-y", "posta-mcp"],
      "env": { "POSTA_API_TOKEN": "your_token_here" }
    }
  }
}</code></pre>
    </section>

    <section class="content-section">
      <h2>Compatible clients</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">Claude Desktop</div>
          <div class="feature-body">Anthropic's reference MCP client. Add Posta and ask Claude to draft and schedule posts in plain English.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Claude Code</div>
          <div class="feature-body">Bring Posta tools to the terminal alongside the dedicated <RouterLink to="/cli-social-media-posting">Claude Code skill</RouterLink>.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Cursor &amp; Windsurf</div>
          <div class="feature-body">Make Posta a tool your IDE agent can reach for while it edits your post-generation code.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">VS Code &amp; Zed</div>
          <div class="feature-body">Any editor with an MCP extension picks up the same server config — no per-editor adapter.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Custom agents</div>
          <div class="feature-body">Build on the MCP TypeScript, Python, or Rust SDK and Posta's tools work the same way.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Multi-agent frameworks</div>
          <div class="feature-body">LangChain, CrewAI, OpenAI Agents SDK — all interoperate with MCP servers through their MCP tool adapters.</div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2>Tools the server exposes</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">createPost</div>
          <div class="feature-body">Create a draft, scheduled, or immediate post on one or many connected accounts.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">schedulePost</div>
          <div class="feature-body">Move a draft to a future timestamp. Time-zone safe.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">listAccounts</div>
          <div class="feature-body">Enumerate connected social accounts so the agent can pick targets.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">getPostStatus</div>
          <div class="feature-body">Check whether a post is queued, processing, posted, or failed.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">listMedia / uploadMedia</div>
          <div class="feature-body">Browse the media library or push a new asset; Posta handles per-platform variants.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">listPosts</div>
          <div class="feature-body">Inspect drafts, scheduled, and posted history — useful for "what did I post last week" prompts.</div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2>Example prompts</h2>
      <p>
        Once the server is wired up, the agent picks the right tool from the prompt — no API
        knowledge required.
      </p>
      <pre class="code-block" v-pre><code>"Draft a LinkedIn post announcing v2.1 of our SDK and schedule it for Tuesday 9am CET."

"Repost the top performer from last week to Bluesky and Threads — keep the caption short."

"List my scheduled posts for next week and tell me which ones are missing images."</code></pre>
    </section>

    <section class="content-section">
      <h2>Why MCP for social media?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">Typed tools, no docs in the prompt</div>
          <div class="feature-body">MCP gives the model machine-readable schemas. The agent learns the right call by introspection — no brittle prompt-engineered API reference.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">One transport, many clients</div>
          <div class="feature-body">Same server config works in Claude Desktop, Cursor, Windsurf — switch clients without rebuilding the integration.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Streamed results</div>
          <div class="feature-body">Tool responses stream back to the model, so long-running operations (uploads, scheduling) don't block.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Token-efficient</div>
          <div class="feature-body">Tool definitions live in the client, not in every prompt — fewer tokens, faster turns.</div>
        </div>
      </div>
    </section>

    <section class="content-section faq-section">
      <h2>Frequently asked questions</h2>
      <div class="faq-grid">
        <div class="faq-item">
          <div class="faq-q">What is an MCP server for social media?</div>
          <div class="faq-a">
            An MCP (Model Context Protocol) server exposes a set of typed tools to any compatible AI
            client. The Posta MCP server exposes tools like <code>createPost</code>,
            <code>schedulePost</code>, <code>listAccounts</code>, and <code>uploadMedia</code>, so
            an MCP client (Claude Desktop, Cursor, Windsurf, VS Code, Zed) can post to eight social
            networks as native tool calls.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Which MCP clients does Posta work with?</div>
          <div class="faq-a">
            Any client that implements MCP — Claude Desktop, <RouterLink to="/cli-social-media-posting">Claude Code</RouterLink>,
            Cursor, Windsurf, VS Code with MCP extensions, Zed, and custom agents built on the MCP
            SDK in TypeScript, Python, or Rust.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">How do I install the Posta MCP server?</div>
          <div class="faq-a">
            Add the Posta MCP server to your client's MCP config (Claude Desktop, Claude Code,
            Cursor, Windsurf, VS Code, Zed all read the same <code>mcpServers</code> JSON shape).
            Set <code>POSTA_API_TOKEN</code> in the env block, restart the client, and the Posta
            tools appear in the tool list. Source on
            <a href="https://github.com/STGime/posta-mcp" target="_blank" rel="noopener">GitHub</a>;
            package on <a href="https://www.npmjs.com/package/posta-mcp" target="_blank" rel="noopener">npm</a>.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Is the MCP server free?</div>
          <div class="faq-a">
            Yes. The <code>posta-mcp</code> package is open source and free on npm and GitHub. You
            only pay for the Posta plan that covers your usage volume, with a 14-day free trial to
            start.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Why MCP instead of the REST API?</div>
          <div class="faq-a">
            MCP tools come with typed schemas the model can introspect, so the agent picks the right
            call without API docs in the prompt. For non-LLM automation pipelines, the
            <RouterLink to="/developers">REST API</RouterLink> is the better fit. Many users wire up
            both — MCP for interactive agents, REST for the n8n flows.
          </div>
        </div>
      </div>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Wire Posta into your agent today"
      subtext="MCP server, Claude Code skill, n8n node, REST API. 14-day free trial, no credit card."
      :source="waitingListSource"
    />
  </SeoPageLayout>
</template>

<style scoped>
.hero {
  margin-bottom: 40px;
}

h1 {
  font-size: clamp(2rem, 3.3vw, 2.8rem);
  line-height: 1.08;
  letter-spacing: -0.04em;
  margin-bottom: 16px;
}

.hero-sub {
  font-size: 16px;
  color: var(--muted);
  max-width: 680px;
  line-height: 1.6;
}

.content-section {
  margin-bottom: 36px;
}

.content-section h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}

.content-section p {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.7;
  max-width: 720px;
  margin-bottom: 14px;
}

.code-block {
  margin: 14px 0;
  padding: 14px;
  border-radius: 10px;
  background: rgba(2, 6, 23, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.25);
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.55;
  color: #cbd5e1;
}

.code-block code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  white-space: pre;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.feature-card {
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(15, 23, 42, 0.85);
  padding: 14px;
}

.feature-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
}

.feature-body {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.5;
}

.feature-body code,
.faq-a code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.9em;
  background: rgba(148, 163, 184, 0.12);
  padding: 1px 4px;
  border-radius: 4px;
}

.feature-body a {
  color: var(--accent-light);
  text-decoration: none;
}

.feature-body a:hover {
  text-decoration: underline;
}

.faq-grid {
  display: grid;
  gap: 16px;
  margin-top: 14px;
}

.faq-item {
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(15, 23, 42, 0.85);
  padding: 14px;
}

.faq-q {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.faq-a {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.6;
}

.faq-a a {
  color: var(--text);
  text-decoration: underline;
  text-underline-offset: 2px;
}

@media (max-width: 600px) {
  .features-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
