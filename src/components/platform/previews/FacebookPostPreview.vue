<script setup lang="ts">
import { computed } from 'vue'
import type { FacebookConfiguration, MediaListItem, SocialAccount } from '@/types'

const props = defineProps<{
  caption: string
  hashtags: string[]
  mediaItems: MediaListItem[]
  config: FacebookConfiguration
  account?: SocialAccount
}>()

const displayCaption = computed(() => props.config.caption || props.caption)

const captionWithHashtags = computed(() => {
  const tags = props.hashtags.map(t => `#${t}`).join(' ')
  return tags ? `${displayCaption.value}\n\n${tags}` : displayCaption.value
})

const truncatedCaption = computed(() => {
  const full = captionWithHashtags.value
  const limit = 250
  return full.length > limit ? full.slice(0, limit) + '...' : full
})

const needsTruncation = computed(() => captionWithHashtags.value.length > 250)

const displayName = computed(() => props.account?.displayName || props.account?.username || 'Your Name')
const avatarInitial = computed(() => displayName.value[0]?.toUpperCase() || '?')

const previewMedia = computed(() => props.mediaItems[0] || null)
const mediaCount = computed(() => props.mediaItems.length)
</script>

<template>
  <div class="fb-preview">
    <!-- Header -->
    <div class="fb-header">
      <div class="fb-avatar">
        <img v-if="account?.profileImageUrl" :src="account.profileImageUrl" :alt="displayName" />
        <span v-else>{{ avatarInitial }}</span>
      </div>
      <div class="fb-user-info">
        <span class="fb-name">{{ displayName }}</span>
        <span class="fb-meta">
          Just now ·
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/>
          </svg>
        </span>
      </div>
      <svg class="fb-more" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="2" />
        <circle cx="5" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
      </svg>
    </div>

    <!-- Caption -->
    <div class="fb-caption">
      <span v-if="truncatedCaption">{{ truncatedCaption }}</span>
      <span v-else class="fb-caption-empty">No caption</span>
      <button v-if="needsTruncation" class="fb-more-link">See more</button>
    </div>

    <!-- Media -->
    <div v-if="previewMedia" class="fb-media">
      <img :src="previewMedia.thumbnail_url" alt="" />
      <div v-if="previewMedia?.type === 'video'" class="fb-video-indicator">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
      <div v-if="mediaCount > 1" class="fb-media-count">+{{ mediaCount - 1 }}</div>
    </div>

    <div v-else class="fb-media-placeholder">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span>No media selected</span>
    </div>

    <!-- Reactions -->
    <div class="fb-reactions">
      <div class="fb-reaction-icons">
        <span>👍</span>
        <span>❤️</span>
        <span>😂</span>
      </div>
      <span class="fb-stats">0 comments · 0 shares</span>
    </div>

    <!-- Actions -->
    <div class="fb-actions">
      <button class="fb-action">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        Like
      </button>
      <button class="fb-action">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Comment
      </button>
      <button class="fb-action">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share
      </button>
    </div>
  </div>
</template>

<style scoped>
.fb-preview {
  max-width: 400px;
  margin: 0 auto;
  background: #242526;
  border-radius: 8px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.fb-header {
  display: flex;
  gap: 8px;
  padding: 12px;
  align-items: flex-start;
}

.fb-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1877f2, #0a66c2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.fb-avatar img { width: 100%; height: 100%; object-fit: cover; }
.fb-avatar span { color: white; font-size: 16px; font-weight: 600; }

.fb-user-info { flex: 1; }
.fb-name { font-size: 15px; font-weight: 600; color: #e4e6eb; display: block; }
.fb-meta { font-size: 13px; color: #b0b3b8; display: flex; align-items: center; gap: 4px; }
.fb-meta svg { width: 12px; height: 12px; }

.fb-more { width: 36px; height: 36px; padding: 8px; color: #b0b3b8; cursor: pointer; border-radius: 50%; }
.fb-more:hover { background: rgba(255,255,255,0.1); }

.fb-caption { padding: 0 12px 12px; font-size: 15px; line-height: 1.4; color: #e4e6eb; white-space: pre-wrap; }
.fb-caption-empty { color: #b0b3b8; font-style: italic; }
.fb-more-link { background: none; border: none; color: #b0b3b8; font-size: 15px; cursor: pointer; padding: 0; }
.fb-more-link:hover { text-decoration: underline; }

.fb-media { position: relative; aspect-ratio: 1.91/1; background: #18191a; }
.fb-media img { width: 100%; height: 100%; object-fit: cover; }

.fb-media-placeholder {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; padding: 32px; background: #18191a; color: #b0b3b8;
}
.fb-media-placeholder svg { width: 48px; height: 48px; }

.fb-video-indicator {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 60px; height: 60px; background: rgba(0,0,0,0.6); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.fb-video-indicator svg { width: 28px; height: 28px; fill: white; margin-left: 4px; }

.fb-media-count {
  position: absolute; bottom: 8px; right: 8px; padding: 4px 12px;
  background: rgba(0,0,0,0.7); border-radius: 4px; font-size: 16px; font-weight: 600; color: white;
}

.fb-reactions {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; border-bottom: 1px solid #3e4042;
}
.fb-reaction-icons { display: flex; gap: -4px; font-size: 18px; }
.fb-stats { font-size: 15px; color: #b0b3b8; }

.fb-actions { display: flex; padding: 4px; }
.fb-action {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 12px; background: none; border: none; color: #b0b3b8; font-size: 15px;
  font-weight: 600; cursor: pointer; border-radius: 4px;
}
.fb-action:hover { background: rgba(255,255,255,0.1); }
.fb-action svg { width: 20px; height: 20px; }
</style>
