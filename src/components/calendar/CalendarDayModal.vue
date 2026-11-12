<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarPost, SocialPlatform } from '@/types'
import PlatformIcon from '@/components/PlatformIcon.vue'

const props = defineProps<{
  show: boolean
  date: Date | null
  posts: CalendarPost[]
}>()

const emit = defineEmits<{
  close: []
  'view-post': [post: CalendarPost]
  'cancel-post': [post: CalendarPost]
}>()

const formattedDate = computed(() => {
  if (!props.date) return ''
  return props.date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'posted':
    case 'partially_posted':
      return 'badge-success'
    case 'scheduled':
      return 'badge-accent'
    case 'failed':
      return 'badge-error'
    case 'processing':
      return 'badge-warning'
    default:
      return 'badge-draft'
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ formattedDate }}</h3>
          <button class="close-btn" @click="emit('close')">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="posts.length === 0" class="empty-day">
            <p>No posts for this day</p>
          </div>

          <div v-else class="posts-list">
            <div
              v-for="post in posts"
              :key="post.id"
              class="post-item"
            >
              <div class="post-info">
                <div class="post-header">
                  <span class="post-time">
                    {{ formatTime(post.scheduledAt || post.publishedAt || post.createdAt) }}
                  </span>
                  <span :class="['status-badge', getStatusClass(post.status)]">
                    {{ post.status }}
                  </span>
                </div>

                <p class="post-caption">{{ post.caption || 'No caption' }}</p>

                <div class="post-platforms">
                  <span
                    v-for="platform in post.platforms"
                    :key="platform"
                    class="platform-chip"
                  >
                    <PlatformIcon :platform="platform as SocialPlatform" size="sm" />
                  </span>
                </div>
              </div>

              <div class="post-actions">
                <button class="btn-view" @click="emit('view-post', post)">
                  View
                </button>
                <button
                  v-if="post.status === 'scheduled'"
                  class="btn-cancel"
                  @click="emit('cancel-post', post)"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  background: var(--ink-1);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
}

.modal-header h3 {
  font-size: 15px;
  font-weight: 600;
}

.close-btn {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid transparent;
  color: var(--fg-3);
  cursor: pointer;
  transition: color 0.12s, background-color 0.12s;
}

.close-btn:hover {
  color: var(--text);
  background: var(--ink-2);
}

.close-btn svg {
  width: 16px;
  height: 16px;
}

.modal-body {
  overflow-y: auto;
  flex: 1;
}

.empty-day {
  text-align: center;
  padding: 32px;
  color: var(--fg-2);
  font-size: 14px;
}

.posts-list {
  display: flex;
  flex-direction: column;
}

.post-item {
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
}

.post-item:last-child {
  border-bottom: 0;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.post-time {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text);
}

.status-badge {
  padding: 1px 6px;
  border: 1px solid currentColor;
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.badge-success {
  color: var(--success);
}

.badge-accent,
.badge-warning {
  color: var(--signal);
}

.badge-error {
  color: var(--error);
}

.badge-draft {
  color: var(--fg-3);
}

.post-caption {
  font-size: 13px;
  color: var(--fg-2);
  margin-bottom: 10px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-platforms {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}

.platform-chip {
  display: flex;
  align-items: center;
  padding: 3px;
  border-radius: 2px;
  border: 1px solid var(--line);
  background: var(--ink-2);
}

.post-actions {
  display: flex;
  gap: 8px;
}

.btn-view,
.btn-cancel {
  padding: 5px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.12s, border-color 0.12s;
}

.btn-view {
  color: var(--text);
  border: 1px solid var(--line-strong);
}

.btn-view:hover {
  background: var(--ink-2);
}

.btn-cancel {
  color: var(--error);
  border: 1px solid rgba(229, 103, 79, 0.5);
}

.btn-cancel:hover {
  background: var(--error-soft);
}
</style>
