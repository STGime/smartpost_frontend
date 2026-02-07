<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import type { WaitingListSource } from '@/services'

const waitingListSource = ref<WaitingListSource>('seo-scheduler')

useHead({
  title: 'Social Media Scheduler – Schedule Posts Across All Platforms',
  meta: [
    { name: 'description', content: 'Schedule your social media posts in one place. Posta supports TikTok, Instagram, YouTube, LinkedIn, Facebook, Pinterest and more with smart cropping and auto-formatting.' },
    { name: 'keywords', content: 'social media scheduler, schedule posts, posting tool, social media planner, content scheduler, multi-platform posting' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://getposta.app/social-media-scheduler' },
    { property: 'og:title', content: 'Social Media Scheduler – Schedule Posts Across All Platforms | Posta' },
    { property: 'og:description', content: 'Schedule your social media posts in one place. Smart cropping, auto-formatting and multi-platform support.' },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Social Media Scheduler – Schedule Posts Across All Platforms | Posta' },
    { name: 'twitter:description', content: 'Schedule your social media posts in one place. Smart cropping, auto-formatting and multi-platform support.' },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [
    { rel: 'canonical', href: 'https://getposta.app/social-media-scheduler' },
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>Schedule your social media posts in one place</h1>
      <p class="hero-sub">
        Stop switching between apps. Posta lets you upload one piece of content, auto-format it for every platform, and schedule it all from a single dashboard.
      </p>
    </section>

    <section class="content-section">
      <h2>Why you need a social media scheduler</h2>
      <p>
        Consistency is the single biggest factor in growing an audience on social media. But posting regularly across TikTok, Instagram, YouTube, LinkedIn, Facebook and Pinterest means managing different formats, aspect ratios, file sizes and posting times. A social media scheduler removes that friction by letting you plan, format and queue content in advance.
      </p>
      <p>
        Posta takes scheduling further. Instead of just queuing text and images, Posta uses face-aware cropping and smart compression to generate platform-ready variants from a single source file. Upload once, and your content is automatically formatted for Reels, Shorts, Stories, feed posts and more.
      </p>
    </section>

    <section class="content-section">
      <h2>One workflow, nine platforms</h2>
      <p>
        Most schedulers treat every platform the same. Posta understands the differences. Each platform has its own aspect ratios, resolution limits and compression quirks. Posta handles all of it behind the scenes so your posts look native on every feed. Connect your accounts, set your schedule, and let Posta do the heavy lifting.
      </p>
      <div class="platform-pills">
        <span class="pill">TikTok</span>
        <span class="pill">Instagram</span>
        <span class="pill">YouTube Shorts</span>
        <span class="pill">LinkedIn</span>
        <span class="pill">Facebook</span>
        <span class="pill">Pinterest</span>
        <span class="pill">Bluesky</span>
        <span class="pill">Threads</span>
        <span class="pill">X (Twitter)</span>
      </div>
    </section>

    <section class="content-section">
      <h2>Built for creators who ship fast</h2>
      <p>
        Posta is designed for indie creators, solo founders and lean marketing teams. No bloated dashboards or enterprise pricing. Just smart media handling, a visual calendar, timezone-safe scheduling and predictable plans that scale when you do. Start with one asset, end up with scheduled posts across every channel.
      </p>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Start scheduling smarter"
      subtext="Join the creators who save hours every week with Posta."
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
</style>
