<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import { breadcrumbJsonLd } from '@/composables/breadcrumbJsonLd'
import type { WaitingListSource } from '@/services'

const waitingListSource = ref<WaitingListSource>('seo-scheduler')

const schedulerFaq = [
  {
    q: 'What is a social media scheduler?',
    a: 'A social media scheduler is a tool that lets you plan, queue, and automatically publish posts to multiple social networks from one calendar. Instead of opening eight apps and posting in real time, you draft once, pick a time, and the scheduler handles publishing — including platform-specific aspect ratios, caption limits, and rate limits.',
  },
  {
    q: 'Which social media platforms does Posta support?',
    a: 'Eight networks: LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, Bluesky, and Threads. Bluesky and Threads support is rare among schedulers — most competitors either don\'t support them or shipped them later than Posta did.',
  },
  {
    q: 'Is there a free social media scheduler?',
    a: 'Posta offers a 14-day free trial with no credit card required, covering scheduling to all 8 supported networks. After the trial, plans start at the Starter tier. Buffer\'s free plan caps you at 3 channels; Hootsuite removed its free plan in 2025. For developers, the entire API surface is included on every paid tier.',
  },
  {
    q: 'How is Posta different from Buffer, Hootsuite, or Later?',
    a: 'Posta supports Bluesky and Threads natively, includes a comments inbox for LinkedIn and TikTok, ships outbound HMAC-signed webhooks, exposes a public REST API with an OpenAPI spec, and integrates with Claude Code, MCP clients, and n8n out of the box. Buffer is a polished publish-queue product; Hootsuite is agency-focused. Posta sits in between, with deeper developer and agent tooling.',
  },
  {
    q: 'Can I schedule the same post to multiple platforms at once?',
    a: 'Yes. Pick which connected accounts to publish to in the composer. Posta auto-formats your media for each platform\'s aspect ratios and caption limits, then publishes in parallel. You can also override the caption or media per-platform if you want a tailored version.',
  },
  {
    q: 'Does Posta auto-crop images for each platform?',
    a: 'Yes. Posta uses face-aware cropping to keep subjects centered when generating platform-specific variants (Instagram 1:1 / 4:5 / 9:16, TikTok 9:16, LinkedIn 1.91:1, Pinterest 2:3, etc.). Upload one image, get six variants generated automatically — no manual cropping per platform.',
  },
  {
    q: 'Can I bulk-schedule posts?',
    a: 'Yes. The visual calendar lets you drag posts onto time slots, and you can duplicate or shift entire weeks at once. The API and n8n node also support bulk creation if you\'re wiring Posta into a content pipeline.',
  },
  {
    q: 'Does Posta handle timezones?',
    a: 'Every scheduled post is stored in UTC and rendered in your account timezone. If you switch timezones (e.g. travel, daylight saving), already-scheduled posts publish at the original absolute time — not the new wall-clock time.',
  },
  {
    q: 'How far in advance can I schedule posts?',
    a: 'There\'s no hard upper bound — schedule weeks or months ahead. A background scheduler picks up posts at the right moment, with retries on transient platform errors.',
  },
  {
    q: 'Does Posta have an API or MCP server?',
    a: 'Yes. Posta exposes a full REST API documented at api.getposta.app/docs and ships an MCP (Model Context Protocol) server so any MCP-capable client — Claude Desktop, Claude Code, Cursor — can create, schedule, and publish posts as tool calls. See the agentic-social-media-scheduler page for the full integration story.',
  },
  {
    q: 'Can AI schedule my posts for me?',
    a: 'Yes — pair Posta with Claude, an n8n workflow, or your own agent. Connect once with an API token, then have the agent draft captions, pick optimal send times based on your analytics, and queue the posts. Posta supplies the publishing primitives; the agent handles the reasoning.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes — 14 days, no credit card required. The trial includes scheduling to all 8 supported networks plus full API and MCP access.',
  },
]

