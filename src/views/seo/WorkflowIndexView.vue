<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import { sortedWorkflows, SITE_URL } from '@/data/workflows'
import type { WaitingListSource } from '@/services'

const waitingListSource = ref<WaitingListSource>('seo-blog')

const description =
  'Ready-to-import n8n workflow templates for Posta — automate social posting, LinkedIn carousels, product launches, and YouTube promotion. Download the JSON and run.'

useHead({
  title: 'n8n Workflow Templates for Posta – Social Media Automation',
  meta: [
    { name: 'description', content: description },
    {
      name: 'keywords',
      content:
        'n8n workflows, n8n templates, posta n8n, social media automation n8n, linkedin carousel n8n, schedule posts n8n',
    },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: `${SITE_URL}/workflows` },
    { property: 'og:title', content: 'n8n Workflow Templates for Posta | Posta' },
    { property: 'og:description', content: description },
    { property: 'og:image', content: `${SITE_URL}/assets/posta_og_image.png` },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'n8n Workflow Templates for Posta' },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: `${SITE_URL}/assets/posta_og_image.png` },
  ],
  link: [{ rel: 'canonical', href: `${SITE_URL}/workflows` }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'n8n Workflow Templates for Posta',
        description,
        url: `${SITE_URL}/workflows`,
        publisher: {
          '@type': 'Organization',
          name: 'Posta',
          url: `${SITE_URL}/`,
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/posta_logo_512.png` },
        },
        hasPart: sortedWorkflows.map((w) => ({
          '@type': 'HowTo',
          name: w.title,
          description: w.description,
          url: `${SITE_URL}/workflows/${w.slug}`,
        })),
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Workflows', item: `${SITE_URL}/workflows` },
        ],
      }),
    },
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>n8n Workflows</h1>
      <p class="hero-sub">
        Ready-to-import automations that connect your tools to Posta — schedule posts, build
        LinkedIn carousels, run launch campaigns, and promote videos. Download the JSON and import
        it into n8n.
      </p>
      <p class="hero-note">
        Each template uses the
        <a href="https://www.npmjs.com/package/n8n-nodes-posta" target="_blank" rel="noopener">
          n8n-nodes-posta</a>
        community node. Browse the source
        <a href="https://github.com/STGime/posta-n8n-workflows" target="_blank" rel="noopener">on GitHub</a>,
        or start with a
        <RouterLink to="/blog/post-to-social-media-from-your-terminal">free trial</RouterLink>.
      </p>
    </section>

    <section class="wf-grid">
      <RouterLink
        v-for="wf in sortedWorkflows"
        :key="wf.slug"
        :to="`/workflows/${wf.slug}`"
        class="wf-card"
      >
        <div class="wf-card-meta">
          <span class="wf-badge">{{ wf.difficulty }}</span>
          <span v-for="tag in wf.tags.slice(0, 2)" :key="tag" class="wf-tag">{{ tag }}</span>
        </div>
        <h2 class="wf-card-title">{{ wf.title }}</h2>
        <p class="wf-card-summary">{{ wf.summary }}</p>
        <div class="wf-chain">
          <template v-for="(node, i) in wf.nodeChain" :key="i">
            <span class="wf-node">{{ node }}</span>
            <span v-if="i < wf.nodeChain.length - 1" class="wf-arrow">→</span>
          </template>
        </div>
        <span class="wf-card-read">View workflow <span class="arrow">→</span></span>
      </RouterLink>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Automate your posting"
      subtext="Connect Posta to n8n and let your content flow. 14-day free trial, no credit card."
      :source="waitingListSource"
    />
  </SeoPageLayout>
</template>

<style scoped>
.hero {
  margin-bottom: 40px;
}

h1 {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.025em;
  margin-bottom: 16px;
}

.hero-sub {
  font-size: 16px;
  color: var(--fg-2);
  max-width: 68ch;
  line-height: 1.65;
}

.hero-note {
  font-size: 14px;
  color: var(--fg-2);
  max-width: 68ch;
  line-height: 1.65;
  margin-top: 12px;
}

.hero-note a {
  color: var(--text);
  text-decoration: underline;
  text-decoration-color: var(--line-strong);
  text-underline-offset: 3px;
  transition: text-decoration-color 0.15s;
}

.hero-note a:hover {
  text-decoration-color: var(--signal);
}

.wf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.wf-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 22px;
  min-width: 0;
  background: var(--ink-0);
  text-decoration: none;
  color: inherit;
  transition: background-color 0.15s;
}

.wf-card:hover {
  background: var(--ink-1);
}

.wf-card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
}

.wf-badge {
  padding: 2px 7px;
  border-radius: 2px;
  border: 1px solid var(--line-strong);
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.wf-tag {
  padding: 2px 7px;
  border-radius: 2px;
  border: 1px solid var(--line);
  color: var(--fg-3);
}

.wf-card-title {
  font-size: 17px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.wf-card-summary {
  font-size: 14px;
  color: var(--fg-2);
  line-height: 1.6;
  flex: 1;
}

.wf-chain {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
}

.wf-node {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 2px;
  border: 1px solid var(--line);
  background: var(--ink-1);
  color: var(--fg-2);
  white-space: nowrap;
}

.wf-card:hover .wf-node {
  background: var(--ink-2);
}

.wf-arrow {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
}

.wf-card-read {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--fg-2);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.15s;
}

.wf-card:hover .wf-card-read {
  color: var(--text);
}

.wf-card:hover .arrow {
  color: var(--signal);
}

.arrow {
  transition: color 0.15s;
}
</style>
