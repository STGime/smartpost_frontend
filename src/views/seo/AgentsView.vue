<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import type { WaitingListSource } from '@/services'

const waitingListSource = ref<WaitingListSource>('seo-api')

const description =
  'Give any AI agent the power to manage social media. Posta lets agents create, schedule, and publish to 8 networks via MCP, a Claude Code skill, an n8n node, and a REST API — with webhooks and per-platform auto-formatting built in.'

useHead({
  title: 'Social Media for AI Agents – Automate Posting via MCP, n8n & API',
  meta: [
    { name: 'description', content: description },
    {
      name: 'keywords',
      content:
        'social media for ai agents, ai agent social media, mcp social media, social media automation api, autonomous posting, n8n social media automation, claude agent social media, agent posting tool, programmatic social media',
    },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://getposta.app/agents' },
    { property: 'og:title', content: 'Social Media for AI Agents – Automate Posting via MCP, n8n & API | Posta' },
    { property: 'og:description', content: description },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Social Media for AI Agents | Posta' },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [{ rel: 'canonical', href: 'https://getposta.app/agents' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How can an AI agent post to social media?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Connect the agent to Posta through one of four interfaces — an MCP server, a Claude Code skill, an n8n community node, or the REST API. The agent can then create, schedule, and publish posts to LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, Bluesky, and Threads, with media auto-formatted per platform.',
            },
          },
          {
            '@type': 'Question',
            name: 'Which AI tools and agent frameworks does Posta support?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Any MCP client (Claude Desktop, Cursor, Windsurf, VS Code, Zed), Claude Code via the Posta skill, n8n via the community node, and any language or framework via the REST API and webhooks.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can agents schedule posts and react to events?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Agents can schedule posts for any future time, and Posta emits outbound webhooks when posts publish, fail, or change status — so an agent can close the loop and respond automatically.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is there a free way to try agent posting?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Posta offers a 14-day free trial with no credit card required, and the MCP server, Claude Code skill, and n8n node are all free and open source.',
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
        name: 'Posta for AI Agents',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web, macOS, Linux, Windows',
        url: 'https://getposta.app/agents',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Social media automation for AI agents — create, schedule, and publish to 8 networks via MCP, a Claude Code skill, an n8n node, and a REST API.',
      }),
    },
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>Social media automation for your AI agents</h1>
      <p class="hero-sub">
        Give any agent or automation the power to run your social media. Posta lets agents create,
        schedule, and publish across 8 networks — through an MCP server, a Claude Code skill, the n8n
        node, or a public REST API. Media auto-formats per platform and webhooks report back when
        posts go live.
      </p>
    </section>

    <section class="content-section">
      <h2>How agents use Posta</h2>
      <div class="steps-grid">
        <div class="step-card">
          <div class="step-number">1</div>
          <div class="step-title">Connect</div>
          <div class="step-body">Plug Posta into whatever your agent speaks — MCP, the Claude Code skill, the n8n node, or the REST API. One Posta token, every channel.</div>
        </div>
        <div class="step-card">
          <div class="step-number">2</div>
          <div class="step-title">Instruct</div>
          <div class="step-body">Drive it with natural language or code: "draft and schedule this week's posts," or a single <code>POST /v1/posts</code> call from your pipeline.</div>
        </div>
        <div class="step-card">
          <div class="step-number">3</div>
          <div class="step-title">Posta executes</div>
          <div class="step-body">Posta formats media per platform, schedules or publishes, and fires a webhook on every result — so the agent can close the loop.</div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2>What you can build</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">Autonomous content pipeline</div>
          <div class="feature-body">Watch an RSS or blog feed, draft a post with an LLM, and schedule it — hands-off. <RouterLink to="/workflows/blog-to-social-media">See the n8n workflow →</RouterLink></div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Launch agent</div>
          <div class="feature-body">One instruction turns a product into a multi-day, multi-platform campaign with per-network copy. <RouterLink to="/workflows/product-launch-campaign">See the n8n workflow →</RouterLink></div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Repurposing agent</div>
          <div class="feature-body">Feed in one asset or a YouTube video and fan it out to Reels, Shorts, TikTok, and feeds. <RouterLink to="/workflows/youtube-to-social-media">See the n8n workflow →</RouterLink></div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Carousel generator</div>
          <div class="feature-body">Summarize an article into a polished LinkedIn carousel PDF — AI text over AI backgrounds. <RouterLink to="/workflows/blog-to-linkedin-carousel">See the n8n workflow →</RouterLink></div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Monitor &amp; respond</div>
          <div class="feature-body">Pull comments via the API and react to publish/fail events with outbound webhooks — a closed-loop social agent.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Agency at scale</div>
          <div class="feature-body">Drive dozens of connected accounts from one codebase or n8n flow — consistent scheduling, zero tab-switching.</div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2>Ways to connect your agent</h2>
      <div class="features-grid">
        <a href="https://www.npmjs.com/package/posta-mcp" target="_blank" rel="noopener" class="feature-card link-card">
          <div class="feature-title">MCP server →</div>
          <div class="feature-body">One npm install adds Posta's tools to Claude Desktop, Cursor, Windsurf, VS Code, and Zed.</div>
        </a>
        <a href="https://github.com/STGime/posta-skill" target="_blank" rel="noopener" class="feature-card link-card">
          <div class="feature-title">Claude Code skill →</div>
          <div class="feature-body">Post from your terminal or hand the skill to an autonomous Claude agent.</div>
        </a>
        <RouterLink to="/workflows" class="feature-card link-card">
          <div class="feature-title">n8n node →</div>
          <div class="feature-body">Drag-and-drop Posta into any n8n workflow — no code. Browse ready-made templates.</div>
        </RouterLink>
        <a href="https://api.getposta.app/docs" target="_blank" rel="noopener" class="feature-card link-card">
          <div class="feature-title">REST API &amp; webhooks →</div>
          <div class="feature-body">Token auth, full OpenAPI spec, and outbound webhooks. Build in any language.</div>
        </a>
      </div>
    </section>

    <section class="content-section">
      <h2>Built for automation</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">Auto-format per platform</div>
          <div class="feature-body">Upload once; Posta generates the right aspect ratios and variants for every network — with face-aware cropping.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Outbound webhooks</div>
          <div class="feature-body">Get notified when posts publish, fail, or change status, so your agent can react in real time.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Token authentication</div>
          <div class="feature-body">Secure, scoped API tokens — give each agent its own credential.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Predictable pricing</div>
          <div class="feature-body">Flat plans built for high-volume, automated posting — no per-post surprises.</div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2>Supported platforms</h2>
      <p>
        Agents can post to every platform Posta supports — LinkedIn, TikTok, Instagram, YouTube,
        Pinterest, Facebook, Bluesky, and Threads. Each platform's requirements — aspect ratios,
        caption limits, privacy settings — are handled automatically.
      </p>
    </section>

    <section class="content-section faq-section">
      <h2>Frequently asked questions</h2>
      <div class="faq-grid">
        <div class="faq-item">
          <div class="faq-q">How can an AI agent post to social media?</div>
          <div class="faq-a">
            Connect the agent to Posta through an <a href="https://www.npmjs.com/package/posta-mcp" target="_blank" rel="noopener">MCP server</a>, a <a href="https://github.com/STGime/posta-skill" target="_blank" rel="noopener">Claude Code skill</a>, the <RouterLink to="/workflows">n8n node</RouterLink>, or the <a href="https://api.getposta.app/docs" target="_blank" rel="noopener">REST API</a>. The agent can then create, schedule, and publish to all 8 networks, with media auto-formatted per platform.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Which AI tools and agent frameworks are supported?</div>
          <div class="faq-a">
            Any MCP client (Claude Desktop, Cursor, Windsurf, VS Code, Zed), Claude Code via the Posta skill, n8n via the community node, and any language or framework via the REST API and webhooks.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Can agents schedule posts and react to events?</div>
          <div class="faq-a">
            Yes. Agents can schedule posts for any future time, and Posta emits outbound webhooks on publish, fail, or status change — so an agent can close the loop and respond automatically.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Is there a free way to try agent posting?</div>
          <div class="faq-a">
            Yes — a 14-day free trial, no credit card required. The MCP server, Claude Code skill, and n8n node are all free and open source.
          </div>
        </div>
      </div>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Let your agents handle social"
      subtext="Connect Posta to your agent via MCP, n8n, or the API. 14-day free trial, no credit card."
      :source="waitingListSource"
    />
  </SeoPageLayout>
