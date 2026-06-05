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
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 20px;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.breadcrumb a {
  color: var(--accent-light);
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.breadcrumb-sep {
  color: rgba(148, 163, 184, 0.5);
}

.wf-header {
  margin-bottom: 24px;
}

h1 {
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  line-height: 1.12;
  letter-spacing: -0.03em;
  margin-bottom: 12px;
  max-width: 820px;
}

.wf-summary {
  font-size: 16px;
  color: var(--muted);
  max-width: 760px;
  line-height: 1.6;
  margin-bottom: 14px;
}

.wf-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 14px;
}

.wf-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.18);
  color: #c7d2fe;
}

.wf-meta-item {
  font-size: 12px;
  color: var(--muted);
}

.wf-plan {
  color: #fcd34d;
  font-weight: 600;
}

.wf-tag {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #a5b4fc;
}

.wf-chain {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.wf-node {
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
  color: var(--text);
  white-space: nowrap;
}

.wf-arrow {
  font-size: 11px;
  color: rgba(148, 163, 184, 0.5);
}

.wf-import {
  margin: 4px 0 32px;
  padding: 20px;
  border-radius: 14px;
  border: 1px solid rgba(99, 102, 241, 0.25);
  background: rgba(30, 27, 75, 0.4);
  max-width: 760px;
}

.wf-download {
  display: inline-block;
  padding: 10px 18px;
  border-radius: 10px;
  background: var(--accent, #6366f1);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: filter 0.2s;
}

.wf-download:hover {
  filter: brightness(1.1);
}

.wf-import-or {
  margin-top: 12px;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.7;
}

.wf-url {
  display: block;
  margin-top: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: #e2e8f0;
  background: rgba(2, 6, 23, 0.6);
  padding: 8px 10px;
  border-radius: 8px;
  word-break: break-all;
}

.wf-creds {
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
  font-size: 13px;
  color: var(--muted);
}

.wf-creds-label {
  font-weight: 600;
  color: var(--text);
  margin-right: 4px;
}

.wf-creds a {
  color: var(--accent-light);
  text-decoration: none;
}

.wf-creds a:hover {
  text-decoration: underline;
}

.wf-body {
  max-width: 760px;
}

.wf-body h2 {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 32px 0 12px;
}

.wf-body h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 24px 0 10px;
  color: var(--text);
}

.wf-body :deep(p) {
  font-size: 15px;
  color: var(--muted);
  line-height: 1.75;
  margin-bottom: 16px;
}

.wf-body :deep(a) {
  color: var(--accent-light);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.wf-body :deep(strong) {
  color: var(--text);
  font-weight: 600;
}

.wf-body :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.86em;
  background: rgba(148, 163, 184, 0.12);
  padding: 1px 5px;
  border-radius: 5px;
}

.body-list {
  max-width: 760px;
  padding-left: 22px;
  display: grid;
  gap: 10px;
  font-size: 15px;
  line-height: 1.7;
  color: var(--muted);
  margin-bottom: 16px;
}

.body-list :deep(strong) {
  color: var(--text);
  font-weight: 600;
}

.body-list :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.86em;
  background: rgba(148, 163, 184, 0.12);
  padding: 1px 5px;
  border-radius: 5px;
}

ul.body-list {
  list-style: disc;
}

ol.body-list {
  list-style: decimal;
}

.code-block {
  margin: 0 0 18px;
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(2, 6, 23, 0.7);
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.6;
}

.code-block code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: #e2e8f0;
  white-space: pre;
}

.wf-related {
  max-width: 760px;
  margin-top: 28px;
  font-size: 14px;
  color: var(--muted);
}

.wf-related a {
  color: var(--accent-light);
  text-decoration: none;
}

.wf-related a:hover {
  text-decoration: underline;
}

.not-found {
  text-align: center;
  padding: 60px 20px;
}

.not-found h1 {
  margin-bottom: 12px;
}

.not-found p {
  color: var(--muted);
  margin-bottom: 20px;
}

.back-link {
  color: var(--accent-light);
  text-decoration: none;
  font-weight: 500;
}
</style>
