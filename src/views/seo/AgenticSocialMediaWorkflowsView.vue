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
  'The complete guide to agentic social media workflows: how AI agents create, schedule, and respond on every social network. MCP servers, Claude Code skills, n8n nodes, REST APIs, and webhooks — five workflow archetypes with reference architectures.'

useHead({
  title: 'Agentic Social Media Workflows: The Complete Guide | Posta',
  meta: [
    { name: 'description', content: description },
    {
      name: 'keywords',
      content:
        'agentic social media workflows, ai agent social media, autonomous social media, social media automation pipeline, agent posting workflow, llm social media, claude social media bot, autonomous content pipeline, agentic publishing, agent social media architecture',
    },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'article' },
    { property: 'og:url', content: 'https://getposta.app/agentic-social-media-workflows' },
    { property: 'og:title', content: 'Agentic Social Media Workflows: The Complete Guide | Posta' },
    { property: 'og:description', content: description },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Agentic Social Media Workflows | Posta' },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [{ rel: 'canonical', href: 'https://getposta.app/agentic-social-media-workflows' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is an agentic social media workflow?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'An agentic social media workflow is a publishing pipeline where an AI agent — not a human clicking buttons — picks targets, drafts captions, attaches media, schedules or publishes, and reacts to platform feedback. It runs on three primitives: an LLM, a typed tool surface, and a closed loop via webhooks.',
            },
          },
          {
            '@type': 'Question',
            name: 'How is agentic posting different from scheduling?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Scheduling is queue-then-publish, with a human at the wheel for every post. Agentic posting puts decisions — what to post, where, when, how to phrase it — inside the agent loop. The schedule is one possible output, not the starting point.',
            },
          },
          {
            '@type': 'Question',
            name: 'Which integration surface should I pick — MCP, n8n, or REST?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'MCP for interactive LLM agents (Claude Desktop, Cursor, custom MCP clients). n8n when you want a visual, branching pipeline with non-agentic triggers. REST API for fully programmatic loops without an LLM in line, or when you need fine control. Most production setups combine two — n8n for triggers, MCP for prompting.',
            },
          },
          {
            '@type': 'Question',
            name: 'Why use webhooks in an agent pipeline?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Without webhooks an agent has to poll for results, which burns API quota and stalls decisions. HMAC-signed outbound webhooks fire the moment a post publishes (or fails), so the agent can immediately respond — kick off a thank-you reply, send a Slack ping, retry, or advance the campaign.',
            },
          },
          {
            '@type': 'Question',
            name: 'What does a closed-loop agent pipeline look like?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Closed-loop means the same agent both publishes and reads platform feedback. The pipeline: agent drafts, Posta publishes, webhook fires on publish/fail, the agent reads it and decides the next action — reply to comments, retry, branch the campaign. The whole thing runs without a human until something needs explicit review.',
            },
          },
        ],
      }),
    },
    breadcrumbJsonLd([
      { name: 'Home', url: 'https://getposta.app/' },
      { name: 'Agentic Social Media Workflows', url: 'https://getposta.app/agentic-social-media-workflows' },
    ]),
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>Agentic Social Media Workflows</h1>
      <p class="hero-sub">
        The complete map of how AI agents create, schedule, and respond on every social network.
        From single-prompt drafts to closed-loop autonomous pipelines — MCP, Claude Code, n8n,
        REST API, and webhooks.
      </p>
    </section>

    <section class="content-section">
      <h2>What makes a workflow "agentic"?</h2>
      <p>
        Three primitives turn social posting into an agentic workflow:
      </p>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">An LLM in the loop</div>
          <div class="feature-body">A model decides what to post, where, and how to phrase it — not a templating engine, not a person.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">A typed tool surface</div>
          <div class="feature-body">The model calls real tools — <code>createPost</code>, <code>schedulePost</code> — with typed schemas, not hand-written HTTP calls.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">A closed loop</div>
          <div class="feature-body">Platform feedback (published, failed, commented) comes back to the agent through webhooks so the next action is informed.</div>
        </div>
      </div>
      <p>
        Without all three you have automation, but not an agent. Posta gives you all three out of
        the box on eight social networks.
      </p>
    </section>

    <section class="content-section">
      <h2>The four integration surfaces</h2>
      <p>
        Pick the surface that fits the shape of your agent. They compose — many production setups
        wire two or three.
      </p>
      <div class="features-grid">
        <RouterLink to="/mcp-social-media-server" class="feature-card link-card">
          <div class="feature-title">MCP server →</div>
          <div class="feature-body">For interactive LLM agents — Claude Desktop, Cursor, Windsurf, custom MCP clients. Typed tools the model can introspect.</div>
        </RouterLink>
        <RouterLink to="/cli-social-media-posting" class="feature-card link-card">
          <div class="feature-title">Claude Code skill →</div>
          <div class="feature-body">For terminal-driven agentic work. The skill installs Posta slash-commands in any repo.</div>
        </RouterLink>
        <RouterLink to="/n8n-social-media-node" class="feature-card link-card">
          <div class="feature-title">n8n node →</div>
          <div class="feature-body">For visual, branching pipelines with non-agentic triggers (RSS, webhooks, schedules). Drop the typed node in next to your LLM nodes.</div>
        </RouterLink>
        <RouterLink to="/developers" class="feature-card link-card">
          <div class="feature-title">REST API + webhooks →</div>
          <div class="feature-body">For programmatic loops without an LLM in line, or fine control. Token auth, OpenAPI spec, HMAC outbound webhooks.</div>
        </RouterLink>
      </div>
    </section>

    <section class="content-section">
      <h2>Five workflow archetypes</h2>
      <p>
        Most real agentic social workflows are a variation on one of five patterns. Pick the
        archetype, then map it to a surface.
      </p>

      <h3>1. Generate-and-schedule</h3>
      <p>
        The simplest agentic loop: a human prompt, an LLM draft, an immediate Posta schedule. No
        triggers, no closed loop. Useful for "draft my LinkedIn this week" sessions.
      </p>
      <pre class="code-block" v-pre><code>User → "Draft 3 LinkedIn posts about &lt;topic&gt;, schedule one per day."
