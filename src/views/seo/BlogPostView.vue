<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import { getPost, postPlainText, SITE_URL, DEFAULT_OG_IMAGE } from '@/data/blog'
import type { WaitingListSource } from '@/services'

const props = defineProps<{ slug: string }>()

const waitingListSource = ref<WaitingListSource>('seo-blog')
const post = getPost(props.slug)

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

if (post) {
  const url = `${SITE_URL}/blog/${post.slug}`
  const ogImage = post.ogImage || DEFAULT_OG_IMAGE
  const modified = post.updated || post.date
  useHead({
    title: post.title,
    meta: [
      { name: 'description', content: post.description },
      { name: 'keywords', content: post.tags.join(', ') },
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: post.author },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: url },
      { property: 'og:title', content: `${post.title} | Posta` },
      { property: 'og:description', content: post.description },
      { property: 'og:image', content: ogImage },
      { property: 'article:published_time', content: post.date },
      { property: 'article:modified_time', content: modified },
      { property: 'article:author', content: post.author },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: post.title },
      { name: 'twitter:description', content: post.description },
      { name: 'twitter:image', content: ogImage },
    ],
    link: [
      { rel: 'canonical', href: url },
      { rel: 'alternate', type: 'application/rss+xml', title: 'Posta Blog', href: `${SITE_URL}/feed.xml` },
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.description,
          image: ogImage,
          datePublished: post.date,
          dateModified: modified,
          keywords: post.tags.join(', '),
          articleBody: postPlainText(post),
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
          author: { '@type': 'Organization', name: 'Posta', url: `${SITE_URL}/` },
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
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
            { '@type': 'ListItem', position: 3, name: post.title, item: url },
          ],
        }),
      },
    ],
  })
} else {
  // Unknown slug (not prerendered) — keep it out of the index.
  useHead({
    title: 'Post not found',
    meta: [{ name: 'robots', content: 'noindex, follow' }],
  })
}
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <template v-if="post">
      <article>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <RouterLink to="/blog">Blog</RouterLink>
          <span class="breadcrumb-sep">/</span>
          <span>{{ post.title }}</span>
        </nav>

        <header class="post-header">
          <h1>{{ post.title }}</h1>
          <div class="post-meta">
            <span>{{ formatDate(post.date) }}</span>
            <span class="dot">·</span>
            <span>{{ post.author }}</span>
          </div>
          <div class="post-tags">
            <span v-for="tag in post.tags" :key="tag" class="post-tag">{{ tag }}</span>
          </div>
        </header>

        <img
          v-if="post.ogImage"
          :src="post.ogImage?.replace(SITE_URL, '')"
          :alt="post.title"
          class="post-cover"
          width="1200"
          height="630"
        />

        <div class="post-body">
          <template v-for="(block, i) in post.body" :key="i">
            <h2 v-if="block.type === 'h2'">{{ block.text }}</h2>
            <h3 v-else-if="block.type === 'h3'">{{ block.text }}</h3>
            <!-- Body text is first-party content from src/data/blog.ts; inline HTML is trusted. -->
            <p v-else-if="block.type === 'p'" v-html="block.text" />
            <blockquote v-else-if="block.type === 'quote'" v-html="block.text" />
            <ul v-else-if="block.type === 'ul'" class="body-list">
              <li v-for="(item, j) in block.items" :key="j" v-html="item" />
            </ul>
            <ol v-else-if="block.type === 'ol'" class="body-list">
              <li v-for="(item, j) in block.items" :key="j" v-html="item" />
            </ol>
            <pre v-else-if="block.type === 'code'" class="code-block"><code>{{ block.code }}</code></pre>
            <figure v-else-if="block.type === 'pdf' && block.src" class="post-pdf">
              <iframe
                :src="`${block.src}#view=FitH`"
                :title="block.text || 'Example PDF'"
                class="post-pdf-frame"
                loading="lazy"
              ></iframe>
              <figcaption class="post-pdf-caption">
                <span v-if="block.text">{{ block.text }}</span>
                <a :href="block.src" target="_blank" rel="noopener" class="post-pdf-link">
                  Open / download PDF →
                </a>
              </figcaption>
            </figure>
            <figure v-else-if="block.type === 'image' && block.src" class="post-figure">
              <img :src="block.src" :alt="block.alt || block.text || ''" class="post-figure-img" loading="lazy" />
              <figcaption v-if="block.text" class="post-figure-caption">{{ block.text }}</figcaption>
            </figure>
          </template>
        </div>
      </article>

      <InternalLinks />

      <CtaSection :source="waitingListSource" />
    </template>

    <section v-else class="not-found">
      <h1>Post not found</h1>
      <p>That article doesn’t exist or may have moved.</p>
      <RouterLink to="/blog" class="back-link">← Back to the blog</RouterLink>
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

.post-header {
  margin-bottom: 24px;
}

.post-cover {
  display: block;
  width: 100%;
  max-width: 820px;
  aspect-ratio: 1200 / 630;
  object-fit: cover;
  border-radius: 16px;
  border: 1px solid var(--border, rgba(148, 163, 184, 0.18));
  margin-bottom: 32px;
}

h1 {
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  line-height: 1.12;
  letter-spacing: -0.03em;
  margin-bottom: 14px;
  max-width: 820px;
}

.post-meta {
  font-size: 13px;
  color: var(--muted);
  display: flex;
  gap: 8px;
  align-items: center;
}

.dot {
  color: rgba(148, 163, 184, 0.5);
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.post-tag {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #a5b4fc;
}

.post-body {
  max-width: 760px;
}

.post-body h2 {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 32px 0 12px;
}

.post-body h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 24px 0 10px;
  color: var(--text);
}

.post-body :deep(p) {
  font-size: 15px;
  color: var(--muted);
  line-height: 1.75;
  margin-bottom: 16px;
}

.post-body :deep(a) {
  color: var(--accent-light);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.post-body :deep(strong) {
  color: var(--text);
  font-weight: 600;
}

.post-body :deep(code) {
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

.post-figure {
  margin: 8px 0 28px;
  max-width: 760px;
}

.post-figure-img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.post-figure-caption {
  margin-top: 10px;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.6;
  text-align: center;
}

.post-pdf {
  margin: 8px 0 28px;
  max-width: 620px;
}

.post-pdf-frame {
  display: block;
  width: 100%;
  height: 680px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  background: #1e293b;
}

.post-pdf-caption {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 12px;
  margin-top: 10px;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.6;
}

.post-pdf-link {
  color: var(--accent-light);
  text-decoration: none;
  font-weight: 500;
  white-space: nowrap;
}

.post-pdf-link:hover {
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
