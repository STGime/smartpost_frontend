<script setup lang="ts">
import { computed } from 'vue'
import type { InstagramConfiguration, MediaListItem, SocialAccount } from '@/types'

const props = defineProps<{
  caption: string
  hashtags: string[]
  mediaItems: MediaListItem[]
  config: InstagramConfiguration
  account?: SocialAccount
}>()

// Use platform-specific caption if set, otherwise main caption
const displayCaption = computed(() => props.config.caption || props.caption)

// Append hashtags to caption
const captionWithHashtags = computed(() => {
  const tags = props.hashtags.map(t => `#${t}`).join(' ')
  return tags ? `${displayCaption.value}\n\n${tags}` : displayCaption.value
})

// Truncate caption for display
const truncatedCaption = computed(() => {
  const full = captionWithHashtags.value
  const limit = 125
  return full.length > limit ? full.slice(0, limit) + '...' : full
})

const needsTruncation = computed(() => captionWithHashtags.value.length > 125)

// Media display
const previewMedia = computed(() => props.mediaItems[0] || null)
const hasCarousel = computed(() => props.mediaItems.length > 1)
const mediaCount = computed(() => props.mediaItems.length)

// Account display
const username = computed(() => props.account?.username || 'username')
const avatarInitial = computed(() => username.value[0]?.toUpperCase() || '?')

// Placement affects aspect ratio
const placementClass = computed(() => {
  const placement = props.config.placement || 'feed'
  return `placement-${placement}`
})
</script>

<template>
  <div :class="['ig-preview', placementClass]">
    <!-- Header -->
    <div class="ig-header">
      <div class="ig-avatar">
        <img v-if="account?.profileImageUrl" :src="account.profileImageUrl" :alt="username" />
        <span v-else>{{ avatarInitial }}</span>
      </div>
      <span class="ig-username">{{ username }}</span>
      <svg class="ig-more" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="12" cy="19" r="1.5" />
      </svg>
    </div>

    <!-- Media -->
    <div class="ig-media">
      <img v-if="previewMedia" :src="previewMedia.thumbnail_url" alt="" />
      <div v-else class="ig-media-placeholder">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>No media selected</span>
      </div>
      <!-- Carousel dots -->
      <div v-if="hasCarousel" class="ig-carousel-dots">
        <span
          v-for="(_, i) in mediaItems.slice(0, 5)"
          :key="i"
          :class="['dot', { active: i === 0 }]"
        />
        <span v-if="mediaCount > 5" class="dot-more">+{{ mediaCount - 5 }}</span>
      </div>
      <!-- Video indicator -->
      <div v-if="previewMedia?.type === 'video'" class="ig-video-indicator">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>

    <!-- Actions -->
    <div class="ig-actions">
      <div class="ig-actions-left">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </div>
      <svg class="ig-bookmark" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    </div>

    <!-- Caption -->
    <div class="ig-caption">
      <span class="ig-caption-username">{{ username }}</span>
      <span v-if="truncatedCaption" class="ig-caption-text">{{ truncatedCaption }}</span>
      <span v-else class="ig-caption-empty">No caption</span>
      <button v-if="needsTruncation" class="ig-more-link">more</button>
    </div>
  </div>
</template>

<style scoped>
.ig-preview {
  max-width: 320px;
  margin: 0 auto;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header */
.ig-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
}

.ig-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #833AB4, #E1306C, #F77737);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.ig-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ig-avatar span {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.ig-username {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.ig-more {
  width: 20px;
  height: 20px;
  color: #fff;
}

/* Media */
.ig-media {
  position: relative;
  aspect-ratio: 1;
  background: #1a1a1a;
}

.placement-reels .ig-media,
.placement-story .ig-media {
  aspect-ratio: 9/16;
}

.ig-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ig-media-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #666;
}

.ig-media-placeholder svg {
  width: 48px;
  height: 48px;
}

.ig-media-placeholder span {
  font-size: 12px;
}

.ig-carousel-dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
}

.dot.active {
  background: #3897f0;
}

.dot-more {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 2px;
}

.ig-video-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ig-video-indicator svg {
  width: 12px;
  height: 12px;
  fill: white;
}

/* Actions */
.ig-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
}

.ig-actions-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.ig-actions svg {
  width: 24px;
  height: 24px;
  color: #fff;
  cursor: pointer;
}

.ig-actions svg:hover {
  opacity: 0.7;
}

/* Caption */
.ig-caption {
  padding: 0 12px 12px;
  font-size: 13px;
  line-height: 1.4;
  color: #fff;
}

.ig-caption-username {
  font-weight: 600;
  margin-right: 6px;
}

.ig-caption-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.ig-caption-empty {
  color: #666;
  font-style: italic;
}

.ig-more-link {
  background: none;
  border: none;
  color: #8e8e8e;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
}

.ig-more-link:hover {
  color: #a8a8a8;
}
</style>