useHead({
  title: 'Social Media Scheduler — Auto-Crop & Schedule to 8 Platforms',
  meta: [
    {
      name: 'description',
      content:
        'A social media scheduler built for creators and AI agents. Plan, auto-crop, and publish to TikTok, Instagram, LinkedIn, YouTube, Bluesky, Threads, Facebook and Pinterest from one calendar — or from Claude, n8n, or the API.',
    },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://getposta.app/social-media-scheduler' },
    { property: 'og:title', content: 'Social Media Scheduler — Auto-Crop & Schedule to 8 Platforms' },
    {
      property: 'og:description',
      content:
        'A social media scheduler built for creators and AI agents. Plan, auto-crop, and publish to 8 platforms from one calendar — or from Claude, n8n, or the API.',
    },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Social Media Scheduler — Auto-Crop & Schedule to 8 Platforms' },
    {
      name: 'twitter:description',
      content:
        'A social media scheduler built for creators and AI agents. Plan, auto-crop, and publish to 8 platforms from one calendar — or from Claude, n8n, or the API.',
    },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [{ rel: 'canonical', href: 'https://getposta.app/social-media-scheduler' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: schedulerFaq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }),
    },
    breadcrumbJsonLd([
      { name: 'Home', url: 'https://getposta.app/' },
      { name: 'Social Media Scheduler', url: 'https://getposta.app/social-media-scheduler' },
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
          'Social media scheduler with smart cropping, multi-platform publishing, a public REST API, MCP server, and n8n community node.',
        offers: [
          { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free trial (14 days, no card)' },
          { '@type': 'Offer', priceCurrency: 'USD', name: 'Starter plan' },
        ],
        featureList: [
          'Visual content calendar across 8 networks',
          'Face-aware auto-cropping (1:1, 4:5, 9:16, 16:9, 2:3, 1.91:1)',
          'Per-platform caption and media overrides',
          'Bluesky and Threads native support',
          'Public REST API with OpenAPI spec',
          'MCP server for Claude, Cursor, and any agent',
          'n8n community node for visual automations',
          'HMAC-signed outbound webhooks',
        ],
      }),
    },
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>Social Media Scheduler — Plan, Auto-Crop, and Publish to 8 Platforms</h1>
      <p class="hero-sub">
        Posta is a social media scheduler for creators, indie founders, and AI agents.
        Upload one piece of content, get platform-perfect variants generated automatically,
        and queue posts across LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook,
        Bluesky, and Threads — from a calendar, the REST API, an
        <RouterLink to="/mcp-social-media-server">MCP server</RouterLink>, or an
        <RouterLink to="/n8n-social-media-node">n8n workflow</RouterLink>.
      </p>
    </section>

    <section class="content-section">
      <h2>What is a social media scheduler?</h2>
      <p>
        A <strong>social media scheduler</strong> is software that lets you plan, queue,
        and automatically publish posts to multiple social networks from a single
        dashboard — instead of logging into each platform and posting in real time. The
        scheduler takes care of timezone conversion, retries on transient platform
        errors, and the platform-specific quirks each network insists on (aspect
        ratios, caption limits, hashtag conventions, video duration caps).
      </p>
      <p>
        A modern social media scheduler does more than just queue text and images. The
        best tools auto-format media for each network, surface analytics so you can
        learn which send times actually convert, and expose an API so the scheduling
        loop can be driven by an AI agent or content pipeline rather than a human
        clicking buttons. That last piece — the API surface and the
        <RouterLink to="/agentic-social-media-scheduler">agentic integration story</RouterLink>
        — is where Posta differs most from Buffer, Hootsuite, and Later.
      </p>
      <p>
        For creators, the value is consistency. Posting on a regular cadence is the
        single biggest factor in growing a social audience, and a scheduler removes the
        friction that breaks consistency: format-fiddling, time-zone math, and the cost
        of being online when each platform's algorithm prefers.
      </p>
    </section>

    <section class="content-section">
      <h2>How a social media scheduler works</h2>
      <p>
        The shape of the workflow is the same across every tool. The differences are in
        how much the scheduler does for you at each step:
      </p>
      <ol class="step-list">
        <li>
          <h3>1. Connect your social accounts</h3>
          <p>
            OAuth into each network you publish to. A good scheduler stores refresh
            tokens so reconnects are rare; Posta also surfaces token-expiry warnings
            before a publish silently fails. Connect once per network per account.
          </p>
        </li>
        <li>
          <h3>2. Upload your media once</h3>
          <p>
            Drop in an image, a video, or a PDF. Posta runs face-aware cropping and
            compression to generate the variants each platform actually wants —
            Instagram square, Instagram portrait, TikTok 9:16, LinkedIn landscape,
            Pinterest 2:3, and so on. No manual export-from-Figma-six-times.
          </p>
        </li>
        <li>
          <h3>3. Write the caption (or have an agent draft it)</h3>
          <p>
            Compose once with optional per-platform overrides — useful when LinkedIn
            wants a long-form opener and TikTok wants three emoji and a hashtag. Or
            point Claude or an n8n workflow at Posta and let the agent draft platform-
            tuned variants from a single brief.
          </p>
        </li>
        <li>
          <h3>4. Pick a time on the calendar</h3>
          <p>
            Drag onto the visual calendar, or set an exact UTC timestamp via API.
            Times are stored in UTC and rendered in your local timezone, so daylight-
            saving switches don't accidentally shift everything an hour.
          </p>
        </li>
        <li>
          <h3>5. Posta publishes — and reports back</h3>
          <p>
            A background scheduler picks up posts at the right moment, retries on
            transient platform errors (Meta is famous for them), and fires HMAC-signed
            webhooks back to your stack on success or final failure. Closes the loop
            for autonomous pipelines.
          </p>
        </li>
      </ol>
    </section>

    <section class="content-section">
      <h2>What to look for in a social media scheduler</h2>
      <p>
        Every scheduler can queue a post. The differences that matter compound over
        months of use — they're what separates a tool you tolerate from one you build
        a workflow around.
      </p>
      <div class="feature-grid">
        <div class="feature-card">
          <h3>Visual content calendar</h3>
          <p>
            Drag-and-drop, week / month views, per-network filtering. Critically: the
            calendar must let you see <em>conflicts</em> — two posts to the same
            network in the same hour usually means an algorithm penalty, and a good
            calendar warns you before you schedule into one.
          </p>
        </div>
        <div class="feature-card">
          <h3>Multi-platform publishing with overrides</h3>
          <p>
            A single composer that fans out to every connected account, but with
            per-platform <em>overrides</em> — distinct captions, distinct media, distinct
            hashtags where you want them, single source of truth where you don't. Posta
            supports overrides on caption, media, and hashtags on every platform.
          </p>
        </div>
        <div class="feature-card">
          <h3>Auto-formatting and smart cropping</h3>
          <p>
            Upload one asset, get platform-ready variants generated automatically. The
            best schedulers use face detection so the subject stays centered when going
            from a 16:9 source to a 9:16 TikTok. Posta generates six aspect-ratio
            variants per image, covering every network it supports.
          </p>
        </div>
        <div class="feature-card">
          <h3>Analytics that close the loop</h3>
          <p>
            Per-post engagement, per-network reach, and — if the platform exposes it —
            best-send-time recommendations based on your actual audience, not a
            blog-post average. Analytics are how you learn what works without doing a
            full content audit every quarter.
          </p>
        </div>
        <div class="feature-card">
          <h3>API, MCP, and automation hooks</h3>
          <p>
            If the scheduler is a dead-end UI, every workflow improvement requires a
            human in the loop. Look for a documented REST API, outbound webhooks, and
            increasingly an MCP server. These are what let you build the
            <RouterLink to="/agentic-social-media-scheduler">agentic social media scheduler</RouterLink>
            stack the next generation of content teams are quietly running.
          </p>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2>Posta vs Buffer vs Hootsuite vs Later</h2>
      <p>
        Buffer, Hootsuite, and Later all do the basics well. The differences show up
        when you push past the dashboard — multi-platform fan-out without per-platform
        babysitting, native Bluesky and Threads, and whether the tool is reachable by
        anything other than a human clicking buttons.
      </p>
      <div class="comparison-table-wrap">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Posta</th>
              <th>Buffer</th>
              <th>Hootsuite</th>
              <th>Later</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Networks supported</td>
              <td>8</td>
              <td>6</td>
              <td>10+</td>
              <td>8</td>
            </tr>
            <tr>
              <td>Bluesky &amp; Threads native</td>
              <td>Yes</td>
              <td>Partial</td>
              <td>Partial</td>
              <td>Partial</td>
            </tr>
            <tr>
              <td>Face-aware auto-cropping</td>
              <td>Yes</td>
              <td>No</td>
              <td>No</td>
              <td>No</td>
            </tr>
            <tr>
              <td>Public REST API on every paid tier</td>
              <td>Yes</td>
              <td>Enterprise only</td>
              <td>Enterprise only</td>
              <td>No public API</td>
            </tr>
            <tr>
              <td>MCP server</td>
              <td>Yes</td>
              <td>No</td>
              <td>No</td>
              <td>No</td>
            </tr>
            <tr>
              <td>n8n community node</td>
              <td>Yes</td>
              <td>Via HTTP</td>
              <td>Via HTTP</td>
              <td>No</td>
            </tr>
            <tr>
              <td>HMAC-signed outbound webhooks</td>
              <td>Yes</td>
              <td>No</td>
              <td>No</td>
              <td>No</td>
            </tr>
            <tr>
              <td>Free trial</td>
              <td>14 days, no card</td>
              <td>Free plan (3 channels)</td>
              <td>30-day trial</td>
              <td>14-day trial</td>
            </tr>
            <tr>
              <td>Starting price</td>
              <td>Starter tier</td>
              <td>$6 / channel / mo</td>
              <td>$199 / mo</td>
              <td>$25 / mo</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Need a head-to-head deep dive? See the dedicated
        <RouterLink to="/buffer-alternative">Buffer alternative</RouterLink> and
        <RouterLink to="/hootsuite-alternative">Hootsuite alternative</RouterLink>
        pages.
      </p>
    </section>

    <section class="content-section">
      <h2>Built for the agentic era</h2>
      <p>
        Most schedulers were built for a human in front of a dashboard. Posta was
        built so that the human is optional. Every primitive — create, schedule,
        publish, list, delete, analytics — is exposed as a REST endpoint, an MCP tool,
        and an n8n node. The same scheduling loop a creator runs by hand, an agent
        can run autonomously.
      </p>
      <p>
        That's the difference between an AI-<em>assisted</em> scheduler (a "generate
        caption" button next to the compose box) and an
        <strong><RouterLink to="/agentic-social-media-scheduler">agentic social media scheduler</RouterLink></strong>
        — one where the entire perceive-reason-act-observe loop runs without a human
        in the critical path. Posta is the latter.
      </p>
      <p>
        Three ways in:
      </p>
      <ul class="feature-list">
        <li>
          <strong><RouterLink to="/mcp-social-media-server">MCP server</RouterLink></strong> — one
          <code>npx posta-mcp</code>, one token, and Claude Desktop, Claude Code, or
          Cursor can schedule and publish across every supported network.
        </li>
        <li>
          <strong><RouterLink to="/n8n-social-media-node">n8n community node</RouterLink></strong> —
          drag-and-drop visual automation. Combine with the
          <RouterLink to="/workflows">workflow templates</RouterLink> to ship a
          trending-topics or RSS-driven content agent in an afternoon.
        </li>
        <li>
          <strong><RouterLink to="/developers">REST API &amp; webhooks</RouterLink></strong> —
          full OpenAPI spec, HMAC-signed outbound webhooks for publish-result events,
          and OAuth-token-per-account so your own agent can multi-tenant cleanly.
        </li>
      </ul>
    </section>

    <section class="content-section">
      <h2>Get started in 3 steps</h2>
      <ol class="step-list compact">
        <li>
          <h3>1. Sign up for the 14-day trial</h3>
          <p>No credit card. Full access to all 8 networks plus the API and MCP server.</p>
        </li>
        <li>
          <h3>2. Connect your accounts</h3>
          <p>OAuth into each network in the dashboard. Two minutes per platform.</p>
        </li>
        <li>
          <h3>3. Schedule your first post</h3>
          <p>
            Upload one image, draft the caption (or let an
            <RouterLink to="/agents">agent draft it</RouterLink>), pick a time, hit
            schedule. Done.
          </p>
        </li>
      </ol>
    </section>

    <section class="faq-section">
      <h2>Social media scheduler FAQ</h2>
      <div class="faq-list">
        <div v-for="item in schedulerFaq" :key="item.q" class="faq-item">
          <h3>{{ item.q }}</h3>
          <p>{{ item.a }}</p>
        </div>
      </div>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Start scheduling smarter"
      subtext="Join the creators and agents who save hours every week with Posta."
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

.hero-sub a {
  color: var(--text);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.content-section {
  margin-bottom: 36px;
}

.content-section h2 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 14px;
  letter-spacing: -0.01em;
}

.content-section p {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.7;
  max-width: 760px;
  margin-bottom: 14px;
}

.content-section p a,
.content-section li a {
  color: var(--text);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.content-section em {
  color: var(--text);
  font-style: italic;
}

.content-section strong {
  color: var(--text);
  font-weight: 600;
}

.step-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 14px;
  max-width: 760px;
}

.step-list.compact {
  gap: 10px;
}

.step-list li {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  padding: 14px 16px;
  background: rgba(15, 23, 42, 0.55);
}

.step-list h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 4px;
}

.step-list p {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.6;
  margin: 0;
}

.feature-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  max-width: 1000px;
  margin-top: 8px;
}

