<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import type { WaitingListSource } from '@/services'

const waitingListSource = ref<WaitingListSource>('seo-bluesky')

const blueskyFaq = [
  {
    q: 'Can I schedule Bluesky posts and threads with Posta?',
    a: 'Yes. Posta publishes directly to Bluesky via the AT Protocol. Schedule individual posts or full threads, with custom thread separators, alt text per image, language tags, and content labels.',
  },
  {
    q: 'How does Posta connect to my Bluesky account?',
    a: 'Connect once with your Bluesky handle and an app password (generated in Bluesky\'s app settings). Posta stores the credential encrypted (AES-256-GCM) and never sees your main account password.',
  },
  {
    q: 'Does Posta support Bluesky threads?',
    a: 'Yes. Enable thread mode in the composer, pick a separator character (default is "---"), and Posta splits your caption into a chain of replies that link cleanly under the root post. Each segment respects Bluesky\'s 300-character limit.',
  },
  {
    q: 'Can I add alt text to Bluesky images?',
    a: 'Yes. Provide alt text per image (up to four images per post) in the composer. Bluesky requires alt text for accessibility; Posta surfaces a reminder if you forget.',
  },
  {
    q: 'Can I add content labels like NSFW to Bluesky posts?',
    a: 'Yes. Posta supports all five Bluesky content labels: nsfw, nudity, suggestive, gore, and spoiler. Pick the appropriate label in the composer before scheduling.',
  },
  {
    q: 'Does Posta create rich-link cards on Bluesky?',
    a: 'Yes. Set an embed URL on a post and Bluesky renders a clickable link card with the page\'s OpenGraph title, description, and image.',
  },
  {
    q: 'Why do most social media schedulers not support Bluesky?',
    a: 'Bluesky\'s AT Protocol is newer and uses a federated identity model that differs from the centralised OAuth flows most schedulers were built for. Posta added native Bluesky support because the network is growing fast and creators want one tool that covers it alongside Instagram, TikTok, LinkedIn, and others.',
  },
  {
    q: 'Is there a free Bluesky scheduler?',
    a: 'Posta\'s 14-day trial includes Bluesky scheduling at no cost, no credit card required. The same trial also covers LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, and Threads.',
  },
]

const blueskyHowTo = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to schedule a Bluesky post with Posta',
  description: 'Three steps to schedule a post or thread to Bluesky via Posta.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Connect your Bluesky account',
      text: 'Generate an app password in Bluesky settings, paste it into Posta\'s Connect Account flow with your handle. Posta encrypts and stores the credential.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Compose your post or thread',
      text: 'Write your post, enable thread mode if you want a chain, add alt text and a content label if relevant, optionally attach an embed URL for a link card.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Schedule or publish',
      text: 'Pick a date and time, or hit publish immediately. Posta queues the job and publishes to Bluesky via the AT Protocol at the right moment.',
    },
  ],
}

