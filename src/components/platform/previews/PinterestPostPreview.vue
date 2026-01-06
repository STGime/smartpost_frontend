<script setup lang="ts">
import { computed } from 'vue'
import type { PinterestConfiguration, MediaListItem, SocialAccount } from '@/types'

const props = defineProps<{
  caption: string
  hashtags: string[]
  mediaItems: MediaListItem[]
  config: PinterestConfiguration
  account?: SocialAccount
}>()

const title = computed(() => props.config.title || props.caption?.slice(0, 100) || 'Pin title')
const displayName = computed(() => props.account?.display_name || props.account?.username || 'Your Name')
const avatarInitial = computed(() => displayName.value[0]?.toUpperCase() || '?')

const previewMedia = computed(() => props.mediaItems[0] || null)
</script>

<template>
  <div class="pin-preview">
    <!-- Pin image -->
    <div class="pin-image">
      <img v-if="previewMedia" :src="previewMedia.thumbnail_url" alt="" />
      <div v-else class="pin-placeholder">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0a12 12 0 0 0-4.373 23.178c-.07-.937-.134-2.377.028-3.4.146-.927.943-3.936.943-3.936s-.24-.481-.24-1.193c0-1.116.647-1.95 1.452-1.95.686 0 1.016.514 1.016 1.131 0 .689-.439 1.719-.665 2.674-.189.798.4 1.45 1.188 1.45 1.426 0 2.522-1.504 2.522-3.673 0-1.921-1.38-3.263-3.352-3.263-2.284 0-3.624 1.714-3.624 3.485 0 .69.266 1.43.598 1.832.066.08.076.15.056.232-.061.253-.197.798-.224.909-.035.147-.116.178-.268.107-1-.465-1.625-1.926-1.625-3.1 0-2.523 1.834-4.84 5.286-4.84 2.775 0 4.932 1.977 4.932 4.62 0 2.758-1.739 4.976-4.152 4.976-.811 0-1.573-.421-1.834-.92l-.498 1.9c-.18.696-.668 1.566-.994 2.097A12 12 0 1 0 12 0z"/>
        </svg>
      </div>
      <!-- Save button -->
      <button class="pin-save">Save</button>
      <!-- Link icon -->
      <div v-if="config.link" class="pin-link-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </div>

    <!-- Pin info -->
    <div class="pin-info">
      <h3 class="pin-title">{{ title }}</h3>
      <div class="pin-author">
        <div class="pin-avatar">
          <img v-if="account?.avatar_url" :src="account.avatar_url" :alt="displayName" />
          <span v-else>{{ avatarInitial }}</span>
        </div>
        <span class="pin-name">{{ displayName }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pin-preview {
  max-width: 236px;
  margin: 0 auto;
  background: #1e1e1e;
  border-radius: 16px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.pin-image {
  position: relative;
  aspect-ratio: 2/3;
  background: #2e2e2e;
}

.pin-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pin-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e60023;
  opacity: 0.5;
}

.pin-placeholder svg {
  width: 64px;
  height: 64px;
}

.pin-save {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 12px 16px;
  background: #e60023;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 700;
  color: white;
  cursor: pointer;
}

.pin-save:hover {
  background: #ad081b;
}

.pin-link-icon {
  position: absolute;
  bottom: 12px;
  left: 12px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pin-link-icon svg {
  width: 16px;
  height: 16px;
  color: #111;
}

/* Info */
.pin-info {
  padding: 8px 12px 12px;
}

.pin-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pin-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pin-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e60023;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.pin-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pin-avatar span {
  color: white;
  font-size: 10px;
  font-weight: 600;
}

.pin-name {
  font-size: 12px;
  color: #efefef;
  font-weight: 600;
}
</style>
