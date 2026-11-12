<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import { getWorkflow, SITE_URL, DEFAULT_OG_IMAGE } from '@/data/workflows'
import { getPost } from '@/data/blog'
import type { WaitingListSource } from '@/services'

const props = defineProps<{ slug: string }>()

const waitingListSource = ref<WaitingListSource>('seo-blog')
const workflow = getWorkflow(props.slug)
const relatedPost = workflow?.relatedBlogSlug ? getPost(workflow.relatedBlogSlug) : undefined

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, '')
}

if (workflow) {
  const url = `${SITE_URL}/workflows/${workflow.slug}`
  const ogImage = workflow.ogImage || DEFAULT_OG_IMAGE
  // Build HowTo steps from the first ordered list (the "How it works" section).
  const stepsBlock = workflow.body.find((b) => b.type === 'ol')
  const steps = (stepsBlock?.items ?? []).map((item, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    text: stripHtml(item),
  }))

  useHead({
    title: workflow.title,
    meta: [
      { name: 'description', content: workflow.description },
      { name: 'keywords', content: workflow.tags.join(', ') },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: url },
      { property: 'og:title', content: `${workflow.title} | Posta` },
      { property: 'og:description', content: workflow.description },
      { property: 'og:image', content: ogImage },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: workflow.title },
      { name: 'twitter:description', content: workflow.description },
      { name: 'twitter:image', content: ogImage },
    ],
    link: [{ rel: 'canonical', href: url }],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: workflow.title,
          description: workflow.description,
          image: ogImage,
          totalTime: undefined,
          step: steps,
          tool: workflow.requiredCredentials.map((c) => ({ '@type': 'HowToTool', name: c.name })),
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
          publisher: {
            '@type': 'Organization',
            name: 'Posta',
            url: `${SITE_URL}/`,
            logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/posta_logo_512.png` },
          },
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
            { '@type': 'ListItem', position: 3, name: workflow.title, item: url },
          ],
        }),
      },
    ],
  })
} else {
  useHead({
    title: 'Workflow not found',
    meta: [{ name: 'robots', content: 'noindex, follow' }],
  })
}

// Absolute URL for n8n "Import from URL" (strip the cache-bust query for display).
const importUrl = workflow ? `${SITE_URL}${workflow.jsonFile}` : ''
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <template v-if="workflow">
      <article>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <RouterLink to="/workflows">Workflows</RouterLink>
          <span class="breadcrumb-sep">/</span>
          <span>{{ workflow.title }}</span>
        </nav>

        <header class="wf-header">
          <h1>{{ workflow.title }}</h1>
          <p class="wf-summary">{{ workflow.summary }}</p>
          <div class="wf-meta">
            <span class="wf-badge">{{ workflow.difficulty }}</span>
            <span class="wf-meta-item">⏱ {{ workflow.setupTime }}</span>
            <span v-if="workflow.requiredPlan" class="wf-meta-item wf-plan">
              {{ workflow.requiredPlan }} plan
            </span>
            <span v-for="tag in workflow.tags" :key="tag" class="wf-tag">{{ tag }}</span>
          </div>
          <div class="wf-chain">
            <template v-for="(node, i) in workflow.nodeChain" :key="i">
              <span class="wf-node">{{ node }}</span>
              <span v-if="i < workflow.nodeChain.length - 1" class="wf-arrow">→</span>
            </template>
          </div>
        </header>

        <!-- Download / import card -->
        <div class="wf-import">
          <a :href="workflow.jsonFile" download class="wf-download">⬇ Download workflow JSON</a>
          <div class="wf-import-or">
            or in n8n: <strong>⋯ menu → Import from URL</strong> and paste:
            <code class="wf-url">{{ importUrl }}</code>
          </div>
          <ul class="wf-creds">
            <li>
              <span class="wf-creds-label">You’ll need:</span>
              <template v-for="(c, i) in workflow.requiredCredentials" :key="c.name">
                <a v-if="c.url" :href="c.url" target="_blank" rel="noopener">{{ c.name }}</a>
                <span v-else>{{ c.name }}</span><span v-if="i < workflow.requiredCredentials.length - 1">, </span>
              </template>
            </li>
          </ul>
        </div>

        <div class="wf-body">
          <template v-for="(block, i) in workflow.body" :key="i">
            <h2 v-if="block.type === 'h2'">{{ block.text }}</h2>
            <h3 v-else-if="block.type === 'h3'">{{ block.text }}</h3>
            <!-- Body text is first-party content from src/data/workflows.ts; inline HTML is trusted. -->
            <p v-else-if="block.type === 'p'" v-html="block.text" />
            <ul v-else-if="block.type === 'ul'" class="body-list">
              <li v-for="(item, j) in block.items" :key="j" v-html="item" />
            </ul>
            <ol v-else-if="block.type === 'ol'" class="body-list">
              <li v-for="(item, j) in block.items" :key="j" v-html="item" />
            </ol>
            <pre v-else-if="block.type === 'code'" class="code-block"><code>{{ block.code }}</code></pre>
          </template>
        </div>

        <p v-if="relatedPost" class="wf-related">
          Read the deep dive:
          <RouterLink :to="`/blog/${relatedPost.slug}`">{{ relatedPost.title }}</RouterLink>
        </p>
      </article>

      <InternalLinks />

      <CtaSection :source="waitingListSource" />
    </template>

    <section v-else class="not-found">
      <h1>Workflow not found</h1>
      <p>That workflow doesn’t exist or may have moved.</p>
      <RouterLink to="/workflows" class="back-link">← Back to workflows</RouterLink>
    </section>
  </SeoPageLayout>
</template>

<style scoped>
.breadcrumb {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--fg-3);
  margin-bottom: 24px;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.breadcrumb a {
  color: var(--fg-2);
  text-decoration: none;
  transition: color 0.15s;
}

.breadcrumb a:hover {
  color: var(--text);
}

.breadcrumb-sep {
  color: var(--line-strong);
}

.wf-header {
  margin-bottom: 32px;
}

h1 {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.025em;
  margin-bottom: 14px;
  max-width: 820px;
  overflow-wrap: anywhere;
}

.wf-summary {
  font-size: 16px;
  color: var(--fg-2);
  max-width: 68ch;
  line-height: 1.65;
  margin-bottom: 18px;
}

.wf-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  align-items: center;
  margin-bottom: 18px;
  font-family: var(--font-mono);
}

.wf-badge {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 3px 8px;
  border-radius: 2px;
  border: 1px solid var(--line-strong);
  color: var(--text);
}

.wf-meta-item {
  font-size: 12px;
  color: var(--fg-2);
}

.wf-plan {
  color: var(--signal);
}

.wf-tag {
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 2px;
  border: 1px solid var(--line);
  color: var(--fg-3);
}

.wf-chain {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.wf-node {
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 4px 9px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  background: var(--ink-1);
  color: var(--text);
  white-space: nowrap;
}

.wf-arrow {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--fg-3);
}

.wf-import {
  margin: 0 0 40px;
  padding: 20px;
  border-radius: var(--radius-md);
  border: 1px solid var(--line);
  background: var(--ink-1);
  max-width: 760px;
}

.wf-download {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--text);
  background: var(--text);
  color: var(--ink-0);
  font-weight: 500;
  font-size: 14px;
  line-height: 1.2;
  text-decoration: none;
  transition: background-color 0.15s, border-color 0.15s;
}

.wf-download:hover {
  background: #ffffff;
  border-color: #ffffff;
}

.wf-import-or {
  margin-top: 14px;
  font-size: 13px;
  color: var(--fg-2);
  line-height: 1.7;
}

.wf-import-or strong {
  color: var(--text);
  font-weight: 500;
}

.wf-url {
  display: block;
  margin-top: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text);
  background: var(--ink-0);
  border: 1px solid var(--line);
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  word-break: break-all;
}

.wf-creds {
  margin: 16px 0 0;
  padding: 14px 0 0;
  border-top: 1px solid var(--line);
  list-style: none;
  font-size: 13px;
  color: var(--fg-2);
}

.wf-creds-label {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--fg-3);
  margin-right: 6px;
}

.wf-creds a,
.wf-related a {
  color: var(--text);
  text-decoration: underline;
  text-decoration-color: var(--line-strong);
  text-underline-offset: 3px;
  transition: text-decoration-color 0.15s, color 0.15s;
}

.wf-creds a:hover,
.wf-related a:hover {
  text-decoration-color: var(--signal);
}

.wf-body {
  max-width: 68ch;
}

.wf-body h2 {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.015em;
  line-height: 1.25;
  margin: 40px 0 14px;
  padding-top: 28px;
  border-top: 1px solid var(--line);
}

.wf-body h2:first-child {
  margin-top: 0;
}

.wf-body h3 {
  font-size: 17px;
  font-weight: 600;
  margin: 28px 0 10px;
  color: var(--text);
}

.wf-body :deep(p) {
  font-size: 15px;
  color: var(--fg-2);
  line-height: 1.65;
  margin-bottom: 16px;
}

.wf-body :deep(a) {
  color: var(--text);
  text-decoration: underline;
  text-decoration-color: var(--line-strong);
  text-underline-offset: 3px;
  transition: text-decoration-color 0.15s;
}

.wf-body :deep(a:hover) {
  text-decoration-color: var(--signal);
}

.wf-body :deep(strong) {
  color: var(--text);
  font-weight: 600;
}

.wf-body :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.86em;
  background: var(--ink-2);
  border: 1px solid var(--line);
  padding: 1px 5px;
  border-radius: var(--radius-sm);
}

.body-list {
  max-width: 68ch;
  padding-left: 22px;
  display: grid;
  gap: 10px;
  font-size: 15px;
  line-height: 1.65;
  color: var(--fg-2);
  margin-bottom: 18px;
}

.body-list :deep(strong) {
  color: var(--text);
  font-weight: 600;
}

ul.body-list {
  list-style: square;
}

ul.body-list li::marker {
  color: var(--fg-3);
}

ol.body-list {
  list-style: decimal-leading-zero;
  padding-left: 32px;
}

ol.body-list li::marker {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--fg-3);
}

.code-block {
  margin: 0 0 18px;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  background: var(--ink-1);
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
}

.code-block code {
  font-family: var(--font-mono);
  color: var(--text);
  white-space: pre;
  background: none;
  border: 0;
  padding: 0;
}

.wf-related {
  max-width: 68ch;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
  font-size: 14px;
  color: var(--fg-2);
}

.not-found {
  text-align: center;
  padding: 64px 0;
}

.not-found h1 {
  margin: 0 auto 12px;
}

.not-found p {
  color: var(--fg-2);
  margin-bottom: 20px;
}

.back-link {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--fg-2);
  text-decoration: none;
  transition: color 0.15s;
}

.back-link:hover {
  color: var(--text);
}
</style>
