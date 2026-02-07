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

useHead({
  title: 'Smart Social Media Posting for Creators & Teams',
  meta: [
    { name: 'description', content: 'Posta lets you create once and publish everywhere. AI-powered smart cropping, face-aware framing, automatic compression and scheduling for TikTok, Instagram, YouTube Shorts and more.' },
    { name: 'keywords', content: 'social media scheduler, auto post, TikTok scheduling, Instagram scheduler, smart cropping, face detection, multi-platform posting, content creator tools, social media automation' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://getposta.app/' },
    { property: 'og:title', content: 'Posta – Smart Social Media Posting for Creators & Teams' },
    { property: 'og:description', content: 'Create once, publish everywhere. AI-powered smart cropping, face-aware framing, and scheduling for TikTok, Instagram, YouTube Shorts and more.' },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { property: 'og:site_name', content: 'Posta' },
    { property: 'og:locale', content: 'en_US' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:url', content: 'https://getposta.app/' },
    { name: 'twitter:title', content: 'Posta – Smart Social Media Posting for Creators & Teams' },
    { name: 'twitter:description', content: 'Create once, publish everywhere. AI-powered smart cropping, face-aware framing, and scheduling for TikTok, Instagram, YouTube Shorts and more.' },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [
    { rel: 'canonical', href: 'https://getposta.app/' },
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
              text: 'Posta is for creators, solo founders and small marketing teams who post regularly across multiple platforms and are tired of manually resizing, re-exporting and re-uploading content.',
            },
          },
          {
            '@type': 'Question',
            name: 'Will you support direct publishing?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. The beta focuses on creating perfect, platform-ready assets. Direct publishing and scheduling to selected platforms will roll out step by step.',
            },
          },
          {
            '@type': 'Question',
            name: 'How is this different from existing tools?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Posta goes deeper on media intelligence – face detection, safe crops and smart compression – instead of just duplicating your post across platforms.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I influence the roadmap?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Early users help shape integrations, workflow and pricing. Tell us how you work and what your current stack looks like when you request access.',
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
        name: 'How to schedule social media posts with Posta',
        description: 'Three simple steps to go from a single asset to scheduled posts across all your social media platforms.',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Drop in your source asset',
            text: 'Start with a single image or video in the format you already use today. Posta analyzes subjects, faces and aspect ratio.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Pick platforms & variants',
            text: 'Choose where you want to post. Posta prepares platform-ready variants with safe framing and compression.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Schedule & ship',
            text: 'Approve the posts, set dates and times, and let Posta take care of the publishing calendar.',
          },
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
        { feature: 'Social accounts', starter: String(s.maxSocialAccounts), professional: String(p.maxSocialAccounts) },
        { feature: 'Posts per month', starter: String(s.maxPostsPerMonth), professional: String(p.maxPostsPerMonth) },
        { feature: 'Scheduled posts', starter: String(s.maxScheduledPosts), professional: String(p.maxScheduledPosts) },
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
        { feature: 'X (Twitter)', starter: true, professional: true },
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
      ],
    },
    {
      name: 'Scheduling',
      rows: [
        { feature: 'Calendar view', starter: true, professional: true },
        { feature: 'Timezone-safe scheduling', starter: true, professional: true },
        { feature: 'Batch scheduling', starter: false, professional: true },
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
            <div class="logo-tagline">Create once. Post everywhere.</div>
          </div>
        </div>
        <div class="header-actions">
          <span class="beta-tag">Private beta</span>
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
              <span class="eyebrow-pill">Multi-channel</span>
              <span>One workflow for all your socials</span>
            </div>
            <h1>
              Create once, <span class="gradient-text">post everywhere</span>.
            </h1>
            <p class="hero-sub">
              Posta turns one piece of content into platform-ready posts for TikTok, Instagram, YouTube & more –
              with face-aware cropping, smart compression and simple scheduling built-in.
            </p>

            <div class="hero-bullets">
              <div class="chip">
                <span class="chip-dot"></span>
                Face-aware framing & smart crops
              </div>
              <div class="chip">
                Auto-format for Reels, Shorts & feed
              </div>
              <div class="chip">
                Creator-friendly pricing
              </div>
            </div>

            <div class="hero-actions">
              <RouterLink v-if="signupEnabled" to="/signup" class="btn-primary">
                <span>Start free trial</span>
                <span class="arrow">→</span>
              </RouterLink>
              <button v-else class="btn-primary" @click="openWaitingList('hero')">
                <span>Join waiting list</span>
                <span class="arrow">→</span>
              </button>
              <a href="#how" class="btn-ghost">
                See how it works
              </a>
            </div>
            <p class="small-note">
              Built for indie creators, small teams and lean marketing setups.
            </p>
          </div>

          <div class="hero-card-wrapper">
            <div class="card">
              <div class="card-header">
                <div>
                  <div class="card-label">Sample campaign · Weekly highlights</div>
                  <div class="card-title">1 asset → 8 posts scheduled</div>
                </div>
                <span class="pill-green">Smart automation</span>
              </div>

              <div class="timeline">
                <div class="timeline-row">
                  <span class="timeline-label">Source video</span>
                  <span class="timeline-value">Square · 1080×1080</span>
                </div>
                <div class="timeline-row">
                  <span class="timeline-label">Outputs</span>
                  <span class="timeline-value">Reels, Shorts, TikTok, feed</span>
                </div>
                <div class="timeline-bar">
                  <div class="timeline-fill"></div>
                </div>
              </div>

              <div class="mini-grid">
                <div class="mini-card">
                  <div class="mini-title">Face-aware crops</div>
                  <div class="mini-main">Keeps faces centered in 9:16 & 16:9</div>
                  <div class="mini-sub">No more manual reframing for every platform.</div>
                </div>
                <div class="mini-card">
                  <div class="mini-title">Smart compression</div>
                  <div class="mini-main">Optimized for quality & size</div>
                  <div class="mini-sub">Ideal for mobile uploads and slower networks.</div>
                </div>
              </div>
            </div>

            <div class="badge-stack">
              <div class="badge">
                <span class="badge-dot-purple"></span>
                <span>Detects faces in your creatives</span>
              </div>
              <div class="badge">
                <span class="badge-dot-cyan"></span>
                <span>Push-ready for TikTok & Instagram</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Why Posta Section -->
        <section class="section" id="features">
          <h2 class="section-title">Why Posta?</h2>
          <p class="section-sub">
            Existing social tools are either too simple or too expensive. Posta focuses on what solo builders and lean
            teams actually need: smart media handling, simple workflows and predictable pricing.
          </p>

          <div class="feature-grid">
            <div class="feature-card feature-card-with-image">
              <div class="feature-tag">Media intelligence</div>
              <div class="feature-title">Face detection & smart cropping</div>
              <div class="feature-body">
                Automatically detects faces in your photos and videos and keeps them in frame when converting to
                portrait, landscape or square formats.
              </div>
              <img src="/assets/images/Smart crop.png" alt="Smart crop example" class="feature-image" />
            </div>
            <div class="feature-card feature-card-with-image">
              <div class="feature-tag">Format once</div>
              <div class="feature-title">Auto layouts for every platform</div>
              <div class="feature-body">
                Generate variants tailored for TikTok, Instagram, YouTube Shorts and more – without exporting eight
                different versions by hand.
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
            <div class="feature-card feature-card-with-image">
              <div class="feature-tag">Performance</div>
              <div class="feature-title">Smart compression engine</div>
              <div class="feature-body">
                Compress images and video so they upload fast and still look good. Keep quality where it matters, save
                bytes where it doesn't.
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
        <section class="section" id="how">
          <h2 class="section-title">How it works</h2>
          <p class="section-sub">
            Posta is designed to fit into your existing workflow. You bring your creative; Posta takes care of formats,
            variants and timing.
          </p>

          <div class="how-grid">
            <div class="step-card">
              <div class="step-num">Step 1</div>
              <div class="step-title">Drop in your source asset</div>
              <div class="step-body">
                Start with a single image or video in the format you already use today. Posta analyzes subjects, faces
                and aspect ratio.
              </div>
              <div class="pill-row">
                <span class="pill">Images & short video</span>
              </div>
            </div>
            <div class="step-card">
              <div class="step-num">Step 2</div>
              <div class="step-title">Pick platforms & variants</div>
              <div class="step-body">
                Choose where you want to post. Posta prepares platform-ready variants with safe framing and compression.
              </div>
              <div class="pill-row">
                <span class="pill">TikTok</span>
                <span class="pill">Instagram</span>
                <span class="pill">YouTube Shorts</span>
              </div>
            </div>
            <div class="step-card">
              <div class="step-num">Step 3</div>
              <div class="step-title">Schedule & ship</div>
              <div class="step-body">
                Approve the posts, set dates and times, and let Posta take care of the publishing calendar.
              </div>
              <div class="pill-row">
                <span class="pill">Batch scheduling</span>
                <span class="pill">Timezone safe</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Pricing Section -->
        <section class="section" id="pricing">
          <h2 class="section-title">Simple, predictable pricing</h2>
          <p class="section-sub">
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
                  <span class="pricing-limit-value">{{ starterPlan.maxSocialAccounts }}</span>
                  <span class="pricing-limit-label">social accounts</span>
                </div>
                <div class="pricing-limit-row">
                  <span class="pricing-limit-value">{{ starterPlan.maxPostsPerMonth }}</span>
                  <span class="pricing-limit-label">posts / month</span>
                </div>
                <div class="pricing-limit-row">
                  <span class="pricing-limit-value">{{ starterPlan.maxScheduledPosts }}</span>
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
                Start free trial
                <span class="arrow">→</span>
              </RouterLink>
              <button v-else class="btn-ghost pricing-cta" @click="openWaitingList('pricing')">
                Join waiting list
                <span class="arrow">→</span>
              </button>
            </div>

            <!-- Professional -->
            <div v-if="professionalPlan" class="pricing-card pricing-card-featured">
              <div class="pricing-popular-badge">Most Popular</div>
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
                  <span class="pricing-limit-value">{{ professionalPlan.maxSocialAccounts }}</span>
                  <span class="pricing-limit-label">social accounts</span>
                </div>
                <div class="pricing-limit-row">
                  <span class="pricing-limit-value">{{ professionalPlan.maxPostsPerMonth }}</span>
                  <span class="pricing-limit-label">posts / month</span>
                </div>
                <div class="pricing-limit-row">
                  <span class="pricing-limit-value">{{ professionalPlan.maxScheduledPosts }}</span>
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
                Start free trial
                <span class="arrow">→</span>
              </RouterLink>
              <button v-else class="btn-primary pricing-cta" @click="openWaitingList('pricing')">
                Join waiting list
                <span class="arrow">→</span>
              </button>
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
        </section>

        <!-- Platforms Section -->
        <section class="section" id="platforms">
          <h2 class="section-title">Supported platforms & formats</h2>
          <p class="section-sub">
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

        <!-- FAQ Section -->
        <section class="section">
          <h2 class="section-title">Questions</h2>
          <div class="faq-grid">
            <div class="faq-item">
              <div class="faq-q">Who is Posta for?</div>
              <div class="faq-a">
                Posta is for creators, solo founders and small marketing teams who post regularly across multiple
                platforms and are tired of manually resizing, re-exporting and re-uploading content.
              </div>
            </div>
            <div class="faq-item">
              <div class="faq-q">Will you support direct publishing?</div>
              <div class="faq-a">
                Yes. The beta focuses on creating perfect, platform-ready assets. Direct publishing and scheduling to
                selected platforms will roll out step by step.
              </div>
            </div>
            <div class="faq-item">
              <div class="faq-q">How is this different from existing tools?</div>
              <div class="faq-a">
                Posta goes deeper on media intelligence – face detection, safe crops and smart compression – instead of
                just duplicating your post across platforms.
              </div>
            </div>
            <div class="faq-item">
              <div class="faq-q">Can I influence the roadmap?</div>
              <div class="faq-a">
                Yes. Early users help shape integrations, workflow and pricing. Tell us how you work and what your
                current stack looks like when you request access.
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-inner">
        <div>© {{ currentYear }} Posta. All rights reserved.</div>
        <div class="footer-links">
          <a href="mailto:hello@getposta.app">Contact</a>
          <RouterLink to="/terms">Terms of Service</RouterLink>
          <RouterLink to="/privacy">Privacy Policy</RouterLink>
          <RouterLink to="/impressum">Impressum</RouterLink>
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
}

.beta-tag {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--muted);
  padding: 4px 9px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(15, 23, 42, 0.7);
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
  font-size: 11px;
  color: var(--muted);
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

.section-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 10px;
}

.section-sub {
  font-size: 13px;
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
.platform-icon.twitter { color: #ffffff; }
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
  .faq-grid {
    grid-template-columns: minmax(0, 1fr);
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
}
</style>
