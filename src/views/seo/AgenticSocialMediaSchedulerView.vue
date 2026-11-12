<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import { breadcrumbJsonLd } from '@/composables/breadcrumbJsonLd'
import type { WaitingListSource } from '@/services'

const waitingListSource = ref<WaitingListSource>('seo-agentic-scheduler')

const agenticFaq = [
  {
    q: 'What is an agentic social media scheduler?',
    a: 'An agentic social media scheduler is a publishing system that an AI agent can drive autonomously — perceive trends or events, reason about what to post, schedule across platforms, and observe the result — without a human in the critical path. The key difference from an AI-assisted scheduler (which adds a "generate caption" button) is that the whole loop runs from agent instructions, not human clicks.',
  },
  {
    q: 'What is the best AI agent for social media?',
    a: 'Any MCP-capable agent — Claude, Cursor, or your own — paired with Posta gives you the publishing primitives. Claude is the most common pairing because the Posta MCP server installs in one command and Claude treats it as native tools. For framework-style agents (LangChain, CrewAI, OpenAI Agents SDK, Vercel AI SDK, Mastra), Posta exposes both an MCP server and a REST API with an OpenAPI spec.',
  },
  {
    q: 'Is there an MCP social media server?',
    a: 'Yes. The Posta MCP server is published on npm and installs with `npx posta-mcp`. It exposes typed tools — createPost, schedulePost, listAccounts, getPostStatus, listMedia, uploadMedia, listPosts — so any MCP client (Claude Desktop, Claude Code, Cursor, Windsurf, VS Code, Zed) becomes a social media client. See the MCP server page for the full tool list and config snippet.',
  },
  {
    q: 'Can I automate social media with n8n?',
    a: 'Yes. Posta ships a verified n8n community node — install from the n8n marketplace, paste your API token, and you have create/schedule/publish/list nodes in the n8n editor. The workflow templates in /workflows include blog-to-social, blog-to-LinkedIn-carousel, product-launch-campaign, and YouTube-to-social pipelines you can clone and customise.',
  },
  {
    q: 'How does a Claude Code agent post to TikTok?',
    a: 'Install the Posta Claude Code skill, connect your TikTok account in the Posta dashboard, and just describe what you want in plain English — e.g. "Generate an image and schedule a TikTok for 3pm with caption …". The skill calls the Posta API behind the scenes, Posta auto-formats the video for TikTok, and queues it. Works for every supported platform, not just TikTok.',
  },
  {
    q: 'How is Posta different from Postiz?',
    a: 'Postiz is open-source and self-hostable, which is its main strength — you control the data and the deploy. Posta is hosted, with 8 platforms (including Bluesky and Threads natively), face-aware auto-cropping across 6 aspect ratios, HMAC-signed outbound webhooks, a verified n8n community node, and a hosted MCP server you don\'t have to deploy. If you want zero-ops and the strongest agent-tooling defaults, choose Posta. If self-hosting and full data control matter more, Postiz is a credible choice.',
  },
  {
    q: 'Is there a social media scheduler with an API on the free tier?',
    a: 'Posta\'s 14-day free trial includes the full REST API, MCP server access, and n8n node — no enterprise-only API gating. After the trial, the API is available on every paid tier (it isn\'t locked to a business plan the way Buffer\'s and Hootsuite\'s APIs are).',
  },
  {
    q: 'How do I keep an agent on-brand?',
    a: 'Two practical patterns. First: give the agent a system prompt that includes your brand voice, banned topics, and required disclosure lines, then have the agent draft against that prompt before calling the Posta schedule tool. Second: route every agent draft through a human approval step using Posta\'s draft + schedule split — the agent creates drafts via the API, a human approves, and only then does the scheduler fire. The webhook on publish closes the loop back to the agent.',
  },
  {
    q: 'What about platform rate limits for AI agents?',
    a: 'Posta\'s queue absorbs platform rate limits transparently — schedule 50 posts in a burst from your agent and Posta paces the actual API calls per platform\'s limit, retrying transient failures. Your agent doesn\'t need to model the rate-limit logic itself. Outbound webhooks tell the agent when each post actually publishes.',
  },
  {
    q: 'How does an agent get OAuth access to a user\'s social accounts?',
    a: 'The user OAuths into each network through the Posta dashboard once. The agent then authenticates against Posta with an API token scoped to that user — it never sees the underlying Meta / TikTok / LinkedIn refresh tokens, which stay in Posta\'s vault. Same pattern multi-tenant agents use today against platforms like Stripe or Linear.',
  },
]

