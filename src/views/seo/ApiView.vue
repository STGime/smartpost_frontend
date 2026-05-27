<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import type { WaitingListSource } from '@/services'

const waitingListSource = ref<WaitingListSource>('seo-api')

const apiFaq = [
  {
    q: 'Is the Posta API free?',
    a: 'The API is available on every paid Posta tier. Trial accounts can use it with the same limits as the trial. There is no separate enterprise contract required to access the REST API or webhooks.',
  },
  {
    q: 'How do I authenticate to the Posta API?',
    a: 'Generate an API token in Settings → API Tokens. Send it as Authorization: Bearer <token> on every request. Tokens are prefixed with posta_ and can be revoked at any time from the dashboard.',
  },
  {
    q: 'Where can I find the OpenAPI spec?',
    a: 'The machine-readable OpenAPI 3.0 specification lives at https://getposta.app/openapi.yaml. The same spec is also served at https://api.getposta.app/docs/openapi.yaml and powers the interactive Swagger UI at https://api.getposta.app/docs.',
  },
  {
    q: 'How are webhooks signed?',
    a: 'Posta sends an X-Posta-Signature header computed as HMAC SHA-256 over the string "<X-Posta-Timestamp>.<raw request body>" — timestamp and body joined by a literal dot. Compare the header against your own HMAC of that string to verify authenticity. The X-Posta-Timestamp value is an ISO 8601 datetime string. Reject deliveries whose timestamp is older than your chosen replay-protection window.',
  },
  {
    q: 'What webhook events does Posta send?',
    a: 'post.scheduled, post.processing, post.published, post.partially_published, post.failed, post.result.success, post.result.failed. Each fires on the lifecycle transition that gives it its name. Per-result events fire once per connected network, so a 3-platform post that succeeds on 2 and fails on 1 sends post.result.success twice and post.result.failed once.',
  },
  {
    q: 'How are webhook retries handled?',
    a: 'Failed deliveries are retried up to 5 times with exponential backoff (30s, 60s, 120s, 240s, 480s). Responses outside the 2xx range count as failures. Each delivery attempt is logged in the dashboard with response status, response body (truncated to 4 KB), and elapsed time.',
  },
  {
    q: 'Are there rate limits?',
    a: 'Yes. Auth endpoints are limited to 5 requests / minute per IP; general API endpoints are 100 requests / minute per token. Hitting a limit returns 429 with a Retry-After header.',
  },
  {
    q: 'Are there official SDKs?',
    a: 'Not yet. Both the OpenAPI spec and the REST surface are stable enough that openapi-generator produces a usable client in any language. We plan to publish official JS and Python SDKs; until then, the spec is the source of truth.',
  },
]

const endpoints = [
  {
    method: 'POST',
    path: '/v1/posts',
    summary: 'Create a post (draft)',
    curl: `curl -X POST https://api.getposta.app/v1/posts \\
  -H "Authorization: Bearer posta_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "caption": "Shipping today!",
    "socialAccountIds": [42, 99],
    "mediaIds": ["b3c5..."]
  }'`,
  },
  {
    method: 'POST',
    path: '/v1/posts/:id/schedule',
    summary: 'Schedule a draft for a future time',
    curl: `curl -X POST https://api.getposta.app/v1/posts/POST_ID/schedule \\
  -H "Authorization: Bearer posta_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "scheduledAt": "2026-06-01T09:00:00Z" }'`,
  },
  {
    method: 'POST',
    path: '/v1/posts/:id/publish',
    summary: 'Publish a draft immediately',
    curl: `curl -X POST https://api.getposta.app/v1/posts/POST_ID/publish \\
  -H "Authorization: Bearer posta_..."`,
  },
  {
    method: 'GET',
    path: '/v1/posts/:id/comments',
    summary: 'List cached comments on a post (LinkedIn, TikTok)',
    curl: `curl https://api.getposta.app/v1/posts/POST_ID/comments \\
  -H "Authorization: Bearer posta_..."`,
  },
  {
    method: 'POST',
    path: '/v1/webhook-endpoints',
    summary: 'Register an outbound webhook URL',
    curl: `curl -X POST https://api.getposta.app/v1/webhook-endpoints \\
  -H "Authorization: Bearer posta_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://your-app.example.com/posta-webhook",
    "events": ["post.published", "post.failed"]
  }'`,
  },
]

