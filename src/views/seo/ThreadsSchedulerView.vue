<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import type { WaitingListSource } from '@/services'

const waitingListSource = ref<WaitingListSource>('seo-threads')

const threadsFaq = [
  {
    q: 'Can I schedule Threads posts with Posta?',
    a: 'Yes. Posta publishes directly to Threads via the official Meta API. Schedule individual posts, carousels (up to 10 items), and videos (up to 5 minutes) with full caption and hashtag handling.',
  },
  {
    q: 'How does Posta connect to my Threads account?',
    a: 'OAuth through Meta\'s developer platform. Posta requests three scopes — threads_basic for profile, threads_content_publish for publishing, threads_manage_insights for analytics — and stores the resulting access token encrypted (AES-256-GCM). You authorise the connection from your Threads account, not via a workaround.',
  },
  {
    q: 'What\'s the Threads character limit?',
    a: 'Threads allows captions up to 500 characters. Posta validates the length at compose time and shows a clear counter so you don\'t hit the limit at publish time.',
  },
  {
    q: 'Does Posta support Threads carousels?',
    a: 'Yes. Up to 10 items per carousel post. Posta uploads each item via Meta\'s container API, waits for them to be ready, then publishes the carousel as a single post.',
  },
  {
    q: 'Can I post Threads videos?',
    a: 'Yes. Videos up to 5 minutes long. Posta auto-formats your source video to Threads\' supported dimensions and compresses for fast upload without visible quality loss.',
  },
  {
    q: 'How many hashtags can I use on Threads?',
    a: 'Posta enforces a 5-hashtag cap on Threads posts. If your caption contains more than 5, the extras are trimmed before publish so the post never gets rejected by the API.',
  },
  {
    q: 'Can I cross-post from Instagram to Threads with Posta?',
    a: 'Yes. Connect both accounts and pick both in the composer; Posta auto-formats once and publishes the same content to both, with each platform\'s aspect-ratio and caption rules respected. You can also pick Threads-specific placement — Timeline or Reels — via the platform configuration.',
  },
  {
    q: 'Is there a free Threads scheduler?',
    a: 'Posta\'s 14-day trial includes Threads scheduling at no cost, no credit card required. The same trial covers LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, X (Twitter), and Bluesky.',
  },
]

const threadsHowTo = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to schedule a Threads post with Posta',
  description: 'Three steps to schedule a post or carousel to Threads via Posta.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Connect your Threads account',
      text: 'Authorise Posta via Meta\'s OAuth flow. Posta requests threads_basic, threads_content_publish, and threads_manage_insights scopes.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Compose your post',
      text: 'Write your caption (up to 500 characters), attach an image or video, or build a carousel of up to 10 items. Pick the placement (feed or Reels).',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Schedule or publish',
      text: 'Pick a date and time, or publish immediately. Posta queues the job and publishes via the Threads API at the scheduled moment.',
    },
  ],
}

useHead({
  title: 'Threads Scheduler – Schedule Posts to Meta Threads',
  meta: [
    { name: 'description', content: 'Schedule Threads posts, carousels and videos via Meta\'s official Threads API. Native support for 500-character captions, carousels up to 10 items, 5-minute video, feed and Reels placement.' },
    { name: 'keywords', content: 'threads scheduler, meta threads scheduler, schedule threads posts, threads auto post, threads posting tool, threads content planner' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://getposta.app/threads-scheduler' },
    { property: 'og:title', content: 'Threads Scheduler – Schedule Posts to Meta Threads | Posta' },
    { property: 'og:description', content: 'Schedule Threads posts, carousels and videos via Meta\'s official Threads API. 500-character captions, 10-item carousels, 5-minute video.' },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Threads Scheduler – Schedule Posts to Meta Threads | Posta' },
    { name: 'twitter:description', content: 'Schedule Threads posts, carousels and videos via Meta\'s official Threads API. 500-character captions, 10-item carousels, 5-minute video.' },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [
    { rel: 'canonical', href: 'https://getposta.app/threads-scheduler' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: threadsFaq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(threadsHowTo),
    },
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>Schedule Threads posts on autopilot</h1>
      <p class="hero-sub">
        Posta is a native Threads scheduler. Publish posts, carousels (up to 10 items), and videos (up to 5 minutes) via Meta's official Threads API — alongside LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, X, and Bluesky.
      </p>
    </section>

    <section class="content-section">
      <h2>How Threads posting works in Posta</h2>
      <p>
        Threads is Meta's microblogging network and uses the same developer-platform plumbing as Instagram. Posta authenticates via OAuth, requests the three Threads scopes (basic profile, content publish, insights), and posts directly via the official Threads API. No browser automation, no scraping — your scheduled posts hit Meta's servers exactly the way the Threads app does.
      </p>
      <p>
        Because Posta uses the official API, posts you schedule appear on your profile with the same reach and ranking as posts published manually. There's no shadow penalty, no third-party watermark, and no risk of your account being flagged for automated behaviour.
      </p>
    </section>

    <section class="content-section">
      <h2>Threads limits, handled cleanly</h2>
      <p>
        Threads has specific limits Posta enforces at compose time so you never hit a publish-time failure:
      </p>
      <div class="format-list">
        <div class="format-item">
          <span class="format-label">Caption</span>
          <span class="format-size">500 chars</span>
        </div>
        <div class="format-item">
          <span class="format-label">Carousel</span>
          <span class="format-size">10 items</span>
        </div>
        <div class="format-item">
          <span class="format-label">Video</span>
          <span class="format-size">5 minutes</span>
        </div>
        <div class="format-item">
          <span class="format-label">Image</span>
          <span class="format-size">Up to 1080×1920</span>
        </div>
        <div class="format-item">
          <span class="format-label">Placement</span>
          <span class="format-size">Timeline or Reels</span>
        </div>
        <div class="format-item">
          <span class="format-label">Hashtags</span>
          <span class="format-size">Up to 5</span>
        </div>
      </div>
      <p>
        Posta validates each constraint before queueing the job, so you don't get publish-time surprises like a 503-character caption silently truncated or a 6-minute video rejected by the API.
      </p>
    </section>

    <section class="content-section">
      <h2>Timeline or Reels — pick the placement</h2>
      <p>
        Threads supports two video placements: standard Timeline posts and Reels. Picking the right one matters for discovery — Reels surface in the dedicated tab and get separate recommendation treatment, while Timeline videos appear inline in followers' feeds. Posta exposes this choice as a simple radio toggle in the composer, so the same video can go out to Timeline today and Reels next week without re-uploading.
      </p>
    </section>

    <section class="content-section">
      <h2>Cross-post from Instagram, without duplicate work</h2>
      <p>
        Most Threads users also post on Instagram. Posta lets you compose once and publish to both with one click: face-aware cropping generates the right aspect ratios for each platform, captions adapt to each network's limits, and the same media is uploaded only once on your machine. Threads and Instagram both speak Meta's Graph API, but each has its own quirks — Posta hides the differences so you don't need to remember which network caps captions where.
      </p>
    </section>

    <section class="faq-section">
      <h2>Threads scheduling FAQ</h2>
      <div class="faq-list">
        <div v-for="item in threadsFaq" :key="item.q" class="faq-item">
          <h3>{{ item.q }}</h3>
          <p>{{ item.a }}</p>
        </div>
      </div>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Start scheduling Threads content"
      subtext="Publish to Threads alongside Instagram, Bluesky, X and the rest — from one workflow."
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
  max-width: 720px;
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
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
  margin: 14px 0;
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