useHead({
  title: 'Agentic Social Media Scheduler — Post from Any AI Agent',
  meta: [
    {
      name: 'description',
      content:
        'The agentic social media scheduler for AI agents and automation. Post from Claude, Cursor, n8n, or your own agent via MCP, REST API, or webhooks — across 8 platforms.',
    },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://getposta.app/agentic-social-media-scheduler' },
    { property: 'og:title', content: 'Agentic Social Media Scheduler — Post from Any AI Agent' },
    {
      property: 'og:description',
      content:
        'The agentic social media scheduler for AI agents and automation. Post from Claude, Cursor, n8n, or your own agent via MCP, REST API, or webhooks.',
    },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Agentic Social Media Scheduler — Post from Any AI Agent' },
    {
      name: 'twitter:description',
      content:
        'The agentic social media scheduler for AI agents and automation. Post from Claude, Cursor, n8n, or your own agent via MCP, REST API, or webhooks.',
    },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [{ rel: 'canonical', href: 'https://getposta.app/agentic-social-media-scheduler' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: agenticFaq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }),
    },
    breadcrumbJsonLd([
      { name: 'Home', url: 'https://getposta.app/' },
      { name: 'Agentic Social Media Scheduler', url: 'https://getposta.app/agentic-social-media-scheduler' },
    ]),
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Posta',
        url: 'https://getposta.app/',
        applicationCategory: 'SocialNetworkingApplication',
        operatingSystem: 'Web, macOS, Windows, Linux (browser)',
        description:
          'Agentic social media scheduler: MCP server, n8n community node, REST API, HMAC webhooks, and auto-formatting for any AI agent.',
        offers: [
          { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free trial (14 days, no card)' },
          { '@type': 'Offer', priceCurrency: 'USD', name: 'Starter plan' },
        ],
        featureList: [
          'MCP server for Claude Desktop, Claude Code, Cursor, Windsurf, Zed',
          'n8n verified community node',
          'Public REST API with OpenAPI spec',
          'HMAC-signed outbound webhooks',
          'OAuth-token-per-account for multi-tenant agents',
          'Per-platform queue with rate-limit handling and retries',
          'Face-aware auto-cropping across 8 networks',
          'Comments inbox API for monitor-and-respond agents',
        ],
      }),
    },
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>Agentic Social Media Scheduler — Post from Any AI Agent</h1>
      <p class="hero-sub">
        Posta is the <strong>agentic social media scheduler</strong> for the era when
        the agent does the posting, not the human. One MCP server, one n8n node, one
        REST API — your AI agent perceives, reasons, drafts, schedules, publishes, and
        observes across LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook,
        Bluesky, and Threads. No dashboard required.
      </p>
    </section>

    <section class="content-section">
      <h2>What is an agentic social media scheduler?</h2>
      <p>
        An <strong>agentic social media scheduler</strong> is a publishing system an
        autonomous agent can drive end-to-end. The agent decides <em>what</em> to
        post (perceive a trend, summarise a blog post, react to an event), <em>when</em>
        to post (optimal send time from analytics, or a calendar slot), <em>where</em>
        to post (which connected accounts), and <em>how</em> to recover when something
        breaks — all without a human clicking a button.
      </p>
      <p>
        That's the distinction from an <em>AI-assisted</em> scheduler — Buffer's
        "generate caption" button, Hootsuite's OwlyWriter, Later's caption assistant.
        Those tools put AI inside the human's compose box. An agentic scheduler puts
        the human inside the agent's review queue, optionally. The publishing loop
        itself is autonomous.
      </p>
      <p>
        Posta is built for the second pattern. Every primitive — create, schedule,
        publish, list, fetch comments, fetch analytics, delete — is exposed as an
        MCP tool, an n8n node, and a REST endpoint. The same API surface a creator
        uses by hand, an agent uses on a loop. Anthropic's
        <a href="https://www.anthropic.com/news/model-context-protocol" target="_blank" rel="noopener">Model Context Protocol</a>
        is what makes the typed tool-call layer portable across agents.
      </p>
    </section>

    <section class="content-section">
      <h2>How agentic posting works with Posta</h2>
      <p>
        The agentic loop is well understood — perceive, reason, act, observe — and
        maps cleanly onto Posta's primitives:
      </p>
      <ol class="step-list">
        <li>
          <h3>1. Trigger (perceive)</h3>
          <p>
            A webhook, a cron, an inbound event, or an LLM reasoning step decides
            it's time to post. Common sources: an RSS feed, a Perplexity trending-
            topics query, a calendar slot, a comment on a previous post.
          </p>
        </li>
        <li>
          <h3>2. Draft (reason)</h3>
          <p>
            The agent generates the caption, per-platform overrides, and media (often
            via image-generation tools). Posta's REST API and MCP server both accept
            multi-platform drafts as a single call — the agent doesn't need to fan-out
            manually.
          </p>
        </li>
        <li>
          <h3>3. Schedule / publish (act)</h3>
          <p>
            One tool call. Posta auto-formats media per platform, queues the post for
            the requested time, and handles per-platform rate limits and retries on
            transient errors transparently. The agent doesn't need to model Meta's
            error codes.
          </p>
        </li>
        <li>
          <h3>4. Observe (close the loop)</h3>
          <p>
            HMAC-signed outbound webhooks fire when each platform publish completes
            (success or final failure). The agent receives the event, can fetch
            comments and analytics via the API, and uses that signal in its next
            reasoning step. Autonomy with feedback.
          </p>
        </li>
      </ol>
    </section>

    <section class="content-section">
      <h2>Three integration paths</h2>
      <p>
        Pick the surface that matches how your agent already runs.
      </p>

      <div class="path-card">
        <h3>Path 1 — Posta MCP server (Claude, Cursor, Zed)</h3>
        <p>
          Best for chat-style agents and IDE agents. One npm install, one API token,
          every Posta primitive shows up as a typed tool the model introspects.
        </p>
