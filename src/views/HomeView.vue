<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useHead } from '@unhead/vue'
import { useAuthStore } from '@/stores'
import LoginModal from '@/components/LoginModal.vue'
import WaitingListModal from '@/components/WaitingListModal.vue'
import { isSignupEnabled } from '@/config/featureFlags'
import { paymentsService } from '@/services'
import type { WaitingListSource } from '@/services'
import type { PricingPlan, BillingInterval } from '@/types'

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

// Hero agent run log: replays the tail of one publish run once on load.
// Initial state is a believable mid-run snapshot so the prerendered page and
// reduced-motion users see a complete, readable log without animation.
type RunStepState = 'ok' | 'active' | 'pending'
interface RunStep {
  time: string
  text: string
  meta: string
  state: RunStepState
}

const runSteps = ref<RunStep[]>([
  { time: '09:41:02', text: 'POST /v1/posts · 8 accounts', meta: '201', state: 'ok' },
  { time: '09:41:02', text: 'POST /v1/posts/:id/schedule · 10:00 UTC', meta: '200', state: 'ok' },
  { time: '10:00:00', text: 'post.processing · 9:16 · 1:1 · 16:9 · 4:5', meta: '6.8s', state: 'ok' },
  { time: '10:00:07', text: 'post.result.success · 5/8 networks', meta: '…', state: 'active' },
  { time: '—', text: 'post.published → your webhook', meta: '', state: 'pending' },
])
const runDone = ref(false)
const runNetworks = ['instagram', 'tiktok', 'linkedin', 'youtube', 'facebook', 'pinterest', 'bluesky', 'threads']
let runTimer: ReturnType<typeof setTimeout> | null = null

const playRun = () => {
  let published = 5
  const tick = () => {
    const steps = runSteps.value
    const active = steps[3]!
    const last = steps[4]!
    if (published < 8) {
      published++
      active.text = `post.result.success · ${published}/8 · ${runNetworks[published - 1]}`
      runTimer = setTimeout(tick, 900)
      return
    }
    active.text = 'post.result.success · 8/8 networks'
    active.meta = '8/8'
    active.state = 'ok'
    last.time = '10:00:11'
    last.state = 'active'
    runTimer = setTimeout(() => {
      last.state = 'ok'
      last.meta = '200'
      runDone.value = true
      runTimer = null
    }, 1100)
  }
  runTimer = setTimeout(tick, 1200)
}

// "Connect your agent" tabs. All panels stay in the DOM (v-show) so the
// prerendered HTML keeps every integration's copy for search engines.
type SurfaceKey = 'mcp' | 'claude' | 'n8n' | 'rest' | 'openclaw'
const activeSurface = ref<SurfaceKey>('mcp')
const surfaces: { key: SurfaceKey; label: string }[] = [
  { key: 'mcp', label: 'MCP server' },
  { key: 'claude', label: 'Claude Code' },
  { key: 'n8n', label: 'n8n' },
  { key: 'rest', label: 'REST API' },
  { key: 'openclaw', label: 'OpenClaw' },
]

const copiedKey = ref<string | null>(null)
let copiedTimer: ReturnType<typeof setTimeout> | null = null
const copyText = async (key: string, text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copiedKey.value = key
    if (copiedTimer) clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => (copiedKey.value = null), 1600)
  } catch {
    copiedKey.value = null
  }
}

onUnmounted(() => {
  if (runTimer) clearTimeout(runTimer)
  if (copiedTimer) clearTimeout(copiedTimer)
})

