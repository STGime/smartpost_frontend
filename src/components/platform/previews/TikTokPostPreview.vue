<script setup lang="ts">
import { computed } from 'vue'
import type { TikTokConfiguration, MediaListItem, SocialAccount } from '@/types'

const props = defineProps<{
  caption: string
  hashtags: string[]
  mediaItems: MediaListItem[]
  config: TikTokConfiguration
  account?: SocialAccount
}>()

const displayCaption = computed(() => props.config.title || props.config.caption || props.caption)

const captionWithHashtags = computed(() => {
  const tags = props.hashtags.map(t => `#${t}`).join(' ')
  return tags ? `${displayCaption.value} ${tags}` : displayCaption.value
})

const truncatedCaption = computed(() => {
  const full = captionWithHashtags.value
  const limit = 100
  return full.length > limit ? full.slice(0, limit) + '...' : full
})

const username = computed(() => props.account?.username || 'username')
const displayName = computed(() => props.account?.displayName || props.account?.username || 'Your Name')
const avatarInitial = computed(() => displayName.value[0]?.toUpperCase() || '?')

const previewMedia = computed(() => props.mediaItems[0] || null)
</script>

<template>
  <div class="tt-preview">
    <!-- Phone frame -->
    <div class="tt-phone">
      <!-- Video background -->
      <div class="tt-video">
        <img v-if="previewMedia" :src="previewMedia.thumbnail_url" alt="" />
        <div v-else class="tt-video-placeholder">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <!-- Right side actions -->
      <div class="tt-actions-side">
        <div class="tt-avatar-action">
          <div class="tt-avatar">
            <img v-if="account?.profileImageUrl" :src="account.profileImageUrl" :alt="displayName" />
            <span v-else>{{ avatarInitial }}</span>
          </div>
          <div class="tt-follow">+</div>
        </div>
        <div class="tt-action">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span>0</span>
        </div>
        <div class="tt-action">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
          <span>0</span>
        </div>
        <div class="tt-action">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
          </svg>
          <span>0</span>
        </div>
        <div class="tt-disc">
          <div class="tt-disc-inner"></div>
        </div>
      </div>

      <!-- Bottom info -->
      <div class="tt-bottom">
        <div class="tt-user">@{{ username }}</div>
        <div class="tt-caption">{{ truncatedCaption || 'Add a caption...' }}</div>
        <div class="tt-sound">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
          <span>Original sound - {{ displayName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tt-preview {
  display: flex;
  justify-content: center;
}

.tt-phone {
  width: 200px;
  height: 355px;
  background: #000;
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.tt-video {
  position: absolute;
  inset: 0;
}

.tt-video img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tt-video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #25f4ee, #fe2c55);
  opacity: 0.3;
}

.tt-video-placeholder svg {
  width: 48px;
  height: 48px;
  color: white;
}

/* Right side actions */
.tt-actions-side {
  position: absolute;
  right: 8px;
  bottom: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.tt-avatar-action {
  position: relative;
}

.tt-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid white;
  background: linear-gradient(135deg, #25f4ee, #fe2c55);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.tt-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tt-avatar span {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.tt-follow {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 18px;
  height: 18px;
  background: #fe2c55;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: white;
}

.tt-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.tt-action svg {
  width: 28px;
  height: 28px;
  fill: white;
}

.tt-action span {
  font-size: 11px;
  color: white;
  font-weight: 600;
}

.tt-disc {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #333, #111);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: spin 4s linear infinite;
}

.tt-disc-inner {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #25f4ee, #fe2c55);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Bottom info */
.tt-bottom {
  position: absolute;
  bottom: 12px;
  left: 8px;
  right: 50px;
}

.tt-user {
  font-size: 14px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.tt-caption {
  font-size: 12px;
  color: white;
  margin-bottom: 8px;
  line-height: 1.3;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tt-sound {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.tt-sound svg {
  width: 12px;
  height: 12px;
  fill: white;
}

.tt-sound span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
