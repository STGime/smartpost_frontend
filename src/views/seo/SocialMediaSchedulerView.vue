<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import type { WaitingListSource } from '@/services'

const waitingListSource = ref<WaitingListSource>('seo-scheduler')

const schedulerFaq = [
  {
    q: 'Which social media platforms does Posta support?',
    a: 'Eight networks: LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, Bluesky, and Threads. Bluesky and Threads support is rare among schedulers — most competitors either don\'t support them or shipped them later than Posta did.',
  },
  {
    q: 'How is Posta different from Buffer or Hootsuite?',
    a: 'Posta supports Bluesky and Threads natively, includes a comments inbox for LinkedIn and TikTok, ships outbound HMAC-signed webhooks, exposes a public REST API with an OpenAPI spec, and integrates with Claude Code for CLI/IDE posting. Buffer is a polished publish-queue product; Hootsuite is agency-focused. Posta sits in between, with deeper developer tooling.',
  },
  {
    q: 'Can I schedule the same post to multiple platforms at once?',
    a: 'Yes. Pick which connected accounts to publish to in the composer. Posta auto-formats your media for each platform\'s aspect ratios and limits, then publishes them in parallel.',
  },
  {
    q: 'Does Posta auto-crop images for each platform?',
    a: 'Yes. Posta uses face detection to keep subjects centered when generating the platform-specific variants (Instagram 1:1 / 4:5 / 9:16, TikTok 9:16, LinkedIn 1.91:1, Pinterest 2:3, etc.).',
  },
  {
    q: 'How far in advance can I schedule posts?',
    a: 'There\'s no hard upper bound — schedule weeks or months ahead. A background scheduler picks up scheduled posts at the right moment.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes — 14 days, no credit card required. The trial includes scheduling to all 8 supported networks.',
  },
  {
    q: 'Can I use Posta as an API or CLI?',
    a: 'Yes. Posta exposes a full REST API documented at api.getposta.app/docs, plus a Claude Code skill that lets you create, schedule, and publish posts from your terminal or IDE using natural-language commands.',
  },
]

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
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: schedulerFaq.map((item) => ({
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
      <h2>One workflow, eight platforms</h2>
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
      </div>
    </section>

    <section class="content-section">
      <h2>Built for creators who ship fast</h2>
      <p>
        Posta is designed for indie creators, solo founders and lean marketing teams. No bloated dashboards or enterprise pricing. Just smart media handling, a visual calendar, timezone-safe scheduling and predictable plans that scale when you do. Start with one asset, end up with scheduled posts across every channel.
      </p>
    </section>

    <section class="faq-section">
      <h2>Social media scheduler FAQ</h2>
      <div class="faq-list">
        <div v-for="item in schedulerFaq" :key="item.q" class="faq-item">
          <h3>{{ item.q }}</h3>
          <p>{{ item.a }}</p>
        </div>
      </div>
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
