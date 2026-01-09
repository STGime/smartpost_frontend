<script setup lang="ts">
import { computed } from 'vue'
import type { SocialPlatform } from '@/types'
import { getHashtagLimitStatuses, type HashtagLimitStatus } from '@/config/hashtagLimits'

const props = defineProps<{
  hashtags: string[]
  platforms: SocialPlatform[]
}>()

// Get limit statuses for all selected platforms
const limitStatuses = computed(() => {
  if (props.platforms.length === 0 || props.hashtags.length === 0) {
    return []
  }
  return getHashtagLimitStatuses(props.platforms, props.hashtags.length)
})

// Filter to only show warnings and exceeded
const visibleStatuses = computed(() => {
  return limitStatuses.value.filter(s => s.status !== 'ok' || s.limit !== null)
})

// Get status class
const getStatusClass = (status: HashtagLimitStatus): string => {
  return `status-${status.status}`
}

// Get icon for status
const getStatusIcon = (status: HashtagLimitStatus): string => {
  switch (status.status) {
    case 'exceeded':
      return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    case 'warning':
      return 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    default:
      return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  }
}
</script>

<template>
  <div v-if="hashtags.length > 0 && visibleStatuses.length > 0" class="hashtag-warnings">
    <div
      v-for="status in visibleStatuses"
      :key="status.platform"
      class="warning-item"
      :class="getStatusClass(status)"
    >
      <svg class="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          :d="getStatusIcon(status)"
        />
      </svg>
      <span class="platform-name">{{ status.displayName }}:</span>
      <span class="warning-message">{{ status.message }}</span>
    </div>
  </div>
</template>

<style scoped>
.hashtag-warnings {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.warning-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
}

.warning-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.platform-name {
  font-weight: 500;
}

.warning-message {
  opacity: 0.9;
}

/* Status colors */
.status-ok {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  color: #86efac;
}

.status-warning {
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid rgba(234, 179, 8, 0.2);
  color: #fde047;
}

.status-exceeded {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}
</style>