<pre class="code-block" v-pre><code>// claude_desktop_config.json (or your client's MCP config)
{
  "mcpServers": {
    "posta": {
      "command": "npx",
      "args": ["-y", "posta-mcp"],
      "env": { "POSTA_API_TOKEN": "..." }
    }
  }
}</code></pre>
        <p>
          See the <RouterLink to="/mcp-social-media-server">MCP server</RouterLink>
          page for the full tool list and per-client setup.
        </p>
      </div>

      <div class="path-card">
        <h3>Path 2 — n8n community node</h3>
        <p>
          Best for visual / multi-step automations and non-developer users. Install
          the Posta node from n8n's verified community marketplace and chain it with
          any of the 400+ n8n integrations.
        </p>
<pre class="code-block"><code># In n8n, add the node:
Settings → Community Nodes → Install
Package: n8n-nodes-posta

# Drag "Posta: Create Post" into your workflow,
# point it at your API token, done.</code></pre>
        <p>
          Browse the ready-made
          <RouterLink to="/workflows">n8n workflow templates</RouterLink> — RSS-to-
          social, trending topics, YouTube-to-shorts, content-calendar, all clonable.
        </p>
      </div>

      <div class="path-card">
        <h3>Path 3 — REST API + webhooks</h3>
        <p>
          Best for framework-style agents (LangChain, CrewAI, OpenAI Agents SDK,
          Vercel AI SDK, Mastra) and custom backends. Full OpenAPI spec, HMAC-signed
          outbound webhooks, per-account OAuth tokens.
        </p>
