<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import { useAuthStore } from '@/stores'
import LoginModal from '@/components/LoginModal.vue'
import WaitingListModal from '@/components/WaitingListModal.vue'
import { isSignupEnabled } from '@/config/featureFlags'
import { paymentsService } from '@/services'
import type { WaitingListSource } from '@/services'
import type { PricingPlan, BillingInterval } from '@/types'
import { useScrollReveal } from '@/composables/useScrollReveal'

const { setRef: whyRef, isVisible: whyVisible } = useScrollReveal()
const { setRef: howRef, isVisible: howVisible } = useScrollReveal()
const { setRef: showcaseRef, isVisible: showcaseVisible } = useScrollReveal()
const { setRef: skillRef, isVisible: skillVisible } = useScrollReveal()
const { setRef: openclawRef, isVisible: openclawVisible } = useScrollReveal()
const { setRef: pricingRef, isVisible: pricingVisible } = useScrollReveal()
const { setRef: platformsRef, isVisible: platformsVisible } = useScrollReveal()
const { setRef: faqRef, isVisible: faqVisible } = useScrollReveal()

useHead({
  title: 'Social Media Automation for AI Agents',
  meta: [
    { name: 'description', content: 'Give any AI agent the power to manage social media. Posta lets agents and automations create, schedule, and publish to 8 networks via MCP, a Claude Code skill, an n8n node, and a REST API — with webhooks and auto-formatting built in.' },
    { name: 'keywords', content: 'social media automation, AI agent social media, MCP social media, agent automation, autonomous posting, n8n social media, claude code social media, social media API, multi-platform posting, schedule posts API, post from terminal, webhooks social media' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://getposta.app/' },
    { property: 'og:title', content: 'Posta – Social Media Automation for AI Agents' },
    { property: 'og:description', content: 'Give any AI agent or automation the power to create, schedule, and publish across 8 networks — via MCP, a Claude Code skill, the n8n node, or the REST API. Webhooks and per-platform auto-formatting included.' },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { property: 'og:site_name', content: 'Posta' },
    { property: 'og:locale', content: 'en_US' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:url', content: 'https://getposta.app/' },
    { name: 'twitter:title', content: 'Posta – Social Media Automation for AI Agents' },
    { name: 'twitter:description', content: 'Give any AI agent or automation the power to create, schedule, and publish across 8 networks — via MCP, a Claude Code skill, the n8n node, or the REST API. Webhooks and per-platform auto-formatting included.' },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [
    { rel: 'canonical', href: 'https://getposta.app/' },
    { rel: 'alternate', type: 'application/rss+xml', title: 'Posta Blog', href: 'https://getposta.app/feed.xml' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Who is Posta for?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Posta is for developers, AI agents, automation engineers, and the creators they support — anyone who treats social posting as a pipeline rather than a manual task. Plug Posta into an MCP server, an n8n workflow, a Claude Code skill, or the REST API and let the agent do the rest.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the Posta MCP server?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Posta ships an MCP (Model Context Protocol) server so any MCP-capable client — Claude Desktop, Claude Code, Cursor, or your own agent — can create, schedule, and publish social media posts as tool calls. One install (npx posta-mcp), one token, every supported network.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does Posta work with n8n?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. The n8n-nodes-posta community node turns every Posta endpoint into a typed n8n node. We publish ready-to-fork workflows for blog-to-social, YouTube-to-social, product launch campaigns, and LinkedIn carousel generation — wire any trigger to Posta in a few clicks.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I post to social media from Claude Code or the terminal?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. The Posta Claude Code skill lets you create, schedule, and publish posts straight from your terminal or IDE using natural language. No dashboard required, no context-switch from your editor.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does Posta publish directly to social networks?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Posta publishes directly to LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, Bluesky, and Threads via each platform\'s official API, and fires HMAC-signed webhooks back to your agent when posts go live — so closed-loop pipelines know exactly when they can act on a result.',
            },
          },
          {
            '@type': 'Question',
            name: 'How is this different from Buffer, Hootsuite, or Later?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Those tools are dashboards designed for humans clicking buttons. Posta is API-first and agent-first: full public REST API on every paid tier, HMAC-signed outbound webhooks, an MCP server, a Claude Code skill, and an n8n community node — none of which the dashboard-led incumbents ship.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I influence the roadmap?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Early users help shape integrations, workflow and pricing. Tell us how you work and what your current agent stack looks like when you request access.',
            },
          },
        ],
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to give an AI agent the power to post to social media with Posta',
        description: 'Three steps to wire any AI agent, automation, or pipeline into Posta and publish to nine social networks.',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Connect once',
            text: 'Generate a Posta API token and pick a surface — MCP server (npx posta-mcp), Claude Code skill, n8n community node, or the public REST API. One token, every network, every surface.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Instruct in natural language or code',
            text: 'Your agent calls Posta as a tool: a Claude tool call via MCP, the Claude Code skill in plain English, an n8n node in a workflow, or a typed POST to the REST API. Plain prompts work; structured payloads work; both compose.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Posta executes and reports back',
            text: 'Posta auto-formats the media per platform, publishes or schedules, then fires HMAC-signed webhooks to your agent when the post goes live — closing the loop for autonomous pipelines.',
          },
        ],
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Posta',
        url: 'https://getposta.app/',
        logo: 'https://getposta.app/assets/posta_og_image.png',
        description:
          'Posta is the API-first, agent-first social media platform. MCP server, Claude Code skill, n8n community node, and public REST API for autonomous publishing across nine networks.',
        // Verified entity-association URLs (HEAD-checked before commit). Social
        // profiles (X, Bluesky, LinkedIn) deliberately omitted until the actual
        // handles are confirmed — do NOT fabricate links.
        sameAs: [
          'https://github.com/STGime/posta-mcp',
          'https://github.com/STGime/posta-skill',
          'https://github.com/STGime/n8n-nodes-posta',
          'https://www.npmjs.com/package/posta-mcp',
          'https://www.npmjs.com/package/n8n-nodes-posta',
        ],
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: 'hello@getposta.app',
            availableLanguage: ['English'],
          },
        ],
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Posta',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: 'https://getposta.app/',
        // Verified entity-association URLs (HEAD-checked before commit). Add
        // social profiles (X, Bluesky, LinkedIn) here once handles are
        // confirmed; do NOT fabricate links.
        sameAs: [
          'https://github.com/STGime/posta-mcp',
          'https://github.com/STGime/posta-skill',
          'https://github.com/STGime/n8n-nodes-posta',
          'https://www.npmjs.com/package/posta-mcp',
          'https://www.npmjs.com/package/n8n-nodes-posta',
        ],
        featureList: [
          'Multi-platform social media scheduling (LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, Bluesky, Threads)',
          'Comments inbox for LinkedIn and TikTok with inline reply',
          'Outbound webhook delivery with HMAC signing',
          'Public REST API with OpenAPI specification',
          'CLI posting via Claude Code skill',
          'Face-aware smart cropping',
          'AI-powered image and video generation',
          'Visual content calendar',
          'Analytics dashboard',
          'Terminal and IDE integration',
        ],
        screenshot: [
          'https://getposta.app/assets/images/ui/dashboard.png',
          'https://getposta.app/assets/images/ui/calendar.png',
          'https://getposta.app/assets/images/ui/analytics.png',
          'https://getposta.app/assets/images/ui/accounts.png',
          'https://getposta.app/assets/images/ui/posts.png',
          'https://getposta.app/assets/images/ui/media.png',
        ],
      }),
    },
  ],
})

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentYear = new Date().getFullYear()
const showLoginModal = ref(false)

const signupEnabled = isSignupEnabled()
const showWaitingListModal = ref(false)
const waitingListSource = ref<WaitingListSource>('hero')

// Landing demo video (click-to-play facade so the YouTube iframe isn't loaded
// on first paint / in the SEO prerender).
const videoPlaying = ref(false)

const openWaitingList = (source: WaitingListSource) => {
  waitingListSource.value = source
  showWaitingListModal.value = true
}

// Pricing
const pricingInterval = ref<BillingInterval>('year')
const pricingPlans = ref<Record<string, { monthly: PricingPlan; yearly: PricingPlan }>>({})
const pricingLoading = ref(true)
const pricingError = ref(false)

onMounted(async () => {
  try {
    const data = await paymentsService.getPlans()
    pricingPlans.value = data.plans
  } catch {
    pricingError.value = true
  } finally {
    pricingLoading.value = false
  }
})

const intervalKey = computed(() => pricingInterval.value === 'year' ? 'yearly' : 'monthly')

const starterPlan = computed<PricingPlan | null>(() => {
  return pricingPlans.value.starter?.[intervalKey.value] ?? null
})

const professionalPlan = computed<PricingPlan | null>(() => {
  return pricingPlans.value.professional?.[intervalKey.value] ?? null
})

const formatPricingAmount = (plan: PricingPlan | null) => {
  if (!plan) return ''
  const symbol = plan.currency === 'eur' ? '€' : '$'
  if (plan.billingInterval === 'year') {
    return `${symbol}${Math.round(plan.priceCents / 12 / 100)}`
  }
  return `${symbol}${Math.round(plan.priceCents / 100)}`
}

const isUnlimited = (value: number | null | undefined) => value == null || value >= 100000
const formatLimit = (value: number | null | undefined) => isUnlimited(value) ? 'Unlimited*' : String(value ?? 0)

interface ComparisonRow {
  feature: string
  starter: string | boolean
  professional: string | boolean
}

interface ComparisonCategory {
  name: string
  rows: ComparisonRow[]
}