onMounted(async () => {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    playRun()
  }
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
    <!-- Header -->
    <header class="header">
      <div class="header-inner">
        <RouterLink to="/" class="logo">
          <div class="logo-mark">
            <div class="logo-inner">P</div>
          </div>
          <span class="logo-text">posta</span>
        </RouterLink>
        <nav class="nav">
          <RouterLink to="/agents" class="nav-link">Agents</RouterLink>
          <RouterLink to="/workflows" class="nav-link">Workflows</RouterLink>
          <RouterLink to="/developers" class="nav-link">Developers</RouterLink>
          <a href="#pricing" class="nav-link">Pricing</a>
          <RouterLink to="/blog" class="nav-link">Blog</RouterLink>
        </nav>
        <div class="header-actions">
          <template v-if="!isAuthenticated">
            <button class="btn-login" @click="showLoginModal = true">Log in</button>
            <RouterLink v-if="signupEnabled" to="/signup" class="btn-primary btn-header">
              Sign up free
            </RouterLink>
            <button v-else class="btn-primary btn-header" @click="openWaitingList('header')">
              Join waiting list
            </button>
          </template>
          <RouterLink v-else to="/app" class="btn-primary btn-header">Dashboard</RouterLink>
        </div>
      </div>
    </header>

    <main>
      <!-- Hero -->
      <section class="hero container">
        <div class="hero-copy">
          <span class="label">Social media automation for AI agents</span>
          <h1>Your agent writes the post. Posta ships it.</h1>
          <p class="hero-sub">
            Give any AI agent or automation the power to run your social media. Posta lets agents create, schedule,
            and publish across LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, Bluesky, and Threads through
            an MCP server, a Claude Code skill, the n8n node, or a public REST API. Media auto-formats per platform and
            webhooks report back when posts go live.
          </p>
          <div class="hero-actions">
            <RouterLink v-if="signupEnabled" to="/signup" class="btn-primary btn-lg">
              Start your 14-day free trial
            </RouterLink>
            <button v-else class="btn-primary btn-lg" @click="openWaitingList('hero')">
              Join waiting list
            </button>
            <a href="#connect" class="btn-ghost btn-lg">See how agents use it</a>
          </div>
          <p class="small-note">No credit card required · 14-day free trial · Cancel anytime</p>
          <div class="surface-strip" aria-label="Integrations">
            <span>MCP</span><span>Claude Code</span><span>n8n</span><span>REST + webhooks</span><span>OpenClaw</span>
          </div>
        </div>

        <div class="run" role="figure" aria-label="Example agent run: one instruction published to 8 networks">
          <div class="run-head">
            <span class="run-id">run_8f2c · “Post our launch everywhere”</span>
            <span :class="['run-status', { done: runDone }]">{{ runDone ? 'published' : 'running' }}</span>
          </div>
          <ol class="run-steps">
            <li v-for="(step, i) in runSteps" :key="i" :class="['run-step', step.state]">
              <span class="run-time">{{ step.time }}</span>
              <span class="run-mark" aria-hidden="true">{{ step.state === 'ok' ? '✓' : step.state === 'active' ? '●' : '○' }}</span>
              <span class="run-text">{{ step.text }}</span>
              <span class="run-meta">{{ step.meta }}</span>
            </li>
          </ol>
          <div class="run-foot">
            <span><span class="k">x-posta-signature</span> sha256=9c1e…a4</span>
            <span><span class="k">event</span> <span class="v">"post.published"</span> <span class="k">platforms</span> 8</span>
          </div>
        </div>
      </section>

      <!-- Connect your agent -->
      <section class="section container" id="connect">
        <div class="section-head">
          <span class="label">Connect</span>
          <h2 id="api">Built for agents &amp; automation</h2>
          <p class="section-sub">
            Posta is the <RouterLink to="/agentic-social-media-scheduler">agentic social media scheduler</RouterLink>.
            It is API-first, so your agents run the whole loop (generate, schedule, publish, report back)
            programmatically. Looking for the full <RouterLink to="/social-media-scheduler">social media scheduler</RouterLink>
            overview? Start there.
          </p>
        </div>

        <div class="tabs" role="tablist" aria-label="Integration surfaces">
          <button
            v-for="surface in surfaces"
            :id="`tab-${surface.key}`"
            :key="surface.key"
            role="tab"
            :aria-selected="activeSurface === surface.key"
            :aria-controls="`panel-${surface.key}`"
            :class="['tab', { active: activeSurface === surface.key }]"
            @click="activeSurface = surface.key"
          >
            {{ surface.label }}
          </button>
        </div>

        <div class="tab-panels">
          <!-- MCP -->
          <div v-show="activeSurface === 'mcp'" id="panel-mcp" class="tab-panel" role="tabpanel" aria-labelledby="tab-mcp">
            <div class="panel-copy">
              <h3>MCP server</h3>
              <p>One npm install adds Posta's tools to Claude Desktop, Cursor, Windsurf, VS Code, and Zed. Schedule and publish from any MCP client.</p>
              <a href="https://www.npmjs.com/package/posta-mcp" target="_blank" rel="noopener noreferrer" class="text-link">posta-mcp on npm →</a>
            </div>
            <div class="cmd">
              <code><span class="prompt">$</span> npx posta-mcp</code>
              <button class="copy" @click="copyText('mcp', 'npx posta-mcp')">{{ copiedKey === 'mcp' ? 'Copied' : 'Copy' }}</button>
            </div>
          </div>

          <!-- Claude Code -->
          <div v-show="activeSurface === 'claude'" id="panel-claude" class="tab-panel" role="tabpanel" aria-labelledby="tab-claude">
            <div class="panel-copy">
              <h3>Post from your terminal</h3>
              <p>
                The terminal is one of many agent surfaces. Posta's Claude Code skill turns your IDE into a social media
                command center. Create, schedule, and publish without leaving your editor, or hand the same skill to an
                autonomous agent. Generate images and captions, schedule across 8 platforms, and check analytics with a
                single prompt.
              </p>
              <a href="https://github.com/STGime/posta-skill" target="_blank" rel="noopener noreferrer" class="text-link">Get it for Claude Code on GitHub →</a>
            </div>
            <div class="terminal">
              <div class="terminal-head">claude</div>
              <div class="terminal-body">
                <div class="t-prompt"><span>&gt;</span> Show my connected accounts</div>
                <div class="t-ok"><span>✓</span> 8 active accounts: Instagram, TikTok, LinkedIn, YouTube, Facebook, Pinterest, Bluesky, Threads</div>
                <div class="t-prompt"><span>&gt;</span> Generate an image and schedule a LinkedIn post for 3pm</div>
                <div class="t-ok"><span>✓</span> Image generated with AI</div>
                <div class="t-ok"><span>✓</span> Draft created: "I posted this from VS Code..."</div>
                <div class="t-ok"><span>✓</span> Scheduled for today at 15:00 CET</div>
                <div class="t-prompt"><span>&gt;</span> How did my last 5 posts perform?</div>
                <div class="t-ok"><span>✓</span> Avg. engagement: 4.2% · Best: LinkedIn carousel (8.1%) · Trend: ↑ 12% vs. prior week</div>
              </div>
            </div>
          </div>

          <!-- n8n -->
          <div v-show="activeSurface === 'n8n'" id="panel-n8n" class="tab-panel" role="tabpanel" aria-labelledby="tab-n8n">
            <div class="panel-copy">
              <h3>n8n community node</h3>
              <p>Drag-and-drop Posta into any n8n workflow. Create posts, upload media, and check analytics with no code. Install it from Settings → Community Nodes.</p>
              <a href="https://www.npmjs.com/package/n8n-nodes-posta" target="_blank" rel="noopener noreferrer" class="text-link">n8n-nodes-posta on npm →</a>
            </div>
            <div class="cmd">
              <code><span class="prompt">npm</span> n8n-nodes-posta</code>
              <button class="copy" @click="copyText('n8n', 'n8n-nodes-posta')">{{ copiedKey === 'n8n' ? 'Copied' : 'Copy' }}</button>
            </div>
          </div>

          <!-- REST -->
          <div v-show="activeSurface === 'rest'" id="panel-rest" class="tab-panel" role="tabpanel" aria-labelledby="tab-rest">
            <div class="panel-copy">
              <h3>REST API &amp; webhooks</h3>
              <p>Full REST API with token auth, webhooks, and an OpenAPI spec. Create posts, manage accounts, and track analytics from your own code.</p>
              <dl class="kv">
                <div><dt>Outbound webhooks</dt><dd>Notified when posts publish, fail, or change status</dd></div>
                <div><dt>Token authentication</dt><dd>Secure API tokens with granular scoping</dd></div>
                <div><dt>OpenAPI spec</dt><dd>Auto-generate clients in any language</dd></div>
              </dl>
              <a href="https://api.getposta.app/docs" target="_blank" rel="noopener noreferrer" class="text-link">Explore API docs →</a>
            </div>
            <div class="cmd cmd-block">
              <pre><code><span class="prompt">$</span> curl -X POST https://api.getposta.app/v1/posts \
  -H "Authorization: Bearer posta_..." \
  -d '{ "caption": "Shipping today!",
        "socialAccountIds": [42, 99] }'</code></pre>
              <button class="copy" @click="copyText('rest', 'curl -X POST https://api.getposta.app/v1/posts -H &quot;Authorization: Bearer posta_...&quot; -H &quot;Content-Type: application/json&quot; -d \'{ &quot;caption&quot;: &quot;Shipping today!&quot;, &quot;socialAccountIds&quot;: [42, 99] }\'')">{{ copiedKey === 'rest' ? 'Copied' : 'Copy' }}</button>
            </div>
          </div>

          <!-- OpenClaw -->
          <div v-show="activeSurface === 'openclaw'" id="panel-openclaw" class="tab-panel" role="tabpanel" aria-labelledby="tab-openclaw">
            <div class="panel-copy">
              <h3>Posta on ClawHub</h3>
              <p>Install the Posta skill on ClawHub and run it from any OpenClaw agent. Generate content and post from your terminal. One-click install, zero config.</p>
              <a href="https://clawhub.ai/STGime/posta" target="_blank" rel="noopener noreferrer" class="text-link">Install on ClawHub →</a>
            </div>
            <div class="cmd">
              <code><span class="prompt">hub</span> clawhub.ai/STGime/posta</code>
              <button class="copy" @click="copyText('openclaw', 'https://clawhub.ai/STGime/posta')">{{ copiedKey === 'openclaw' ? 'Copied' : 'Copy' }}</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Workflows -->
      <section class="section container" id="workflows">
        <div class="section-head">
          <span class="label">Workflows</span>
          <h2>What agents run on Posta</h2>
        </div>
        <div class="table-wrap">
          <table class="wf-table">
            <thead>
              <tr><th scope="col">Agent</th><th scope="col">What it does</th><th scope="col">Template</th></tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Autonomous content pipeline</th>
                <td>Watch an RSS or blog feed, draft a post with an LLM, and schedule it, hands-off.</td>
                <td><RouterLink to="/workflows/blog-to-social-media">n8n workflow →</RouterLink></td>
              </tr>
              <tr>
                <th scope="row">Launch agent</th>
                <td>One instruction turns a product into a multi-day, multi-platform campaign with per-network copy.</td>
                <td><RouterLink to="/workflows/product-launch-campaign">n8n workflow →</RouterLink></td>
              </tr>
              <tr>
                <th scope="row">Repurposing agent</th>
                <td>Feed in one asset (or a YouTube video) and let the agent fan it out to Reels, Shorts, TikTok, and feeds.</td>
                <td><RouterLink to="/workflows/youtube-to-social-media">n8n workflow →</RouterLink></td>
              </tr>
              <tr>
                <th scope="row">Carousel generator</th>
                <td>Summarize an article into a polished LinkedIn carousel PDF: AI text over AI backgrounds, assembled by Posta.</td>
                <td><RouterLink to="/workflows/blog-to-linkedin-carousel">n8n workflow →</RouterLink></td>
              </tr>
              <tr>
                <th scope="row">Monitor &amp; respond</th>
                <td>Pull comments via the API and react to publish/fail events with outbound webhooks to build a closed-loop social agent.</td>
                <td><RouterLink to="/developers">API docs →</RouterLink></td>
              </tr>
              <tr>
                <th scope="row">Agency at scale</th>
                <td>Drive dozens of connected accounts from one codebase or n8n flow with consistent scheduling and zero tab-switching.</td>
                <td><RouterLink to="/agents">For agents →</RouterLink></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- How it works -->
      <section class="section container" id="how">
        <div class="section-head">
          <span class="label">How it works</span>
          <h2>How agents use Posta</h2>
          <p class="section-sub">
            Posta is API-first and agent-first. Wire it into whatever your stack already speaks (MCP, Claude Code, n8n,
            or plain HTTP) and let the agent run the loop.
          </p>
        </div>
        <ol class="steps">
          <li class="step">
            <span class="step-num">01</span>
            <h3>Connect once</h3>
            <p>Generate a Posta API token, then pick a surface. One token, every network, every surface.</p>
            <pre class="code"><code>$ npx posta-mcp</code></pre>
          </li>
          <li class="step">
            <span class="step-num">02</span>
            <h3>Instruct in natural language or code</h3>
            <p>Your agent calls Posta as a tool: a Claude tool call via MCP, the Claude Code skill in plain English, an n8n node, or a typed POST. Same Posta on the other side.</p>
            <pre class="code"><code>"Schedule a launch announcement to LinkedIn
