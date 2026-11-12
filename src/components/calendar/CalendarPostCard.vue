<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarPost, SocialPlatform } from '@/types'
import PlatformIcon from '@/components/PlatformIcon.vue'

const props = defineProps<{
  post: CalendarPost
}>()

const visiblePlatforms = computed(() => props.post.platforms.slice(0, 3))
const extraPlatforms = computed(() => props.post.platforms.slice(3))
const extraCount = computed(() => extraPlatforms.value.length)

defineEmits<{
  click: [post: CalendarPost]
}>()

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
        v-for="platform in visiblePlatforms"
        :key="platform"
        :platform="platform as SocialPlatform"
        size="sm"
      />
      <span v-if="extraCount > 0" class="extra-count">+{{ extraCount }}</span>
      <span v-if="extraCount > 0" class="extra-platforms">
        <PlatformIcon
          v-for="platform in extraPlatforms"
          :key="platform"
          :platform="platform as SocialPlatform"
          size="sm"
        />
      </span>
    </span>
  </button>
</template>

<style scoped>
.calendar-post-card {
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
  min-width: 0;
  padding: 3px 5px;
  border-radius: 2px;
  background: var(--ink-2);
  border: 1px solid var(--line);
  color: var(--text);
  cursor: pointer;
  transition: background-color 0.12s, border-color 0.12s;
  font-size: 11px;
  text-align: left;
  overflow: hidden;
}

.calendar-post-card:hover {
  background: var(--ink-3);
  border-color: var(--line-strong);
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

.status-scheduled,
.status-processing {
  background: var(--signal);
}

.status-failed {
  background: var(--error);
}

.status-draft {
  background: var(--fg-3);
}

.post-time {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.post-platforms {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
}

.extra-count {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--fg-3);
  padding: 1px 2px;
  line-height: 1;
}

.extra-platforms {
  display: none;
  align-items: center;
  gap: 2px;
}

.calendar-post-card:hover .extra-count {
  display: none;
}

.calendar-post-card:hover .extra-platforms {
  display: flex;
}
</style>