<pre class="code-block"><code>curl https://api.getposta.app/v1/posts \
  -H "Authorization: Bearer $POSTA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "...",
    "socialAccountIds": [12, 47],
    "scheduledAt": "2026-06-27T15:00:00Z"
  }'</code></pre>
        <p>
          See the <RouterLink to="/developers">REST API reference</RouterLink> and the
          <RouterLink to="/integrations">framework integration guides</RouterLink>.
        </p>
      </div>
    </section>

    <section class="content-section">
      <h2>Posta vs Postiz vs DIY</h2>
      <p>
        The agentic-social niche has a handful of credible options. The trade-offs
        are mostly about ops burden vs. defaults.
      </p>
      <div class="comparison-table-wrap">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Capability</th>
              <th>Posta</th>
              <th>Postiz</th>
              <th>DIY (Meta / X / TikTok APIs)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Hosted (zero ops)</td>
              <td>Yes</td>
              <td>Self-host primary</td>
              <td>No</td>
            </tr>
            <tr>
              <td>Networks supported</td>
              <td>8 (incl. Bluesky &amp; Threads)</td>
              <td>9+</td>
              <td>Each platform separately</td>
            </tr>
            <tr>
              <td>Hosted MCP server</td>
              <td>Yes (npm)</td>
              <td>Yes</td>
              <td>Build your own</td>
            </tr>
            <tr>
              <td>n8n verified node</td>
              <td>Yes</td>
              <td>Community HTTP</td>
              <td>No</td>
            </tr>
            <tr>
              <td>Face-aware auto-cropping</td>
              <td>Yes (6 aspect ratios)</td>
              <td>Basic resize</td>
              <td>Build your own</td>
            </tr>
            <tr>
              <td>HMAC-signed outbound webhooks</td>
              <td>Yes</td>
              <td>No</td>
              <td>Build your own</td>
            </tr>
            <tr>
              <td>Per-platform rate-limit absorption</td>
              <td>Yes</td>
              <td>Partial</td>
              <td>You model it</td>
            </tr>
            <tr>
              <td>Comments inbox API</td>
              <td>Yes (LinkedIn, TikTok)</td>
              <td>Partial</td>
              <td>Per-platform polling</td>
            </tr>
            <tr>
              <td>OAuth multi-tenant for agents</td>
              <td>Yes (token-per-user)</td>
              <td>Yes</td>
              <td>Build your own</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        DIY makes sense if you only need one platform and the volume justifies the
        ongoing cost of platform API changes. Postiz makes sense if self-hosting is
        a hard requirement. Posta makes sense if you want the strongest agent-tooling
        defaults without standing up infrastructure.
      </p>
      <p class="comparison-footnote">
        Comparison verified June 2026. Postiz is an actively developed open-source
        project; check the upstream repo for current capabilities.
      </p>
    </section>

    <section class="content-section">
      <h2>What you can build</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <h3>Autonomous content agent</h3>
          <p>
            Watch an RSS feed or trending-topics source, draft platform-tuned posts
            with an LLM, queue them via Posta, react to publish webhooks. Closed-
            loop, hands-off. See the
            <RouterLink to="/workflows/blog-to-social-media">blog-to-social workflow</RouterLink>.
          </p>
        </div>
        <div class="feature-card">
          <h3>Trend-driven posting</h3>
          <p>
            Daily Perplexity query → Claude reasoning → multi-platform schedule.
            One n8n workflow ships in an afternoon — browse the
            <RouterLink to="/workflows">workflow templates</RouterLink> for a
            starting point.
          </p>
        </div>
        <div class="feature-card">
          <h3>Calendar-aware scheduler agent</h3>
          <p>
            Read your editorial calendar from Notion, Airtable, or Google Sheets,
            draft and queue every row via the API or n8n node, write back the post
            URL on success. The n8n
            <RouterLink to="/workflows">workflow templates</RouterLink> are a starting
            point for the wiring.
          </p>
        </div>
        <div class="feature-card">
          <h3>Multi-account fan-out agent</h3>
          <p>
            Agency or multi-brand creator? One agent, many client accounts.
            OAuth-token-per-account keeps the credential model clean and
            multi-tenant.
          </p>
        </div>
      </div>
    </section>

    <section class="faq-section">
      <h2>Agentic social media FAQ</h2>
      <div class="faq-list">
        <div v-for="item in agenticFaq" :key="item.q" class="faq-item">
          <h3>{{ item.q }}</h3>
          <p>{{ item.a }}</p>
        </div>
      </div>
    </section>

    <section class="content-section reciprocal">
      <p>
        Looking for the broader scheduling category overview? See the
        <RouterLink to="/social-media-scheduler">social media scheduler</RouterLink>
        pillar, or the <RouterLink to="/agents">social media for AI agents</RouterLink>
        page for the homepage-level positioning.
      </p>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Wire an agent into your social today"
      subtext="14-day free trial. Full API, MCP, and n8n access — no credit card."
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
  margin-bottom: 18px;
  max-width: 26ch;
}

.hero-sub {
  font-size: 17px;
  color: var(--fg-2);
  max-width: 64ch;
  line-height: 1.6;
}

.hero-sub a,
.content-section p a,
.content-section li a {
  color: var(--text);
  text-decoration: underline;
  text-decoration-color: var(--signal);
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  transition: color 0.15s;
}

.hero-sub a:hover,
.content-section p a:hover,
.content-section li a:hover {
  color: var(--signal);
}

