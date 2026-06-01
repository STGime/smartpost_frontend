<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const links = [
  { path: '/', label: 'Posta Home' },
  { path: '/social-media-scheduler', label: 'Social Media Scheduler' },
  { path: '/instagram-scheduler', label: 'Instagram Scheduler' },
  { path: '/tiktok-scheduler', label: 'TikTok Scheduler' },
  { path: '/bluesky-scheduler', label: 'Bluesky Scheduler' },
  { path: '/threads-scheduler', label: 'Threads Scheduler' },
  { path: '/buffer-alternative', label: 'Buffer Alternative' },
  { path: '/hootsuite-alternative', label: 'Hootsuite Alternative' },
  { path: '/compare', label: 'Compare Schedulers' },
  { path: '/developers', label: 'API & Webhooks' },
  { path: '/auto-post-social-media', label: 'Auto Post Social Media' },
  { path: '/social-media-tools', label: 'Social Media Tools' },
  { path: '/cli-social-media-posting', label: 'CLI Social Media Posting' },
  { path: '/blog', label: 'Blog' },
]

const filteredLinks = computed(() =>
  links.filter(link => link.path !== route.path)
)
</script>

<template>
  <section class="internal-links">
    <h2 class="internal-links-heading">Explore more</h2>
    <div class="links-grid">
      <RouterLink
        v-for="link in filteredLinks"
        :key="link.path"
        :to="link.path"
        class="link-card"
      >
        {{ link.label }}
        <span class="link-arrow">→</span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.internal-links {
  margin-top: 40px;
}

.internal-links-heading {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 14px;
  color: var(--muted);
}

.links-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.link-card {
  font-size: 13px;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(15, 23, 42, 0.85);
  color: var(--text);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: border-color 0.2s, background 0.2s;
}

.link-card:hover {
  border-color: rgba(148, 163, 184, 0.7);
  background: rgba(15, 23, 42, 0.95);
}

.link-arrow {
  color: var(--muted);
  font-size: 14px;
}
</style>
