<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostsStore } from '@/stores'
import PlatformIcon from '@/components/PlatformIcon.vue'
import DateTimePicker from '@/components/DateTimePicker.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()

const postId = route.params.id as string
const scheduledAt = ref<string | null>(null)
const isRescheduling = ref(false)

// Modal state
const showDeleteModal = ref(false)
const showCancelModal = ref(false)

onMounted(() => {
  postsStore.fetchPostById(postId)
})

const post = computed(() => postsStore.currentPost)

// Determine back path based on where user came from
const backPath = computed(() => {
  return route.query.from === 'calendar' ? '/app/calendar' : '/app/posts'
})

const backLabel = computed(() => {
  return route.query.from === 'calendar' ? 'Back to Calendar' : 'Back to Posts'
})

const openDeleteModal = () => {
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  await postsStore.deletePost(postId)
  showDeleteModal.value = false
  router.push(backPath.value)
}

const handlePublish = async () => {
  await postsStore.publishPost(postId)
}

const handleSchedule = async () => {
  if (!scheduledAt.value) return
  await postsStore.schedulePost(postId, scheduledAt.value)
  scheduledAt.value = null
  isRescheduling.value = false
}

const openCancelModal = () => {
  showCancelModal.value = true
}

const confirmCancelSchedule = async () => {
  await postsStore.cancelScheduledPost(postId)
  showCancelModal.value = false
}

const startRescheduling = () => {
  // Pre-fill with current scheduled time
  if (post.value?.scheduledAt) {
    scheduledAt.value = post.value.scheduledAt
  }
  isRescheduling.value = true
}

