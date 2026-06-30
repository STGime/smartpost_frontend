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
  'From zero to a closed-loop autonomous social media bot in one afternoon using Claude and the Posta MCP server. Draft, schedule, publish to eight networks, and react to HMAC webhooks — no dashboard, no glue code.'

useHead({
  title: 'Build an Autonomous Social Media Bot in One Afternoon | Posta',
  meta: [
    { name: 'description', content: description },
    {
      name: 'keywords',
      content:
        'autonomous social media bot, build social media bot, ai social media bot, agentic social media bot, autonomous posting bot, claude social bot, claude social media bot, social media agent tutorial, autonomous content bot, posta tutorial',
    },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'article' },
    { property: 'og:url', content: 'https://getposta.app/autonomous-social-media-bot' },
    { property: 'og:title', content: 'Build an Autonomous Social Media Bot in One Afternoon | Posta' },
    { property: 'og:description', content: description },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Build an Autonomous Social Media Bot | Posta' },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [{ rel: 'canonical', href: 'https://getposta.app/autonomous-social-media-bot' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is an autonomous social media bot?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'A pipeline that drafts, schedules, publishes, and reacts to platform feedback without a human in the loop for each post. Built on three pieces: an LLM (Claude), a typed tool surface (Posta MCP), and HMAC-signed outbound webhooks so the bot can close the loop on its own publishes.',
            },
          },
          {
            '@type': 'Question',
            name: 'What do I need to build one?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'A Posta API token (free trial), the Posta MCP server (npx posta-mcp), an LLM client that supports MCP (Claude Desktop, Claude Code, Cursor, custom), and a small webhook receiver for the closed loop — a single edge function or a 50-line Node server is enough.',
            },
          },
          {
            '@type': 'Question',
            name: 'How long does it take?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'An afternoon end-to-end if you stay in scope. MCP install is 30 seconds, prompting the agent is iterative, the webhook receiver is the longest piece — and even that is a 50-line file.',
            },
          },
          {
            '@type': 'Question',
            name: 'Will the bot get rate-limited or banned?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Posta publishes via official platform APIs with per-network rate-limit handling and retry-with-backoff baked in. As long as your bot posts at normal volumes (not spam), you stay within platform terms.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I supervise the bot before it auto-posts?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Posta supports draft, scheduled, and immediate posts. Common pattern: the bot creates drafts the first week, you approve, then graduate it to scheduled mode once you trust the output.',
            },
          },
        ],
      }),
    },
    breadcrumbJsonLd([
      { name: 'Home', url: 'https://getposta.app/' },
      { name: 'Autonomous Social Media Bot', url: 'https://getposta.app/autonomous-social-media-bot' },
    ]),
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>Build an Autonomous Social Media Bot in One Afternoon</h1>
      <p class="hero-sub">
        From zero to a closed-loop social bot using Claude + the Posta MCP server. Draft, schedule,
        publish to eight networks, and react to HMAC webhooks — no dashboard, no glue code.
      </p>
    </section>

    <section class="content-section">
      <h2>What you'll build</h2>
      <p>
        A bot that takes a high-level instruction ("post about our launch this week"), drafts
        per-platform captions with Claude, schedules them via Posta, and reacts when each post
        publishes — replying to early comments, pinging Slack, or branching the next campaign
        step.
      </p>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">In scope</div>
          <div class="feature-body">Draft → schedule → publish → webhook → react. Eight social networks, one afternoon.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Out of scope</div>
          <div class="feature-body">Crawling platforms for replies, scraping competitors, anything against platform ToS.</div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2>The stack</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">Claude (the brain)</div>
          <div class="feature-body">Claude Desktop, Claude Code, or any MCP-capable client. The model writes captions and picks tools.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Posta MCP server (the tools)</div>
          <div class="feature-body">Exposes typed tools — <code>createPost</code>, <code>schedulePost</code>, <code>listAccounts</code>, <code>uploadMedia</code>. <RouterLink to="/mcp-social-media-server">More →</RouterLink></div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Webhook receiver (the loop)</div>
          <div class="feature-body">A 50-line edge function or Node server that catches Posta's outbound webhooks and signals the bot.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Posta account (the rails)</div>
          <div class="feature-body">Connects to eight social networks via official APIs. 14-day free trial.</div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2>Step 1 — Wire Posta MCP into your client</h2>
      <p>
        Get a Posta API token from your dashboard, then add the Posta MCP server to your client's
        MCP config. The server runs on demand via <code>npx</code> — no separate install step.
        Restart the client and the Posta tools appear in the tool list.
      </p>
      <pre class="code-block" v-pre><code>// claude_desktop_config.json (or your client's MCP config)
{
  "mcpServers": {
    "posta": {
      "command": "npx",
      "args": ["-y", "posta-mcp"],
      "env": { "POSTA_API_TOKEN": "posta_xxx" }
    }
  }
}</code></pre>
    </section>

    <section class="content-section">
      <h2>Step 2 — Prompt Claude to draft and schedule</h2>
      <p>
        With the MCP server wired in, Claude picks the right Posta tool based on the prompt. No
        prompt-engineered API docs needed.
      </p>
      <pre class="code-block" v-pre><code>"This week I'm announcing v2 of our SDK.
 Draft a LinkedIn post (long-form), a Bluesky thread (short),
 and a Threads post. Schedule LinkedIn for Tuesday 9am CET,
 the others for Wednesday 10am CET. Use the launch image from
 my media library."</code></pre>
      <p>
        Claude calls <code>listMedia</code> to find the image, drafts three per-platform captions,
        and calls <code>createPost</code> three times with the right scheduling. Output ends up in
        your Posta dashboard as scheduled drafts.
      </p>
    </section>

    <section class="content-section">
      <h2>Step 3 — Receive HMAC webhooks</h2>
      <p>
        Configure a webhook endpoint in Posta's settings. When a post publishes (or fails), Posta
        POSTs an HMAC-signed payload to your URL. A minimal receiver in Node:
      </p>
      <pre class="code-block" v-pre><code>// webhook.js