const comparisonTable = computed<ComparisonCategory[]>(() => {
  const s = starterPlan.value
  const p = professionalPlan.value
  if (!s || !p) return []

  return [
    {
      name: 'Usage Limits',
      rows: [
        { feature: 'Social accounts', starter: formatLimit(s.maxSocialAccounts), professional: formatLimit(p.maxSocialAccounts) },
        { feature: 'Posts per month', starter: formatLimit(s.maxPostsPerMonth), professional: formatLimit(p.maxPostsPerMonth) },
        { feature: 'Scheduled posts', starter: formatLimit(s.maxScheduledPosts), professional: formatLimit(p.maxScheduledPosts) },
      ],
    },
    {
      name: 'Platforms',
      rows: [
        { feature: 'Instagram', starter: true, professional: true },
        { feature: 'TikTok', starter: true, professional: true },
        { feature: 'YouTube', starter: true, professional: true },
        { feature: 'Facebook', starter: true, professional: true },
        { feature: 'LinkedIn', starter: true, professional: true },
        { feature: 'Pinterest', starter: true, professional: true },
        { feature: 'Bluesky', starter: true, professional: true },
        { feature: 'Threads', starter: true, professional: true },
      ],
    },
    {
      name: 'Media Processing',
      rows: [
        { feature: 'Auto-format for every platform', starter: true, professional: true },
        { feature: 'Face-aware cropping', starter: true, professional: true },
        { feature: 'Smart compression', starter: true, professional: true },
        { feature: 'Video processing', starter: true, professional: true },
        { feature: 'LinkedIn carousel maker (text-over-image PDF)', starter: false, professional: true },
      ],
    },
    {
      name: 'Scheduling',
      rows: [
        { feature: 'Calendar view', starter: true, professional: true },
        { feature: 'Timezone-safe scheduling', starter: true, professional: true },
      ],
    },
    {
      name: 'Analytics',
      rows: [
        { feature: 'Overview & engagement trends', starter: '90 days', professional: '1 year' },
        { feature: 'Per-post analytics', starter: true, professional: true },
        { feature: 'Platform performance breakdown', starter: true, professional: true },
        { feature: 'Best time to post', starter: true, professional: true },
        { feature: 'Content type breakdown', starter: true, professional: true },
        { feature: 'Manual refresh', starter: true, professional: true },
        { feature: 'Hashtag performance', starter: false, professional: true },
        { feature: 'Custom date ranges', starter: false, professional: true },
        { feature: 'Post comparison', starter: false, professional: true },
        { feature: 'Engagement benchmarks', starter: false, professional: true },
        { feature: 'CSV & PDF export', starter: false, professional: true },
      ],
    },
    {
      name: 'Support',
      rows: [
        { feature: 'Email support', starter: true, professional: true },
        { feature: 'Priority support', starter: false, professional: true },
      ],
    },
  ]
})
</script>

