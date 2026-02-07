<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import type { WaitingListSource } from '@/services'

const waitingListSource = ref<WaitingListSource>('seo-tools')

useHead({
  title: 'Social Media Tools – Smart Tools for Creators Who Ship Fast',
  meta: [
    { name: 'description', content: 'Social media tools built for creators who ship fast. Face-aware cropping, smart compression, multi-platform formatting and scheduling in one place.' },
    { name: 'keywords', content: 'social media tools, management tools, social media management, creator tools, content creation tools, social media platform tools' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://getposta.app/social-media-tools' },
    { property: 'og:title', content: 'Social Media Tools – Smart Tools for Creators Who Ship Fast | Posta' },
    { property: 'og:description', content: 'Social media tools built for creators who ship fast. Face-aware cropping, smart compression, multi-platform formatting and scheduling.' },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Social Media Tools – Smart Tools for Creators Who Ship Fast | Posta' },
    { name: 'twitter:description', content: 'Social media tools built for creators who ship fast. Face-aware cropping, smart compression, multi-platform formatting and scheduling.' },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [
    { rel: 'canonical', href: 'https://getposta.app/social-media-tools' },
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>Social media tools built for creators who ship fast</h1>
      <p class="hero-sub">
        Posta combines face-aware cropping, smart compression, multi-platform formatting and scheduling into one streamlined toolkit.
      </p>
    </section>

    <section class="content-section">
      <h2>Every tool you need, nothing you don't</h2>
      <p>
        The social media tool landscape is crowded. Enterprise platforms offer hundreds of features but cost hundreds of dollars. Simple scheduling apps lack the media intelligence creators need. Posta sits in the sweet spot: powerful enough to handle real multi-platform workflows, lean enough to stay affordable and easy to use.
      </p>
      <div class="tools-grid">
        <div class="tool-card">
          <div class="tool-title">Face-aware cropping</div>
          <div class="tool-body">Detects faces in your photos and videos and keeps them in frame when converting between aspect ratios.</div>
        </div>
        <div class="tool-card">
          <div class="tool-title">Smart compression</div>
          <div class="tool-body">Optimizes file size for each platform without visible quality loss. Ideal for mobile uploads.</div>
        </div>
        <div class="tool-card">
          <div class="tool-title">Auto-format</div>
          <div class="tool-body">Generates platform-ready variants for TikTok, Instagram, YouTube, LinkedIn and more from one source file.</div>
        </div>
        <div class="tool-card">
          <div class="tool-title">Visual calendar</div>
          <div class="tool-body">Plan and schedule content across all your channels with a drag-and-drop calendar view.</div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2>Media intelligence, not just scheduling</h2>
      <p>
        Most social media tools focus on the scheduling part and treat media as an afterthought. Posta flips that. The core of the platform is intelligent media handling: understanding what is in your image or video, how to crop it for different formats, and how to compress it for each platform's requirements. Scheduling is the delivery mechanism. Media intelligence is what makes your content look good everywhere.
      </p>
    </section>

    <section class="content-section">
      <h2>Pricing that makes sense for creators</h2>
      <p>
        Posta is built for indie creators, solo founders and small marketing teams. That means no agency-level pricing, no feature-gating that pushes you to expensive plans, and no hidden limits. You get all the tools on every plan. The difference between tiers is usage limits like number of social accounts and posts per month, not access to features.
      </p>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Get the tools your content deserves"
      subtext="Smart cropping, compression and scheduling in one platform."
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

.tools-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.tool-card {
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(15, 23, 42, 0.85);
  padding: 14px;
}

.tool-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
}

.tool-body {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.5;
}

@media (max-width: 600px) {
  .tools-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
