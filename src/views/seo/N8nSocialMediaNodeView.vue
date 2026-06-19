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
  'Install n8n-nodes-posta and every social network becomes a typed node in your n8n workflows — LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, Bluesky, Threads. One auth, every channel, ready-to-fork templates.'

useHead({
  title: 'n8n Social Media Node — One Community Node, 8 Networks | Posta',
  meta: [
    { name: 'description', content: description },
    {
      name: 'keywords',
      content:
        'n8n social media, n8n social media node, n8n social media automation, n8n posting node, n8n linkedin node, n8n instagram node, n8n community node social, social media n8n workflow, n8n-nodes-posta, posta n8n',
    },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://getposta.app/n8n-social-media-node' },
    { property: 'og:title', content: 'n8n Node for Social Media: One Node, 8 Networks | Posta' },
    { property: 'og:description', content: description },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'n8n Social Media Node | Posta' },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [{ rel: 'canonical', href: 'https://getposta.app/n8n-social-media-node' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is the Posta n8n community node?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'n8n-nodes-posta is an official community node that turns every Posta API endpoint into a typed, drag-and-drop n8n node. Drop it into a workflow alongside your other n8n nodes — RSS, OpenAI, HTTP, Schedule — and post to LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, Bluesky, and Threads without writing HTTP requests.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I install n8n-nodes-posta?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'In self-hosted n8n: install the package from the Community Nodes settings page (npm name: n8n-nodes-posta) and restart. In n8n Cloud: community nodes are available on the Pro plan. Then add a Posta credential with your API token and the node appears in the node picker.',
            },
          },
          {
            '@type': 'Question',
            name: 'What operations does the node support?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Create Post (draft, scheduled, or immediate), Schedule Post, List Accounts, Get Post Status, Upload Media, List Media, List Posts. Each operation maps to a typed Posta endpoint with full parameter typing.',
            },
          },
          {
            '@type': 'Question',
            name: 'Are there ready-to-fork n8n workflows for social media?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Posta publishes ready-to-fork n8n workflows for blog-to-social, YouTube-to-social, product-launch campaigns, and LinkedIn carousel generation. Each includes the .json export, the node chain, setup time, and required credentials.',
            },
          },
          {
            '@type': 'Question',
            name: 'Why a typed node instead of HTTP Request?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Typed parameters, credential management, retry semantics on platform rate limits, and platform-aware caption limits all come for free. The HTTP node makes you re-implement them per workflow.',
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
        name: 'n8n-nodes-posta',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web, macOS, Linux, Windows',
        url: 'https://getposta.app/n8n-social-media-node',
        downloadUrl: 'https://www.npmjs.com/package/n8n-nodes-posta',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description: 'Open-source n8n community node that exposes Posta as a typed, drag-and-drop node for posting to LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, Bluesky, and Threads.',
      }),
    },
    breadcrumbJsonLd([
      { name: 'Home', url: 'https://getposta.app/' },
      { name: 'n8n Social Media Node', url: 'https://getposta.app/n8n-social-media-node' },
    ]),
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>n8n Node for Social Media: One Node, 8 Networks</h1>
      <p class="hero-sub">
        Install <code>n8n-nodes-posta</code> and every social network becomes a typed node in your
        n8n workflows. LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, Bluesky, Threads —
        one auth, every channel. Open source, free, and on the official npm registry.
      </p>
    </section>

    <section class="content-section">
      <h2>Install in 60 seconds</h2>
      <p>
        On self-hosted n8n, add the community node from settings and restart. On n8n Cloud,
        community nodes are available from the Pro plan upward. Then create a Posta credential with
        your API token.
      </p>
      <pre class="code-block"><code># Self-hosted n8n
Settings → Community Nodes → Install
  npm package: n8n-nodes-posta
  → Save → restart n8n

