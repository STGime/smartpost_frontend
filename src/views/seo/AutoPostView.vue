<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import type { WaitingListSource } from '@/services'

const waitingListSource = ref<WaitingListSource>('seo-autopost')

useHead({
  title: 'Auto Post Social Media – Automatic Posting, Zero Manual Work',
  meta: [
    { name: 'description', content: 'Automatic social media posting with zero manual work. Posta auto-crops, auto-formats and auto-publishes your content across TikTok, Instagram, YouTube and more.' },
    { name: 'keywords', content: 'auto post social media, automatic posting, auto publish, social media automation, automated social media posts' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://getposta.app/auto-post-social-media' },
    { property: 'og:title', content: 'Auto Post Social Media – Automatic Posting, Zero Manual Work | Posta' },
    { property: 'og:description', content: 'Automatic social media posting with zero manual work. Auto-crop, auto-format and auto-publish across all platforms.' },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Auto Post Social Media – Automatic Posting, Zero Manual Work | Posta' },
    { name: 'twitter:description', content: 'Automatic social media posting with zero manual work. Auto-crop, auto-format and auto-publish across all platforms.' },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [
    { rel: 'canonical', href: 'https://getposta.app/auto-post-social-media' },
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>Automatic social media posting, zero manual work</h1>
      <p class="hero-sub">
        Upload your content once. Posta auto-crops for every platform, auto-compresses for optimal quality, and auto-publishes on your schedule.
      </p>
    </section>

    <section class="content-section">
      <h2>From upload to published, fully automated</h2>
      <p>
        Manual social media posting is a time sink. For every piece of content, you open an editor, export multiple crops, log into each platform, upload, write captions, and hit publish. Multiply that by five platforms and three posts a week, and you are spending hours on repetitive work that adds no creative value.
      </p>
      <p>
        Posta automates the entire pipeline. Drop in your source file, select your target platforms, and Posta takes over. It detects faces and subjects, generates correctly cropped variants for each platform, compresses media to platform-specific size limits, and queues everything for publishing at the times you set. You stay creative. Posta handles the logistics.
      </p>
    </section>

    <section class="content-section">
      <h2>Smart automation, not dumb duplication</h2>
      <p>
        Most auto-posting tools just copy the same file to every platform. That results in awkward crops, letterboxing, and content that looks out of place. Posta is different. Every variant is tailored to its destination: 9:16 for TikTok and Reels, 1:1 for Instagram feed, 16:9 for YouTube. Face detection ensures your subjects are always in frame, and smart compression balances quality and file size for each platform's requirements.
      </p>
    </section>

    <section class="content-section">
      <h2>Set it and forget it</h2>
      <p>
        With Posta's visual calendar and timezone-aware scheduling, you can plan days or weeks of content in a single session. Batch scheduling lets you queue up a week of posts in minutes. Once it is scheduled, Posta handles the rest. Your content goes live when your audience is active, whether you are at your desk or not.
      </p>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Automate your social media workflow"
      subtext="Stop wasting time on manual posting. Let Posta handle the heavy lifting."
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
</style>