useHead({
  title: 'Bluesky Scheduler – Schedule Posts and Threads to Bluesky',
  meta: [
    { name: 'description', content: 'Schedule Bluesky posts and threads via the AT Protocol. Posta supports threads, alt text, embed cards, language tags, and content labels — natively, not via workaround.' },
    { name: 'keywords', content: 'bluesky scheduler, schedule bluesky posts, bluesky thread scheduler, atproto scheduler, bluesky posting tool, bluesky auto post' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://getposta.app/bluesky-scheduler' },
    { property: 'og:title', content: 'Bluesky Scheduler – Schedule Posts and Threads to Bluesky | Posta' },
    { property: 'og:description', content: 'Schedule Bluesky posts and threads via the AT Protocol. Native support for threads, alt text, embed cards, content labels.' },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Bluesky Scheduler – Schedule Posts and Threads to Bluesky | Posta' },
    { name: 'twitter:description', content: 'Schedule Bluesky posts and threads via the AT Protocol. Native support for threads, alt text, embed cards, content labels.' },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [
    { rel: 'canonical', href: 'https://getposta.app/bluesky-scheduler' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: blueskyFaq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(blueskyHowTo),
    },
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>Schedule Bluesky posts and threads</h1>
      <p class="hero-sub">
        Posta is a native Bluesky scheduler. Publish posts and threads via the AT Protocol with thread chains, alt text, embed cards, language tags, and content labels — all in one workflow alongside LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, and Threads.
      </p>
    </section>

    <section class="content-section">
      <h2>How Bluesky posting works in Posta</h2>
      <p>
        Bluesky is built on the AT Protocol, an open federated network. Most social media schedulers were built before AT Protocol existed and still treat Bluesky as a workaround — if they support it at all. Posta adds first-class Bluesky support: you connect your handle once with a generated app password, and Posta handles authentication, publishing, and thread chaining for you.
      </p>
      <p>
        Behind the scenes, Posta speaks AT Protocol directly. A scheduled Bluesky post hits the same publishing queue as the rest of your social calendar; when its scheduled time arrives, Posta authenticates to your PDS (Personal Data Server), creates the record, and stores the resulting at-uri so you can find the post later. No browser automation, no shaky third-party intermediaries.
      </p>
    </section>

    <section class="content-section">
      <h2>Connect with an app password, not your main credential</h2>
      <p>
        Bluesky lets you generate dedicated app passwords from your account settings. Posta only ever uses an app password — your main account password never enters our system. The credential is encrypted at rest with AES-256-GCM, and you can revoke the app password from Bluesky at any time without touching anything else in Posta.
      </p>
      <p>
        Want to connect multiple Bluesky accounts (personal + brand, for example)? Connect them separately and pick which one each post publishes from in the composer.
      </p>
    </section>

    <section class="content-section">
      <h2>Threads, alt text, embed cards, content labels</h2>
      <p>
        Posta supports the full Bluesky feature surface:
      </p>
      <div class="format-list">
        <div class="format-item">
          <span class="format-label">Threads</span>
          <span class="format-size">Split by separator</span>
        </div>
        <div class="format-item">
          <span class="format-label">Alt text</span>
          <span class="format-size">Up to 4 images</span>
        </div>
        <div class="format-item">
          <span class="format-label">Embed cards</span>
          <span class="format-size">Auto-fetched OG</span>
        </div>
        <div class="format-item">
          <span class="format-label">Languages</span>
          <span class="format-size">ISO tags</span>
        </div>
        <div class="format-item">
          <span class="format-label">Content labels</span>
          <span class="format-size">NSFW, gore, spoiler…</span>
        </div>
        <div class="format-item">
          <span class="format-label">Character cap</span>
          <span class="format-size">300 per post</span>
        </div>
      </div>
      <p>
        Threads are split using a separator character you pick (default <code>---</code>). Each segment respects Bluesky's 300-character per-post cap. Posta validates the split before scheduling so you don't end up with truncated thoughts.
      </p>
    </section>

    <section class="content-section">
      <h2>One subscription, every network</h2>
      <p>
        Most creators don't post only to Bluesky. With Posta, the same subscription that publishes to Bluesky also publishes to LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, and Threads. Auto-format images for each network's aspect ratios, run the same caption across all of them, and see everything on one visual calendar.
      </p>
    </section>

    <section class="content-section">
      <h2>Why most schedulers still don't support Bluesky</h2>
      <p>
        AT Protocol uses a different identity model than the OAuth flows that dominate the older social media APIs. Adding Bluesky means writing a brand-new authentication and posting client, not bolting on yet another OAuth provider. Most established schedulers haven't made that investment yet — or shipped half-finished support that doesn't cover threads, alt text, or content labels.
      </p>
      <p>
        Posta added Bluesky early because the network is growing fast and the creators who want it are the same creators we serve.
      </p>
    </section>

    <section class="faq-section">
      <h2>Bluesky scheduling FAQ</h2>
      <div class="faq-list">
        <div v-for="item in blueskyFaq" :key="item.q" class="faq-item">
          <h3>{{ item.q }}</h3>
          <p>{{ item.a }}</p>
        </div>
      </div>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Start scheduling Bluesky content"
      subtext="Publish to Bluesky alongside LinkedIn, TikTok, Instagram, YouTube and more — from one workflow."
      :source="waitingListSource"
    />
  </SeoPageLayout>
</template>

<style scoped>
.hero {
  padding-bottom: 40px;
}

h1 {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--text);
  margin-bottom: 16px;
}

.hero-sub {
  font-size: 16px;
  color: var(--fg-2);
  max-width: 68ch;
  line-height: 1.65;
}

.content-section,
.faq-section {
  border-top: 1px solid var(--line);
  padding: 36px 0;
}

.content-section h2,
.faq-section h2 {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.015em;
  color: var(--text);
  margin-bottom: 14px;
}

.content-section p {
  font-size: 15px;
  color: var(--fg-2);
  line-height: 1.65;
  max-width: 68ch;
  margin-bottom: 14px;
}

.content-section p:last-child {
  margin-bottom: 0;
}

.content-section p code {
  font-family: var(--font-mono);
  font-size: 0.86em;
  color: var(--text);
  background: var(--ink-2);
  border: 1px solid var(--line);
  border-radius: 2px;
  padding: 1px 5px;
}

.format-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
  gap: 1px;
  margin: 16px 0;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.format-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  padding: 12px 16px;
  background: var(--ink-0);
}

.format-label {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--fg-3);
}

.format-size {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text);
  text-align: right;
}

.faq-list {
  max-width: 68ch;
  border-top: 1px solid var(--line);
}

.faq-item {
  padding: 18px 0;
  border-bottom: 1px solid var(--line);
}

.faq-item h3 {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text);
  margin-bottom: 6px;
}

.faq-item p {
  font-size: 15px;
  color: var(--fg-2);
  line-height: 1.65;
}
</style>
