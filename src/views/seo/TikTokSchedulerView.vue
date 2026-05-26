<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import type { WaitingListSource } from '@/services'

const waitingListSource = ref<WaitingListSource>('seo-tiktok')

const tiktokFaq = [
  {
    q: 'Can I schedule TikTok videos with Posta?',
    a: 'Yes. Posta publishes directly to TikTok via the official Content Posting API. Set a future date and time, and Posta uploads the video at that moment.',
  },
  {
    q: 'Does Posta support TikTok photo posts?',
    a: 'Yes. Posta supports both video and photo posts on TikTok. Photo posts are uploaded via TikTok\'s PULL_FROM_URL flow with a signed media URL.',
  },
  {
    q: 'What privacy levels can I set on scheduled TikToks?',
    a: 'All four: PUBLIC_TO_EVERYONE, MUTUAL_FOLLOW_FRIENDS, FOLLOWER_OF_CREATOR, and SELF_ONLY. Posta surfaces only the privacy levels your TikTok account is currently eligible to use.',
  },
  {
    q: 'Can I disable comments, duets, or stitches on scheduled posts?',
    a: 'Yes. Each option is a toggle on the post composer. Defaults match TikTok\'s UX guidelines (interaction controls default off).',
  },
  {
    q: 'Does Posta auto-format my videos to 1080×1920?',
    a: 'Yes. Posta detects faces and important subjects, then crops to TikTok\'s 9:16 portrait format with the subject centered. Smart compression keeps the file size within TikTok\'s limits without visible quality loss.',
  },
  {
    q: 'How does Posta handle branded-content disclosure?',
    a: 'Posta surfaces TikTok\'s branded-content and paid-partnership toggles at compose time, and requires explicit user acknowledgement of TikTok\'s branded-content policy before publishing. We never enable these toggles automatically.',
  },
  {
    q: 'Can I save scheduled TikToks as drafts to finalize on the TikTok mobile app?',
    a: 'Yes. Toggle "Save as draft" on the post composer. Posta uploads the content to your TikTok inbox so you can edit and publish it from the mobile app.',
  },
]

useHead({
  title: 'TikTok Scheduler – Schedule TikTok Videos Automatically',
  meta: [
    { name: 'description', content: 'Schedule TikTok videos and go viral on autopilot. Posta auto-formats your content to 1080x1920, compresses for fast mobile uploads, and publishes on your schedule.' },
    { name: 'keywords', content: 'tiktok scheduler, tiktok posting tool, schedule tiktok videos, tiktok auto post, tiktok content planner' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://getposta.app/tiktok-scheduler' },
    { property: 'og:title', content: 'TikTok Scheduler – Schedule TikTok Videos Automatically | Posta' },
    { property: 'og:description', content: 'Schedule TikTok videos and go viral on autopilot. Auto-format, compress and publish on your schedule.' },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'TikTok Scheduler – Schedule TikTok Videos Automatically | Posta' },
    { name: 'twitter:description', content: 'Schedule TikTok videos and go viral on autopilot. Auto-format, compress and publish on your schedule.' },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [
    { rel: 'canonical', href: 'https://getposta.app/tiktok-scheduler' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: tiktokFaq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }),
    },
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>Schedule TikTok videos and go viral on autopilot</h1>
      <p class="hero-sub">
        Posta takes your video content, optimizes it for TikTok's 9:16 format, compresses it for fast mobile uploads, and publishes it exactly when you want.
      </p>
    </section>

    <section class="content-section">
      <h2>TikTok-ready in seconds</h2>
      <p>
        TikTok's algorithm rewards consistency. But preparing vertical video content, checking file sizes, and manually uploading at peak hours is a grind. Posta automates the technical side: upload your source video in any format, and Posta converts it to the 1080x1920 portrait format TikTok requires. Face-aware cropping ensures subjects stay centered, and smart compression keeps file sizes within TikTok's limits without visible quality loss.
      </p>
    </section>

    <section class="content-section">
      <h2>Post at the right time, every time</h2>
      <p>
        Timing matters on TikTok. Post when your audience is scrolling and you get more initial engagement, which feeds the algorithm. Posta's timezone-safe scheduling lets you queue posts for specific times regardless of where you or your audience are located. Plan a week of TikTok content in one sitting and let Posta handle the rest.
      </p>
    </section>

    <section class="content-section">
      <h2>Repurpose content across platforms</h2>
      <p>
        The same video that works on TikTok can work on Instagram Reels, YouTube Shorts and Facebook Reels. Posta generates platform-specific variants from the same source file, each with the correct dimensions, compression and metadata. Create once, publish everywhere. No re-exporting, no manual adjustments, no switching between five different apps.
      </p>
      <div class="platform-pills">
        <span class="pill active">TikTok 1080x1920</span>
        <span class="pill">Instagram Reels</span>
        <span class="pill">YouTube Shorts</span>
        <span class="pill">Facebook Reels</span>
      </div>
    </section>

    <section class="faq-section">
      <h2>TikTok scheduling FAQ</h2>
      <div class="faq-list">
        <div v-for="item in tiktokFaq" :key="item.q" class="faq-item">
          <h3>{{ item.q }}</h3>
          <p>{{ item.a }}</p>
        </div>
      </div>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Start scheduling TikTok content"
      subtext="Auto-format, compress and schedule your TikTok videos with Posta."
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
  max-width: 640px;
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
  max-width: 720px;
  margin-bottom: 14px;
}

.platform-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.pill {
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.5);
  color: var(--muted);
}

.pill.active {
  border-color: rgba(99, 102, 241, 0.7);
  color: #a5b4fc;
  background: rgba(79, 70, 229, 0.15);
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