<template>
  <div class="page">
    <div class="wrapper">
      <!-- Header -->
      <header class="header">
        <div class="logo">
          <div class="logo-mark">
            <div class="logo-inner">P</div>
          </div>
          <div>
            <div class="logo-text">Posta</div>
            <div class="logo-tagline">Social media for agents and automation.</div>
          </div>
        </div>
        <div class="header-actions">
          <RouterLink to="/agents" class="nav-link">Agents</RouterLink>
          <RouterLink to="/workflows" class="nav-link">Workflows</RouterLink>
          <RouterLink to="/developers" class="nav-link">Developers</RouterLink>
          <RouterLink to="/blog" class="nav-link">Blog</RouterLink>
          <template v-if="!isAuthenticated">
            <button class="btn-login" @click="showLoginModal = true">
              Log in
            </button>
            <RouterLink v-if="signupEnabled" to="/signup" class="btn-primary btn-header">
              Sign up free
            </RouterLink>
            <button v-else class="btn-primary btn-header" @click="openWaitingList('header')">
              Join waiting list
            </button>
          </template>
          <RouterLink v-else to="/app" class="btn-primary btn-header">
            Dashboard
          </RouterLink>
        </div>
      </header>

      <main>
        <!-- Hero Section -->
        <section class="hero">
          <div class="hero-content">
            <div class="eyebrow">
              <span class="eyebrow-pill">For agents &amp; automation</span>
              <span>MCP · Claude Code · n8n · REST API</span>
            </div>
            <h1>
              Social media automation for <span class="gradient-text">your agents</span>.
            </h1>
            <p class="hero-sub">
              Give any AI agent or automation the power to run your social media. Posta lets agents create, schedule, and publish across LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, Bluesky, and Threads — through an MCP server, a Claude Code skill, the n8n node, or a public REST API. Media auto-formats per platform and webhooks report back when posts go live.
            </p>

            <div class="hero-bullets">
              <div class="chip">
                <span class="chip-dot"></span>
                MCP server — Claude Desktop, Cursor, Zed
              </div>
              <div class="chip">
                Claude Code skill — post from your terminal
              </div>
              <div class="chip">
                n8n community node — drag-and-drop automation
              </div>
              <div class="chip">
                REST API &amp; webhooks on every plan
              </div>
            </div>

            <div class="hero-actions">
              <RouterLink v-if="signupEnabled" to="/signup" class="btn-primary btn-primary-hero">
                <span>Start your 14-day free trial</span>
                <span class="arrow">→</span>
              </RouterLink>
              <button v-else class="btn-primary btn-primary-hero" @click="openWaitingList('hero')">
                <span>Join waiting list</span>
                <span class="arrow">→</span>
              </button>
              <a href="#api" class="btn-ghost">
                See how agents use it
              </a>
            </div>
            <p class="small-note">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 4px; opacity: 0.7;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>No credit card required · 14-day free trial · Cancel anytime
            </p>
          </div>

          <div class="hero-card-wrapper">
            <div class="card">
              <div class="card-header">
                <div>
                  <div class="card-label">Your agent · one instruction</div>
                  <div class="card-title">“Post our launch everywhere”</div>
                </div>
                <span class="pill-green">Agent-driven</span>
              </div>

              <div class="agent-steps">
                <div class="agent-step"><span class="agent-check">✓</span> 8 posts drafted across every network</div>
                <div class="agent-step"><span class="agent-check">✓</span> Media auto-formatted per platform</div>
                <div class="agent-step"><span class="agent-check">✓</span> Scheduled — webhook fires on publish</div>
              </div>

              <div class="agent-snippet">
                <span class="agent-snippet-line"><span class="tok-method">POST</span> /v1/posts</span>
                <span class="agent-snippet-line tok-muted">{ "caption": "...", "socialAccountIds": [...],</span>
                <span class="agent-snippet-line tok-muted">&nbsp;&nbsp;"mediaIds": ["..."], "scheduledAt": "..." }</span>
                <span class="agent-snippet-line"><span class="tok-ok">201</span> Created · 8 posts queued</span>
              </div>
            </div>

            <div class="badge-stack">
              <div class="badge">
                <span class="badge-dot-purple"></span>
                <span>Driven by MCP, n8n &amp; REST</span>
              </div>
              <div class="badge">
                <span class="badge-dot-cyan"></span>
                <span>Webhooks on every publish</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Demo Video Section -->
        <section class="video-section" id="demo">
          <h2 class="video-heading">Set up Posta with Claude Code in minutes</h2>
          <p class="video-sub">Watch the full walkthrough — connect your account, add your API token, and create your first post.</p>
          <div class="video-frame">
            <iframe
              v-if="videoPlaying"
              src="https://www.youtube.com/embed/CBG0qdnFxl4?autoplay=1&rel=0&modestbranding=1"
              title="Set up Posta with Claude Code"
              loading="lazy"
              referrerpolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
            <button
              v-else
              type="button"
              class="video-facade"
              aria-label="Play video: set up Posta with Claude Code"
              @click="videoPlaying = true"
            >
              <img
                src="https://i.ytimg.com/vi/CBG0qdnFxl4/sddefault.jpg"
                alt="Posta + Claude Code walkthrough"
                loading="lazy"
                width="640"
                height="480"
                @error="(e) => ((e.target as HTMLImageElement).src = 'https://i.ytimg.com/vi/CBG0qdnFxl4/hqdefault.jpg')"
              />
              <span class="video-play" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </span>
            </button>
          </div>
          <p class="video-fallback">
            Trouble playing?
            <a href="https://www.youtube.com/watch?v=CBG0qdnFxl4" target="_blank" rel="noopener">Watch on YouTube →</a>
          </p>
        </section>

        <!-- OpenClaw & API Section -->
        <section :ref="openclawRef" class="section" id="api">
          <h2 :class="openclawVisible ? 'section-title animate-fade-in-up' : 'section-title opacity-0'">Built for agents & automation</h2>
          <p :class="openclawVisible ? 'section-sub animate-fade-in-up stagger-1' : 'section-sub opacity-0'">
            Posta is the <RouterLink to="/agentic-social-media-scheduler">agentic social media scheduler</RouterLink> — API-first, so your agents run the whole loop (generate, schedule, publish, report back) programmatically. Looking for the full <RouterLink to="/social-media-scheduler">social media scheduler</RouterLink> overview? Start there.
          </p>

          <div :class="openclawVisible ? 'usecase-grid animate-fade-in-up stagger-1' : 'usecase-grid opacity-0'">
            <div class="usecase-card">
              <div class="usecase-title">Autonomous content pipeline</div>
              <div class="usecase-body">Watch an RSS or blog feed, draft a post with an LLM, and schedule it — hands-off. <RouterLink to="/workflows/blog-to-social-media">See the n8n workflow →</RouterLink></div>
            </div>
            <div class="usecase-card">
              <div class="usecase-title">Launch agent</div>
              <div class="usecase-body">One instruction turns a product into a multi-day, multi-platform campaign with per-network copy. <RouterLink to="/workflows/product-launch-campaign">See the n8n workflow →</RouterLink></div>
            </div>
            <div class="usecase-card">
              <div class="usecase-title">Repurposing agent</div>
              <div class="usecase-body">Feed in one asset (or a YouTube video) and let the agent fan it out to Reels, Shorts, TikTok, and feeds. <RouterLink to="/workflows/youtube-to-social-media">See the n8n workflow →</RouterLink></div>
            </div>
            <div class="usecase-card">
              <div class="usecase-title">Carousel generator</div>
              <div class="usecase-body">Summarize an article into a polished LinkedIn carousel PDF — AI text over AI backgrounds, assembled by Posta. <RouterLink to="/workflows/blog-to-linkedin-carousel">See the n8n workflow →</RouterLink></div>
            </div>
            <div class="usecase-card">
              <div class="usecase-title">Monitor &amp; respond</div>
              <div class="usecase-body">Pull comments via the API and react to publish/fail events with outbound webhooks — build a closed-loop social agent.</div>
            </div>
            <div class="usecase-card">
              <div class="usecase-title">Agency at scale</div>
              <div class="usecase-body">Drive dozens of connected accounts from one codebase or n8n flow — consistent scheduling, zero tab-switching.</div>
            </div>
          </div>

          <div :class="openclawVisible ? 'api-cards animate-fade-in-up stagger-2' : 'api-cards opacity-0'">
            <a href="https://clawhub.ai/STGime/posta" target="_blank" rel="noopener noreferrer" class="api-card api-card-openclaw">
              <div class="api-card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              </div>
              <div class="api-card-content">
                <div class="api-card-label">OpenClaw</div>
                <div class="api-card-title">Posta on ClawHub</div>
                <div class="api-card-body">Install the Posta skill on ClawHub and run it from any OpenClaw agent — generate content and post from your terminal. One-click install, zero config.</div>
              </div>
              <span class="api-card-arrow">→</span>
            </a>

            <a href="https://github.com/STGime/posta-skill" target="_blank" rel="noopener noreferrer" class="api-card api-card-claude">
              <div class="api-card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
              </div>
              <div class="api-card-content">
                <div class="api-card-label">Claude Code</div>
                <div class="api-card-title">Claude Code skill</div>
                <div class="api-card-body">Add the Posta skill to Claude Code — generate content and post straight from your editor or terminal. Installs from the GitHub repo.</div>
              </div>
              <span class="api-card-arrow">→</span>
            </a>

            <a href="https://www.npmjs.com/package/posta-mcp" target="_blank" rel="noopener noreferrer" class="api-card api-card-mcp">
              <div class="api-card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
              </div>
              <div class="api-card-content">
                <div class="api-card-label">MCP</div>
                <div class="api-card-title">MCP server</div>
                <div class="api-card-body">One npm install adds Posta's tools to Claude Desktop, Cursor, Windsurf, VS Code, and Zed — schedule and publish from any MCP client.</div>
              </div>
              <span class="api-card-arrow">→</span>
            </a>

            <a href="https://www.npmjs.com/package/n8n-nodes-posta" target="_blank" rel="noopener noreferrer" class="api-card api-card-n8n">
              <div class="api-card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <div class="api-card-content">
                <div class="api-card-label">n8n</div>
                <div class="api-card-title">n8n community node</div>
                <div class="api-card-body">Drag-and-drop Posta into any n8n workflow. Create posts, upload media, and check analytics — no code required.</div>
              </div>
              <span class="api-card-arrow">→</span>
            </a>

            <a href="https://api.getposta.app/docs" target="_blank" rel="noopener noreferrer" class="api-card api-card-docs">
              <div class="api-card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <div class="api-card-content">
                <div class="api-card-label">REST API</div>
                <div class="api-card-title">API documentation</div>
                <div class="api-card-body">Full REST API with token auth, webhooks, and OpenAPI spec. Create posts, manage accounts, and track analytics from your own code.</div>
              </div>
              <span class="api-card-arrow">→</span>
            </a>
          </div>

          <div :class="openclawVisible ? 'api-features animate-fade-in-up stagger-3' : 'api-features opacity-0'">
            <div class="api-feature">
              <div class="api-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              </div>
              <div class="api-feature-text">
                <strong>Outbound webhooks</strong>
                <span>Get notified when posts publish, fail, or change status</span>
              </div>
            </div>
            <div class="api-feature">
              <div class="api-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div class="api-feature-text">
                <strong>Token authentication</strong>
                <span>Secure API tokens with granular scoping</span>
              </div>
            </div>
            <div class="api-feature">
              <div class="api-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              </div>
              <div class="api-feature-text">
                <strong>OpenAPI spec</strong>
                <span>Auto-generate clients in any language</span>
              </div>
            </div>
          </div>

          <div :class="openclawVisible ? 'api-cta animate-fade-in-up stagger-4' : 'api-cta opacity-0'">
            <a href="https://api.getposta.app/docs" target="_blank" rel="noopener noreferrer" class="btn-primary">
              <span>Explore API docs</span>
              <span class="arrow">→</span>
            </a>
            <a href="https://clawhub.ai/STGime/posta" target="_blank" rel="noopener noreferrer" class="btn-ghost">
              <span>Install on ClawHub</span>
              <span class="arrow">→</span>
            </a>
            <a href="https://github.com/STGime/posta-skill" target="_blank" rel="noopener noreferrer" class="btn-ghost">
              <span>Get it for Claude Code</span>
              <span class="arrow">→</span>
            </a>
          </div>
        </section>

        <!-- Posta Skill Section -->
        <section :ref="skillRef" class="section" id="skill">
          <h2 :class="skillVisible ? 'section-title animate-fade-in-up' : 'section-title opacity-0'">Post from your terminal</h2>
          <p :class="skillVisible ? 'section-sub animate-fade-in-up stagger-1' : 'section-sub opacity-0'">
            The terminal is one of many agent surfaces. Posta's Claude Code skill turns your IDE into a social media command center — create, schedule, and publish without ever leaving your editor, or hand the same skill to an autonomous agent.
          </p>

          <div :class="skillVisible ? 'skill-terminal animate-fade-in-up stagger-2' : 'skill-terminal opacity-0'">
            <div class="skill-terminal-header">
              <div class="skill-terminal-dots">
                <span class="skill-dot skill-dot-red"></span>
                <span class="skill-dot skill-dot-yellow"></span>
                <span class="skill-dot skill-dot-green"></span>
              </div>
              <span class="skill-terminal-title">claude</span>
            </div>
            <div class="skill-terminal-body">
              <div class="skill-line skill-line-prompt"><span class="skill-prompt-icon">&gt;</span> Show my connected accounts</div>
              <div class="skill-line skill-line-response"><span class="skill-check">&#10003;</span> 8 active accounts: Instagram, TikTok, LinkedIn, YouTube, Facebook, Pinterest, Bluesky, Threads</div>
              <div class="skill-line skill-line-spacer"></div>
              <div class="skill-line skill-line-prompt"><span class="skill-prompt-icon">&gt;</span> Generate an image and schedule a LinkedIn post for 3pm</div>
              <div class="skill-line skill-line-response"><span class="skill-check">&#10003;</span> Image generated with AI</div>
              <div class="skill-line skill-line-response"><span class="skill-check">&#10003;</span> Draft created — "I posted this from VS Code..."</div>
              <div class="skill-line skill-line-response"><span class="skill-check">&#10003;</span> Scheduled for today at 15:00 CET</div>
              <div class="skill-line skill-line-spacer"></div>
              <div class="skill-line skill-line-prompt"><span class="skill-prompt-icon">&gt;</span> How did my last 5 posts perform?</div>
              <div class="skill-line skill-line-response"><span class="skill-check">&#10003;</span> Avg. engagement: 4.2% · Best: LinkedIn carousel (8.1%) · Trend: ↑ 12% vs. prior week</div>
            </div>
          </div>

          <div :class="skillVisible ? 'skill-features animate-fade-in-up stagger-3' : 'skill-features opacity-0'">
            <div class="skill-feature-card">
              <div class="skill-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <div class="skill-feature-title">AI content generation</div>
              <div class="skill-feature-body">Generate images and captions without leaving your editor. AI handles the creative work while you stay in flow.</div>
            </div>
            <div class="skill-feature-card">
              <div class="skill-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/></svg>
              </div>
              <div class="skill-feature-title">Schedule & publish</div>
              <div class="skill-feature-body">Create, schedule and post across 8 platforms from the terminal. One prompt replaces an entire dashboard session.</div>
            </div>
            <div class="skill-feature-card">
              <div class="skill-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div class="skill-feature-title">Analytics at a glance</div>
              <div class="skill-feature-body">Check engagement, best times and trends with a single prompt. No dashboards, no tab-switching — just answers.</div>
            </div>
          </div>

          <div :class="skillVisible ? 'skill-cta animate-fade-in-up stagger-4' : 'skill-cta opacity-0'">
            <a href="https://github.com/STGime/posta-skill" target="_blank" rel="noopener noreferrer" class="btn-ghost">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
              <span>View on GitHub</span>
            </a>
            <RouterLink v-if="signupEnabled" to="/signup" class="btn-primary">
              <span>Try free for 14 days</span>
              <span class="arrow">→</span>
            </RouterLink>
            <button v-else class="btn-primary" @click="openWaitingList('skill')">
              <span>Try free for 14 days</span>
              <span class="arrow">→</span>
            </button>
          </div>
        </section>

        <!-- Why Posta Section -->
        <section :ref="whyRef" class="section" id="features">
          <h2 :class="whyVisible ? 'section-title animate-fade-in-up' : 'section-title opacity-0'">Why agents choose Posta</h2>
          <p :class="whyVisible ? 'section-sub animate-fade-in-up stagger-1' : 'section-sub opacity-0'">
            Other social tools were built for humans clicking buttons. Posta is API-first, agent-first, and built for the
            class of automation that ships hundreds of posts a week — auto-formatting, closed-loop webhooks, and one
            token for every network.
          </p>

          <div class="feature-grid">
            <div :class="whyVisible ? 'feature-card feature-card-with-image animate-fade-in-up stagger-2' : 'feature-card feature-card-with-image opacity-0'">
              <div class="feature-tag">Autonomous pipelines</div>
              <div class="feature-title">No human in the loop, no broken crops</div>
              <div class="feature-body">
                Your agent never has to reframe media. Posta detects faces in photos and videos and keeps them in
                frame when converting to portrait, landscape, or square — automatically, on every upload. No hand-off,
                no manual review step.
              </div>
              <img src="/assets/images/Smart crop.png" alt="Smart crop example" class="feature-image" />
            </div>
            <div :class="whyVisible ? 'feature-card feature-card-with-image animate-fade-in-up stagger-3' : 'feature-card feature-card-with-image opacity-0'">
              <div class="feature-tag">One API, every network</div>
              <div class="feature-title">One call, nine networks, every format</div>
              <div class="feature-body">
                One <code>POST /v1/posts</code>, one MCP tool call, or one n8n node — Posta generates the variants for
                TikTok, Instagram, YouTube Shorts and more. Your pipeline never exports eight versions by hand.
              </div>
              <div class="platform-previews">
                <div class="platform-preview tiktok-preview">
                  <img src="/assets/images/city.png" alt="TikTok format" />
                  <div class="platform-overlay">
                    <div class="tiktok-ui">
                      <div class="tiktok-side">
                        <div class="tiktok-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div>
                        <div class="tiktok-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/></svg></div>
                        <div class="tiktok-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg></div>
                      </div>
                      <div class="tiktok-bottom">
                        <div class="tiktok-user">@posta</div>
                        <div class="tiktok-desc">City vibes</div>
                      </div>
                    </div>
                  </div>
                  <div class="platform-label">TikTok</div>
                </div>
                <div class="platform-preview instagram-preview">
                  <img src="/assets/images/city.png" alt="Instagram format" />
                  <div class="platform-overlay">
                    <div class="instagram-ui">
                      <div class="instagram-header">
                        <div class="instagram-avatar"></div>
                        <span>posta</span>
                      </div>
                      <div class="instagram-actions">
                        <div class="instagram-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
                        <div class="instagram-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></div>
                        <div class="instagram-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg></div>
                      </div>
                    </div>
                  </div>
                  <div class="platform-label">Instagram</div>
                </div>
                <div class="platform-preview youtube-preview">
                  <img src="/assets/images/city.png" alt="YouTube format" />
                  <div class="platform-overlay">
                    <div class="youtube-ui">
                      <div class="youtube-play">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                      <div class="youtube-progress">
                        <div class="youtube-progress-fill"></div>
                      </div>
                      <div class="youtube-bottom">
                        <span class="youtube-time">0:15</span>
                        <span class="youtube-shorts">#Shorts</span>
                      </div>
                    </div>
                  </div>
                  <div class="platform-label">YouTube</div>
                </div>
              </div>
            </div>
            <div :class="whyVisible ? 'feature-card feature-card-with-image animate-fade-in-up stagger-4' : 'feature-card feature-card-with-image opacity-0'">
              <div class="feature-tag">Closed-loop with webhooks</div>
              <div class="feature-title">Built for high-volume pipelines</div>
              <div class="feature-body">
                Compression keeps quality where it matters and saves bytes where it doesn't — so automated, high-volume
                posting uploads fast and stays reliable. When a post goes live, an HMAC-signed webhook fires back to your
                agent so the next step knows it can run.
              </div>
              <div class="compression-demo">
                <div class="compression-item">
                  <img src="/assets/images/dog.png" alt="Original" />
                  <div class="compression-size original">1.4 MB</div>
                </div>
                <div class="compression-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                  <div class="compression-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2 6h-2v2h-2v-2h-2v-2h2v-2h2v2h2v2z"/>
                    </svg>
                  </div>
                  <span class="compression-label">-87%</span>
                </div>
                <div class="compression-item">
                  <img src="/assets/images/dog.png" alt="Compressed" />
                  <div class="compression-size compressed">182 KB</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- How it Works Section -->
        <section :ref="howRef" class="section" id="how">
          <h2 :class="howVisible ? 'section-title animate-fade-in-up' : 'section-title opacity-0'">How agents use Posta</h2>
          <p :class="howVisible ? 'section-sub animate-fade-in-up stagger-1' : 'section-sub opacity-0'">
            Posta is API-first and agent-first. Wire it into whatever your stack already speaks — MCP, Claude Code, n8n,
            or plain HTTP — and let the agent run the loop.
          </p>

          <div class="how-grid">
            <div :class="howVisible ? 'step-card animate-fade-in-up stagger-2' : 'step-card opacity-0'">
              <div class="step-num">Step 1</div>
              <div class="step-title">Connect once</div>
              <div class="step-body">
                Generate a Posta API token, then pick a surface. One token, every network, every surface.
              </div>
              <pre class="step-code"><code>$ npx posta-mcp install</code></pre>
              <div class="pill-row">
                <span class="pill">MCP server</span>
                <span class="pill">Claude Code skill</span>
                <span class="pill">n8n node</span>
                <span class="pill">REST API</span>
              </div>
            </div>
            <div :class="howVisible ? 'step-card animate-fade-in-up stagger-3' : 'step-card opacity-0'">
              <div class="step-num">Step 2</div>
              <div class="step-title">Instruct in natural language or code</div>
              <div class="step-body">
                Your agent calls Posta as a tool. A Claude tool call via MCP, the Claude Code skill in plain English, an
                n8n node, or a typed POST — same Posta on the other side.
              </div>
              <pre class="step-code"><code>"Schedule a launch announcement to LinkedIn
