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
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
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
  padding: 18px 20px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: transparent;
  border: none;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}

.close-btn:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.1);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
}

.empty-day {
  text-align: center;
  padding: 32px;
  color: var(--muted);
  font-size: 14px;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-item {
  padding: 14px;
  border-radius: var(--radius-md);
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border);
}

.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.post-time {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.status-badge {
  padding: 3px 8px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 500;
  text-transform: capitalize;
}

.badge-success {
  background: rgba(34, 197, 94, 0.15);
  color: #86efac;
}

.badge-accent {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
}

.badge-error {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}

.badge-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #fcd34d;
}

.badge-draft {
  background: rgba(100, 116, 139, 0.15);
  color: #94a3b8;
}

.post-caption {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-platforms {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.platform-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: var(--radius-full);
  background: rgba(15, 23, 42, 0.6);
  font-size: 11px;
  color: var(--muted);
}

.post-actions {
  display: flex;
  gap: 8px;
}

.btn-view {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  background: var(--accent-soft);
  color: #c7d2fe;
  border: 1px solid rgba(79, 70, 229, 0.3);
  cursor: pointer;
  transition: background 0.15s;
}

.btn-view:hover {
  background: rgba(79, 70, 229, 0.25);
}

.btn-cancel {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
  cursor: pointer;
  transition: background 0.15s;
}

.btn-cancel:hover {
  background: rgba(239, 68, 68, 0.2);
}
</style>