and Bluesky for tomorrow at 9am."</code></pre>
          </li>
          <li class="step">
            <span class="step-num">03</span>
            <h3>Posta executes and reports back</h3>
            <p>Posta auto-formats the media per platform, schedules or publishes, and fires HMAC-signed webhooks with retries and backoff when the post goes live.</p>
            <pre class="code"><code>POST {your-webhook}
{ "event": "post.published",
  "platform": "linkedin",
  "platformPostUrl": "..." }</code></pre>
          </li>
        </ol>
      </section>

      <!-- Why -->
      <section class="section container" id="features">
        <div class="section-head">
          <span class="label">Why Posta</span>
          <h2>Why agents choose Posta</h2>
          <p class="section-sub">
            Other social tools were built for humans clicking buttons. Posta is API-first, agent-first, and built for the
            class of automation that ships hundreds of posts a week: auto-formatting, closed-loop webhooks, and one
            token for every network.
          </p>
        </div>
        <div class="why-grid">
          <div class="why-cell">
            <span class="label">Autonomous pipelines</span>
            <h3>No human in the loop, no broken crops</h3>
            <p>
              Your agent never has to reframe media. Posta detects faces in photos and videos and keeps them in frame
              when converting to portrait, landscape, or square, automatically, on every upload.
            </p>
            <img src="/assets/images/Smart crop.png" alt="Smart crop example" class="why-image" loading="lazy" width="600" height="400" />
          </div>
          <div class="why-cell">
            <span class="label">One API, every network</span>
            <h3>One call, eight networks, every format</h3>
            <p>
              One <code>POST /v1/posts</code>, one MCP tool call, or one n8n node. Posta generates the variants for
              TikTok, Instagram, YouTube Shorts and more. Your pipeline never exports eight versions by hand.
            </p>
            <div class="ratio-row" aria-hidden="true">
              <div class="ratio"><i style="aspect-ratio: 9 / 16"></i><span>9:16</span></div>
              <div class="ratio"><i style="aspect-ratio: 4 / 5"></i><span>4:5</span></div>
              <div class="ratio"><i style="aspect-ratio: 1 / 1"></i><span>1:1</span></div>
              <div class="ratio"><i style="aspect-ratio: 16 / 9"></i><span>16:9</span></div>
            </div>
          </div>
          <div class="why-cell">
            <span class="label">Closed-loop with webhooks</span>
            <h3>Built for high-volume pipelines</h3>
            <p>
              Compression keeps quality where it matters and saves bytes where it doesn't, so high-volume posting
              uploads fast. When a post goes live, an HMAC-signed webhook tells your agent the next step can run.
            </p>
            <div class="compress">
              <div><span class="label">Original</span><b>1.4 MB</b></div>
              <span class="compress-arrow" aria-hidden="true">→</span>
              <div><span class="label">Posta</span><b>182 KB</b></div>
              <span class="compress-delta">−87%</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Demo Video -->
      <section class="section container" id="demo">
        <div class="video-layout">
          <div class="section-head">
            <span class="label">Walkthrough · 4 min</span>
            <h2>Set up Posta with Claude Code in minutes</h2>
            <p class="section-sub">Watch the full walkthrough: connect your account, add your API token, and create your first post.</p>
            <p class="video-fallback">
              Trouble playing?
              <a href="https://www.youtube.com/watch?v=CBG0qdnFxl4" target="_blank" rel="noopener">Watch on YouTube →</a>
            </p>
          </div>
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
        </div>
      </section>

      <!-- Platforms -->
      <section class="section container" id="platforms">
        <div class="section-head">
          <span class="label">Platforms</span>
          <h2>Supported platforms &amp; formats</h2>
          <p class="section-sub">
            Posta automatically optimizes your content for each platform's requirements. One upload, correct exports for every destination.
          </p>
        </div>
        <div class="table-wrap">
          <table class="platform-table">
            <thead>
              <tr><th scope="col">Network</th><th scope="col">Formats (px)</th></tr>
            </thead>
            <tbody>
              <tr><th scope="row">Instagram</th><td><span>Feed 1080×1080</span><span>Portrait 1080×1350</span><span>Reels 1080×1920</span><span>Stories 1080×1920</span></td></tr>
              <tr><th scope="row">TikTok</th><td><span>Video 1080×1920</span><span>Photo 1080×1920</span></td></tr>
              <tr><th scope="row">YouTube</th><td><span>Shorts 1080×1920</span><span>Landscape 1920×1080</span><span>Thumbnail 1280×720</span></td></tr>
              <tr><th scope="row">LinkedIn</th><td><span>Feed 1200×627</span><span>Square 1080×1080</span><span>Portrait 1080×1350</span><span>PDF Carousel 1080×1350</span></td></tr>
              <tr><th scope="row">Facebook</th><td><span>Feed 1200×630</span><span>Square 1080×1080</span><span>Stories 1080×1920</span><span>Reels 1080×1920</span></td></tr>
              <tr><th scope="row">Bluesky</th><td><span>Feed 2000×2000</span><span>Landscape 1200×675</span></td></tr>
              <tr><th scope="row">Threads</th><td><span>Feed 1080×1080</span><span>Portrait 1080×1350</span></td></tr>
              <tr><th scope="row">Pinterest</th><td><span>Pin 1000×1500</span><span>Square 1000×1000</span><span>Long 1000×2100</span></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Pricing -->
      <section class="section container" id="pricing">
        <div class="section-head section-head-row">
          <div>
            <span class="label">Pricing</span>
            <h2>Simple, predictable pricing</h2>
            <p class="section-sub">
              No bloated dashboards, no agency-level pricing. Pick a plan that fits your workflow and scale when you need to.
            </p>
          </div>
          <div class="pricing-toggle" role="group" aria-label="Billing interval">
            <button
              :class="['pricing-toggle-btn', { active: pricingInterval === 'month' }]"
              :aria-pressed="pricingInterval === 'month'"
              @click="pricingInterval = 'month'"
            >
              Monthly
            </button>
            <button
              :class="['pricing-toggle-btn', { active: pricingInterval === 'year' }]"
              :aria-pressed="pricingInterval === 'year'"
              @click="pricingInterval = 'year'"
            >
              Yearly <span class="save">−20%</span>
            </button>
          </div>
        </div>

        <div v-if="pricingLoading" class="pricing-state">
          <div class="spinner"></div>
        </div>
        <div v-else-if="pricingError" class="pricing-state">
          <p>Unable to load plans. Please try again later.</p>
        </div>

        <div v-else class="pricing-cards">
          <div v-if="starterPlan" class="plan">
            <div class="plan-head">
              <h3>Starter</h3>
              <span class="tag">14 days free</span>
            </div>
            <p class="plan-desc">For solo creators getting started with multi-platform publishing.</p>
            <div class="plan-price">
              <span class="amount">{{ formatPricingAmount(starterPlan) }}</span>
              <span class="period">/mo<template v-if="pricingInterval === 'year'"> · billed yearly</template></span>
            </div>
            <dl class="plan-limits">
              <div><dt>Social accounts</dt><dd>{{ formatLimit(starterPlan.maxSocialAccounts) }}</dd></div>
              <div><dt>Posts / month</dt><dd>{{ formatLimit(starterPlan.maxPostsPerMonth) }}</dd></div>
              <div><dt>Scheduled posts</dt><dd>{{ formatLimit(starterPlan.maxScheduledPosts) }}</dd></div>
            </dl>
            <ul class="plan-features">
              <li v-for="feature in starterPlan.features" :key="feature">{{ feature }}</li>
            </ul>
            <RouterLink v-if="signupEnabled" to="/signup" class="btn-secondary plan-cta">Start 14-day free trial</RouterLink>
            <button v-else class="btn-secondary plan-cta" @click="openWaitingList('pricing')">Join waiting list</button>
            <p class="plan-note">No credit card required</p>
          </div>

          <div v-if="professionalPlan" class="plan plan-featured">
            <div class="plan-head">
              <h3>Professional</h3>
              <span class="tag tag-signal">Most popular</span>
            </div>
            <p class="plan-desc">For teams and serious creators who need advanced features and higher limits.</p>
            <div class="plan-price">
              <span class="amount">{{ formatPricingAmount(professionalPlan) }}</span>
              <span class="period">/mo<template v-if="pricingInterval === 'year'"> · billed yearly</template></span>
            </div>
            <dl class="plan-limits">
              <div><dt>Social accounts</dt><dd>{{ formatLimit(professionalPlan.maxSocialAccounts) }}</dd></div>
              <div><dt>Posts / month</dt><dd>{{ formatLimit(professionalPlan.maxPostsPerMonth) }}</dd></div>
              <div><dt>Scheduled posts</dt><dd>{{ formatLimit(professionalPlan.maxScheduledPosts) }}</dd></div>
            </dl>
            <ul class="plan-features">
              <li v-for="feature in professionalPlan.features" :key="feature">{{ feature }}</li>
            </ul>
            <RouterLink v-if="signupEnabled" to="/signup" class="btn-primary plan-cta">Start 14-day free trial</RouterLink>
            <button v-else class="btn-primary plan-cta" @click="openWaitingList('pricing')">Join waiting list</button>
            <p class="plan-note">No credit card required · 14 days free</p>
          </div>
        </div>

        <details v-if="!pricingLoading && !pricingError && comparisonTable.length > 0" class="compare-plans">
          <summary>Compare plans in detail</summary>
          <div class="table-wrap">
            <table class="plans-table">
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col">Starter</th>
                  <th scope="col">Professional</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="category in comparisonTable" :key="category.name">
                  <tr class="cat-row"><td colspan="3">{{ category.name }}</td></tr>
                  <tr v-for="row in category.rows" :key="row.feature">
                    <td>{{ row.feature }}</td>
                    <td class="val">
                      <span v-if="row.starter === true" class="yes" aria-label="Included">✓</span>
                      <span v-else-if="row.starter === false" class="no" aria-label="Not included">—</span>
                      <span v-else>{{ row.starter }}</span>
                    </td>
                    <td class="val">
                      <span v-if="row.professional === true" class="yes" aria-label="Included">✓</span>
                      <span v-else-if="row.professional === false" class="no" aria-label="Not included">—</span>
                      <span v-else>{{ row.professional }}</span>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </details>

        <p class="footnote">* Unlimited is subject to our <a href="/terms">fair use policy</a>. Plans are designed for normal business usage and are not intended for automated bulk operations or abuse.</p>
      </section>

      <!-- Compare -->
      <section class="section container" id="compare">
        <div class="section-head">
          <span class="label">Compare</span>
          <h2>Posta vs. other social media schedulers</h2>
          <p class="section-sub">
            A quick, factual comparison. For a full pillar comparison see <RouterLink to="/compare">/compare</RouterLink>.
          </p>
        </div>
        <div class="table-wrap">
          <table class="compare-table">
            <thead>
              <tr>
                <th scope="col">Feature</th>
                <th scope="col" class="posta-col">Posta</th>
                <th scope="col">Buffer</th>
                <th scope="col">Hootsuite</th>
                <th scope="col">Later</th>
                <th scope="col">Publer</th>
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row">Networks supported</th><td class="posta-col">8</td><td>8</td><td>20+</td><td>7</td><td>11</td></tr>
              <tr><th scope="row">Bluesky support</th><td class="posta-col">Yes (native AT Protocol)</td><td>Yes</td><td>Partial</td><td>No</td><td>Yes</td></tr>
              <tr><th scope="row">Threads support</th><td class="posta-col">Yes (feed + Reels)</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
              <tr><th scope="row">Comments inbox</th><td class="posta-col">Yes (LinkedIn, TikTok)</td><td>Limited</td><td>Yes (Inbox 2.0)</td><td>No</td><td>Limited</td></tr>
              <tr><th scope="row">Public REST API</th><td class="posta-col">Yes (OpenAPI)</td><td>Yes</td><td>Enterprise only</td><td>No</td><td>Partial</td></tr>
              <tr><th scope="row">Outbound webhooks</th><td class="posta-col">Yes (HMAC-signed)</td><td>No</td><td>Enterprise only</td><td>No</td><td>No</td></tr>
              <tr><th scope="row">CLI / IDE posting</th><td class="posta-col">Yes (Claude Code)</td><td>No</td><td>No</td><td>No</td><td>No</td></tr>
              <tr><th scope="row">Free trial</th><td class="posta-col">14 days, no card</td><td>14 days</td><td>30 days</td><td>14 days</td><td>14 days</td></tr>
            </tbody>
          </table>
        </div>
        <p class="footnote">
          Comparison points are based on publicly published feature lists at the time this page was updated. If a row is out of date, please reach out. We keep this table honest.
        </p>
      </section>

      <!-- FAQ -->
      <section class="section container" id="faq">
        <div class="section-head">
          <span class="label">FAQ</span>
          <h2>Questions</h2>
        </div>
        <div class="faq">
          <details open>
            <summary>Who is Posta for?</summary>
            <p>
              Developers, AI agents, automation engineers, and the creators they support: anyone who treats social
              posting as a pipeline rather than a manual task. Plug Posta into an MCP server, an n8n workflow, a
              <RouterLink to="/cli-social-media-posting">Claude Code skill</RouterLink>, or the
              <RouterLink to="/developers">REST API</RouterLink> and let the agent do the rest.
            </p>
          </details>
          <details>
            <summary>What is the Posta MCP server?</summary>
            <p>
              Posta ships an MCP (Model Context Protocol) server so any MCP-capable client (Claude Desktop, Claude Code,
              Cursor, or your own agent) can create, schedule, and publish social media posts as tool calls. One install
              (<code>npx posta-mcp</code>), one token, every supported network.
            </p>
          </details>
          <details>
            <summary>Does Posta work with n8n?</summary>
            <p>
              Yes. The <code>n8n-nodes-posta</code> community node turns every Posta endpoint into a typed n8n node.
              We publish ready-to-fork <RouterLink to="/workflows">workflows</RouterLink> for blog-to-social,
              YouTube-to-social, product-launch campaigns, and LinkedIn carousel generation.
            </p>
          </details>
          <details>
            <summary>Can I post from Claude Code or the terminal?</summary>
            <p>
              Yes. The <RouterLink to="/cli-social-media-posting">Posta Claude Code skill</RouterLink> lets you create,
              schedule, and publish posts straight from your terminal or IDE using natural language.
              No dashboard required, no context-switch from your editor.
            </p>
          </details>
          <details>
            <summary>Does Posta publish directly to social networks?</summary>
            <p>
              Yes. Posta publishes directly to LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, Bluesky, and
              Threads via each platform's official API, and fires HMAC-signed webhooks back to your agent when posts
              go live, so closed-loop pipelines know exactly when they can act on a result.
            </p>
          </details>
          <details>
            <summary>How is this different from Buffer, Hootsuite, or Later?</summary>
            <p>
              Those tools are dashboards designed for humans clicking buttons. Posta is API-first and agent-first:
              full public <RouterLink to="/developers">REST API</RouterLink> on every paid tier, HMAC-signed outbound
              webhooks, an MCP server, a Claude Code skill, and an n8n community node. See the
              <RouterLink to="/compare">side-by-side comparison</RouterLink>.
            </p>
          </details>
          <details>
            <summary>Can I influence the roadmap?</summary>
            <p>
              Yes. Early users help shape integrations, workflow and pricing. Tell us how you work and what your
              current agent stack looks like when you request access.
            </p>
          </details>
        </div>
      </section>

      <!-- Closing CTA -->
      <section class="section container">
        <div class="closing">
          <div>
            <h2>Give your agent a publish button.</h2>
            <p class="section-sub">One token, eight networks, signed webhooks. 14 days free, no card.</p>
          </div>
          <div class="closing-actions">
            <RouterLink v-if="signupEnabled" to="/signup" class="btn-primary btn-lg">Start free trial</RouterLink>
            <button v-else class="btn-primary btn-lg" @click="openWaitingList('hero')">Join waiting list</button>
            <a href="https://api.getposta.app/docs" target="_blank" rel="noopener noreferrer" class="btn-ghost btn-lg">Read the docs</a>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-inner container">
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
          <div class="footer-heading">Company</div>
          <div class="footer-links">
            <RouterLink to="/blog">Blog</RouterLink>
            <a href="mailto:hello@getposta.app">Contact</a>
            <RouterLink to="/terms">Terms of Service</RouterLink>
            <RouterLink to="/privacy">Privacy Policy</RouterLink>
            <RouterLink to="/legal-notice">Legal Notice</RouterLink>
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
        <div class="footer-legal">© {{ currentYear }} Posta. Operated by Eurobase OÜ (Estonia). All rights reserved.</div>
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
/* Layout: one 1120px column. Sections are separated by hairlines, not cards. */
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--ink-0);
}