LLM  → drafts 3 captions, picks images from media library
LLM  → calls Posta MCP createPost × 3 with scheduleFor times
Done.</code></pre>

      <h3>2. Watch-and-repurpose</h3>
      <p>
        A trigger fires (RSS feed, GitHub release, new YouTube video), an LLM generates per-platform
        captions, Posta schedules across every account. Posta's
        <RouterLink to="/workflows/blog-to-social-media">blog-to-social</RouterLink> and
        <RouterLink to="/workflows/youtube-to-social-media">YouTube-to-social</RouterLink> workflows
        are this pattern.
      </p>
      <pre class="code-block" v-pre><code>RSS Trigger      → new blog post
  └─ OpenAI       → per-platform captions (LinkedIn long, Bluesky short)
       └─ Posta    Create Post (multi-account, scheduled)</code></pre>

      <h3>3. Conversation-driven posting</h3>
      <p>
        A human (or upstream agent) talks to a model in Claude Desktop / Cursor / Slack, and that
        model calls Posta tools as needed. The MCP server is the right surface here — the agent
        introspects the tool list and picks calls organically.
      </p>

      <h3>4. Closed-loop publishing</h3>
      <p>
        The agent publishes, Posta fires an HMAC webhook on publish/fail, the agent reads the
        webhook and decides the next move — kick off a follow-up reply, ping Slack, retry with a
        different image, branch the campaign. This is what makes the loop <em>agentic</em>, not
        just <em>automated</em>.
      </p>
      <pre class="code-block" v-pre><code>Agent  → POST /v1/posts  (createPost via Posta REST)