and Bluesky for tomorrow at 9am."</code></pre>
              <div class="pill-row">
                <span class="pill">Prompt</span>
                <span class="pill">Tool call</span>
                <span class="pill">JSON payload</span>
              </div>
            </div>
            <div :class="howVisible ? 'step-card animate-fade-in-up stagger-4' : 'step-card opacity-0'">
              <div class="step-num">Step 3</div>
              <div class="step-title">Posta executes and reports back</div>
              <div class="step-body">
                Posta auto-formats the media per platform, schedules or publishes, and fires HMAC-signed webhooks back
                to your agent when the post goes live. Closed-loop, hands-off.
              </div>
              <pre class="step-code"><code>POST {your-webhook}
{ "event": "post.published",
  "platform": "linkedin",
  "platformPostUrl": "..." }</code></pre>
              <div class="pill-row">
                <span class="pill">HMAC-signed</span>
                <span class="pill">Retries with backoff</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Product Showcase Section -->
        <section :ref="showcaseRef" class="section" id="showcase">
          <h2 :class="showcaseVisible ? 'section-title animate-fade-in-up' : 'section-title opacity-0'">See Posta in action</h2>
          <p :class="showcaseVisible ? 'section-sub animate-fade-in-up stagger-1' : 'section-sub opacity-0'">
            A clean, focused interface designed for speed. Here's what you'll be working with every day.
          </p>

          <div class="showcase-list">
            <div :class="showcaseVisible ? 'showcase-item animate-fade-in-up stagger-2' : 'showcase-item opacity-0'">
              <div class="showcase-image-wrapper">
                <img src="/assets/images/ui/dashboard.png" alt="Posta dashboard showing scheduled posts and account health" loading="lazy" class="showcase-image" />
              </div>
              <div class="showcase-text">
                <h3 class="showcase-heading">Your command center</h3>
                <p class="showcase-desc">
                  Overview of scheduled posts, account health and your upcoming queue – all in one place. Know exactly what's going out and when.
                </p>
              </div>
            </div>

            <div :class="showcaseVisible ? 'showcase-item showcase-item-reverse animate-fade-in-up stagger-3' : 'showcase-item showcase-item-reverse opacity-0'">
              <div class="showcase-image-wrapper">
                <img src="/assets/images/ui/calendar.png" alt="Visual content calendar with drag-and-drop scheduling" loading="lazy" class="showcase-image" />
              </div>
              <div class="showcase-text">
                <h3 class="showcase-heading">Visual content calendar</h3>
                <p class="showcase-desc">
                  See your week or month at a glance and schedule posts right from the calendar. Plan your content rhythm without spreadsheets.
                </p>
              </div>
            </div>

            <div :class="showcaseVisible ? 'showcase-item animate-fade-in-up stagger-4' : 'showcase-item opacity-0'">
              <div class="showcase-image-wrapper">
                <img src="/assets/images/ui/analytics.png" alt="Analytics dashboard tracking engagement and growth" loading="lazy" class="showcase-image" />
              </div>
              <div class="showcase-text">
                <h3 class="showcase-heading">Know what works</h3>
                <p class="showcase-desc">
                  Track engagement, reach and growth across all your platforms. Spot trends and double down on what your audience responds to.
                </p>
              </div>
            </div>

            <div :class="showcaseVisible ? 'showcase-item showcase-item-reverse animate-fade-in-up stagger-5' : 'showcase-item showcase-item-reverse opacity-0'">
              <div class="showcase-image-wrapper">
                <img src="/assets/images/ui/accounts.png" alt="Connected social accounts management view" loading="lazy" class="showcase-image" />
              </div>
              <div class="showcase-text">
                <h3 class="showcase-heading">All accounts, one place</h3>
                <p class="showcase-desc">
                  Connect and manage all your social profiles from a single dashboard. No more juggling between apps.
                </p>
              </div>
            </div>

            <div :class="showcaseVisible ? 'showcase-item animate-fade-in-up stagger-6' : 'showcase-item opacity-0'">
              <div class="showcase-image-wrapper">
                <img src="/assets/images/ui/posts.png" alt="Post management view with status tracking" loading="lazy" class="showcase-image" />
              </div>
              <div class="showcase-text">
                <h3 class="showcase-heading">Track every post</h3>
                <p class="showcase-desc">
                  See all your posts in one feed — drafts, scheduled and published. Filter by platform, status or date to find exactly what you need.
                </p>
              </div>
            </div>

            <div :class="showcaseVisible ? 'showcase-item showcase-item-reverse animate-fade-in-up stagger-7' : 'showcase-item showcase-item-reverse opacity-0'">
              <div class="showcase-image-wrapper">
                <img src="/assets/images/ui/media.png" alt="Media library with smart processing" loading="lazy" class="showcase-image" />
              </div>
              <div class="showcase-text">
                <h3 class="showcase-heading">Your media library</h3>
                <p class="showcase-desc">
                  Every image and video you upload lives in one organized library. Smart compression and face-aware cropping happen automatically.
                </p>
              </div>
            </div>
          </div>

          <div :class="showcaseVisible ? 'showcase-cta animate-fade-in-up' : 'showcase-cta opacity-0'">
            <RouterLink v-if="signupEnabled" to="/signup" class="btn-primary">
              <span>Start your 14-day free trial</span>
              <span class="arrow">→</span>
            </RouterLink>
            <button v-else class="btn-primary" @click="openWaitingList('showcase')">
              <span>Start posting smarter</span>
              <span class="arrow">→</span>
            </button>
            <a href="#pricing" class="btn-ghost">See pricing</a>
            <p class="cta-trust-note">No credit card required</p>
          </div>
        </section>

        <!-- Pricing Section -->
        <section :ref="pricingRef" class="section" id="pricing">
          <h2 :class="pricingVisible ? 'section-title animate-fade-in-up' : 'section-title opacity-0'">Simple, predictable pricing</h2>
          <p :class="pricingVisible ? 'section-sub animate-fade-in-up stagger-1' : 'section-sub opacity-0'">
            No bloated dashboards, no agency-level pricing. Pick a plan that fits your workflow and scale when you need to.
          </p>

          <!-- Billing Toggle -->
          <div class="pricing-toggle-wrapper">
            <div class="pricing-toggle">
              <button
                :class="['pricing-toggle-btn', { active: pricingInterval === 'month' }]"
                @click="pricingInterval = 'month'"
              >
                Monthly
              </button>
              <button
                :class="['pricing-toggle-btn', { active: pricingInterval === 'year' }]"
                @click="pricingInterval = 'year'"
              >
                Yearly
                <span class="pricing-save-badge">Save 20%</span>
              </button>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="pricingLoading" class="pricing-loading">
            <div class="pricing-spinner"></div>
          </div>

          <!-- Error -->
          <div v-else-if="pricingError" class="pricing-error">
            <p>Unable to load plans. Please try again later.</p>
          </div>

          <!-- Plan Cards -->
          <div v-else class="pricing-cards">
            <!-- Starter -->
            <div v-if="starterPlan" class="pricing-card">
              <div class="pricing-trial-badge">14 days free</div>
              <div class="pricing-card-header">
                <h3 class="pricing-card-name">Starter</h3>
                <p class="pricing-card-desc">For solo creators getting started with multi-platform publishing.</p>
              </div>
              <div class="pricing-card-price">
                <span class="pricing-amount">{{ formatPricingAmount(starterPlan) }}</span>
                <span class="pricing-period">/mo</span>
              </div>
              <p v-if="pricingInterval === 'year'" class="pricing-billed-note">
                billed yearly
              </p>
              <div class="pricing-card-limits">
                <div class="pricing-limit-row">
                  <span class="pricing-limit-value">{{ formatLimit(starterPlan.maxSocialAccounts) }}</span>
                  <span class="pricing-limit-label">social accounts</span>
                </div>
                <div class="pricing-limit-row">
                  <span class="pricing-limit-value">{{ formatLimit(starterPlan.maxPostsPerMonth) }}</span>
                  <span class="pricing-limit-label">posts / month</span>
                </div>
                <div class="pricing-limit-row">
                  <span class="pricing-limit-value">{{ formatLimit(starterPlan.maxScheduledPosts) }}</span>
                  <span class="pricing-limit-label">scheduled posts</span>
                </div>
              </div>
              <ul class="pricing-card-features">
                <li v-for="feature in starterPlan.features" :key="feature">
                  <svg class="pricing-check" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  {{ feature }}
                </li>
              </ul>
              <RouterLink v-if="signupEnabled" to="/signup" class="btn-primary pricing-cta">
                Start 14-day free trial
                <span class="arrow">→</span>
              </RouterLink>
              <button v-else class="btn-ghost pricing-cta" @click="openWaitingList('pricing')">
                Join waiting list
                <span class="arrow">→</span>
              </button>
              <p class="cta-trust-note">No credit card required</p>
            </div>

            <!-- Professional -->
            <div v-if="professionalPlan" class="pricing-card pricing-card-featured">
              <div class="pricing-popular-badge">Most Popular</div>
              <div class="pricing-trial-badge pricing-trial-badge-right">14 days free</div>
              <div class="pricing-card-header">
                <h3 class="pricing-card-name">Professional</h3>
                <p class="pricing-card-desc">For teams and serious creators who need advanced features and higher limits.</p>
              </div>
              <div class="pricing-card-price">
                <span class="pricing-amount">{{ formatPricingAmount(professionalPlan) }}</span>
                <span class="pricing-period">/mo</span>
              </div>
              <p v-if="pricingInterval === 'year'" class="pricing-billed-note">
                billed yearly
              </p>
              <div class="pricing-card-limits">
                <div class="pricing-limit-row">
                  <span class="pricing-limit-value">{{ formatLimit(professionalPlan.maxSocialAccounts) }}</span>
                  <span class="pricing-limit-label">social accounts</span>
                </div>
                <div class="pricing-limit-row">
                  <span class="pricing-limit-value">{{ formatLimit(professionalPlan.maxPostsPerMonth) }}</span>
                  <span class="pricing-limit-label">posts / month</span>
                </div>
                <div class="pricing-limit-row">
                  <span class="pricing-limit-value">{{ formatLimit(professionalPlan.maxScheduledPosts) }}</span>
                  <span class="pricing-limit-label">scheduled posts</span>
                </div>
              </div>
              <ul class="pricing-card-features">
                <li v-for="feature in professionalPlan.features" :key="feature">
                  <svg class="pricing-check" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  {{ feature }}
                </li>
              </ul>
              <RouterLink v-if="signupEnabled" to="/signup" class="btn-primary pricing-cta">
                Start 14-day free trial
                <span class="arrow">→</span>
              </RouterLink>
              <button v-else class="btn-primary pricing-cta" @click="openWaitingList('pricing')">
                Join waiting list
                <span class="arrow">→</span>
              </button>
              <p class="cta-trust-note">No credit card required</p>
            </div>
          </div>

          <!-- Comparison Table -->
          <div v-if="!pricingLoading && !pricingError && comparisonTable.length > 0" class="comparison-wrapper">
            <h3 class="comparison-title">Compare plans</h3>
            <div class="comparison-scroll">
              <table class="comparison-table">
                <thead>
                  <tr>
                    <th class="comparison-feature-col">Feature</th>
                    <th class="comparison-plan-col">Starter</th>
                    <th class="comparison-plan-col comparison-pro-col">Professional</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="category in comparisonTable" :key="category.name">
                    <tr class="comparison-category-row">
                      <td colspan="3">{{ category.name }}</td>
                    </tr>
                    <tr v-for="row in category.rows" :key="row.feature" class="comparison-row">
                      <td class="comparison-feature-cell">{{ row.feature }}</td>
                      <td class="comparison-value-cell">
                        <svg v-if="row.starter === true" class="comparison-check" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                        <span v-else-if="row.starter === false" class="comparison-dash">—</span>
                        <span v-else class="comparison-text">{{ row.starter }}</span>
                      </td>
                      <td class="comparison-value-cell comparison-pro-col">
                        <svg v-if="row.professional === true" class="comparison-check" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                        <span v-else-if="row.professional === false" class="comparison-dash">—</span>
                        <span v-else class="comparison-text">{{ row.professional }}</span>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>

          <p class="pricing-footnote">* Unlimited is subject to our <a href="/terms" class="pricing-footnote-link">fair use policy</a>. Plans are designed for normal business usage and are not intended for automated bulk operations or abuse.</p>
        </section>

        <!-- Platforms Section -->
        <section :ref="platformsRef" class="section" id="platforms">
          <h2 :class="platformsVisible ? 'section-title animate-fade-in-up' : 'section-title opacity-0'">Supported platforms & formats</h2>
          <p :class="platformsVisible ? 'section-sub animate-fade-in-up stagger-1' : 'section-sub opacity-0'">
            Posta automatically optimizes your content for each platform's requirements. One upload, perfect exports for every destination.
          </p>

          <div class="platform-grid">
            <div class="platform-card">
              <div class="platform-header">
                <span class="platform-icon instagram">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </span>
                <span class="platform-name">Instagram</span>
              </div>
              <div class="platform-formats">
                <div class="format-item"><span class="format-label">Feed</span><span class="format-size">1080×1080</span></div>
                <div class="format-item"><span class="format-label">Portrait</span><span class="format-size">1080×1350</span></div>
                <div class="format-item"><span class="format-label">Reels</span><span class="format-size">1080×1920</span></div>
                <div class="format-item"><span class="format-label">Stories</span><span class="format-size">1080×1920</span></div>
              </div>
            </div>

            <div class="platform-card">
              <div class="platform-header">
                <span class="platform-icon tiktok">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>
                </span>
                <span class="platform-name">TikTok</span>
              </div>
              <div class="platform-formats">
                <div class="format-item"><span class="format-label">Video</span><span class="format-size">1080×1920</span></div>
                <div class="format-item"><span class="format-label">Photo</span><span class="format-size">1080×1920</span></div>
              </div>
            </div>

            <div class="platform-card">
              <div class="platform-header">
                <span class="platform-icon youtube">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </span>
                <span class="platform-name">YouTube</span>
              </div>
              <div class="platform-formats">
                <div class="format-item"><span class="format-label">Shorts</span><span class="format-size">1080×1920</span></div>
                <div class="format-item"><span class="format-label">Landscape</span><span class="format-size">1920×1080</span></div>
                <div class="format-item"><span class="format-label">Thumbnail</span><span class="format-size">1280×720</span></div>
              </div>
            </div>

            <div class="platform-card">
              <div class="platform-header">
                <span class="platform-icon linkedin">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </span>
                <span class="platform-name">LinkedIn</span>
              </div>
              <div class="platform-formats">
                <div class="format-item"><span class="format-label">Feed</span><span class="format-size">1200×627</span></div>
                <div class="format-item"><span class="format-label">Square</span><span class="format-size">1080×1080</span></div>
                <div class="format-item"><span class="format-label">Portrait</span><span class="format-size">1080×1350</span></div>
                <div class="format-item"><span class="format-label">PDF Carousel</span><span class="format-size">1080×1350</span></div>
              </div>
            </div>

            <div class="platform-card">
              <div class="platform-header">
                <span class="platform-icon facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </span>
                <span class="platform-name">Facebook</span>
              </div>
              <div class="platform-formats">
                <div class="format-item"><span class="format-label">Feed</span><span class="format-size">1200×630</span></div>
                <div class="format-item"><span class="format-label">Square</span><span class="format-size">1080×1080</span></div>
                <div class="format-item"><span class="format-label">Stories</span><span class="format-size">1080×1920</span></div>
                <div class="format-item"><span class="format-label">Reels</span><span class="format-size">1080×1920</span></div>
              </div>
            </div>

            <div class="platform-card">
              <div class="platform-header">
                <span class="platform-icon bluesky">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 01-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/></svg>
                </span>
                <span class="platform-name">Bluesky</span>
              </div>
              <div class="platform-formats">
                <div class="format-item"><span class="format-label">Feed</span><span class="format-size">2000×2000</span></div>
                <div class="format-item"><span class="format-label">Landscape</span><span class="format-size">1200×675</span></div>
              </div>
            </div>

            <div class="platform-card">
              <div class="platform-header">
                <span class="platform-icon threads">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.023.85-.704 2.012-1.135 3.46-1.284 1.072-.11 2.073-.106 2.992.012.167-.633.197-1.16.09-1.583-.145-.572-.553-.988-1.217-1.24-.715-.27-1.715-.412-2.98-.412l-.003.009c-1.6.019-2.834.376-3.672 1.063-.752.616-1.163 1.461-1.163 2.378h-2.12c0-1.496.658-2.846 1.855-3.803 1.187-.949 2.855-1.478 4.829-1.533h.009c1.475 0 2.755.189 3.8.562 1.202.428 2.078 1.116 2.604 2.045.436.77.57 1.63.487 2.544l.012.013c.918.476 1.662 1.122 2.213 1.922.88 1.276 1.226 2.948.973 4.71-.312 2.17-1.513 4.016-3.478 5.342C17.96 23.217 15.29 24 12.186 24zm-1.072-8.018c-.944.052-1.68.3-2.19.74-.46.396-.683.877-.652 1.395.034.586.316 1.066.817 1.39.565.366 1.336.542 2.165.497 1.098-.06 1.944-.467 2.516-1.208.415-.539.68-1.262.793-2.156-.948-.141-1.966-.19-3.018-.105-.142.013-.286.027-.431.047z"/></svg>
                </span>
                <span class="platform-name">Threads</span>
              </div>
              <div class="platform-formats">
                <div class="format-item"><span class="format-label">Feed</span><span class="format-size">1080×1080</span></div>
                <div class="format-item"><span class="format-label">Portrait</span><span class="format-size">1080×1350</span></div>
              </div>
            </div>

            <div class="platform-card">
              <div class="platform-header">
                <span class="platform-icon pinterest">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg>
                </span>
                <span class="platform-name">Pinterest</span>
              </div>
              <div class="platform-formats">
                <div class="format-item"><span class="format-label">Pin</span><span class="format-size">1000×1500</span></div>
                <div class="format-item"><span class="format-label">Square</span><span class="format-size">1000×1000</span></div>
                <div class="format-item"><span class="format-label">Long</span><span class="format-size">1000×2100</span></div>
              </div>
            </div>
          </div>
        </section>

        <section class="section" id="compare">
          <h2 class="section-title">Posta vs. other social media schedulers</h2>
          <p class="section-sub">
            A quick, factual comparison. For a full pillar comparison see <RouterLink to="/compare">/compare</RouterLink>.
          </p>
          <div class="compare-table-wrap">
            <table class="compare-table">
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col">Posta</th>
                  <th scope="col">Buffer</th>
                  <th scope="col">Hootsuite</th>
                  <th scope="col">Later</th>
                  <th scope="col">Publer</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Networks supported</th>
                  <td>8</td>
                  <td>8</td>
                  <td>20+</td>
                  <td>7</td>
                  <td>11</td>
                </tr>
                <tr>
                  <th scope="row">Bluesky support</th>
                  <td>Yes (native AT Protocol)</td>
                  <td>Yes</td>
                  <td>Partial</td>
                  <td>No</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <th scope="row">Threads support</th>
                  <td>Yes (feed + Reels)</td>
                  <td>Yes</td>
                  <td>Yes</td>
                  <td>Yes</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <th scope="row">Comments inbox</th>
                  <td>Yes (LinkedIn, TikTok)</td>
                  <td>Limited</td>
                  <td>Yes (Inbox 2.0)</td>
                  <td>No</td>
                  <td>Limited</td>
                </tr>
                <tr>
                  <th scope="row">Public REST API</th>
                  <td>Yes (OpenAPI)</td>
                  <td>Yes</td>
                  <td>Enterprise only</td>
                  <td>No</td>
                  <td>Partial</td>
                </tr>
                <tr>
                  <th scope="row">Outbound webhooks</th>
                  <td>Yes (HMAC-signed)</td>
                  <td>No</td>
                  <td>Enterprise only</td>
                  <td>No</td>
                  <td>No</td>
                </tr>
                <tr>
                  <th scope="row">CLI / IDE posting</th>
                  <td>Yes (Claude Code)</td>
                  <td>No</td>
                  <td>No</td>
                  <td>No</td>
                  <td>No</td>
                </tr>
                <tr>
                  <th scope="row">Free trial</th>
                  <td>14 days, no card</td>
                  <td>14 days</td>
                  <td>30 days</td>
                  <td>14 days</td>
                  <td>14 days</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="compare-footnote">
            Comparison points are based on publicly published feature lists at the time this page was updated. If a row is out of date, please reach out — we keep this table honest.
          </p>
        </section>

        <!-- FAQ Section -->
        <section :ref="faqRef" class="section">
          <h2 :class="faqVisible ? 'section-title animate-fade-in-up' : 'section-title opacity-0'">Questions</h2>
          <div class="faq-grid">
            <div class="faq-item">
              <div class="faq-q">Who is Posta for?</div>
              <div class="faq-a">
                Developers, AI agents, automation engineers, and the creators they support — anyone who treats social
                posting as a pipeline rather than a manual task. Plug Posta into an MCP server, an n8n workflow, a
                <RouterLink to="/cli-social-media-posting">Claude Code skill</RouterLink>, or the
                <RouterLink to="/developers">REST API</RouterLink> and let the agent do the rest.
              </div>
            </div>
            <div class="faq-item">
              <div class="faq-q">What is the Posta MCP server?</div>
              <div class="faq-a">
                Posta ships an MCP (Model Context Protocol) server so any MCP-capable client — Claude Desktop,
                Claude Code, Cursor, or your own agent — can create, schedule, and publish social media posts as tool
                calls. One install (<code>npx posta-mcp</code>), one token, every supported network.
              </div>
            </div>
            <div class="faq-item">
              <div class="faq-q">Does Posta work with n8n?</div>
              <div class="faq-a">
                Yes. The <code>n8n-nodes-posta</code> community node turns every Posta endpoint into a typed n8n node.
                We publish ready-to-fork <RouterLink to="/workflows">workflows</RouterLink> for blog-to-social,
                YouTube-to-social, product-launch campaigns, and LinkedIn carousel generation.
              </div>
            </div>
            <div class="faq-item">
              <div class="faq-q">Can I post from Claude Code or the terminal?</div>
              <div class="faq-a">
                Yes. The <RouterLink to="/cli-social-media-posting">Posta Claude Code skill</RouterLink> lets you create,
                schedule, and publish posts straight from your terminal or IDE using natural language.
                No dashboard required, no context-switch from your editor.
              </div>
            </div>
            <div class="faq-item">
              <div class="faq-q">Does Posta publish directly to social networks?</div>
              <div class="faq-a">
                Yes. Posta publishes directly to LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, Bluesky, and
                Threads via each platform's official API, and fires HMAC-signed webhooks back to your agent when posts
                go live — so closed-loop pipelines know exactly when they can act on a result.
              </div>
            </div>
            <div class="faq-item">
              <div class="faq-q">How is this different from Buffer, Hootsuite, or Later?</div>
              <div class="faq-a">
                Those tools are dashboards designed for humans clicking buttons. Posta is API-first and agent-first:
                full public <RouterLink to="/developers">REST API</RouterLink> on every paid tier, HMAC-signed outbound
                webhooks, an MCP server, a Claude Code skill, and an n8n community node — none of which the
                dashboard-led incumbents ship. See the
                <RouterLink to="/compare">side-by-side comparison</RouterLink>.
              </div>
            </div>
            <div class="faq-item">
              <div class="faq-q">Can I influence the roadmap?</div>
              <div class="faq-a">
                Yes. Early users help shape integrations, workflow and pricing. Tell us how you work and what your
                current agent stack looks like when you request access.
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-inner">
        <div>© {{ currentYear }} Posta. Operated by Stefan Gimeson. All rights reserved.</div>
        <div class="footer-links">
          <RouterLink to="/blog">Blog</RouterLink>
          <a href="mailto:hello@getposta.app">Contact</a>
          <RouterLink to="/terms">Terms of Service</RouterLink>
          <RouterLink to="/privacy">Privacy Policy</RouterLink>
          <RouterLink to="/impressum">Impressum</RouterLink>
        </div>
        <div class="footer-section">
          <div class="footer-heading">Developer resources</div>
          <div class="footer-links">
            <RouterLink to="/agents">For AI agents</RouterLink>
            <RouterLink to="/cli-social-media-posting">Claude Code skill</RouterLink>
            <RouterLink to="/workflows">n8n workflows</RouterLink>
            <RouterLink to="/developers">REST API docs</RouterLink>
            <a href="https://github.com/STGime/posta-mcp" target="_blank" rel="noopener">MCP server (GitHub)</a>
            <a href="https://github.com/STGime/posta-skill" target="_blank" rel="noopener">Claude Code skill (GitHub)</a>
          </div>
        </div>
        <div class="footer-section">
          <div class="footer-heading">Other Products</div>
          <div class="footer-links">
            <a href="https://www.drostecv.app" target="_blank" rel="noopener">DrosteCV</a>
            <a href="https://www.stupidcorrelations.app" target="_blank" rel="noopener">Stupid Correlations</a>
          </div>
        </div>
        <div class="footer-section">
          <div class="footer-heading">Alternatives</div>
          <div class="footer-links">
            <a href="https://buffer.com" target="_blank" rel="noopener">Buffer</a>
            <a href="https://hootsuite.com" target="_blank" rel="noopener">Hootsuite</a>
            <a href="https://later.com" target="_blank" rel="noopener">Later</a>
            <a href="https://sproutsocial.com" target="_blank" rel="noopener">Sprout Social</a>
            <a href="https://planoly.com" target="_blank" rel="noopener">Planoly</a>
            <a href="https://socialbee.com" target="_blank" rel="noopener">SocialBee</a>
          </div>
        </div>
      </div>
    </footer>

    <LoginModal :show="showLoginModal" @close="showLoginModal = false" />
    <WaitingListModal
      :show="showWaitingListModal"
      :source="waitingListSource"
      @close="showWaitingListModal = false"
    />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at top, #111827 0, #020617 45%, #000 100%);
  overflow-x: hidden;
}

