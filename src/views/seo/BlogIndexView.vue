<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import { sortedPosts, SITE_URL } from '@/data/blog'
import type { WaitingListSource } from '@/services'

const waitingListSource = ref<WaitingListSource>('seo-blog')

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

const description =
  'Guides, how-tos, and product updates from Posta — social media scheduling, automation, the API & CLI, and platform-specific tips.'

useHead({
  title: 'Posta Blog – Social Media Scheduling Guides & Updates',
  meta: [
    { name: 'description', content: description },
    {
      name: 'keywords',
      content:
        'posta blog, social media scheduling guides, social media automation, social media tips, content scheduling blog',
    },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: `${SITE_URL}/blog` },
    { property: 'og:title', content: 'Posta Blog – Social Media Scheduling Guides & Updates | Posta' },
    { property: 'og:description', content: description },
    { property: 'og:image', content: `${SITE_URL}/assets/posta_og_image.png` },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Posta Blog – Social Media Scheduling Guides & Updates' },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: `${SITE_URL}/assets/posta_og_image.png` },
  ],
  link: [
    { rel: 'canonical', href: `${SITE_URL}/blog` },
    { rel: 'alternate', type: 'application/rss+xml', title: 'Posta Blog', href: `${SITE_URL}/feed.xml` },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Posta Blog',
        description,
        url: `${SITE_URL}/blog`,
        publisher: {
          '@type': 'Organization',
          name: 'Posta',
          url: `${SITE_URL}/`,
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/posta_logo_512.png` },
        },
        blogPost: sortedPosts.map((p) => ({
          '@type': 'BlogPosting',
          headline: p.title,
          description: p.description,
          url: `${SITE_URL}/blog/${p.slug}`,
          datePublished: p.date,
          dateModified: p.updated || p.date,
          author: { '@type': 'Organization', name: 'Posta' },
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
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
        ],
      }),
    },
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>Posta Blog</h1>
      <p class="hero-sub">
        Guides, how-tos, and product updates on social media scheduling, automation, and posting
        from the API, CLI, and your favorite AI tools.
      </p>
    </section>

    <section class="post-grid">
      <RouterLink
        v-for="post in sortedPosts"
        :key="post.slug"
        :to="`/blog/${post.slug}`"
        class="post-card"
      >
        <img
          v-if="post.ogImage"
          :src="post.ogImage"
          :alt="post.title"
          class="post-card-img"
          loading="lazy"
          width="1200"
          height="630"
        />
        <div class="post-card-meta">
          <span class="post-date">{{ formatDate(post.date) }}</span>
          <span v-for="tag in post.tags.slice(0, 2)" :key="tag" class="post-tag">{{ tag }}</span>
        </div>
        <h2 class="post-card-title">{{ post.title }}</h2>
        <p class="post-card-excerpt">{{ post.description }}</p>
        <span class="post-card-read">Read article <span class="arrow">→</span></span>
      </RouterLink>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Create once, post everywhere"
      subtext="Schedule to eight networks from one workflow. 14-day free trial, no credit card."
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
  max-width: 680px;
  line-height: 1.6;
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.post-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 22px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(to bottom right, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.96));
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.post-card:hover {
  border-color: rgba(165, 180, 252, 0.4);
  box-shadow: 0 0 24px rgba(99, 102, 241, 0.12);
  transform: translateY(-2px);
}

.post-card-img {
  width: 100%;
  aspect-ratio: 1200 / 630;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  margin-bottom: 2px;
}

.post-card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.post-date {
  color: var(--muted);
}

.post-tag {
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #a5b4fc;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.post-card-title {
  font-size: 17px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.post-card-excerpt {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.6;
  flex: 1;
}

.post-card-read {
  font-size: 13px;
  font-weight: 500;
  color: var(--accent-light);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.post-card:hover .arrow {
  transform: translateX(3px);
}

.arrow {
  transition: transform 0.2s;
}
</style>