</template>

<style scoped>
.hero {
  margin-bottom: 48px;
}

h1 {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.025em;
  margin-bottom: 16px;
}

.hero-sub {
  font-size: 16px;
  color: var(--fg-2);
  max-width: 68ch;
  line-height: 1.65;
}

.content-section {
  padding: 36px 0;
  border-top: 1px solid var(--line);
}

.content-section h2 {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.015em;
  line-height: 1.25;
  margin-bottom: 14px;
}

.content-section p {
  font-size: 15px;
  color: var(--fg-2);
  line-height: 1.65;
  max-width: 68ch;
  margin-bottom: 14px;
}

.content-section p a,
.feature-body a,
.faq-a a {
  color: var(--text);
  text-decoration: underline;
  text-decoration-color: var(--line-strong);
  text-underline-offset: 3px;
  transition: text-decoration-color 0.15s;
}

.content-section p a:hover,
.feature-body a:hover,
.faq-a a:hover {
  text-decoration-color: var(--signal);
}

.hero-sub code,
.content-section p code,
.feature-body code,
.faq-a code,
.step-body code {
  font-family: var(--font-mono);
  font-size: 0.86em;
  color: var(--text);
  background: var(--ink-2);
  border: 1px solid var(--line);
  padding: 1px 5px;
  border-radius: var(--radius-sm);
  overflow-wrap: anywhere;
}

.code-block {
  margin: 14px 0 18px;
  padding: 14px 16px;
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

.code-block code {
  font-family: var(--font-mono);
  white-space: pre;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  margin-top: 18px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.feature-card {
  min-width: 0;
  background: var(--ink-0);
  padding: 18px 20px;
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

.link-card:hover .feature-title {
  color: var(--text);
}

.feature-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.35;
  margin-bottom: 6px;
  color: var(--text);
}

.feature-body {
  font-size: 14px;
  color: var(--fg-2);
  line-height: 1.6;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 18px;
  border-top: 1px solid var(--line-strong);
}

.step-card {
  min-width: 0;
  padding: 20px 20px 4px 0;
}

.step-card + .step-card {
  padding-left: 20px;
  border-left: 1px solid var(--line);
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 22px;
  padding: 0 6px;
  margin-bottom: 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: var(--fg-2);
  border: 1px solid var(--line-strong);
  border-radius: 2px;
}

.step-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 6px;
}

.step-body {
  font-size: 14px;
  color: var(--fg-2);
  line-height: 1.6;
}

.faq-grid {
  margin-top: 18px;
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
  margin-bottom: 6px;
  color: var(--text);
}

.faq-a {
  font-size: 15px;
  color: var(--fg-2);
  line-height: 1.65;
}

@media (max-width: 600px) {
  .features-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .steps-grid {
    grid-template-columns: minmax(0, 1fr);
    border-top: 0;
    border-left: 1px solid var(--line-strong);
  }

  .step-card,
  .step-card + .step-card {
    padding: 0 0 20px 20px;
    border-left: 0;
  }
}
</style>