.container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding-inline: 24px;
}

main {
  flex: 1;
}

.label {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--fg-3);
}

h1 {
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: 600;
  line-height: 1.04;
  letter-spacing: -0.03em;
}

h2 {
  font-size: clamp(1.5rem, 2.6vw, 2rem);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

h3 {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
}

p {
  color: var(--fg-2);
}

code {
  font-size: 0.9em;
}

.text-link,
.section-sub a,
.faq a,
.footnote a,
.wf-table a {
  color: var(--text);
  text-decoration: underline;
  text-decoration-color: var(--line-strong);
  text-underline-offset: 3px;
  transition: text-decoration-color 0.15s;
}

.text-link:hover,
.section-sub a:hover,
.faq a:hover,
.footnote a:hover,
.wf-table a:hover {
  text-decoration-color: var(--signal);
}

.btn-lg {
  padding: 12px 18px;
  font-size: 15px;
}

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 30;
  background: var(--ink-0);
  border-bottom: 1px solid var(--line);
}

.header-inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-text {
  font-weight: 600;
  font-size: 17px;
  letter-spacing: -0.01em;
}

.nav {
  display: flex;
  gap: 2px;
  flex: 1;
}

.nav-link {
  color: var(--fg-2);
  font-size: 14px;
  font-weight: 500;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  transition: color 0.15s, background-color 0.15s;
}