.wrapper {
  max-width: 1040px;
  margin: 0 auto;
  padding: 32px 20px 60px;
  flex: 1;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-mark {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: conic-gradient(from 210deg, #4f46e5, #22c55e, #06b6d4, #4f46e5);
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(79, 70, 229, 0.6);
}

.logo-inner {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: #020617;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #e5e7eb;
}

.logo-text {
  font-weight: 600;
  letter-spacing: 0.02em;
  font-size: 18px;
}

.logo-tagline {
  font-size: 11px;
  color: var(--muted);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-login {
  border: 1px solid rgba(148, 163, 184, 0.6);
  background: rgba(15, 23, 42, 0.7);
  color: var(--text);
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  text-decoration: none;
}

.btn-login:hover {
  border-color: rgba(148, 163, 184, 0.9);
  background: rgba(15, 23, 42, 0.9);
}

.nav-link {
  color: var(--muted);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  padding: 8px 4px;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--text);
}

.btn-header {
  padding: 8px 16px;
  font-size: 13px;
}

.btn-primary {
  border: none;
  cursor: pointer;
  padding: 11px 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  background: radial-gradient(circle at top left, #6366f1, #4f46e5);
  color: #e5e7eb;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.8);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.8), 0 0 20px rgba(99, 102, 241, 0.4);
}

.btn-primary::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent 0%,
    rgba(255, 255, 255, 0.12) 40%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.12) 60%,
    transparent 100%
  );
  animation: shimmer 4s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { left: -100%; }
  50%, 80% { left: 100%; }
}

