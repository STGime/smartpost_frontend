<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import type { WaitingListSource } from '@/services'

const waitingListSource = ref<WaitingListSource>('seo-cli')

useHead({
  title: 'CLI Social Media Posting – Post from Your Terminal with Claude Code',
  meta: [
    { name: 'description', content: 'Post to Instagram, TikTok, LinkedIn and more from your terminal or IDE. Posta\'s Claude Code skill lets developers schedule, publish and track social media without leaving their editor.' },
    { name: 'keywords', content: 'cli social media posting, post from terminal, claude code social media, claude code integration, developer social media tools, IDE social media posting, VS Code social media, headless social media posting, AI social media automation, command line social media' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://getposta.app/cli-social-media-posting' },
    { property: 'og:title', content: 'CLI Social Media Posting – Post from Your Terminal with Claude Code | Posta' },
    { property: 'og:description', content: 'Post to Instagram, TikTok, LinkedIn and more from your terminal or IDE. Posta\'s Claude Code skill lets developers schedule, publish and track social media without leaving their editor.' },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'CLI Social Media Posting – Post from Your Terminal with Claude Code | Posta' },
    { name: 'twitter:description', content: 'Post to Instagram, TikTok, LinkedIn and more from your terminal or IDE. Posta\'s Claude Code skill lets developers schedule, publish and track social media without leaving their editor.' },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [
    { rel: 'canonical', href: 'https://getposta.app/cli-social-media-posting' },
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
            name: 'What is the Posta Claude Code skill?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The Posta Claude Code skill is an integration that lets you create, schedule and publish social media posts directly from your terminal or IDE using natural language commands. It connects to the Posta API and supports all platforms including Instagram, TikTok, LinkedIn and YouTube.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I install the Posta skill for Claude Code?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Install the skill by running the /install-skill command in Claude Code and pointing it to the Posta skill repository. Once installed, Claude can authenticate with your Posta account and manage posts on your behalf.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I schedule social media posts from the command line?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. You can tell Claude to schedule posts for specific dates and times using natural language, for example "schedule this post for Friday at 6pm on TikTok". The skill handles media upload, caption formatting and platform-specific configuration automatically.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is the CLI posting feature free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The Posta Claude Code skill itself is free and open source. You need a Posta account to use it. Posta offers a free trial so you can test the full workflow including CLI posting before committing to a paid plan.',
            },
          },
        ],
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Posta Claude Code Skill',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'macOS, Linux, Windows',
        url: 'https://getposta.app/cli-social-media-posting',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description: 'A Claude Code skill that lets developers create, schedule and publish social media posts from the terminal or IDE.',
      }),
    },
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>Post to social media from your terminal</h1>
      <p class="hero-sub">
        Posta's Claude Code skill lets you create, schedule and publish posts to Instagram, TikTok, LinkedIn and more – without leaving your editor or terminal.
      </p>
    </section>

    <section class="content-section">
      <h2>How it works</h2>
      <div class="steps-grid">
        <div class="step-card">
          <div class="step-number">1</div>
          <div class="step-title">Install the skill</div>
          <div class="step-body">Add the Posta skill to Claude Code. It connects to your Posta account and gives Claude access to your social media workflows.</div>
        </div>
        <div class="step-card">
          <div class="step-number">2</div>
          <div class="step-title">Describe your post</div>
          <div class="step-body">Tell Claude what you want to post in plain English. Attach images, generate AI visuals, or use existing media from your library.</div>
        </div>
        <div class="step-card">
          <div class="step-number">3</div>
          <div class="step-title">Publish or schedule</div>
          <div class="step-body">Claude uploads media, formats captions, picks the right platforms and publishes or schedules – all from a single conversation.</div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2>Why developers love it</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">Stay in flow</div>
          <div class="feature-body">No context switching. Post from VS Code, Cursor, or any terminal without opening a browser.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Natural language</div>
          <div class="feature-body">Say "post this screenshot to LinkedIn and Bluesky" instead of clicking through five menus.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Batch operations</div>
          <div class="feature-body">Generate and schedule a week of content in one conversation. Upload multiple assets, set captions and schedule times in bulk.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Full API access</div>
          <div class="feature-body">The skill uses the same API as the web app. Analytics, media library, scheduling – everything is available from the CLI.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">AI image generation</div>
          <div class="feature-body">Generate images with AI models directly in your terminal, upload them to Posta and post – all in one step.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Platform-aware</div>
          <div class="feature-body">Handles TikTok privacy settings, LinkedIn formatting, Instagram aspect ratios and more automatically.</div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2>Supported platforms</h2>
      <p>
        The Posta CLI skill supports every platform available in Posta — LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, Bluesky, and Threads. Each platform's specific requirements – aspect ratios, caption limits, privacy settings – are handled automatically by Claude when creating your post.
      </p>
    </section>

    <section class="content-section faq-section">
      <h2>Frequently asked questions</h2>
      <div class="faq-grid">
        <div class="faq-item">
          <div class="faq-q">What is the Posta Claude Code skill?</div>
          <div class="faq-a">
            It's an integration that lets you create, schedule and publish social media posts directly from your terminal or IDE using natural language commands. It connects to the Posta API and supports all platforms.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">How do I install the skill?</div>
          <div class="faq-a">
            Install the skill by running the /install-skill command in Claude Code and pointing it to the
            <a href="https://github.com/posta-app/posta-skill" target="_blank" rel="noopener">Posta skill repository</a>.
            Once installed, Claude can authenticate with your Posta account.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Can I schedule posts from the command line?</div>
          <div class="faq-a">
            Yes. Tell Claude to schedule posts for specific dates and times using natural language, for example "schedule this for Friday at 6pm on TikTok". Media upload, caption formatting and platform configuration are handled automatically.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Is the CLI posting feature free?</div>
          <div class="faq-a">
            The skill itself is free and open source. You need a Posta account to use it. Posta offers a free trial so you can test the full workflow before committing to a paid plan.
          </div>
        </div>
      </div>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Ship content from your terminal"
      subtext="Install the Posta skill for Claude Code and start posting in seconds."
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

.hero-sub a,
.content-section p a,
.content-section li a,
.faq-a a {
  color: var(--text);
  text-decoration: underline;
  text-decoration-color: var(--line-strong);
  text-underline-offset: 3px;
  transition: color 0.15s, text-decoration-color 0.15s;
}

.hero-sub a:hover,
.content-section p a:hover,
.content-section li a:hover,
.faq-a a:hover {
  color: var(--signal);
  text-decoration-color: var(--signal);
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin-top: 16px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.step-card {
  background: var(--ink-0);
  padding: 20px;
}

.step-number {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--fg-3);
  margin-bottom: 10px;
}

.step-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text);
  margin-bottom: 6px;
}

.step-body {
  font-size: 14px;
  color: var(--fg-2);
  line-height: 1.6;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  margin-top: 16px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.feature-card {
  background: var(--ink-0);
  padding: 20px;
}

.feature-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text);
  margin-bottom: 6px;
}

.feature-body {
  font-size: 14px;
  color: var(--fg-2);
  line-height: 1.6;
}

.faq-grid {
  max-width: 68ch;
  border-top: 1px solid var(--line);
}

.faq-item {
  padding: 18px 0;
  border-bottom: 1px solid var(--line);
}

.faq-q {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text);
  margin-bottom: 6px;
}

.faq-a {
  font-size: 15px;
  color: var(--fg-2);
  line-height: 1.65;
}

@media (max-width: 640px) {
  .steps-grid,
  .features-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