.nav-link:hover {
  color: var(--text);
  background: var(--ink-1);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-login {
  border: 1px solid var(--line-strong);
  background: transparent;
  color: var(--text);
  padding: 7px 14px;
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s;
}

.btn-login:hover {
  border-color: var(--fg-3);
}

.btn-header {
  padding: 7px 14px;
}

/* Hero */
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  gap: 56px;
  align-items: center;
  padding-block: 80px 88px;
}

.hero-copy {
  display: grid;
  gap: 22px;
  align-content: start;
}

.hero-sub {
  font-size: 17px;
  line-height: 1.65;
  max-width: 60ch;
}

.hero-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.small-note {
  font-size: 13px;
  color: var(--fg-3);
}

.surface-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 0;
  padding-top: 18px;
  border-top: 1px solid var(--line);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--fg-3);
}

.surface-strip span + span::before {
  content: '/';
  margin: 0 10px;
  color: var(--line-strong);
}

/* Agent run log: the one moving element on the page */
.run {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--ink-1);
  font-family: var(--font-mono);
  font-size: 12.5px;
  min-width: 0;
}

.run-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 16px;
  border-bottom: 1px solid var(--line);
  color: var(--fg-3);
}

.run-id {
  color: var(--fg-2);
}

.run-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--signal);
  transition: color 0.3s;
}