.btn-primary-hero {
  padding: 13px 26px;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  animation: hero-glow 3s ease-in-out infinite;
}

@keyframes hero-glow {
  0%, 100% { box-shadow: 0 24px 80px rgba(15, 23, 42, 0.8), 0 0 15px rgba(99, 102, 241, 0.3); }
  50% { box-shadow: 0 24px 80px rgba(15, 23, 42, 0.8), 0 0 30px rgba(99, 102, 241, 0.5), 0 0 60px rgba(99, 102, 241, 0.2); }
}

.btn-primary-hero:hover {
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.8), 0 0 30px rgba(99, 102, 241, 0.5), 0 0 60px rgba(99, 102, 241, 0.2);
}

.cta-trust-note {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
  flex-basis: 100%;
  text-align: center;
}

.btn-primary.btn-sm {
  padding: 9px 16px;
  font-size: 13px;
  margin-top: 6px;
}

.btn-ghost {
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.6);
  padding: 10px 16px;
  font-size: 13px;
  color: var(--muted);
  background: rgba(15, 23, 42, 0.7);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  white-space: nowrap;
}

.arrow {
  font-size: 15px;
  transform: translateY(0.5px);
}

/* Hero */
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 32px;
  align-items: center;
  margin-bottom: 48px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.5);
  background: rgba(15, 23, 42, 0.8);
  color: var(--muted);
  font-size: 12px;
  margin-bottom: 14px;
}

.eyebrow-pill {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(79, 70, 229, 0.18);
  color: #e0e7ff;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

h1 {
  font-size: clamp(2.3rem, 3.3vw, 3rem);
  line-height: 1.04;
  letter-spacing: -0.04em;
  margin-bottom: 16px;
}

.gradient-text {
  background: linear-gradient(135deg, #4f46e5, #06b6d4, #22c55e);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-sub {
  font-size: 15px;
  color: var(--muted);
  max-width: 520px;
  margin-bottom: 22px;
}

.hero-bullets {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 26px;
}

.chip {
  font-size: 11px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(15, 23, 42, 0.75);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.7);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.3);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.small-note {
  font-size: 13px;
  color: #94a3b8;
  letter-spacing: 0.01em;
}

/* Card */
.hero-card-wrapper {
  position: relative;
}

.card {
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: radial-gradient(circle at top left, rgba(79, 70, 229, 0.25), rgba(15, 23, 42, 0.98));
  padding: 18px 18px 16px;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(18px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.card-label {
  font-size: 12px;
  color: var(--muted);
}

.card-title {
  font-size: 13px;
  font-weight: 500;
}

.pill-green {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(22, 163, 74, 0.16);
  color: #bbf7d0;
  border: 1px solid rgba(22, 163, 74, 0.5);
}

/* Agent hero card */
.agent-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 18px 0;
}

.agent-step {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text);
}

.agent-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: rgba(22, 163, 74, 0.18);
  color: #4ade80;
  font-size: 12px;
  flex-shrink: 0;
}

