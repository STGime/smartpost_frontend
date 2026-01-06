<script setup lang="ts">
import { computed } from 'vue'
import type { LinkedInConfiguration, MediaListItem, SocialAccount } from '@/types'

const props = defineProps<{
  caption: string
  hashtags: string[]
  mediaItems: MediaListItem[]
  config: LinkedInConfiguration
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
  const limit = 250
  return full.length > limit ? full.slice(0, limit) + '...' : full
})

const needsTruncation = computed(() => captionWithHashtags.value.length > 250)

// Account display
const displayName = computed(() => props.account?.display_name || props.account?.username || 'Your Name')
const avatarInitial = computed(() => displayName.value[0]?.toUpperCase() || '?')

// Post type display
const postType = computed(() => props.config.postType || 'post')
const isCarousel = computed(() => postType.value === 'document')
const isArticle = computed(() => postType.value === 'article')

// Visibility icon
const isPublic = computed(() => props.config.visibility !== 'CONNECTIONS')

// Media display
const previewMedia = computed(() => props.mediaItems[0] || null)
const mediaCount = computed(() => props.mediaItems.length)
</script>

<template>
  <div class="li-preview">
    <!-- Header -->
    <div class="li-header">
      <div class="li-avatar">
        <img v-if="account?.avatar_url" :src="account.avatar_url" :alt="displayName" />
        <span v-else>{{ avatarInitial }}</span>
      </div>
      <div class="li-user-info">
        <span class="li-name">{{ displayName }}</span>
        <span class="li-headline">LinkedIn User</span>
        <span class="li-meta">
          now ·
          <svg v-if="isPublic" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/>
            <path d="M8 3.5a.5.5 0 01.5.5v4a.5.5 0 01-.5.5H4a.5.5 0 010-1h3.5V4a.5.5 0 01.5-.5z"/>
          </svg>
          <svg v-else viewBox="0 0 16 16" fill="currentColor">
            <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 100-6 3 3 0 000 6zM5.5 9a.5.5 0 01-.5-.5V7h-2a.5.5 0 010-1h2V4a.5.5 0 011 0v2h2a.5.5 0 010 1h-2v1.5a.5.5 0 01-.5.5z"/>
          </svg>
        </span>
      </div>
      <svg class="li-more" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="19" r="2" />
      </svg>
    </div>

    <!-- Caption -->
    <div class="li-caption">
      <span v-if="truncatedCaption">{{ truncatedCaption }}</span>
      <span v-else class="li-caption-empty">No caption</span>
      <button v-if="needsTruncation" class="li-more-link">...see more</button>
    </div>

    <!-- Media -->
    <div v-if="previewMedia && !isArticle" class="li-media">
      <img :src="previewMedia.thumbnail_url" alt="" />
      <!-- Carousel indicator -->
      <div v-if="isCarousel || mediaCount > 1" class="li-carousel-badge">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/>
        </svg>
        <span>{{ isCarousel ? 'Document' : mediaCount + ' slides' }}</span>
      </div>
      <!-- Video indicator -->
      <div v-if="previewMedia?.type === 'video'" class="li-video-indicator">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>

    <!-- Article Link Preview -->
    <div v-if="isArticle && config.articleUrl" class="li-article">
      <div class="li-article-image">
        <img v-if="previewMedia" :src="previewMedia.thumbnail_url" alt="" />
        <div v-else class="li-article-placeholder">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/>
          </svg>
        </div>
      </div>
      <div class="li-article-info">
        <span class="li-article-title">{{ config.documentTitle || 'Article title' }}</span>
        <span class="li-article-url">{{ config.articleUrl }}</span>
      </div>
    </div>

    <!-- No media placeholder -->
    <div v-if="!previewMedia && !isArticle" class="li-media-placeholder">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span>No media selected</span>
    </div>

    <!-- Engagement -->
    <div class="li-engagement">
      <div class="li-reactions">
        <div class="li-reaction-icons">
          <span class="reaction like">👍</span>
          <span class="reaction celebrate">🎉</span>
          <span class="reaction love">❤️</span>
        </div>
        <span>0</span>
      </div>
      <div class="li-stats">
        <span>0 comments</span>
        <span>·</span>
        <span>0 reposts</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="li-actions">
      <button class="li-action">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span>Like</span>
      </button>
      <button class="li-action">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span>Comment</span>
      </button>
      <button class="li-action">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>Repost</span>
      </button>
      <button class="li-action">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span>Send</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.li-preview {
  max-width: 400px;
  margin: 0 auto;
  background: #1b1f23;
  border-radius: 8px;
  border: 1px solid #38434f;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header */
.li-header {
  display: flex;
  gap: 8px;
  padding: 12px 16px 8px;
}

.li-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0a66c2, #004182);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.li-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.li-avatar span {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.li-user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.li-name {
  font-size: 14px;
  font-weight: 600;
  color: #e7e9ea;
}

.li-headline {
  font-size: 12px;
  color: #71767b;
}

.li-meta {
  font-size: 12px;
  color: #71767b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.li-meta svg {
  width: 12px;
  height: 12px;
}

.li-more {
  width: 24px;
  height: 24px;
  color: #71767b;
  cursor: pointer;
}

/* Caption */
.li-caption {
  padding: 0 16px 12px;
  font-size: 14px;
  line-height: 1.5;
  color: #e7e9ea;
  white-space: pre-wrap;
  word-break: break-word;
}

.li-caption-empty {
  color: #71767b;
  font-style: italic;
}

.li-more-link {
  background: none;
  border: none;
  color: #71767b;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
}

.li-more-link:hover {
  color: #0a66c2;
  text-decoration: underline;
}

/* Media */
.li-media {
  position: relative;
  aspect-ratio: 1.91/1;
  background: #0a0a0a;
}

.li-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.li-media-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px;
  background: #0a0a0a;
  color: #71767b;
}

.li-media-placeholder svg {
  width: 48px;
  height: 48px;
}

.li-media-placeholder span {
  font-size: 13px;
}

.li-carousel-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  font-size: 11px;
  color: white;
}

.li-carousel-badge svg {
  width: 14px;
  height: 14px;
}

.li-video-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.li-video-indicator svg {
  width: 24px;
  height: 24px;
  fill: white;
  margin-left: 4px;
}

/* Article */
.li-article {
  border: 1px solid #38434f;
  margin: 0 16px;
  border-radius: 8px;
  overflow: hidden;
}

.li-article-image {
  aspect-ratio: 1.91/1;
  background: #0a0a0a;
}

.li-article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.li-article-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #71767b;
}

.li-article-placeholder svg {
  width: 48px;
  height: 48px;
}

.li-article-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.li-article-title {
  font-size: 14px;
  font-weight: 600;
  color: #e7e9ea;
}

.li-article-url {
  font-size: 12px;
  color: #71767b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Engagement */
.li-engagement {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  font-size: 12px;
  color: #71767b;
  border-bottom: 1px solid #38434f;
}

.li-reactions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.li-reaction-icons {
  display: flex;
}

.reaction {
  font-size: 14px;
  margin-left: -4px;
}

.reaction:first-child {
  margin-left: 0;
}

.li-stats {
  display: flex;
  gap: 4px;
}

/* Actions */
.li-actions {
  display: flex;
  padding: 4px 8px;
}

.li-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 8px;
  background: none;
  border: none;
  color: #71767b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.15s;
}

.li-action:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #e7e9ea;
}

.li-action svg {
  width: 20px;
  height: 20px;
}
</style>