.run-status::before {
  content: '';
  width: 6px;
  height: 6px;
  background: currentColor;
}

.run-status.done {
  color: var(--success);
}

.run-steps {
  list-style: none;
  padding: 8px 0;
}

.run-step {
  display: grid;
  grid-template-columns: 62px 14px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: baseline;
  padding: 8px 16px;
  color: var(--fg-2);
  transition: background-color 0.3s, color 0.3s;
}

.run-time,
.run-meta {
  color: var(--fg-3);
  font-variant-numeric: tabular-nums;
}

.run-text {
  overflow-wrap: anywhere;
}

.run-mark {
  color: var(--fg-3);
}

.run-step.ok .run-mark {
  color: var(--success);
}

.run-step.active {
  background: var(--signal-soft);
  color: var(--text);
}

.run-step.active .run-mark {
  color: var(--signal);
}

.run-step.pending {
  color: var(--fg-3);
}

.run-foot {
  display: grid;
  gap: 4px;
  padding: 12px 16px;
  border-top: 1px solid var(--line);
  color: var(--fg-3);
  overflow-x: auto;
  white-space: nowrap;
}

.run-foot .k {
  color: var(--fg-2);
}

.run-foot .v {
  color: var(--success);
}

/* Sections */
.section {
  padding-block: 72px;
  border-top: 1px solid var(--line);
}