.content-section {
  border-top: 1px solid var(--line);
  padding: 32px 0;
}

.content-section h2,
.faq-section h2 {
  font-size: 23px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.02em;
  margin-bottom: 14px;
}

.content-section p {
  font-size: 15px;
  color: var(--fg-2);
  line-height: 1.65;
  max-width: 68ch;
  margin-bottom: 14px;
}

.content-section em {
  color: var(--text);
  font-style: italic;
}

.content-section strong {
  color: var(--text);
  font-weight: 600;
}

.content-section code {
  font-family: var(--font-mono);
  font-size: 0.86em;
  padding: 1px 5px;
  border-radius: 2px;
  background: var(--ink-2);
  border: 1px solid var(--line);
  color: var(--text);
}

.step-list {
  list-style: none;
  padding: 0;
  margin: 6px 0 0;
  max-width: 760px;
  border-top: 1px solid var(--line);
}

.step-list li {
  padding: 16px 0;
  border-bottom: 1px solid var(--line);
}

.step-list.compact li {
  padding: 12px 0;
}

.step-list h3 {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text);
  margin: 0 0 4px;
}

.content-section .step-list p {
  font-size: 15px;
  margin: 0;
}

.feature-grid {
  display: grid;
  gap: 1px;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  margin-top: 18px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.feature-card {
  padding: 18px 20px;
  background: var(--ink-0);
  min-width: 0;
}

.feature-card h3 {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text);
  margin: 0 0 6px;
}

.content-section .feature-card p {
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.feature-list {
  list-style: disc;
  padding-left: 22px;
  margin: 6px 0 14px;
  max-width: 68ch;
}

.feature-list ::marker {
  color: var(--fg-3);
}

.feature-list li {
  font-size: 15px;
  color: var(--fg-2);
  line-height: 1.65;
  margin-bottom: 8px;
}

.comparison-table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 18px 0 10px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 540px;
}

.comparison-table th,
.comparison-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
}

.comparison-table tbody tr:last-child td {
  border-bottom: 0;
}

.comparison-table thead th {
  background: var(--ink-1);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--fg-3);
  white-space: nowrap;
}

.comparison-table tbody tr {
  transition: background-color 0.15s;
}

.comparison-table tbody tr:hover {
  background: var(--ink-1);
}

.comparison-table tbody td {
  color: var(--fg-2);
}

.comparison-table tbody td:first-child {
  color: var(--text);
  font-weight: 500;
}

/* Posta column: the one highlighted column */
.comparison-table thead th:nth-child(2) {
  color: var(--signal);
  border-bottom-color: var(--signal);
}

.comparison-table tbody td:nth-child(2) {
  color: var(--text);
  font-weight: 500;
  background: var(--signal-soft);
}

.content-section p.comparison-footnote {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--fg-3);
  line-height: 1.6;
  margin-top: 6px;
}

.faq-section {
  border-top: 1px solid var(--line);
  padding: 32px 0 40px;
}

.faq-list {
  max-width: 760px;
  border-top: 1px solid var(--line);
}

.faq-item {
  padding: 18px 0;
  border-bottom: 1px solid var(--line);
}

.faq-item h3 {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 6px;
  color: var(--text);
}

.faq-item p {
  font-size: 15px;
  color: var(--fg-2);
  line-height: 1.65;
  max-width: 68ch;
}

.hero-sub strong {
  color: var(--text);
  font-weight: 600;
}

.path-card {
  max-width: 820px;
  padding: 22px 0;
  border-bottom: 1px solid var(--line);
}

.path-card:first-of-type {
  margin-top: 6px;
  border-top: 1px solid var(--line);
}

.path-card h3 {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text);
  margin: 0 0 8px;
}

.content-section .path-card p {
  margin: 0 0 12px;
}

.content-section .path-card p:last-child {
  margin-bottom: 0;
}

.code-block {
  margin: 0 0 12px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: var(--ink-1);
  border: 1px solid var(--line);
  overflow-x: auto;
  max-width: 100%;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
  color: var(--text);
}

.content-section .code-block code {
  font-family: inherit;
  font-size: inherit;
  white-space: pre;
  background: transparent;
  padding: 0;
  border: 0;
  border-radius: 0;
  color: inherit;
}

.content-section.reciprocal {
  padding: 20px 0;
}

.content-section.reciprocal p {
  font-size: 14px;
  margin-bottom: 0;
}
</style>
