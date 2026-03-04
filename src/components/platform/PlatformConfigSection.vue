<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SocialAccount, PlatformConfigurations, SocialPlatform, MediaListItem } from '@/types'
import TikTokConfigPanel from './TikTokConfigPanel.vue'
import InstagramConfigPanel from './InstagramConfigPanel.vue'
import YouTubeConfigPanel from './YouTubeConfigPanel.vue'
import FacebookConfigPanel from './FacebookConfigPanel.vue'
import XConfigPanel from './XConfigPanel.vue'
import LinkedInConfigPanel from './LinkedInConfigPanel.vue'
import PinterestConfigPanel from './PinterestConfigPanel.vue'
import BlueskyConfigPanel from './BlueskyConfigPanel.vue'
import ThreadsConfigPanel from './ThreadsConfigPanel.vue'
import PlatformIcon from '@/components/PlatformIcon.vue'

const props = defineProps<{
  selectedAccounts: SocialAccount[]
  modelValue: PlatformConfigurations
  selectedMedia?: MediaListItem[]
  caption: string
  hashtags: string[]
}>()

// Helper to get account for a specific platform
const getAccountForPlatform = (platform: SocialPlatform) =>
  props.selectedAccounts.find(a => a.platform === platform)

const emit = defineEmits<{
  'update:modelValue': [value: PlatformConfigurations]
  'validation-change': [platform: SocialPlatform, valid: boolean, errors: string[]]
}>()

// Handle validation changes from platform config panels
const handleValidationChange = (platform: SocialPlatform, valid: boolean, errors: string[]) => {
  emit('validation-change', platform, valid, errors)
}

// Track which panels are expanded
const expandedPanels = ref<Set<SocialPlatform>>(new Set())

// Get unique platforms from selected accounts
const selectedPlatforms = computed(() => {
  const platforms = new Set<SocialPlatform>()
  props.selectedAccounts.forEach(account => {
    platforms.add(account.platform)
  })
  return Array.from(platforms)
})

// Check if a platform has configurable options (all platforms now have config panels)
const hasConfigOptions = (platform: SocialPlatform) => {
  return [
    'tiktok', 'instagram', 'youtube', 'facebook',
    'twitter', 'x', 'linkedin', 'pinterest', 'bluesky', 'threads'
  ].includes(platform)
}

// Get platforms that have config options
const configurablePlatforms = computed(() => {
  return selectedPlatforms.value.filter(hasConfigOptions)
})

const togglePanel = (platform: SocialPlatform) => {
  if (expandedPanels.value.has(platform)) {
    expandedPanels.value.delete(platform)
  } else {
    expandedPanels.value.add(platform)
  }
  // Force reactivity
  expandedPanels.value = new Set(expandedPanels.value)
}

const updatePlatformConfig = (platform: SocialPlatform, config: PlatformConfigurations[keyof PlatformConfigurations]) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [platform]: config
  })
}

const getPlatformColor = (platform: SocialPlatform) => {
  const colors: Record<SocialPlatform, string> = {
    linkedin: '#0A66C2',
    twitter: '#1DA1F2',
    x: '#000000',
    bluesky: '#0085FF',
    tiktok: '#000000',
    instagram: '#E4405F',
    facebook: '#1877F2',
    youtube: '#FF0000',
    pinterest: '#BD081C',
    threads: '#000000',
  }
  return colors[platform] || '#6366f1'
}

const getPlatformName = (platform: SocialPlatform) => {
  const names: Record<SocialPlatform, string> = {
    linkedin: 'LinkedIn',
    twitter: 'X (Twitter)',
    x: 'X (Twitter)',
    bluesky: 'Bluesky',
    tiktok: 'TikTok',
    instagram: 'Instagram',
    facebook: 'Facebook',
    youtube: 'YouTube',
    pinterest: 'Pinterest',
    threads: 'Threads',
  }
  return names[platform] || platform
}
</script>

