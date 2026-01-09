<script setup lang="ts">
import { computed } from 'vue'
import type { YouTubeConfiguration, MediaListItem, SocialAccount } from '@/types'

const props = defineProps<{
  caption: string
  hashtags: string[]
  mediaItems: MediaListItem[]
  config: YouTubeConfiguration
  account?: SocialAccount
}>()

const title = computed(() => props.config.title || 'Video title')
const description = computed(() => props.config.description || props.caption || 'Video description...')

const truncatedDescription = computed(() => {
  const full = description.value
  const limit = 100
  return full.length > limit ? full.slice(0, limit) + '...' : full
})

const displayName = computed(() => props.account?.displayName || props.account?.username || 'Channel Name')
const avatarInitial = computed(() => displayName.value[0]?.toUpperCase() || '?')

const previewMedia = computed(() => props.mediaItems[0] || null)
const isShort = computed(() => props.config.isShort)
</script>

<template>
  <div :class="['yt-preview', { 'yt-short': isShort }]">
    <!-- Thumbnail -->
    <div class="yt-thumbnail">
      <img v-if="previewMedia" :src="previewMedia.thumbnail_url" alt="" />
      <div v-else class="yt-placeholder">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
      </div>
      <!-- Play button -->
      <div class="yt-play">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
      <!-- Duration -->
      <span class="yt-duration">0:00</span>
      <!-- Short badge -->
      <span v-if="isShort" class="yt-short-badge">SHORT</span>
    </div>

    <!-- Info -->
    <div class="yt-info">
      <div class="yt-avatar">
        <img v-if="account?.profileImageUrl" :src="account.profileImageUrl" :alt="displayName" />
        <span v-else>{{ avatarInitial }}</span>
      </div>
      <div class="yt-details">
        <h3 class="yt-title">{{ title }}</h3>
        <div class="yt-meta">
          <span class="yt-channel">{{ displayName }}</span>
          <span class="yt-stats">0 views · Just now</span>
        </div>
        <p class="yt-description">{{ truncatedDescription }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.yt-preview {
  max-width: 400px;
  margin: 0 auto;
  background: #0f0f0f;
  border-radius: 12px;
  overflow: hidden;
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
}

.yt-preview.yt-short {
  max-width: 200px;
}

.yt-thumbnail {
  position: relative;
  aspect-ratio: 16/9;
  background: #1a1a1a;
}

.yt-preview.yt-short .yt-thumbnail {
  aspect-ratio: 9/16;
}

.yt-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.yt-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff0000;
}

.yt-placeholder svg {
  width: 64px;
  height: 64px;
  opacity: 0.5;
}

.yt-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 42px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.yt-play svg {
  width: 24px;
  height: 24px;
  fill: white;
  margin-left: 2px;
}

.yt-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 2px 4px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.yt-short-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 6px;
  background: #ff0000;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  color: white;
  letter-spacing: 0.5px;
}

/* Info */
.yt-info {
  display: flex;
  gap: 12px;
  padding: 12px;
}

.yt-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ff0000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.yt-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.yt-avatar span {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.yt-details {
  flex: 1;
  min-width: 0;
}

.yt-title {
  font-size: 14px;
  font-weight: 500;
  color: #f1f1f1;
  margin: 0 0 4px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.yt-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.yt-channel {
  font-size: 12px;
  color: #aaa;
}

.yt-stats {
  font-size: 12px;
  color: #aaa;
}

.yt-description {
  margin: 8px 0 0;
  font-size: 12px;
  color: #aaa;
  line-height: 1.4;
}
</style>
