<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const links = [
  { path: '/', label: 'Posta Home' },
  { path: '/social-media-scheduler', label: 'Social Media Scheduler' },
  { path: '/agentic-social-media-scheduler', label: 'Agentic Social Media Scheduler' },
  { path: '/instagram-scheduler', label: 'Instagram Scheduler' },
  { path: '/tiktok-scheduler', label: 'TikTok Scheduler' },
  { path: '/bluesky-scheduler', label: 'Bluesky Scheduler' },
  { path: '/threads-scheduler', label: 'Threads Scheduler' },
  { path: '/buffer-alternative', label: 'Buffer Alternative' },
  { path: '/hootsuite-alternative', label: 'Hootsuite Alternative' },
  { path: '/compare', label: 'Compare Schedulers' },
  { path: '/agents', label: 'Social Media for AI Agents' },
  { path: '/developers', label: 'API & Webhooks' },
  { path: '/auto-post-social-media', label: 'Auto Post Social Media' },
  { path: '/social-media-tools', label: 'Social Media Tools' },
  { path: '/cli-social-media-posting', label: 'CLI Social Media Posting' },
  { path: '/workflows', label: 'n8n Workflows' },
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
  margin-top: 56px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
}

.internal-links-heading {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 14px;
  color: var(--fg-3);
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0 24px;
}

.link-card {
  font-size: 14px;
  padding: 9px 0;
  border-bottom: 1px solid var(--line);
  color: var(--fg-2);
  text-decoration: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  transition: color 0.15s;
}

.link-card:hover {
  color: var(--text);
}

.link-arrow {
  color: var(--fg-3);
  font-size: 14px;
}
</style>
