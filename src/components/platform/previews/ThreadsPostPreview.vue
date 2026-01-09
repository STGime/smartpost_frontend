<script setup lang="ts">
import { computed } from 'vue'
import type { ThreadsConfiguration, MediaListItem, SocialAccount } from '@/types'

const props = defineProps<{
  caption: string
  hashtags: string[]
  mediaItems: MediaListItem[]
  config: ThreadsConfiguration
  account?: SocialAccount
}>()

const displayCaption = computed(() => props.config.caption || props.caption)

const captionWithHashtags = computed(() => {
  const tags = props.hashtags.map(t => `#${t}`).join(' ')
  return tags ? `${displayCaption.value}\n\n${tags}` : displayCaption.value
})

const truncatedCaption = computed(() => {
  const full = captionWithHashtags.value
  const limit = 500
  return full.length > limit ? full.slice(0, limit) + '...' : full
})

const username = computed(() => props.account?.username || 'username')
const displayName = computed(() => props.account?.displayName || props.account?.username || 'Your Name')
const avatarInitial = computed(() => displayName.value[0]?.toUpperCase() || '?')

const previewMedia = computed(() => props.mediaItems[0] || null)
const hasCarousel = computed(() => props.mediaItems.length > 1)
</script>

<template>
  <div class="threads-preview">
    <div class="threads-post">
      <!-- Left: Avatar and line -->
      <div class="threads-left">
        <div class="threads-avatar">
          <img v-if="account?.profileImageUrl" :src="account.profileImageUrl" :alt="displayName" />
          <span v-else>{{ avatarInitial }}</span>
        </div>
        <div class="threads-line"></div>
      </div>

      <!-- Right: Content -->
      <div class="threads-content">
        <!-- Header -->
        <div class="threads-header">
          <span class="threads-username">{{ username }}</span>
          <span class="threads-time">now</span>
          <svg class="threads-more" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </div>

        <!-- Caption -->
        <div class="threads-caption">
          <span v-if="truncatedCaption">{{ truncatedCaption }}</span>
          <span v-else class="threads-empty">Start a thread...</span>
        </div>

        <!-- Media -->
        <div v-if="previewMedia" class="threads-media">
          <img :src="previewMedia.thumbnail_url" alt="" />
          <div v-if="hasCarousel" class="threads-carousel-dots">
            <span v-for="(_, i) in mediaItems.slice(0, 5)" :key="i" :class="['dot', { active: i === 0 }]" />
          </div>
        </div>

        <!-- Actions -->
        <div class="threads-actions">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </div>

        <!-- Stats -->
        <div class="threads-stats">
          0 replies · 0 likes
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.threads-preview {
  max-width: 400px;
  margin: 0 auto;
  background: #101010;
  border-radius: 12px;
  border: 1px solid #333;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.threads-post {
  display: flex;
  gap: 12px;
  padding: 12px;
}

.threads-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.threads-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #000, #333);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.threads-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.threads-avatar span {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.threads-line {
  width: 2px;
  flex: 1;
  background: #333;
  border-radius: 1px;
  min-height: 20px;
}

.threads-content {
  flex: 1;
  min-width: 0;
}

.threads-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.threads-username {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.threads-time {
  font-size: 14px;
  color: #777;
}

.threads-more {
  width: 20px;
  height: 20px;
  color: #777;
  margin-left: auto;
  cursor: pointer;
}

.threads-caption {
  font-size: 15px;
  line-height: 1.4;
  color: #fff;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 12px;
}

.threads-empty {
  color: #777;
}

.threads-media {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.threads-media img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.threads-carousel-dots {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
}

.dot.active {
  background: #fff;
}

.threads-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.threads-actions svg {
  width: 20px;
  height: 20px;
  color: #fff;
  cursor: pointer;
}

.threads-actions svg:hover {
  opacity: 0.7;
}

.threads-stats {
  font-size: 14px;
  color: #777;
}
</style>
