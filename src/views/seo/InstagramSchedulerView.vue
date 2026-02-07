<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import type { WaitingListSource } from '@/services'

const waitingListSource = ref<WaitingListSource>('seo-instagram')

useHead({
  title: 'Instagram Scheduler – Schedule Reels, Stories & Feed Posts',
  meta: [
    { name: 'description', content: 'Schedule Instagram posts, Reels and Stories with automatic face-aware cropping and format optimization. Posta handles 1080x1080, 1080x1350 and 1080x1920 so you never crop manually again.' },
    { name: 'keywords', content: 'instagram scheduler, instagram auto post, schedule instagram reels, instagram stories scheduler, instagram posting tool' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://getposta.app/instagram-scheduler' },
    { property: 'og:title', content: 'Instagram Scheduler – Schedule Reels, Stories & Feed Posts | Posta' },
    { property: 'og:description', content: 'Schedule Instagram posts, Reels and Stories with automatic face-aware cropping and format optimization.' },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Instagram Scheduler – Schedule Reels, Stories & Feed Posts | Posta' },
    { name: 'twitter:description', content: 'Schedule Instagram posts, Reels and Stories with automatic face-aware cropping and format optimization.' },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [
    { rel: 'canonical', href: 'https://getposta.app/instagram-scheduler' },
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>Schedule Instagram posts, Reels and Stories</h1>
      <p class="hero-sub">
        Posta auto-formats your content for every Instagram placement, from square feed posts to 9:16 Reels and Stories, with face-aware cropping built in.
      </p>
    </section>

    <section class="content-section">
      <h2>Instagram formats, handled automatically</h2>
      <p>
        Instagram supports multiple content formats and each one has different dimension requirements. Feed posts work best at 1080x1080 or 1080x1350, Reels and Stories need 1080x1920, and carousel images have their own constraints. Manually exporting and cropping for every format wastes hours every week.
      </p>
      <p>
        Posta solves this by analyzing your source image or video, detecting faces and important subjects, then generating correctly cropped variants for every Instagram format. The result is professional-looking content that fits Instagram natively, without you touching an editor.
      </p>
      <div class="format-list">
        <div class="format-item">
          <span class="format-label">Feed</span>
          <span class="format-size">1080 x 1080</span>
        </div>
        <div class="format-item">
          <span class="format-label">Portrait</span>
          <span class="format-size">1080 x 1350</span>
        </div>
        <div class="format-item">
          <span class="format-label">Reels</span>
          <span class="format-size">1080 x 1920</span>
        </div>
        <div class="format-item">
          <span class="format-label">Stories</span>
          <span class="format-size">1080 x 1920</span>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2>Face-aware cropping keeps your subjects in frame</h2>
      <p>
        Standard cropping tools cut from the center, which often means faces are partially cropped out when converting between aspect ratios. Posta uses face detection to identify people in your content and keeps them centered regardless of the target format. Your portrait shots stay portrait-friendly, even in a square crop.
      </p>
    </section>

    <section class="content-section">
      <h2>Schedule and forget</h2>
      <p>
        Plan your Instagram content calendar days or weeks in advance. Set the exact date and time for each post, preview how it will look on Instagram, and let Posta handle the publishing. Timezone-safe scheduling means your posts go live when your audience is active, no matter where you are.
      </p>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Simplify your Instagram workflow"
      subtext="Auto-crop, auto-format, and schedule your Instagram content in one place."
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

.format-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.format-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(15, 23, 42, 0.85);
}

.format-label {
  color: var(--text);
  font-weight: 500;
}

.format-size {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
  color: #a5b4fc;
  font-size: 11px;
  background: rgba(79, 70, 229, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
}
</style>