.section-head {
  display: grid;
  gap: 12px;
  margin-bottom: 36px;
  max-width: 720px;
}

.section-head-row {
  max-width: none;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  flex-wrap: wrap;
}

.section-head-row > div {
  display: grid;
  gap: 12px;
  max-width: 640px;
}

.section-sub {
  font-size: 16px;
  line-height: 1.65;
  max-width: 66ch;
}

/* Connect tabs */
.tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--line);
  overflow-x: auto;
  scrollbar-width: none;
}

.tab {
  flex: none;
  background: none;
  border: 0;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  padding: 10px 16px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--fg-3);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.tab:hover {
  color: var(--text);
}

.tab.active {
  color: var(--text);
  border-bottom-color: var(--signal);
}

.tab-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 40px;
  align-items: start;
  padding-top: 32px;
}

.panel-copy {
  display: grid;
  gap: 14px;
  align-content: start;
}

.panel-copy h3 {
  font-size: 20px;
}

.panel-copy p {
  font-size: 15px;
  line-height: 1.65;
}

.kv {
  display: grid;
  border-top: 1px solid var(--line);
}

.kv div {
  display: grid;
  grid-template-columns: 170px minmax(0, 1fr);
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid var(--line);
  font-size: 14px;
}

.kv dt {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text);
  padding-top: 2px;
}

.kv dd {
  color: var(--fg-2);
}

.cmd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--ink-1);
  min-width: 0;
}

.cmd code,
.cmd pre {
  font-size: 13px;
  color: var(--text);
  overflow-x: auto;
  min-width: 0;
}

.cmd-block {
  align-items: flex-start;
}

.cmd pre {
  white-space: pre;
  line-height: 1.6;
}

.prompt {
  color: var(--signal);
  margin-right: 8px;
}

.copy {
  flex: none;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--fg-2);
  background: transparent;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  padding: 4px 9px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.copy:hover {
  color: var(--text);
  border-color: var(--fg-3);
}

.terminal {
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--ink-1);
  font-family: var(--font-mono);
  font-size: 12.5px;
  min-width: 0;
}

.terminal-head {
  padding: 8px 14px;
  border-bottom: 1px solid var(--line);
  color: var(--fg-3);
}

.terminal-body {
  display: grid;
  gap: 6px;
  padding: 14px;
}

.t-prompt {
  color: var(--text);
  margin-top: 8px;
}

.t-prompt:first-child {
  margin-top: 0;
}

.t-prompt span {
  color: var(--signal);
  margin-right: 6px;
}

.t-ok {
  color: var(--fg-2);
  padding-left: 14px;
}

.t-ok span {
  color: var(--success);
  margin-right: 6px;
}

/* Tables */
.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th,
td {
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
}

tbody tr:last-child > * {
  border-bottom: 0;
}

thead th {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fg-3);
  background: var(--ink-1);
  white-space: nowrap;
}

tbody th {
  font-weight: 500;
  color: var(--text);
}

td {
  color: var(--fg-2);
}

.wf-table {
  min-width: 640px;
}

.wf-table tbody th {
  width: 26%;
}

.wf-table td:last-child {
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: 13px;
}

.platform-table {
  min-width: 520px;
}

.platform-table tbody th {
  width: 160px;
}

.platform-table td {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 20px;
  font-family: var(--font-mono);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

/* Steps (a real sequence, so numbered) */
.steps {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.step {
  background: var(--ink-0);
  padding: 24px;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 10px;
  min-width: 0;
}

.step-num {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--signal);
}

.step p {
  font-size: 14px;
  line-height: 1.6;
}

.code {
  margin-top: 6px;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--ink-1);
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--fg-2);
  overflow-x: auto;
}

/* Why */
.why-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.why-cell {
  background: var(--ink-0);
  padding: 24px;
  display: grid;
  grid-template-rows: auto auto auto 1fr;
  gap: 12px;
  min-width: 0;
}

.why-cell p {
  font-size: 14px;
  line-height: 1.6;
}

.why-image {
  width: 100%;
  height: auto;
  align-self: end;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
}

.ratio-row {
  display: flex;
  align-items: flex-end;
  gap: 14px;
  align-self: end;
  padding-top: 8px;
}

.ratio {
  display: grid;
  gap: 6px;
  justify-items: center;
  flex: 1;
}

.ratio i {
  display: block;
  width: 100%;
  max-height: 120px;
  border: 1px solid var(--line-strong);
  border-radius: 2px;
  background: var(--ink-1);
}

.ratio:first-child i {
  width: auto;
  height: 120px;
}

.ratio span {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
}

.compress {
  align-self: end;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--ink-1);
}

.compress > div {
  display: grid;
  gap: 4px;
}

.compress b {
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: 18px;
  font-variant-numeric: tabular-nums;
}

.compress-arrow {
  color: var(--fg-3);
}