const cancelRescheduling = () => {
  scheduledAt.value = null
  isRescheduling.value = false
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

const useAsTemplate = () => {
  if (!post.value) return
  postsStore.setTemplate(post.value)
  router.push('/app/posts/new')
}
</script>

<template>
  <div class="post-detail-page">
    <div class="page-header">
      <div>
        <h1>Post Details</h1>
        <p>View and manage your post</p>
      </div>
      <RouterLink :to="backPath" class="btn-secondary">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="btn-icon">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {{ backLabel }}
      </RouterLink>
    </div>

    <div v-if="postsStore.isLoading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else-if="post" class="post-content">
      <!-- Status Card -->
      <div class="card detail-card">
        <div class="status-row">
          <span :class="['status-badge', `badge-${post.status}`]">
            {{ post.status }}
          </span>
          <span class="created-date">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Created {{ formatDate(post.createdAt) }}
          </span>
        </div>
      </div>

      <!-- Scheduling Card -->
      <div class="card detail-card">
        <div class="section-label">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke-width="1.5" />
            <line x1="16" y1="2" x2="16" y2="6" stroke-width="1.5" />
            <line x1="8" y1="2" x2="8" y2="6" stroke-width="1.5" />
            <line x1="3" y1="10" x2="21" y2="10" stroke-width="1.5" />
          </svg>
          Schedule
        </div>

        <!-- Show scheduled time for scheduled posts -->
        <div v-if="post.status === 'scheduled' && post.scheduledAt" class="scheduled-section">
          <!-- Current schedule display -->
          <div v-if="!isRescheduling" class="scheduled-info">
            <div class="scheduled-time">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Scheduled for {{ formatDate(post.scheduledAt) }}</span>
            </div>
            <div class="scheduled-actions">
              <button
                @click="startRescheduling"
                :disabled="postsStore.isLoading"
                class="btn-secondary btn-reschedule"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="btn-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Change
              </button>
              <button
                @click="openCancelModal"
                :disabled="postsStore.isLoading"
                class="btn-ghost btn-cancel-schedule"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="btn-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            </div>
          </div>

          <!-- Reschedule form -->
          <div v-else class="schedule-form">
            <p class="reschedule-label">Change scheduled time:</p>
            <div class="schedule-picker-row">
              <DateTimePicker
                v-model="scheduledAt"
                placeholder="Select new date and time"
                :disabled="postsStore.isLoading"
              />
              <button
                @click="handleSchedule"
                :disabled="!scheduledAt || postsStore.isLoading"
                class="btn-primary btn-schedule"
              >
                {{ postsStore.isLoading ? 'Saving...' : 'Save' }}
              </button>
              <button
                @click="cancelRescheduling"
                :disabled="postsStore.isLoading"
                class="btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Show date picker for drafts -->
        <div v-else-if="post.status === 'draft'" class="schedule-form">
          <div class="schedule-picker-row">
            <DateTimePicker
              v-model="scheduledAt"
              placeholder="Select date and time"
              :disabled="postsStore.isLoading"
            />
            <button
              @click="handleSchedule"
              :disabled="!scheduledAt || postsStore.isLoading"
              class="btn-primary btn-schedule"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="btn-icon">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke-width="2" />
                <line x1="16" y1="2" x2="16" y2="6" stroke-width="2" />
                <line x1="8" y1="2" x2="8" y2="6" stroke-width="2" />
                <line x1="3" y1="10" x2="21" y2="10" stroke-width="2" />
              </svg>
              {{ postsStore.isLoading ? 'Scheduling...' : 'Schedule Post' }}
            </button>
          </div>
          <p class="schedule-hint">Select a date and time to schedule this post for automatic publishing.</p>
        </div>

        <!-- Not schedulable message for other statuses -->
        <div v-else class="not-schedulable">
          <p>This post cannot be scheduled.</p>
        </div>
      </div>

      <!-- Caption Card -->
      <div class="card detail-card">
        <div class="section-label">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Caption
        </div>
        <p class="caption-text">{{ post.caption || 'No caption' }}</p>
      </div>

      <!-- Hashtags Card -->
      <div v-if="post.hashtags && post.hashtags.length > 0" class="card detail-card">
        <div class="section-label">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          Hashtags
          <span class="count-badge">{{ post.hashtags.length }}</span>
        </div>
        <div class="hashtags-list">
          <span
            v-for="tag in post.hashtags"
            :key="tag"
            class="hashtag-chip"
          >
            #{{ tag }}
          </span>
        </div>
      </div>

      <!-- Media Card -->
      <div class="card detail-card">
        <div class="section-label">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Media
          <span v-if="post.media?.length" class="count-badge">{{ post.media.length }}</span>
        </div>

        <div v-if="post.media?.length > 0" class="media-grid">
          <div
            v-for="media in post.media"
            :key="media.id"
            class="media-item"
          >
            <img :src="media.thumbnailUrl || media.originalUrl" alt="" />
            <span v-if="media.type === 'video'" class="video-indicator">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span v-else-if="media.type === 'document'" class="document-indicator">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <span class="media-type-badge" :class="{ 'badge-pdf': media.type === 'document' }">{{ media.type === 'document' ? 'PDF' : media.type }}</span>
          </div>
        </div>
        <div v-else class="empty-media">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>No media attached</p>
        </div>
      </div>

      <!-- Accounts Card -->
      <div class="card detail-card">
        <div class="section-label">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Target Accounts
          <span v-if="post.socialAccounts?.length" class="count-badge">{{ post.socialAccounts.length }}</span>
        </div>

        <div v-if="post.socialAccounts?.length > 0" class="accounts-list">
          <div
            v-for="account in post.socialAccounts"
            :key="account.id"
            class="account-chip"
          >
            <PlatformIcon :platform="account.platform" size="sm" />
            <span class="account-username">@{{ account.username }}</span>
          </div>
        </div>
        <div v-else class="empty-accounts">
          <p>No accounts selected</p>
        </div>
      </div>

      <!-- Publishing Progress (shown when processing) -->
      <div v-if="post.status === 'processing'" class="card detail-card publishing-card">
        <div class="publishing-header">
          <div class="publishing-spinner"></div>
          <div class="publishing-text">
            <h3>Publishing in Progress</h3>
            <p>Your post is being published to {{ post.socialAccounts?.length || 0 }} platform{{ (post.socialAccounts?.length || 0) !== 1 ? 's' : '' }}...</p>
          </div>
        </div>

        <!-- Show per-platform status if available -->
        <div v-if="post.results && post.results.length > 0" class="publishing-progress-list">
          <div
            v-for="result in post.results"
            :key="result.socialAccountId"
            :class="['publishing-progress-item', `progress-${result.status}`]"
          >
            <PlatformIcon :platform="result.platform" size="sm" />
            <span class="progress-platform">{{ result.platform }}</span>
            <span :class="['progress-status', `status-${result.status}`]">
              <span v-if="result.status === 'pending'" class="status-dot pending"></span>
              <span v-else-if="result.status === 'processing'" class="status-dot processing"></span>
              <svg v-else-if="result.status === 'success'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else-if="result.status === 'failed'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {{ result.status }}
            </span>
          </div>
        </div>
      </div>

      <!-- Publishing Results -->
      <div v-if="post.results && post.results.length > 0 && post.status !== 'processing'" class="card detail-card">
        <div class="section-label">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Publishing Results
          <span class="count-badge">{{ post.results.length }}</span>
        </div>

        <div class="results-list">
          <div
            v-for="result in post.results"
            :key="result.socialAccountId"
            :class="['result-item', `result-${result.status}`]"
          >
            <div class="result-header">
              <PlatformIcon :platform="result.platform" size="sm" />
              <span class="result-platform">{{ result.platform }}</span>
              <span :class="['result-status', `status-${result.status}`]">
                {{ result.status }}
              </span>
            </div>
            <div v-if="result.status === 'success' && result.platformUrl" class="result-link">
              <a :href="result.platformUrl" target="_blank" rel="noopener noreferrer">
                View on {{ result.platform }}
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <div v-if="result.status === 'failed' && result.error" class="result-error">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ result.error }}</span>
            </div>
            <div v-if="result.postedAt" class="result-time">
              Published {{ formatDate(result.postedAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-row">
        <RouterLink
          v-if="post.status === 'draft'"
          :to="`/app/posts/${post.id}/edit`"
          class="btn-secondary"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="btn-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </RouterLink>
        <button
          v-if="post.status === 'draft'"
          @click="handlePublish"
          :disabled="postsStore.isLoading"
          class="btn-primary btn-lg"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="btn-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          {{ postsStore.isLoading ? 'Publishing...' : 'Publish Now' }}
        </button>
        <button
          @click="useAsTemplate"
          class="btn-secondary"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="btn-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Use as Template
        </button>
        <button
          @click="openDeleteModal"
          class="btn-danger"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="btn-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="empty-state card">
      <div class="empty-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="empty-title">Post not found</p>
      <p class="empty-sub">This post may have been deleted</p>
      <RouterLink to="/app/posts" class="btn-primary">Back to Posts</RouterLink>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      :show="showDeleteModal"
      title="Delete Post"
      message="Are you sure you want to delete this post? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      variant="danger"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />

    <!-- Cancel Schedule Confirmation Modal -->
    <ConfirmModal
      :show="showCancelModal"
      title="Cancel Scheduled Post"
      message="Are you sure you want to cancel this scheduled post? The post will return to draft status."
      confirm-text="Cancel Post"
      cancel-text="Keep Scheduled"
      variant="warning"
      @confirm="confirmCancelSchedule"
      @cancel="showCancelModal = false"
    />
  </div>
</template>

<style scoped>
.post-detail-page {
  max-width: 800px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 4px;
}

.page-header p {
  font-size: 14px;
  color: var(--muted);
}

.btn-icon {
  width: 18px;
  height: 18px;
}

/* Loading State */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 64px;
}

/* Post Content */
.post-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-card {
  padding: 18px;
}

/* Section Labels */
.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 14px;
  color: var(--text);
}

.section-label svg {
  width: 18px;
  height: 18px;
  color: var(--muted);
}

.count-badge {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--accent-soft);
  color: #a5b4fc;
  font-size: 11px;
  font-weight: 500;
}