<template>
  <div class="platform-config-section" v-if="configurablePlatforms.length > 0">
    <div class="section-header">
      <div class="section-label">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Platform Settings
        <span class="settings-count">{{ configurablePlatforms.length }} platform{{ configurablePlatforms.length > 1 ? 's' : '' }}</span>
      </div>
      <p class="section-hint">Customize settings for each platform</p>
    </div>

    <div class="platform-accordions">
      <div
        v-for="platform in configurablePlatforms"
        :key="platform"
        class="platform-accordion"
      >
        <button
          type="button"
          class="accordion-header"
          @click="togglePanel(platform)"
          :style="{ '--platform-color': getPlatformColor(platform) }"
        >
          <PlatformIcon :platform="platform" size="xs" />
          <span class="platform-name">{{ getPlatformName(platform) }}</span>
          <svg
            class="chevron"
            :class="{ expanded: expandedPanels.has(platform) }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div
          v-show="expandedPanels.has(platform)"
          class="accordion-content"
        >
          <!-- TikTok -->
          <TikTokConfigPanel
            v-if="platform === 'tiktok'"
            :model-value="modelValue.tiktok || {}"
            :selected-media="selectedMedia"
            :caption="caption"
            :hashtags="hashtags"
            :account="getAccountForPlatform('tiktok')"
            @update:model-value="updatePlatformConfig('tiktok', $event)"
            @validation-change="(valid, errors) => handleValidationChange('tiktok', valid, errors)"
          />

          <!-- Instagram -->
          <InstagramConfigPanel
            v-if="platform === 'instagram'"
            :model-value="modelValue.instagram || {}"
            :selected-media="selectedMedia"
            :caption="caption"
            :hashtags="hashtags"
            :account="getAccountForPlatform('instagram')"
            @update:model-value="updatePlatformConfig('instagram', $event)"
          />

          <!-- YouTube -->
          <YouTubeConfigPanel
            v-if="platform === 'youtube'"
            :model-value="modelValue.youtube || {}"
            :selected-media="selectedMedia"
            :caption="caption"
            :hashtags="hashtags"
            :account="getAccountForPlatform('youtube')"
            @update:model-value="updatePlatformConfig('youtube', $event)"
          />

          <!-- Facebook -->
          <FacebookConfigPanel
            v-if="platform === 'facebook'"
            :model-value="modelValue.facebook || {}"
            :selected-media="selectedMedia"
            :caption="caption"
            :hashtags="hashtags"
            :account="getAccountForPlatform('facebook')"
            @update:model-value="updatePlatformConfig('facebook', $event)"
          />

          <!-- X (Twitter) -->
          <XConfigPanel
            v-if="platform === 'twitter' || platform === 'x'"
            :model-value="modelValue.twitter || modelValue.x || {}"
            :selected-media="selectedMedia"
            :caption="caption"
            :hashtags="hashtags"
            :account="getAccountForPlatform('twitter') || getAccountForPlatform('x')"
            @update:model-value="updatePlatformConfig('twitter', $event)"
          />

          <!-- LinkedIn -->
          <LinkedInConfigPanel
            v-if="platform === 'linkedin'"
            :model-value="modelValue.linkedin || {}"
            :selected-media="selectedMedia"
            :caption="caption"
            :hashtags="hashtags"
            :account="getAccountForPlatform('linkedin')"
            @update:model-value="updatePlatformConfig('linkedin', $event)"
          />

          <!-- Pinterest -->
          <PinterestConfigPanel
            v-if="platform === 'pinterest'"
            :model-value="modelValue.pinterest || {}"
            :selected-media="selectedMedia"
            :caption="caption"
            :hashtags="hashtags"
            :account="getAccountForPlatform('pinterest')"
            @update:model-value="updatePlatformConfig('pinterest', $event)"
            @validation-change="(valid, errors) => handleValidationChange('pinterest', valid, errors)"
          />

          <!-- Bluesky -->
          <BlueskyConfigPanel
            v-if="platform === 'bluesky'"
            :model-value="modelValue.bluesky || {}"
            :selected-media="selectedMedia"
            :caption="caption"
            :hashtags="hashtags"
            :account="getAccountForPlatform('bluesky')"
            @update:model-value="updatePlatformConfig('bluesky', $event)"
          />

          <!-- Threads -->
          <ThreadsConfigPanel
            v-if="platform === 'threads'"
            :model-value="modelValue.threads || {}"
            :selected-media="selectedMedia"
            :caption="caption"
            :hashtags="hashtags"
            :account="getAccountForPlatform('threads')"
            @update:model-value="updatePlatformConfig('threads', $event)"
          />
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.platform-config-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.section-label svg {
  width: 18px;
  height: 18px;
  color: var(--muted);
}

.settings-count {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--accent-soft);
  color: #a5b4fc;
  font-size: 11px;
  font-weight: 500;
}

.section-hint {
  font-size: 12px;
  color: var(--muted);
  margin-left: 26px;
}

.platform-accordions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.platform-accordion {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.accordion-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.6);
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}

.accordion-header:hover {
  background: rgba(15, 23, 42, 0.8);
}

.accordion-header :deep(.platform-icon) {
  flex-shrink: 0;
}

.platform-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.chevron {
  margin-left: auto;
  width: 18px;
  height: 18px;
  color: var(--muted);
  transition: transform 0.2s;
}

.chevron.expanded {
  transform: rotate(180deg);
}

.accordion-content > :deep(.config-panel) {
  border: none;
  border-radius: 0;
  border-top: 1px solid var(--border);
}
</style>
