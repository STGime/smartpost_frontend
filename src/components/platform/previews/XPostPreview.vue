<script setup lang="ts">
import { computed } from 'vue'
import type { XConfiguration, MediaListItem, SocialAccount } from '@/types'

const props = defineProps<{
  caption: string
  hashtags: string[]
  mediaItems: MediaListItem[]
  config: XConfiguration
  account?: SocialAccount
}>()

// Use platform-specific caption if set, otherwise main caption
const displayCaption = computed(() => props.config.caption || props.caption)

// Append hashtags to caption
const captionWithHashtags = computed(() => {
  const tags = props.hashtags.map(t => `#${t}`).join(' ')
  return tags ? `${displayCaption.value} ${tags}` : displayCaption.value
})

// Check if over character limit
const charLimit = 280
const isOverLimit = computed(() => captionWithHashtags.value.length > charLimit)

// Account display
const username = computed(() => props.account?.username || 'username')
const displayName = computed(() => props.account?.displayName || props.account?.username || 'Your Name')
const avatarInitial = computed(() => displayName.value[0]?.toUpperCase() || '?')

// Media grid class based on count
const mediaGridClass = computed(() => {
  const count = props.mediaItems.length
  if (count === 0) return ''
  if (count === 1) return 'media-single'
  if (count === 2) return 'media-duo'
  if (count === 3) return 'media-trio'
  return 'media-quad'
})
</script>

<template>
  <div class="x-preview">
    <!-- Main tweet -->
    <div class="x-tweet">
      <!-- Avatar -->
      <div class="x-avatar">
        <img v-if="account?.profileImageUrl" :src="account.profileImageUrl" :alt="displayName" />
        <span v-else>{{ avatarInitial }}</span>
      </div>

      <!-- Content -->
      <div class="x-content">
        <!-- Header -->
        <div class="x-header">
          <span class="x-name">{{ displayName }}</span>
          <span class="x-handle">@{{ username }}</span>
          <span class="x-dot">·</span>
          <span class="x-time">now</span>
        </div>

        <!-- Caption -->
        <div :class="['x-text', { 'over-limit': isOverLimit }]">
          <span v-if="captionWithHashtags">{{ captionWithHashtags }}</span>
          <span v-else class="x-text-empty">No caption</span>
        </div>

        <!-- Character count warning -->
        <div v-if="isOverLimit" class="x-char-warning">
          {{ captionWithHashtags.length }}/{{ charLimit }} characters
        </div>

        <!-- Media -->
        <div v-if="mediaItems.length > 0" :class="['x-media', mediaGridClass]">
          <div
            v-for="(media, i) in mediaItems.slice(0, 4)"
            :key="i"
            class="x-media-item"
          >
            <img :src="media.thumbnail_url" alt="" />
            <div v-if="media.type === 'video'" class="x-video-indicator">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="x-actions">
          <div class="x-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>0</span>
          </div>
          <div class="x-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>0</span>
          </div>
          <div class="x-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>0</span>
          </div>
          <div class="x-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>0</span>
          </div>
          <div class="x-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.x-preview {
  max-width: 400px;
  margin: 0 auto;
  background: #15202b;
  border-radius: 16px;
  border: 1px solid #38444d;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.x-tweet {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
}

/* Avatar */
.x-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1d9bf0, #0a66c2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.x-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.x-avatar span {
  color: white;
  font-size: 16px;
  font-weight: 700;
}

/* Content */
.x-content {
  flex: 1;
  min-width: 0;
}

/* Header */
.x-header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.x-name {
  font-size: 15px;
  font-weight: 700;
  color: #e7e9ea;
}

.x-handle {
  font-size: 15px;
  color: #71767b;
}

.x-dot {
  color: #71767b;
}

.x-time {
  font-size: 15px;
  color: #71767b;
}

/* Text */
.x-text {
  font-size: 15px;
  line-height: 1.4;
  color: #e7e9ea;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 12px;
}

.x-text.over-limit {
  color: #f4212e;
}

.x-text-empty {
  color: #71767b;
  font-style: italic;
}

.x-char-warning {
  font-size: 13px;
  color: #f4212e;
  margin-bottom: 8px;
}

/* Media */
.x-media {
  display: grid;
  gap: 2px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 12px;
}

.x-media.media-single {
  grid-template-columns: 1fr;
}

.x-media.media-duo {
  grid-template-columns: 1fr 1fr;
}

.x-media.media-trio {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.x-media.media-trio .x-media-item:first-child {
  grid-row: span 2;
}

.x-media.media-quad {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.x-media-item {
  position: relative;
  aspect-ratio: 16/9;
  background: #1a1a1a;
}

.x-media.media-duo .x-media-item,
.x-media.media-trio .x-media-item,
.x-media.media-quad .x-media-item {
  aspect-ratio: 1;
}

.x-media-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.x-video-indicator {
  position: absolute;
  bottom: 8px;
  left: 8px;
  width: 28px;
  height: 28px;
  background: rgba(29, 155, 240, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.x-video-indicator svg {
  width: 14px;
  height: 14px;
  fill: white;
}

/* Actions */
.x-actions {
  display: flex;
  justify-content: space-between;
  max-width: 300px;
}

.x-action {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #71767b;
  cursor: pointer;
  transition: color 0.15s;
}

.x-action:hover {
  color: #1d9bf0;
}

.x-action:nth-child(2):hover {
  color: #00ba7c;
}

.x-action:nth-child(3):hover {
  color: #f91880;
}

.x-action svg {
  width: 18px;
  height: 18px;
}

.x-action span {
  font-size: 13px;
}
</style>