.agent-snippet {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(2, 6, 23, 0.7);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #e2e8f0;
  overflow-x: auto;
}

.agent-snippet-line {
  white-space: nowrap;
}

.tok-method {
  color: #a5b4fc;
  font-weight: 700;
}

.tok-ok {
  color: #4ade80;
  font-weight: 700;
}

.tok-muted {
  color: rgba(148, 163, 184, 0.8);
}

.timeline {
  font-size: 12px;
  border-radius: 14px;
  padding: 10px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.4);
  margin-bottom: 10px;
}

.timeline-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.timeline-row:last-of-type {
  margin-bottom: 0;
}

.timeline-label {
  color: var(--muted);
}

.timeline-value {
  font-weight: 500;
  font-size: 12px;
}

.timeline-bar {
  margin-top: 6px;
  height: 4px;
  border-radius: 999px;
  background: rgba(31, 41, 55, 0.9);
  overflow: hidden;
}

.timeline-fill {
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #22c55e);
}

.mini-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
  font-size: 12px;
}

.mini-card {
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.4);
  padding: 8px 9px;
}

.mini-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--muted);
  margin-bottom: 4px;
}

.mini-main {
  font-size: 12px;
  margin-bottom: 2px;
}

.mini-sub {
  font-size: 11px;
  color: var(--muted);
}

.badge-stack {
  position: absolute;
  right: 4px;
  top: -12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}

.badge {
  font-size: 11px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.4);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.7);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.badge-dot-purple {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #a855f7;
}

.badge-dot-cyan {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #22d3ee;
}

/* Section */
.section {
  margin-bottom: 40px;
}

/* Demo video section */
.video-section {
  margin: 8px auto 56px;
  max-width: 860px;
  text-align: center;
}

.video-heading {
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin-bottom: 10px;
}

.video-sub {
  color: var(--muted, #94a3b8);
  font-size: 1rem;
  line-height: 1.5;
  margin: 0 auto 24px;
  max-width: 560px;
}

.video-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-xl, 16px);
  overflow: hidden;
  border: 1px solid var(--border, rgba(148, 163, 184, 0.15));
  background: #000;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
}

.video-frame iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.video-fallback {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-muted, rgba(148, 163, 184, 0.85));
  text-align: center;
}

.video-fallback a {
  color: inherit;
  text-decoration: underline;
}

.video-fallback a:hover {
  color: var(--text, #fff);
}

.video-facade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  cursor: pointer;
  background: #000;
  display: block;
}

.video-facade img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease, opacity 0.2s ease;
}

.video-facade:hover img {
  transform: scale(1.03);
  opacity: 0.85;
}

.video-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--accent, #6366f1);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  transition: transform 0.2s ease, background 0.2s ease;
}

.video-facade:hover .video-play,
.video-facade:focus-visible .video-play {
  transform: translate(-50%, -50%) scale(1.08);
}

.video-play svg {
  width: 30px;
  height: 30px;
  margin-left: 4px;
}

.section-title {
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin-bottom: 12px;
}

.section-sub {
  font-size: 15px;
  color: var(--muted);
  max-width: 620px;
  margin-bottom: 18px;
}

/* Features */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.feature-card {
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: linear-gradient(to bottom right, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.96));
  padding: 14px 13px 13px;
  font-size: 13px;
}

.feature-tag {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #a5b4fc;
  margin-bottom: 6px;
}

.feature-title {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
}

.feature-body {
  color: var(--muted);
  font-size: 12px;
}

.feature-card-with-image {
  display: flex;
  flex-direction: column;
}

.feature-image {
  margin-top: 10px;
  width: 100%;
  max-height: 120px;
  object-fit: contain;
  border-radius: 8px;
}

/* Platform Previews */
.platform-previews {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  align-items: flex-end;
  height: 90px;
}

.platform-preview {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  background: #000;
  height: 100%;
}

.platform-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* TikTok - 9:16 portrait */
.tiktok-preview {
  aspect-ratio: 9 / 16;
}

/* Instagram - 1:1 square */
.instagram-preview {
  aspect-ratio: 1 / 1;
}

/* YouTube - 16:9 landscape */
.youtube-preview {
  aspect-ratio: 16 / 9;
}

.platform-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.platform-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  font-size: 9px;
  font-weight: 500;
  padding: 12px 4px 3px;
  text-align: center;
}