Posta  → publishes to LinkedIn + Bluesky
Posta  → POST {your-webhook}  { event: "post.published", platform, url }
Agent  → reads webhook → decides next action → loops</code></pre>

      <h3>5. Multi-agent broadcast</h3>
      <p>
        An orchestrator (LangChain, CrewAI, OpenAI Agents SDK) dispatches per-platform agents — a
        LinkedIn specialist, a Bluesky specialist, a YouTube Shorts specialist — each tuned for
        that platform's voice. Each agent calls Posta as a shared tool surface.
      </p>
    </section>

    <section class="content-section">
      <h2>Anti-patterns</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">Polling instead of webhooks</div>
          <div class="feature-body">If your agent polls <code>getPostStatus</code> in a loop you'll waste tokens and quota. Use HMAC webhooks; the agent only wakes when something happens.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">One prompt, every platform</div>
          <div class="feature-body">Networks have very different voices and length limits. Generate per-platform captions, not one and truncate.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">No retry strategy</div>
          <div class="feature-body">Platforms throttle, hiccup, sometimes error transiently. Make sure your agent handles "scheduled but not yet posted" as a normal state, not a failure.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Skipping the human review for sensitive posts</div>
          <div class="feature-body">For high-stakes content (announcements, crisis responses), build a "draft and approve" step into the loop. Agentic doesn't mean unsupervised everywhere.</div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2>Pricing for agent workloads</h2>
      <p>
        Posta's plans are flat — predictable for high-volume agent pipelines. The MCP server, the
        Claude Code skill, and the n8n node are all free and open source; you only pay for the
        Posta tier that covers your post volume.
      </p>
    </section>

    <section class="content-section faq-section">
      <h2>Frequently asked questions</h2>
      <div class="faq-grid">
        <div class="faq-item">
          <div class="faq-q">What is an agentic social media workflow?</div>
          <div class="faq-a">
            A publishing pipeline where an AI agent — not a human clicking buttons — picks targets,
            drafts captions, attaches media, schedules or publishes, and reacts to platform feedback.
            It runs on three primitives: an LLM, a typed tool surface, and a closed loop via webhooks.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">How is it different from scheduling?</div>
          <div class="faq-a">
            Scheduling is queue-then-publish, with a human at the wheel. Agentic posting puts the
            decisions inside the agent loop. The schedule is one output, not the starting point.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Which integration surface should I pick?</div>
          <div class="faq-a">
            <RouterLink to="/mcp-social-media-server">MCP</RouterLink> for interactive LLM agents.
            <RouterLink to="/n8n-social-media-node">n8n</RouterLink> for visual pipelines with
            non-agentic triggers. <RouterLink to="/developers">REST API</RouterLink> for
            programmatic loops or fine control. Most production setups combine two.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Why use webhooks?</div>
          <div class="faq-a">
            Without webhooks the agent has to poll, which burns API quota and stalls decisions.
            HMAC-signed outbound webhooks fire the moment a post publishes (or fails) so the agent
            can immediately respond — reply to comments, send a Slack ping, retry, or advance the
            campaign.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">What does a closed loop look like?</div>
          <div class="faq-a">
            Agent drafts → Posta publishes → webhook fires on publish/fail → agent reads, decides
            next action → loop. The whole thing runs without a human until something explicitly
            needs review.
          </div>
        </div>
      </div>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Build your first agentic workflow"
      subtext="Pick a surface — MCP, n8n, Claude Code, or the API. 14-day free trial, no credit card."
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
  max-width: 720px;
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

.content-section h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 20px 0 8px;
}

.content-section p {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.7;
  max-width: 760px;
  margin-bottom: 14px;
}

.content-section p code,
.feature-body code,
.faq-a code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.9em;
  background: rgba(148, 163, 184, 0.12);
  padding: 1px 4px;
  border-radius: 4px;
}

.code-block {
  margin: 12px 0 18px;
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

.link-card {
  display: block;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, transform 0.2s;
}

.link-card:hover {
  border-color: rgba(165, 180, 252, 0.5);
  transform: translateY(-2px);
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