.compress-delta {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--success);
}

/* Video */
.video-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: 40px;
  align-items: center;
}

.video-layout .section-head {
  margin-bottom: 0;
}

.video-fallback {
  font-size: 13px;
  color: var(--fg-3);
}

.video-fallback a {
  color: var(--fg-2);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.video-frame {
  position: relative;
  aspect-ratio: 16 / 9;
  max-width: 100%;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--ink-1);
}

.video-frame iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.video-facade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  padding: 0;
  cursor: pointer;
  background: var(--ink-1);
}

.video-facade img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.75;
  transition: opacity 0.15s;
}

.video-facade:hover img {
  opacity: 0.9;
}

.video-play {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-md);
  background: var(--text);
  color: var(--ink-0);
}

.video-play svg {
  width: 26px;
  height: 26px;
}

/* Pricing */
.pricing-toggle {
  display: inline-flex;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.pricing-toggle-btn {
  background: transparent;
  border: 0;
  padding: 8px 14px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--fg-2);
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.pricing-toggle-btn + .pricing-toggle-btn {
  border-left: 1px solid var(--line-strong);
}

.pricing-toggle-btn.active {
  background: var(--ink-2);
  color: var(--text);
}

.save {
  color: var(--signal);
  margin-left: 4px;
}

.pricing-state {
  display: grid;
  place-items: center;
  min-height: 200px;
}

.pricing-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.plan {
  display: grid;
  grid-template-rows: auto auto auto auto 1fr auto auto;
  gap: 16px;
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--ink-0);
}

.plan-featured {
  background: var(--ink-1);
  border-color: var(--line-strong);
}

.plan-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.plan-head h3 {
  font-size: 18px;
}

.tag {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  padding: 3px 7px;
  border: 1px solid var(--line-strong);
  border-radius: 2px;
  color: var(--fg-2);
  white-space: nowrap;
}

.tag-signal {
  border-color: var(--signal);
  color: var(--signal);
}

.plan-desc {
  font-size: 14px;
}

.plan-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.amount {
  font-size: 44px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.period {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--fg-3);
}

.plan-limits {
  display: grid;
  border-top: 1px solid var(--line);
}

.plan-limits div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid var(--line);
  font-size: 14px;
}

.plan-limits dt {
  color: var(--fg-2);
}

.plan-limits dd {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  color: var(--text);
}

.plan-features {
  list-style: none;
  display: grid;
  gap: 8px;
  align-content: start;
  font-size: 14px;
  color: var(--fg-2);
}

.plan-features li {
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr);
  gap: 8px;
}

.plan-features li::before {
  content: '✓';
  color: var(--success);
  font-family: var(--font-mono);
  font-size: 12px;
  padding-top: 2px;
}

.plan-cta {
  width: 100%;
}

.plan-note {
  text-align: center;
  font-size: 12px;
  color: var(--fg-3);
}

.compare-plans {
  margin-top: 24px;
}

.compare-plans summary {
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--fg-2);
  padding: 10px 0;
  list-style-position: inside;
}

.compare-plans summary:hover {
  color: var(--text);
}

.compare-plans .table-wrap {
  margin-top: 12px;
}

.plans-table {
  min-width: 480px;
}

.plans-table .val {
  width: 22%;
  font-family: var(--font-mono);
  font-size: 13px;
}

.cat-row td {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fg-3);
  background: var(--ink-1);
  padding-block: 8px;
}

.yes {
  color: var(--success);
}

.no {
  color: var(--fg-3);
}

.footnote {
  margin-top: 20px;
  font-size: 13px;
  color: var(--fg-3);
  max-width: 80ch;
}

/* Compare */
.compare-table {
  min-width: 720px;
}

.compare-table .posta-col {
  color: var(--text);
  background: var(--signal-soft);
}

.compare-table thead .posta-col {
  color: var(--signal);
}

/* FAQ */
.faq {
  border-top: 1px solid var(--line);
  max-width: 820px;
}

.faq details {
  border-bottom: 1px solid var(--line);
}

.faq summary {
  cursor: pointer;
  list-style: none;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--text);
}

.faq summary::-webkit-details-marker {
  display: none;
}

.faq summary::after {
  content: '+';
  font-family: var(--font-mono);
  color: var(--fg-3);
}

.faq details[open] summary::after {
  content: '−';
}

.faq details p {
  padding-bottom: 18px;
  font-size: 15px;
  line-height: 1.65;
  max-width: 70ch;
}

/* Closing */
.closing {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  padding: 32px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--ink-1);
}

.closing > div:first-child {
  display: grid;
  gap: 8px;
}

.closing-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Footer */
.footer {
  border-top: 1px solid var(--line);
}

.footer-inner {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 32px;
  padding-block: 48px 40px;
}

.footer-section {
  display: grid;
  gap: 12px;
  align-content: start;
}

.footer-heading {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--fg-3);
}

.footer-links {
  display: grid;
  gap: 8px;
}

.footer-links a {
  font-size: 14px;
  color: var(--fg-2);
  transition: color 0.15s;
}

.footer-links a:hover {
  color: var(--text);
}

.footer-legal {
  grid-column: 1 / -1;
  padding-top: 20px;
  border-top: 1px solid var(--line);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--fg-3);
}

/* Responsive */
@media (max-width: 960px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 40px;
    padding-block: 56px 64px;
  }
  .tab-panel,
  .video-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .steps,
  .why-grid {
    grid-template-columns: 1fr;
  }
  .footer-inner {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .nav {
    display: none;
  }
  .header-inner {
    justify-content: space-between;
  }
  .pricing-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .container,
  .header-inner {
    padding-inline: 16px;
  }
  .section {
    padding-block: 56px;
  }
  .btn-login {
    padding: 7px 10px;
  }
  .run-step {
    grid-template-columns: 56px 12px minmax(0, 1fr);
    padding-inline: 12px;
  }
  .run-meta {
    display: none;
  }
  .kv div {
    grid-template-columns: 1fr;
    gap: 2px;
  }
  .plan,
  .closing {
    padding: 22px;
  }
  .footer-inner {
    grid-template-columns: 1fr;
  }
}
</style>