const webhookPayloadExample = `POST https://your-app.example.com/posta-webhook
Content-Type: application/json
User-Agent: Posta-Webhooks/1.0
X-Posta-Event: post.result.success
X-Posta-Delivery: 9f1a2b...
X-Posta-Timestamp: 2026-05-27T10:00:00Z
X-Posta-Signature: <HMAC SHA-256 of "timestamp.body" (hex)>

{
  "post": { "id": "7a8b..." },
  "result": {
    "platform": "linkedin",
    "status": "success",
    "platform_post_id": "urn:li:share:71...",
    "platform_post_url": "https://www.linkedin.com/feed/update/...",
    "published_at": "2026-05-27T10:00:00Z"
  }
}`

useHead({
  title: 'Posta API and Webhooks – REST API for Social Media Scheduling',
  meta: [
    { name: 'description', content: 'The Posta REST API lets you create, schedule, and publish social media posts programmatically across 9 networks. Outbound HMAC-signed webhooks, full OpenAPI spec, Bearer-token auth, available on every paid tier.' },
    { name: 'keywords', content: 'posta api, social media scheduler api, instagram scheduling api, tiktok api, linkedin api scheduler, social media webhook, openapi social media' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://getposta.app/developers' },
    { property: 'og:title', content: 'Posta API and Webhooks – REST API for Social Media Scheduling | Posta' },
    { property: 'og:description', content: 'REST API for creating, scheduling, and publishing posts to 9 networks. Outbound HMAC-signed webhooks, full OpenAPI spec, on every paid tier.' },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Posta API and Webhooks – REST API for Social Media Scheduling | Posta' },
    { name: 'twitter:description', content: 'REST API for creating, scheduling, and publishing posts to 9 networks. Outbound HMAC-signed webhooks, full OpenAPI spec, on every paid tier.' },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [
    { rel: 'canonical', href: 'https://getposta.app/developers' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: apiFaq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Posta API',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web',
        url: 'https://getposta.app/developers',
        featureList: [
          'REST API for creating and scheduling social media posts',
          'OpenAPI 3.0 specification at https://getposta.app/openapi.yaml',
          'Bearer-token authentication, self-serve from dashboard',
          'Outbound webhook delivery with HMAC SHA-256 signing',
          'Programmatic comments inbox (LinkedIn, TikTok) with reply endpoint',
          'Available on every paid tier — no enterprise contract required',
        ],
      }),
    },
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>Posta API and Webhooks</h1>
      <p class="hero-sub">
        Posta exposes a REST API for creating, scheduling, and publishing social media posts across LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, X (Twitter), Bluesky, and Threads. Bearer-token auth, full OpenAPI 3.0 spec, outbound HMAC-signed webhooks — available on every paid tier, no enterprise contract required.
      </p>
      <div class="hero-links">
        <a class="btn-primary" href="https://api.getposta.app/docs">Open Swagger UI</a>
        <a class="btn-secondary" href="/openapi.yaml">Download OpenAPI YAML</a>
      </div>
    </section>

    <section class="content-section">
      <h2>Authentication</h2>
      <p>
        Generate an API token in <strong>Settings → API Tokens</strong>. Tokens are prefixed with <code>posta_</code> and can be revoked at any time. Send the token on every request as a Bearer header:
      </p>
      <pre class="code-block"><code>Authorization: Bearer posta_xxxxxxxxxxxxxxxx</code></pre>
      <p>
        Tokens are bound to your user account and inherit your plan's rate limits and feature access. Treat them like passwords — never commit one to a public repository.
      </p>
    </section>

    <section class="content-section">
      <h2>Top endpoints</h2>
      <p>
        These five endpoints cover the most common automation flows. The full surface (analytics, social accounts, media uploads, OAuth state, etc.) is documented in the Swagger UI.
      </p>

      <div v-for="(ep, i) in endpoints" :key="i" class="endpoint-block">
        <div class="endpoint-head">
          <span :class="['method-pill', `method-${ep.method.toLowerCase()}`]">{{ ep.method }}</span>
          <code class="endpoint-path">{{ ep.path }}</code>
        </div>
        <p class="endpoint-summary">{{ ep.summary }}</p>
        <pre class="code-block"><code>{{ ep.curl }}</code></pre>
      </div>
    </section>

    <section class="content-section">
      <h2>Outbound webhooks</h2>
      <p>
        Register a webhook endpoint to receive HMAC-signed event callbacks when posts move through their lifecycle. Posta retries failed deliveries up to 5 times with exponential backoff (30s, 60s, 120s, 240s, 480s).
      </p>
      <p>
        <strong>Event types:</strong>
      </p>
      <ul class="event-list">
        <li><code>post.scheduled</code> — A post was scheduled for a future time.</li>
        <li><code>post.processing</code> — The publisher worker picked up a scheduled post.</li>
        <li><code>post.published</code> — A post completed successfully across all platforms.</li>
        <li><code>post.partially_published</code> — A post succeeded on some platforms and failed on others.</li>
        <li><code>post.failed</code> — A post failed on every platform.</li>
        <li><code>post.result.success</code> — One per-platform result completed successfully.</li>
        <li><code>post.result.failed</code> — One per-platform result failed.</li>
      </ul>
      <p>
        <strong>Example webhook payload:</strong>
      </p>
      <pre class="code-block"><code>{{ webhookPayloadExample }}</code></pre>
      <p>
        Verify the signature by computing <code>HMAC-SHA256(secret, timestamp + "." + body)</code> as a hex digest and comparing it to the <code>X-Posta-Signature</code> header. The <code>timestamp</code> is the value of the <code>X-Posta-Timestamp</code> header (an ISO 8601 datetime string) and <code>body</code> is the raw, byte-for-byte request body — don't re-serialize the JSON before hashing. Reject deliveries whose timestamp is older than your tolerance window (we recommend 5 minutes).
      </p>
    </section>

    <section class="content-section">
      <h2>OpenAPI specification</h2>
      <p>
        The full machine-readable OpenAPI 3.0 spec lives at <a href="/openapi.yaml"><code>https://getposta.app/openapi.yaml</code></a> (mirror) and <a href="https://api.getposta.app/docs/openapi.yaml"><code>https://api.getposta.app/docs/openapi.yaml</code></a> (canonical). Feed it into openapi-generator, Postman, Insomnia, or any tool that consumes OpenAPI to scaffold a client in your language of choice.
      </p>
      <p>
        Browse the interactive documentation at <a href="https://api.getposta.app/docs">api.getposta.app/docs</a> — every endpoint has request/response schemas, examples, and an in-browser "Try it out" form.
      </p>
    </section>

    <section class="content-section">
      <h2>Rate limits</h2>
      <p>
        Auth endpoints: 5 requests per minute per IP. General endpoints: 100 requests per minute per API token. Exceeding either returns <code>429 Too Many Requests</code> with a <code>Retry-After</code> header. We'll raise per-token limits on request if you have a legitimate volume need.
      </p>
    </section>

    <section class="faq-section">
      <h2>API FAQ</h2>
      <div class="faq-list">
        <div v-for="item in apiFaq" :key="item.q" class="faq-item">
          <h3>{{ item.q }}</h3>
          <p>{{ item.a }}</p>
        </div>
      </div>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Start building with the Posta API"
      subtext="14-day free trial, no credit card. Bearer-token API, full OpenAPI spec, and HMAC-signed webhooks on every paid tier."
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
  max-width: 760px;
  line-height: 1.6;
  margin-bottom: 18px;
}

.hero-links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hero-links .btn-primary,
.hero-links .btn-secondary {
  font-size: 13px;
  padding: 10px 16px;
  border-radius: 999px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.hero-links .btn-primary {
  background: var(--accent);
  color: white;
  border: 1px solid var(--accent);
}

.hero-links .btn-secondary {
  background: rgba(15, 23, 42, 0.85);
  color: var(--text);
  border: 1px solid rgba(148, 163, 184, 0.4);
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

.content-section a {
  color: var(--accent-light);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.content-section strong {
  color: var(--text);
  font-weight: 600;
}

.content-section code,
.endpoint-path,
code {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
  font-size: 12px;
  background: rgba(79, 70, 229, 0.15);
  color: #a5b4fc;
  padding: 1px 6px;
  border-radius: 4px;
}

.code-block {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
  font-size: 12px;
  background: rgba(2, 6, 23, 0.85);
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 10px;
  padding: 14px 16px;
  overflow-x: auto;
  margin: 12px 0;
  line-height: 1.55;
  white-space: pre;
}

.code-block code {
  background: transparent;
  color: inherit;
  padding: 0;
  border-radius: 0;
  font-size: inherit;
}

.endpoint-block {
  margin: 18px 0;
  padding: 14px 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.5);
}

.endpoint-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.method-pill {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.method-get {
  background: rgba(34, 197, 94, 0.18);
  color: #86efac;
}

.method-post {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
}

.endpoint-summary {
  font-size: 13px;
  color: var(--muted);
  margin: 4px 0 6px 0;
}

.endpoint-block .code-block {
  margin: 8px 0 0 0;
}

.event-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 14px;
  display: grid;
  gap: 6px;
  max-width: 760px;
}

.event-list li {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.6;
}

.faq-section {
  margin: 48px 0 36px;
}

.faq-section h2 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
}

.faq-list {
  display: grid;
  gap: 18px;
  max-width: 760px;
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