/* TikTok UI */
.tiktok-ui {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.tiktok-side {
  position: absolute;
  right: 3px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tiktok-icon {
  width: 14px;
  height: 14px;
  color: #fff;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
}

.tiktok-icon svg {
  width: 100%;
  height: 100%;
}

.tiktok-bottom {
  padding: 3px 4px 16px;
  background: linear-gradient(transparent, rgba(0,0,0,0.6));
}

.tiktok-user {
  font-size: 8px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.tiktok-desc {
  font-size: 7px;
  color: rgba(255,255,255,0.9);
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

/* Instagram UI */
.instagram-ui {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.instagram-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: linear-gradient(rgba(0,0,0,0.4), transparent);
  font-size: 8px;
  font-weight: 600;
}

.instagram-avatar {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
}

.instagram-actions {
  display: flex;
  gap: 6px;
  padding: 4px;
  background: linear-gradient(transparent, rgba(0,0,0,0.4));
  padding-bottom: 16px;
}

.instagram-icon {
  width: 12px;
  height: 12px;
  color: #fff;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
}

.instagram-icon svg {
  width: 100%;
  height: 100%;
}

/* YouTube UI */
.youtube-ui {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.youtube-play {
  width: 24px;
  height: 24px;
  background: rgba(0,0,0,0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.youtube-play svg {
  width: 12px;
  height: 12px;
  margin-left: 2px;
}

.youtube-progress {
  position: absolute;
  bottom: 18px;
  left: 4px;
  right: 4px;
  height: 2px;
  background: rgba(255,255,255,0.3);
  border-radius: 1px;
}

.youtube-progress-fill {
  width: 35%;
  height: 100%;
  background: #ff0000;
  border-radius: 1px;
}

.youtube-bottom {
  position: absolute;
  bottom: 2px;
  left: 4px;
  right: 4px;
  display: flex;
  justify-content: space-between;
  font-size: 7px;
}

.youtube-time {
  color: rgba(255,255,255,0.9);
}

.youtube-shorts {
  color: #ff0000;
  font-weight: 600;
}

/* Compression Demo */
.compression-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.compression-item {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  width: 80px;
}

.compression-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 6px;
}

.compression-size {
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.compression-size.original {
  background: rgba(239, 68, 68, 0.9);
  color: #fff;
}

.compression-size.compressed {
  background: rgba(34, 197, 94, 0.9);
  color: #fff;
}

.compression-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: var(--muted);
  flex-shrink: 0;
}

.compression-arrow > svg {
  width: 18px;
  height: 18px;
}

.compression-icon {
  width: 14px;
  height: 14px;
  color: #22c55e;
}

.compression-icon svg {
  width: 100%;
  height: 100%;
}

.compression-label {
  font-size: 9px;
  font-weight: 700;
  color: #22c55e;
}

/* How it works */
.how-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  font-size: 13px;
}

.step-card {
  border-radius: 16px;
  border: 1px dashed rgba(148, 163, 184, 0.7);
  background: rgba(15, 23, 42, 0.85);
  padding: 13px 12px 12px;
}

.step-num {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--muted);
  margin-bottom: 4px;
}

.step-title {
  font-weight: 500;
  margin-bottom: 3px;
}

.step-body {
  font-size: 12px;
  color: var(--muted);
}

.step-code {
  margin: 10px 0 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.2);
  overflow-x: auto;
  font-size: 11px;
  line-height: 1.5;
  color: #cbd5e1;
}

.step-code code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  white-space: pre;
}

.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.pill {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.5);
  color: var(--muted);
}

/* Platforms */
.platform-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.platform-card {
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(15, 23, 42, 0.85);
  padding: 12px 14px;
  transition: border-color 0.2s;
}

.platform-card:hover {
  border-color: rgba(148, 163, 184, 0.7);
}

.platform-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.platform-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.platform-icon svg {
  width: 16px;
  height: 16px;
}

.platform-icon.instagram { color: #E4405F; }
.platform-icon.tiktok { color: #ffffff; }
.platform-icon.youtube { color: #FF0000; }
.platform-icon.linkedin { color: #0A66C2; }
.platform-icon.facebook { color: #1877F2; }
.platform-icon.bluesky { color: #0085ff; }
.platform-icon.threads { color: #ffffff; }
.platform-icon.pinterest { color: #E60023; }

.platform-name {
  font-size: 13px;
  font-weight: 600;
}

.platform-formats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.format-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}

.format-label {
  color: var(--muted);
}

.format-size {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
  color: #a5b4fc;
  font-size: 10px;
  background: rgba(79, 70, 229, 0.15);
  padding: 2px 6px;
  border-radius: 4px;
}

/* Pricing */
.pricing-toggle-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.pricing-toggle {
  display: inline-flex;
  padding: 4px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.4);
}

.pricing-toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}

.pricing-toggle-btn.active {
  background: radial-gradient(circle at top left, #6366f1, #4f46e5);
  color: #e5e7eb;
}

.pricing-save-badge {
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  background: rgba(22, 163, 74, 0.2);
  color: #86efac;
  border: 1px solid rgba(22, 163, 74, 0.4);
}

.pricing-loading {
  display: flex;
  justify-content: center;
  padding: 48px;
}

.pricing-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(148, 163, 184, 0.3);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.pricing-error {
  text-align: center;
  padding: 32px;
  color: var(--muted);
  font-size: 13px;
}

.pricing-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.pricing-card {
  position: relative;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: linear-gradient(to bottom right, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.96));
  padding: 24px 20px 20px;
  display: flex;
  flex-direction: column;
}

.pricing-card-featured {
  border-color: rgba(99, 102, 241, 0.7);
  background: radial-gradient(circle at top left, rgba(79, 70, 229, 0.2), rgba(15, 23, 42, 0.98));
}

.pricing-trial-badge,
.pricing-popular-badge {
  position: absolute;
  top: -11px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
}

.pricing-trial-badge {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.pricing-popular-badge {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
}

.pricing-trial-badge-right {
  left: auto;
  right: 16px;
  transform: none;
}

.pricing-card-header {
  margin-bottom: 16px;
}

.pricing-card-name {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 4px;
}

.pricing-card-desc {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.4;
}

.pricing-card-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin-bottom: 2px;
}

.pricing-amount {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.pricing-period {
  font-size: 14px;
  color: var(--muted);
}

.pricing-billed-note {
  font-size: 11px;
  color: var(--muted);
  margin-bottom: 16px;
}

.pricing-card-limits {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 0;
  margin-bottom: 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.pricing-limit-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.pricing-limit-value {
  font-weight: 600;
  min-width: 28px;
  color: #e5e7eb;
}

.pricing-limit-label {
  color: var(--muted);
}

.pricing-card-features {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.pricing-card-features li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: var(--muted);
}

.pricing-check {
  width: 16px;
  height: 16px;
  color: #22c55e;
  flex-shrink: 0;
  margin-top: 0px;
}

.pricing-cta {
  width: 100%;
  justify-content: center;
  text-align: center;
  padding: 10px 16px;
  font-size: 13px;
}

/* Comparison Table */
.comparison-wrapper {
  margin-top: 8px;
}

.comparison-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 14px;
  text-align: center;
}

.comparison-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  min-width: 500px;
}

.comparison-table th {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.3);
  color: var(--muted);
}

.comparison-feature-col {
  text-align: left !important;
  width: 40%;
}

.comparison-plan-col {
  width: 30%;
}

.comparison-pro-col {
  background: rgba(79, 70, 229, 0.06);
}

.comparison-category-row td {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #a5b4fc;
  padding: 14px 12px 6px;
  border: none;
}

.comparison-row td {
  padding: 7px 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.comparison-feature-cell {
  color: var(--muted);
}

.comparison-value-cell {
  text-align: center;
}

.comparison-check {
  width: 16px;
  height: 16px;
  color: #22c55e;
  display: inline-block;
}

.comparison-dash {
  color: rgba(148, 163, 184, 0.4);
  font-size: 14px;
}

.comparison-text {
  font-weight: 600;
  color: #e5e7eb;
}

.pricing-footnote {
  margin-top: 24px;
  font-size: 12px;
  color: var(--muted);
  text-align: center;
  line-height: 1.5;
}

.pricing-footnote-link {
  color: var(--muted);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.pricing-footnote-link:hover {
  color: var(--foreground);
}

/* Comparison table */
.compare-table-wrap {
  margin: 32px 0 12px;
  border-radius: 16px;
  overflow-x: auto;
  border: 1px solid var(--border, rgba(148, 163, 184, 0.15));
  background: rgba(15, 23, 42, 0.4);
}

.compare-table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: 14px;
}

.compare-table thead {
  background: rgba(99, 102, 241, 0.08);
}

.compare-table th,
.compare-table td {
  text-align: left;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  vertical-align: top;
}

.compare-table thead th {
  font-weight: 600;
  color: var(--foreground, #f1f5f9);
  font-size: 13px;
  letter-spacing: 0.02em;
}

.compare-table tbody th {
  font-weight: 500;
  color: var(--muted, #cbd5e1);
  width: 28%;
  white-space: nowrap;
}

.compare-table tbody td {
  color: var(--foreground, #e2e8f0);
}

.compare-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.compare-table tbody td:first-of-type {
  font-weight: 500;
}

.compare-footnote {
  margin-top: 8px;
  font-size: 12px;
  color: var(--muted, #94a3b8);
  text-align: center;
}

@media (max-width: 720px) {
  .compare-table {
    font-size: 13px;
  }
  .compare-table th,
  .compare-table td {
    padding: 10px 12px;
  }
}

/* FAQ */
.faq-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  font-size: 13px;
}

.faq-item {
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.45);
  background: rgba(15, 23, 42, 0.9);
  padding: 10px 11px 9px;
}

.faq-q {
  font-weight: 500;
  margin-bottom: 2px;
}

.faq-a {
  font-size: 12px;
  color: var(--muted);
}

/* Footer */
.footer {
  border-top: 1px solid rgba(31, 41, 55, 0.9);
  margin-top: auto;
}

.footer-inner {
  max-width: 1040px;
  margin: 0 auto;
  padding: 16px 20px 24px;
  font-size: 11px;
  color: var(--muted);
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.footer-links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.footer-links a {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  color: var(--muted);
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.footer-heading {
  font-size: 11px;
  font-weight: 600;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Scroll Animations */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out both;
}

.opacity-0 {
  opacity: 0;
}

.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }
.stagger-3 { animation-delay: 0.3s; }
.stagger-4 { animation-delay: 0.4s; }
.stagger-5 { animation-delay: 0.5s; }
.stagger-6 { animation-delay: 0.6s; }
.stagger-7 { animation-delay: 0.7s; }

@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up {
    animation: none;
    opacity: 1;
    transform: none;
  }
  .opacity-0 {
    opacity: 1;
  }
  .btn-primary::after {
    animation: none;
  }
  .btn-primary-hero {
    animation: none;
  }
  .btn-primary:hover {
    transform: none;
  }
}

/* Product Showcase */
.showcase-list {
  display: flex;
  flex-direction: column;
  gap: 40px;
  margin-bottom: 32px;
}

.showcase-item {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 28px;
  align-items: center;
}

.showcase-item-reverse {
  direction: rtl;
}

.showcase-item-reverse > * {
  direction: ltr;
}

.showcase-image-wrapper {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.3);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
  background: rgba(15, 23, 42, 0.6);
}

.showcase-image {
  width: 100%;
  height: auto;
  display: block;
}

.showcase-heading {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

.showcase-desc {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
}

.showcase-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

/* Skill Section */
.skill-terminal {
  max-width: 720px;
  margin: 0 auto 32px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  background: #0d1117;
  overflow: hidden;
  box-shadow: 0 0 40px rgba(99, 102, 241, 0.08), 0 8px 32px rgba(0, 0, 0, 0.4);
}

.skill-terminal-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.skill-terminal-dots {
  display: flex;
  gap: 6px;
}

.skill-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.skill-dot-red { background: #ff5f57; }
.skill-dot-yellow { background: #febc2e; }
.skill-dot-green { background: #28c840; }

.skill-terminal-title {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.6);
  font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
}

.skill-terminal-body {
  padding: 16px 18px 20px;
  font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.7;
}

.skill-line-spacer {
  height: 12px;
}

.skill-line-prompt {
  color: #e6edf3;
}

.skill-prompt-icon {
  color: #a5b4fc;
  margin-right: 6px;
  font-weight: 600;
}

.skill-line-response {
  color: rgba(148, 163, 184, 0.8);
}

.skill-check {
  color: #34d399;
  margin-right: 6px;
  font-weight: 700;
}

.skill-features {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  max-width: 720px;
  margin: 0 auto 32px;
}

.skill-feature-card {
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  background: linear-gradient(to bottom right, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.96));
  padding: 16px;
}

.skill-feature-icon {
  color: #a5b4fc;
  margin-bottom: 10px;
}

.skill-feature-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
}

.skill-feature-body {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.5;
}

.skill-cta {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

/* OpenClaw & API Section */
.usecase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
  max-width: 960px;
  margin: 0 auto 36px;
}

.usecase-card {
  text-align: left;
  padding: 18px 20px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(to bottom right, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.96));
}

.usecase-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text);
}

.usecase-body {
  font-size: 13px;
  line-height: 1.6;
  color: var(--muted);
}

.usecase-body a {
  color: var(--accent-light);
  text-decoration: none;
  white-space: nowrap;
}

.usecase-body a:hover {
  text-decoration: underline;
}

.api-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  max-width: 960px;
  margin: 0 auto 32px;
}

.api-card {
  flex: 1 1 280px;
  max-width: 300px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  background: linear-gradient(to bottom right, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.96));
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  position: relative;
}

.api-card:hover {
  border-color: rgba(165, 180, 252, 0.4);
  box-shadow: 0 0 24px rgba(99, 102, 241, 0.12);
  transform: translateY(-2px);
}

.api-card-icon {
  color: #a5b4fc;
  flex-shrink: 0;
  margin-top: 2px;
}

.api-card-openclaw .api-card-icon { color: #34d399; }
.api-card-n8n .api-card-icon { color: #ff6d5a; }
.api-card-n8n .api-card-label { color: #ff6d5a; }
.api-card-mcp .api-card-icon { color: #a78bfa; }
.api-card-mcp .api-card-label { color: #a78bfa; }
.api-card-claude .api-card-icon { color: #d97757; }
.api-card-claude .api-card-label { color: #d97757; }

.api-card-content {
  flex: 1;
  min-width: 0;
}

.api-card-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #a5b4fc;
  margin-bottom: 4px;
}

.api-card-openclaw .api-card-label { color: #34d399; }

.api-card-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 6px;
}

.api-card-body {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.5;
}

.api-card-arrow {
  color: var(--muted);
  font-size: 18px;
  flex-shrink: 0;
  align-self: center;
  transition: transform 0.2s;
}

.api-card:hover .api-card-arrow {
  transform: translateX(4px);
}

.api-features {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 720px;
  margin: 0 auto 32px;
}

.api-feature {
  display: flex;
  align-items: center;
  gap: 10px;
}

.api-feature-icon {
  color: #a5b4fc;
  flex-shrink: 0;
}

.api-feature-text {
  font-size: 13px;
  line-height: 1.4;
}

.api-feature-text strong {
  display: block;
  font-weight: 600;
  margin-bottom: 1px;
}

.api-feature-text span {
  color: var(--muted);
  font-size: 12px;
}

.api-cta {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

/* Responsive */
@media (max-width: 860px) {
  .hero {
    grid-template-columns: minmax(0, 1fr);
  }
  .hero-card-wrapper {
    order: -1;
  }
  .badge-stack {
    position: static;
    margin-top: 10px;
  }
  .platform-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .feature-grid,
  .how-grid,
  .faq-grid,
  .skill-features {
    grid-template-columns: minmax(0, 1fr);
  }
  .skill-terminal-body {
    font-size: 11px;
    padding: 12px 12px 16px;
  }
  .skill-cta,
  .api-cta {
    flex-direction: column;
  }
  .api-cards {
    max-width: 420px;
  }
  .api-card {
    flex-basis: 100%;
    max-width: none;
  }
  .api-features {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding-inline: 16px;
  }
  .platform-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .pricing-cards {
    grid-template-columns: minmax(0, 1fr);
  }
  .wrapper {
    padding-inline: 16px;
  }
  .logo-tagline {
    display: none;
  }
  .showcase-item,
  .showcase-item-reverse {
    grid-template-columns: minmax(0, 1fr);
    direction: ltr;
  }
  .showcase-cta {
    flex-direction: column;
  }
  .comparison-table {
    min-width: 0;
    font-size: 11px;
  }
  .comparison-table th,
  .comparison-table td {
    padding: 6px 6px;
  }
}
</style>