/* Status Row */
.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.status-badge {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 500;
  text-transform: capitalize;
}

.badge-posted {
  background: rgba(34, 197, 94, 0.15);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.badge-scheduled {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge-draft {
  background: rgba(100, 116, 139, 0.15);
  color: #94a3b8;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.badge-processing {
  background: rgba(245, 158, 11, 0.15);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge-partially_posted {
  background: rgba(245, 158, 11, 0.15);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge-failed {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.created-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--muted);
}

.created-date svg {
  width: 16px;
  height: 16px;
}

/* Caption */
.caption-text {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text);
  white-space: pre-wrap;
}

/* Hashtags */
.hashtags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hashtag-chip {
  display: inline-flex;
  padding: 6px 12px;
  background: var(--accent-soft);
  border: 1px solid rgba(79, 70, 229, 0.3);
  border-radius: var(--radius-full);
  font-size: 13px;
  color: #c7d2fe;
}

/* Media Grid */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.media-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: rgba(15, 23, 42, 0.6);
}

.media-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.video-indicator svg {
  width: 20px;
  height: 20px;
  margin-left: 2px;
}

.document-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: rgba(239, 68, 68, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.document-indicator svg {
  width: 20px;
  height: 20px;
}

.media-type-badge {
  position: absolute;
  bottom: 6px;
  left: 6px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.6);
  font-size: 10px;
  text-transform: uppercase;
  color: white;
}

.media-type-badge.badge-pdf {
  background: rgba(239, 68, 68, 0.8);
}

.empty-media {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: var(--muted);
  background: rgba(15, 23, 42, 0.4);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border);
}