import { createHmac, timingSafeEqual } from 'node:crypto'
import express from 'express'

const app = express()
app.use(express.json({ verify: (req, _, buf) => { req.raw = buf } }))

app.post('/posta-webhook', (req, res) => {
  const sig = req.headers['x-posta-signature']
  const ts = req.headers['x-posta-timestamp']
  if (!sig || !ts) return res.sendStatus(401)
  const expected = createHmac('sha256', process.env.POSTA_WEBHOOK_SECRET)
    .update(ts + '.' + req.raw).digest('hex')
  const sigBuf = Buffer.from(sig)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return res.sendStatus(401)
  }

  const { event, platform, platformPostUrl } = req.body
  console.log(`${event} on ${platform}: ${platformPostUrl}`)
  // → trigger next agent action here
  res.sendStatus(200)
})
app.listen(3000)</code></pre>
    </section>

    <section class="content-section">
      <h2>Step 4 — Close the loop</h2>
      <p>
        Now the bot has feedback: each publish fires a webhook, and the receiver can kick off the
        next action — call Claude back, post a Slack note, branch a multi-day campaign, retry on
        failure. Some common closed-loop patterns:
      </p>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">Auto-respond on publish</div>
          <div class="feature-body">When LinkedIn fires "post.published", hand the post URL to Claude and have it draft the first comment reply.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Multi-day campaign branching</div>
          <div class="feature-body">When day 1's post publishes, the bot evaluates engagement and decides what day 2 should say.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Retry-with-variation</div>
          <div class="feature-body">When "post.failed" fires, the bot regenerates the caption with a different angle and re-schedules.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Slack supervision</div>
          <div class="feature-body">Every publish fires a Slack message with a "kill switch" button — supervised autonomy.</div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2>Where to go from here</h2>
      <p>
        Three good next steps once the basic loop works:
      </p>
      <div class="features-grid">
        <RouterLink to="/agentic-social-media-workflows" class="feature-card link-card">
          <div class="feature-title">The five workflow archetypes →</div>
          <div class="feature-body">Map your bot to the right shape — generate-and-schedule, watch-and-repurpose, closed-loop, multi-agent.</div>
        </RouterLink>
        <RouterLink to="/workflows" class="feature-card link-card">
          <div class="feature-title">Ready-to-fork n8n workflows →</div>
          <div class="feature-body">If you'd rather start visual, fork the blog-to-social, YouTube-to-social, or product-launch workflow.</div>
        </RouterLink>
        <RouterLink to="/developers" class="feature-card link-card">
          <div class="feature-title">REST API + webhooks reference →</div>
          <div class="feature-body">For programmatic loops without an MCP client in the picture.</div>
        </RouterLink>
        <RouterLink to="/blog" class="feature-card link-card">
          <div class="feature-title">Blog patterns and examples →</div>
          <div class="feature-body">How others have wired Claude, n8n, and the REST API for closed-loop posting.</div>
        </RouterLink>
      </div>
    </section>

    <section class="content-section faq-section">
      <h2>Frequently asked questions</h2>
      <div class="faq-grid">
        <div class="faq-item">
          <div class="faq-q">What is an autonomous social media bot?</div>
          <div class="faq-a">
            A pipeline that drafts, schedules, publishes, and reacts to platform feedback without a
            human in the loop for each post. Three pieces: an LLM (Claude), a typed tool surface
            (Posta MCP), and HMAC-signed outbound webhooks for the closed loop.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">What do I need to build one?</div>
          <div class="faq-a">
            A Posta API token (free trial), the
            <RouterLink to="/mcp-social-media-server">Posta MCP server</RouterLink>, an MCP-capable
            LLM client (Claude Desktop, Claude Code, Cursor, or custom), and a small webhook
            receiver for the closed loop. The receiver is a 50-line Node file.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">How long does it take?</div>
          <div class="faq-a">
            An afternoon end-to-end if you stay in scope. MCP install is 30 seconds, prompting is
            iterative, the webhook receiver is the longest piece.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Will my bot get rate-limited or banned?</div>
          <div class="faq-a">
            Posta publishes via official platform APIs with per-network rate-limit handling and
            retry-with-backoff baked in. As long as the bot posts at normal volumes, you stay within
            platform terms.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Can I supervise before going fully autonomous?</div>
          <div class="faq-a">
            Yes. Common pattern: the bot creates drafts the first week, you review, then graduate
            it to scheduled mode once you trust the output.
          </div>
        </div>
      </div>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Get a Posta token and start building"
      subtext="14-day free trial. MCP server, Claude Code skill, and n8n node are free and open source."
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