# Then add a Posta credential
Credentials → Add → Posta
  API token: posta_xxx (get one at /app/settings/api)</code></pre>
    </section>

    <section class="content-section">
      <h2>Operations the node exposes</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">Create Post</div>
          <div class="feature-body">Draft, scheduled, or immediate. Pick one or many connected accounts, attach media, set platform-specific config.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Schedule Post</div>
          <div class="feature-body">Move a draft to a future timestamp. Time-zone safe, with calendar collision-checking.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">List Accounts</div>
          <div class="feature-body">Iterate connected social accounts to fan out a post across every channel.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Get Post Status</div>
          <div class="feature-body">Poll a queued or processing post — though webhooks are usually a better trigger.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Upload / List Media</div>
          <div class="feature-body">Push assets into the media library and reference them by ID across multiple posts.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">List Posts</div>
          <div class="feature-body">Pull a window of drafts, scheduled, or posted history for reporting workflows.</div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2>Ready-to-fork workflows</h2>
      <p>
        Each is an export-ready n8n JSON with the node chain, setup time, and required credentials
        documented. Fork, swap your accounts in, run.
      </p>
      <div class="features-grid">
        <RouterLink to="/workflows/blog-to-social-media" class="feature-card link-card">
          <div class="feature-title">Blog → Social media →</div>
          <div class="feature-body">Reads your blog RSS feed, builds a post with the article image, schedules across every connected account.</div>
        </RouterLink>
        <RouterLink to="/workflows/youtube-to-social-media" class="feature-card link-card">
          <div class="feature-title">YouTube → Social media →</div>
          <div class="feature-body">Drafts promo posts for your newest YouTube video on every platform with AI-written captions.</div>
        </RouterLink>
        <RouterLink to="/workflows/product-launch-campaign" class="feature-card link-card">
          <div class="feature-title">Product launch campaign →</div>
          <div class="feature-body">Turns one product into a 5-day, multi-platform launch campaign with per-network captions.</div>
        </RouterLink>
        <RouterLink to="/workflows/blog-to-linkedin-carousel" class="feature-card link-card">
          <div class="feature-title">Blog → LinkedIn carousel →</div>
          <div class="feature-body">Summarises an article into a swipeable LinkedIn carousel PDF, end to end.</div>
        </RouterLink>
      </div>
    </section>

    <section class="content-section">
      <h2>Example workflow</h2>
      <p>
        A minimal n8n workflow that watches an RSS feed, drafts a LinkedIn caption with OpenAI, and
        schedules it through Posta:
      </p>
      <pre class="code-block" v-pre><code>RSS Trigger              → new blog post detected
  └─ OpenAI               → "Draft a LinkedIn caption from this excerpt"
       └─ Posta            (operation: Create Post)
             account: LinkedIn
             caption: ={{$json.caption}}
             mediaUrl: ={{$json.image}}
             scheduleFor: tomorrow 9am CET</code></pre>
    </section>

    <section class="content-section">
      <h2>Why a typed node?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">Typed parameters</div>
          <div class="feature-body">Caption, schedule, accounts, media — all surfaced as proper n8n inputs with validation. No copy-pasting API docs.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Credential management</div>
          <div class="feature-body">One Posta credential per n8n instance, reused across every workflow. No token-juggling in HTTP nodes.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Rate-limit-aware retries</div>
          <div class="feature-body">Posta handles platform rate limits and 5xx hiccups internally — the node surfaces final status, not the noise.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Per-platform caption limits</div>
          <div class="feature-body">Truncation enforced per network — Bluesky 300, Threads 500, LinkedIn 3000 — without you parsing the limits.</div>
        </div>
      </div>
    </section>

    <section class="content-section faq-section">
      <h2>Frequently asked questions</h2>
      <div class="faq-grid">
        <div class="faq-item">
          <div class="faq-q">What is the Posta n8n community node?</div>
          <div class="faq-a">
            <code>n8n-nodes-posta</code> is an official community node that turns every Posta API
            endpoint into a typed, drag-and-drop n8n node. Drop it into a workflow alongside your
            other n8n nodes — RSS, OpenAI, HTTP, Schedule — and post to eight social networks
            without writing HTTP requests. Source on
            <a href="https://github.com/STGime/n8n-nodes-posta" target="_blank" rel="noopener">GitHub</a>;
            package on <a href="https://www.npmjs.com/package/n8n-nodes-posta" target="_blank" rel="noopener">npm</a>.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">How do I install n8n-nodes-posta?</div>
          <div class="faq-a">
            Self-hosted n8n: <em>Settings → Community Nodes → Install</em>, paste
            <code>n8n-nodes-posta</code>, restart. n8n Cloud: community nodes are available on the
            Pro plan. Add a Posta credential with your API token and the node appears in the picker.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">What operations does the node support?</div>
          <div class="faq-a">
            Create Post, Schedule Post, List Accounts, Get Post Status, Upload Media, List Media,
            List Posts. Each maps to a typed Posta endpoint.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Are there example workflows?</div>
          <div class="faq-a">
            Yes — see the <RouterLink to="/workflows">workflow gallery</RouterLink>. Each is an
            export-ready n8n JSON with the node chain, setup time, and required credentials
            documented.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Why a typed node instead of HTTP Request?</div>
          <div class="faq-a">
            Typed parameters, credential management, retry semantics on platform rate limits, and
            platform-aware caption limits all come for free. The HTTP node makes you re-implement
            them per workflow.
          </div>
        </div>
      </div>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Make Posta a node in your n8n workflows"
      subtext="Install the community node, fork a template, ship a workflow. 14-day free trial."
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

.hero-sub code,
.faq-a code,
.feature-body code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.9em;
  background: rgba(148, 163, 184, 0.12);
  padding: 1px 4px;
  border-radius: 4px;
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
