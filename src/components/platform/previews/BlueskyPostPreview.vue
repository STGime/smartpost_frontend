<script setup lang="ts">
import { computed } from 'vue'
import type { BlueskyConfiguration, MediaListItem, SocialAccount } from '@/types'

const props = defineProps<{
  caption: string
  hashtags: string[]
  mediaItems: MediaListItem[]
  config: BlueskyConfiguration
  account?: SocialAccount
}>()

const displayCaption = computed(() => props.config.caption || props.caption)

const captionWithHashtags = computed(() => {
  const tags = props.hashtags.map(t => `#${t}`).join(' ')
  return tags ? `${displayCaption.value} ${tags}` : displayCaption.value
})

const charLimit = 300
const isOverLimit = computed(() => captionWithHashtags.value.length > charLimit)

const username = computed(() => props.account?.username || 'handle')
const displayName = computed(() => props.account?.displayName || props.account?.username || 'Your Name')
const avatarInitial = computed(() => displayName.value[0]?.toUpperCase() || '?')

const mediaCount = computed(() => Math.min(props.mediaItems.length, 4))

const mediaGridClass = computed(() => {
  if (mediaCount.value === 0) return ''
  if (mediaCount.value === 1) return 'media-single'
  if (mediaCount.value === 2) return 'media-duo'
  return 'media-grid'
})
</script>

<template>
  <div class="bsky-preview">
    <!-- Post -->
    <div class="bsky-post">
      <!-- Avatar -->
      <div class="bsky-avatar">
        <img v-if="account?.profileImageUrl" :src="account.profileImageUrl" :alt="displayName" />
        <span v-else>{{ avatarInitial }}</span>
      </div>

      <!-- Content -->
      <div class="bsky-content">
        <!-- Header -->
        <div class="bsky-header">
          <span class="bsky-name">{{ displayName }}</span>
          <span class="bsky-handle">@{{ username }}.bsky.social</span>
          <span class="bsky-dot">·</span>
          <span class="bsky-time">now</span>
        </div>

        <!-- Caption -->
        <div :class="['bsky-caption', { 'over-limit': isOverLimit }]">
          <span v-if="captionWithHashtags">{{ captionWithHashtags }}</span>
          <span v-else class="bsky-empty">Write something...</span>
        </div>

        <div v-if="isOverLimit" class="bsky-char-warning">
          {{ captionWithHashtags.length }}/{{ charLimit }} characters
        </div>

        <!-- Media -->
        <div v-if="mediaCount > 0" :class="['bsky-media', mediaGridClass]">
          <div
            v-for="(media, i) in mediaItems.slice(0, 4)"
            :key="i"
            class="bsky-media-item"
          >
            <img :src="media.thumbnail_url" alt="" />
          </div>
        </div>

        <!-- Actions -->
        <div class="bsky-actions">
          <div class="bsky-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>0</span>
          </div>
          <div class="bsky-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>0</span>
          </div>
          <div class="bsky-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>0</span>
          </div>
          <div class="bsky-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bsky-preview {
  max-width: 400px;
  margin: 0 auto;
  background: #161e27;
  border-radius: 12px;
  border: 1px solid #2a3a4a;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.bsky-post {
  display: flex;
  gap: 12px;
  padding: 12px;
}

.bsky-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0085ff, #00c8ff);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.bsky-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bsky-avatar span {
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.bsky-content {
  flex: 1;
  min-width: 0;
}

.bsky-header {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.bsky-name {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.bsky-handle {
  font-size: 14px;
  color: #7b8da0;
}

.bsky-dot {
  color: #7b8da0;
}

.bsky-time {
  font-size: 14px;
  color: #7b8da0;
}

.bsky-caption {
  font-size: 15px;
  line-height: 1.4;
  color: #fff;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 12px;
}

.bsky-caption.over-limit {
  color: #ff6b6b;
}

.bsky-empty {
  color: #7b8da0;
}

.bsky-char-warning {
  font-size: 12px;
  color: #ff6b6b;
  margin-bottom: 8px;
}

/* Media */
.bsky-media {
  display: grid;
  gap: 2px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.bsky-media.media-single {
  grid-template-columns: 1fr;
}

.bsky-media.media-duo {
  grid-template-columns: 1fr 1fr;
}

.bsky-media.media-grid {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.bsky-media-item {
  aspect-ratio: 16/9;
  background: #0d1117;
}

.bsky-media.media-duo .bsky-media-item,
.bsky-media.media-grid .bsky-media-item {
  aspect-ratio: 1;
}

.bsky-media-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Actions */
.bsky-actions {
  display: flex;
  gap: 24px;
}

.bsky-action {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #7b8da0;
  cursor: pointer;
}

.bsky-action:hover {
  color: #0085ff;
}

.bsky-action svg {
  width: 18px;
  height: 18px;
}

.bsky-action span {
  font-size: 13px;
}
</style>
