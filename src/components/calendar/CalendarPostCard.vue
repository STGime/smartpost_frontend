<script setup lang="ts">
import type { Post, SocialPlatform } from '@/types'
import PlatformIcon from '@/components/PlatformIcon.vue'

defineProps<{
  post: Post
}>()

defineEmits<{
  click: [post: Post]
}>()

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getUniquePlatforms = (post: Post): SocialPlatform[] => {
  const platforms = new Set<SocialPlatform>()
  post.socialAccounts?.forEach((account) => platforms.add(account.platform))
  return Array.from(platforms).slice(0, 3)
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'posted':
    case 'partially_posted':
      return 'status-posted'
    case 'scheduled':
      return 'status-scheduled'
    case 'failed':
      return 'status-failed'
    case 'processing':
      return 'status-processing'
    default:
      return 'status-draft'
  }
}
</script>

<template>
  <button class="calendar-post-card" @click="$emit('click', post)">
    <span :class="['status-dot', getStatusClass(post.status)]"></span>
    <span class="post-time">{{ formatTime(post.scheduledAt || post.publishedAt || post.createdAt) }}</span>
    <span class="post-platforms">
      <PlatformIcon
        v-for="platform in getUniquePlatforms(post)"
        :key="platform"
        :platform="platform"
        size="sm"
      />
    </span>
  </button>
</template>

<style scoped>
.calendar-post-card {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 4px 6px;
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  font-size: 11px;
  text-align: left;
}

.calendar-post-card:hover {
  background: rgba(15, 23, 42, 0.9);
  border-color: var(--border-hover);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-posted {
  background: var(--success);
}

.status-scheduled {
  background: #3b82f6;
}

.status-failed {
  background: var(--error);
}

.status-processing {
  background: var(--warning);
}

.status-draft {
  background: #94a3b8;
}

.post-time {
  color: var(--text);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.post-platforms {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
}
</style>