.feature-card {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  padding: 14px 16px;
  background: rgba(15, 23, 42, 0.55);
}

.feature-card h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 6px;
}

.feature-card p {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.6;
  margin: 0;
}

.feature-list {
  list-style: disc;
  padding-left: 22px;
  margin: 6px 0 0;
  max-width: 760px;
}

.feature-list li {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.7;
  margin-bottom: 6px;
}

.feature-list code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12.5px;
  padding: 1px 6px;
  border-radius: 5px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: var(--text);
}

.comparison-table-wrap {
  overflow-x: auto;
  margin: 10px 0 14px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
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
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.comparison-table thead th {
  background: rgba(15, 23, 42, 0.85);
  color: var(--text);
  font-weight: 600;
  font-size: 12.5px;
}

.comparison-table tbody td:first-child {
  color: var(--text);
  font-weight: 500;
}

.comparison-table tbody td {
  color: var(--muted);
}

.comparison-table tbody td:nth-child(2) {
  color: var(--text);
  font-weight: 500;
}

.faq-section {
  margin: 48px 0 36px;
}

.faq-section h2 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
  letter-spacing: -0.01em;
}

.faq-list {
  display: grid;
  gap: 18px;
  max-width: 820px;
}

.faq-item h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text);
}

.faq-item p {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.65;
}
</style>