.empty-media svg {
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.empty-media p {
  font-size: 13px;
}

/* Accounts */
.accounts-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.account-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border);
}

.account-username {
  font-size: 13px;
  color: var(--text);
}

.empty-accounts {
  padding: 24px;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
}

/* Publishing Results */
.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  padding: 14px;
  border-radius: var(--radius-md);
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--border);
}

.result-item.result-success {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.05);
}

.result-item.result-failed {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.result-item.result-pending {
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.05);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-platform {
  font-size: 14px;
  font-weight: 500;
  text-transform: capitalize;
}

.result-status {
  margin-left: auto;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-success {
  background: rgba(34, 197, 94, 0.15);
  color: #86efac;
}

.status-failed {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}

.status-pending {
  background: rgba(245, 158, 11, 0.15);
  color: #fcd34d;
}

.result-link {
  margin-top: 10px;
}

.result-link a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--accent-light);
  text-decoration: none;
}

.result-link a:hover {
  text-decoration: underline;
}

.result-link svg {
  width: 14px;
  height: 14px;
}

.result-error {
  margin-top: 10px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #fca5a5;
}

.result-error svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}

.result-time {
  margin-top: 8px;
  font-size: 12px;
  color: var(--muted);
}

/* Actions */
.actions-row {
  display: flex;
  gap: 12px;
  padding-top: 8px;
}

.btn-lg {
  padding: 14px 24px;
  font-size: 15px;
}

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: var(--radius-md);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: var(--radius-full);
  background: var(--accent-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a5b4fc;
}

.empty-icon svg {
  width: 28px;
  height: 28px;
}

.empty-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.empty-sub {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 20px;
}

/* Scheduling */
.scheduled-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.scheduled-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.1);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.scheduled-time svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.btn-cancel-schedule {
  color: var(--muted);
}

.btn-cancel-schedule:hover {
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.4);
}

.scheduled-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scheduled-actions {
  display: flex;
  gap: 8px;
}

.btn-reschedule {
  padding: 8px 12px;
}

.reschedule-label {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 4px;
}

.schedule-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-picker-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.schedule-picker-row > :first-child {
  flex: 1;
  min-width: 200px;
}

.btn-schedule {
  flex-shrink: 0;
  white-space: nowrap;
}

.schedule-hint {
  font-size: 12px;
  color: var(--muted);
}

.not-schedulable {
  padding: 16px;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
  background: rgba(15, 23, 42, 0.4);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border);
}

@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .status-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .actions-row {
    flex-direction: column;
  }

  .btn-lg {
    width: 100%;
    justify-content: center;
  }

  .btn-danger {
    width: 100%;
    justify-content: center;
  }

  .scheduled-info {
    flex-direction: column;
    align-items: stretch;
  }

  .schedule-picker-row {
    flex-direction: column;
  }

  .schedule-picker-row > :first-child {
    min-width: 100%;
  }

  .btn-schedule {
    width: 100%;
    justify-content: center;
  }

  .btn-cancel-schedule {
    width: 100%;
    justify-content: center;
  }
}

/* Publishing Progress */
.publishing-card {
  border-color: rgba(245, 158, 11, 0.3);
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, var(--bg-card) 100%);
}

.publishing-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.publishing-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(245, 158, 11, 0.2);
  border-top-color: #fcd34d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.publishing-text h3 {
  font-size: 16px;
  font-weight: 600;
  color: #fcd34d;
  margin-bottom: 4px;
}

.publishing-text p {
  font-size: 13px;
  color: var(--muted);
}

.publishing-progress-list {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.publishing-progress-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(15, 23, 42, 0.4);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.publishing-progress-item.progress-success {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.05);
}

.publishing-progress-item.progress-failed {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.publishing-progress-item.progress-processing {
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.05);
}

.progress-platform {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  text-transform: capitalize;
}

.progress-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  text-transform: capitalize;
}

.progress-status svg {
  width: 14px;
  height: 14px;
}

.progress-status.status-success {
  color: #86efac;
}

.progress-status.status-failed {
  color: #fca5a5;
}

.progress-status.status-pending {
  color: var(--muted);
}

.progress-status.status-processing {
  color: #fcd34d;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.pending {
  background: var(--muted);
}

.status-dot.processing {
  background: #fcd34d;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
