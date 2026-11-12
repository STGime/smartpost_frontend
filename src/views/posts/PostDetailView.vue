<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostsStore } from '@/stores'
import PlatformIcon from '@/components/PlatformIcon.vue'
import DateTimePicker from '@/components/DateTimePicker.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import MediaDetailModal from '@/components/MediaDetailModal.vue'
import CommentsTab from '@/components/comments/CommentsTab.vue'
import type { PostMedia } from '@/types'

type DetailTab = 'details' | 'comments'

const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()

const postId = route.params.id as string
const scheduledAt = ref<string | null>(null)
const isRescheduling = ref(false)
// Last (re)schedule attempt error, surfaced inline next to the picker. Without
// this the store swallows backend rejections (e.g. wrong status, past time)
// silently — the Save button just stops doing anything.
const scheduleError = ref<string | null>(null)

// Tabs
const activeTab = ref<DetailTab>('details')

// Media detail modal
const selectedMedia = ref<PostMedia | null>(null)
const showMediaModal = ref(false)
const openMediaModal = (media: PostMedia) => {
  selectedMedia.value = media
  showMediaModal.value = true
}

// Modal state
const showDeleteModal = ref(false)
const showCancelModal = ref(false)
const showPublishModal = ref(false)
const showMoveToDraftModal = ref(false)

// TikTok policy consent for publish modal
const tiktokPolicyConsent = ref(false)

// Track if we're scheduling (true) or publishing immediately (false)
const isSchedulingAction = ref(false)
const pendingScheduleTime = ref<string | null>(null)

onMounted(() => {
  postsStore.fetchPostById(postId)
})

const post = computed(() => postsStore.currentPost)

// Check if post includes TikTok accounts (for policy consent requirement)
const hasTikTokAccount = computed(() => {
  return post.value?.socialAccounts?.some(account => account.platform === 'tiktok') ?? false
})

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

const openPublishModal = (forScheduling: boolean = false) => {
  tiktokPolicyConsent.value = false
  isSchedulingAction.value = forScheduling
  if (forScheduling) {
    pendingScheduleTime.value = scheduledAt.value
  }
  showPublishModal.value = true
}

function readError(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { error?: string } } }
  return e.response?.data?.error || fallback
}

const confirmPublishOrSchedule = async () => {
  showPublishModal.value = false

  if (isSchedulingAction.value && pendingScheduleTime.value) {
    scheduleError.value = null
    try {
      await postsStore.schedulePost(postId, pendingScheduleTime.value)
      scheduledAt.value = null
      pendingScheduleTime.value = null
      isRescheduling.value = false
    } catch (err) {
      scheduleError.value = readError(err, 'Failed to schedule post')
    }
  } else {
    scheduleError.value = null
    try {
      await postsStore.publishPost(postId)
    } catch (err) {
      // Reuse the same inline alert slot — only one form is visible at a
      // time via v-if, so there's no collision with the schedule path.
      scheduleError.value = readError(err, 'Failed to publish post')
    }
  }
}

const handleSchedule = async () => {
  if (!scheduledAt.value) return

  scheduleError.value = null

  // Show consent modal for TikTok posts
  if (hasTikTokAccount.value) {
    openPublishModal(true)
    return
  }

  try {
    await postsStore.schedulePost(postId, scheduledAt.value)
    scheduledAt.value = null
    isRescheduling.value = false
  } catch (err) {
    scheduleError.value = readError(err, 'Failed to schedule post')
  }
}

const openCancelModal = () => {
  showCancelModal.value = true
}

const confirmCancelSchedule = async () => {
  await postsStore.cancelScheduledPost(postId)
  showCancelModal.value = false
}

const confirmMoveToDraft = async () => {
  await postsStore.cancelScheduledPost(postId)
  showMoveToDraftModal.value = false
}

const startRescheduling = () => {
  // Pre-fill with current scheduled time
  if (post.value?.scheduledAt) {
    scheduledAt.value = post.value.scheduledAt
  }
  scheduleError.value = null
  isRescheduling.value = true
}

const cancelRescheduling = () => {
  scheduledAt.value = null
  scheduleError.value = null
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
      <!-- Tabs -->
      <div class="tab-strip" role="tablist">
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'details'"
          class="tab-button"
          :class="{ active: activeTab === 'details' }"
          @click="activeTab = 'details'"
        >
          Details
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'comments'"
          class="tab-button"
          :class="{ active: activeTab === 'comments' }"
          @click="activeTab = 'comments'"
        >
          Comments
          <span
            v-if="(post.unreadCommentCount ?? 0) > 0 && activeTab !== 'comments'"
            class="tab-badge"
          >{{ post.unreadCommentCount }}</span>
        </button>
      </div>

      <CommentsTab v-if="activeTab === 'comments'" :post="post" />

      <div v-show="activeTab === 'details'" class="details-pane">
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
            <p v-if="scheduleError" class="schedule-error" role="alert">
              {{ scheduleError }}
            </p>
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
          <p v-if="scheduleError" class="schedule-error" role="alert">
            {{ scheduleError }}
          </p>
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
            role="button"
            tabindex="0"
            title="View media detail"
            @click="openMediaModal(media)"
            @keydown.enter="openMediaModal(media)"
            @keydown.space.prevent="openMediaModal(media)"
          >
            <img
              v-if="media.thumbnailUrl || media.originalUrl"
              :src="media.thumbnailUrl || media.originalUrl"
              alt=""
              @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
            />
            <div v-else class="media-placeholder">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ media.name || 'Media' }}</span>
            </div>
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
          v-if="post.status === 'draft' || post.status === 'scheduled'"
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
          @click="openPublishModal()"
          :disabled="postsStore.isLoading"
          class="btn-primary btn-lg"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="btn-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          {{ postsStore.isLoading ? 'Publishing...' : 'Publish Now' }}
        </button>
        <button
          v-if="post.status === 'scheduled'"
          @click="showMoveToDraftModal = true"
          :disabled="postsStore.isLoading"
          class="btn-secondary"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="btn-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
          </svg>
          Move to Draft
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

    <!-- Media Detail Modal -->
    <MediaDetailModal
      :show="showMediaModal"
      :media="selectedMedia"
      @close="showMediaModal = false"
    />

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

    <!-- Move to Draft Confirmation Modal -->
    <ConfirmModal
      :show="showMoveToDraftModal"
      title="Move to Draft"
      message="This will unschedule the post and move it back to draft status. You can reschedule it later."
      confirm-text="Move to Draft"
      cancel-text="Keep Scheduled"
      @confirm="confirmMoveToDraft"
      @cancel="showMoveToDraftModal = false"
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

    <!-- Publish/Schedule Confirmation Modal (TikTok UX Requirement) -->
    <Teleport to="body">
      <div v-if="showPublishModal" class="modal-overlay" @click.self="showPublishModal = false">
        <div class="publish-modal">
          <div class="publish-modal-header">
            <svg v-if="isSchedulingAction" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke-width="2" />
              <line x1="16" y1="2" x2="16" y2="6" stroke-width="2" />
              <line x1="8" y1="2" x2="8" y2="6" stroke-width="2" />
              <line x1="3" y1="10" x2="21" y2="10" stroke-width="2" />
            </svg>
            <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <h3>{{ isSchedulingAction ? 'Confirm Schedule' : 'Confirm Publish' }}</h3>
          </div>

          <div class="publish-modal-body">
            <p class="publish-message">
              <template v-if="isSchedulingAction">
                Your post will be scheduled for {{ pendingScheduleTime ? formatDate(pendingScheduleTime) : 'the selected time' }} and published to {{ post?.socialAccounts?.length || 0 }} platform{{ (post?.socialAccounts?.length || 0) !== 1 ? 's' : '' }}.
              </template>
              <template v-else>
                Your post will be published to {{ post?.socialAccounts?.length || 0 }} platform{{ (post?.socialAccounts?.length || 0) !== 1 ? 's' : '' }}.
                This action cannot be undone.
              </template>
            </p>

            <!-- TikTok Policy Consent (Required when posting to TikTok) -->
            <div v-if="hasTikTokAccount" class="tiktok-consent-section">
              <div class="consent-header">
                <svg viewBox="0 0 24 24" fill="currentColor" class="tiktok-icon">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <span>TikTok Policy Agreement</span>
              </div>

              <div class="policy-links">
                <p>By publishing to TikTok, you agree to:</p>
                <ul>
                  <li><a href="https://www.tiktok.com/legal/music-usage-confirmation" target="_blank" rel="noopener">Music Usage Confirmation</a></li>
                  <li><a href="https://www.tiktok.com/community-guidelines" target="_blank" rel="noopener">Community Guidelines</a></li>
                  <li><a href="https://www.tiktok.com/legal/terms-of-service" target="_blank" rel="noopener">Terms of Service</a></li>
                </ul>
              </div>

              <label class="consent-checkbox">
                <input
                  type="checkbox"
                  v-model="tiktokPolicyConsent"
                />
                <span class="checkbox-mark"></span>
                <span class="checkbox-label">I have read and agree to TikTok's policies</span>
              </label>

              <div class="tiktok-processing-notice">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="notice-content">
                  <strong>Processing Time</strong>
                  <p v-if="isSchedulingAction">When your scheduled post is published, it may take a few minutes for your content to be processed and visible on your TikTok profile. We'll track the status and notify you when it's ready.</p>
                  <p v-else>After publishing, it may take a few minutes for your content to be processed and visible on your TikTok profile. We'll track the status and notify you when it's ready.</p>
                </div>
              </div>
            </div>

            <p class="processing-note">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Processing may take a few moments depending on file size and platform requirements.
            </p>
          </div>

          <div class="publish-modal-footer">
            <button
              class="btn-secondary"
              @click="showPublishModal = false"
              :disabled="postsStore.isLoading"
            >
              Cancel
            </button>
            <button
              class="btn-primary"
              @click="confirmPublishOrSchedule"
              :disabled="postsStore.isLoading || (hasTikTokAccount && !tiktokPolicyConsent)"
            >
              <svg v-if="postsStore.isLoading" class="btn-spinner" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4" stroke-linecap="round" />
              </svg>
              <template v-if="isSchedulingAction">
                {{ postsStore.isLoading ? 'Scheduling...' : 'Confirm Schedule' }}
              </template>
              <template v-else>
                {{ postsStore.isLoading ? 'Publishing...' : 'Confirm Publish' }}
              </template>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.post-detail-page {
  max-width: 800px;
}

.tab-strip {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--line);
  overflow-x: auto;
}

.tab-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: -1px;
  background: transparent;
  border: none;
  color: var(--fg-2);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
}

.tab-button:hover {
  color: var(--text);
}

.tab-button.active {
  color: var(--text);
  border-bottom-color: var(--signal);
}

.tab-badge {
  border: 1px solid rgba(242, 169, 59, 0.5);
  color: var(--signal);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  line-height: 1.3;
  padding: 1px 6px;
  border-radius: 2px;
  min-width: 20px;
  text-align: center;
}

.details-pane {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 4px;
}

.page-header p {
  font-size: 14px;
  color: var(--fg-2);
}

.btn-icon {
  width: 16px;
  height: 16px;
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
  gap: 12px;
}

.detail-card {
  padding: 16px;
}

/* Section Labels */
.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
  color: var(--fg-2);
}

.section-label svg {
  width: 16px;
  height: 16px;
  color: var(--fg-3);
}

.count-badge {
  margin-left: auto;
  padding: 1px 6px;
  border-radius: 2px;
  border: 1px solid var(--line-strong);
  color: var(--fg-2);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0;
}

/* Status Row */
.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

/* Status tags: run-log style. amber = in progress/scheduled, green = published,
   red = failed, fg-3 = draft */
.status-badge,
.result-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 3px 8px;
  border: 1px solid var(--line-strong);
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
  text-transform: lowercase;
  color: var(--fg-3);
  white-space: nowrap;
}

.status-badge::before,
.result-status::before {
  content: '';
  width: 6px;
  height: 6px;
  background: currentColor;
  flex-shrink: 0;
}

.badge-posted,
.status-success {
  color: var(--success);
  border-color: rgba(95, 191, 138, 0.5);
}

.badge-scheduled,
.badge-processing,
.badge-partially_posted,
.status-pending,
.status-processing {
  color: var(--signal);
  border-color: rgba(242, 169, 59, 0.5);
}

.badge-failed,
.status-failed {
  color: var(--error);
  border-color: rgba(229, 103, 79, 0.5);
}

.badge-draft {
  color: var(--fg-3);
}

.result-status {
  margin-left: auto;
  font-size: 11px;
  padding: 2px 7px;
}

.created-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--fg-3);
}

.created-date svg {
  width: 14px;
  height: 14px;
}

/* Caption */
.caption-text {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* Hashtags */
.hashtags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hashtag-chip {
  display: inline-flex;
  padding: 3px 8px;
  background: var(--ink-0);
  border: 1px solid var(--line);
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--fg-2);
}

/* Media Grid */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.media-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--ink-2);
  border: 1px solid var(--line);
  cursor: pointer;
  transition: border-color 0.15s;
}

.media-item:hover,
.media-item:focus-visible {
  border-color: var(--signal);
  outline: none;
}

.media-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--ink-2);
  color: var(--fg-3);
}

.media-placeholder svg {
  width: 28px;
  height: 28px;
}

.media-placeholder span {
  font-family: var(--font-mono);
  font-size: 11px;
  text-align: center;
  padding: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.video-indicator,
.document-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid var(--line-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
}

.video-indicator svg {
  width: 18px;
  height: 18px;
  margin-left: 2px;
}

.document-indicator {
  color: var(--error);
}

.document-indicator svg {
  width: 18px;
  height: 18px;
}

.media-type-badge {
  position: absolute;
  bottom: 6px;
  left: 6px;
  padding: 1px 5px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.7);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text);
}

.media-type-badge.badge-pdf {
  color: var(--error);
}

.empty-media,
.not-schedulable {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  color: var(--fg-3);
  font-size: 13px;
  border-radius: var(--radius-sm);
  border: 1px dashed var(--line-strong);
}

.empty-media svg {
  width: 28px;
  height: 28px;
  margin-bottom: 8px;
}

/* Accounts */
.accounts-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.account-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  background: var(--ink-0);
  border: 1px solid var(--line);
  min-width: 0;
}

.account-username {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text);
  overflow-wrap: anywhere;
}

.empty-accounts {
  padding: 20px;
  text-align: center;
  color: var(--fg-3);
  font-size: 13px;
}

/* Publishing Results: run-log rows */
.results-list,
.publishing-progress-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--ink-0);
}

.result-item,
.publishing-progress-item {
  padding: 10px 12px;
  border-left: 2px solid transparent;
}

.result-item + .result-item,
.publishing-progress-item + .publishing-progress-item {
  border-top: 1px solid var(--line);
}

.result-item.result-success,
.publishing-progress-item.progress-success {
  border-left-color: var(--success);
}

.result-item.result-failed,
.publishing-progress-item.progress-failed {
  border-left-color: var(--error);
}

.result-item.result-pending,
.result-item.result-processing,
.publishing-progress-item.progress-processing {
  border-left-color: var(--signal);
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

.result-link {
  margin-top: 6px;
}

.result-link a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--signal);
}

.result-link a:hover {
  text-decoration: underline;
}

.result-link svg {
  width: 13px;
  height: 13px;
}

.result-error {
  margin-top: 6px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.5;
  color: #f2a594;
  overflow-wrap: anywhere;
}

.result-error svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--error);
}

.result-time {
  margin-top: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
}

/* Actions */
.actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 4px;
}

.btn-lg {
  padding: 11px 20px;
  font-size: 15px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--line-strong);
  background: var(--ink-2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fg-3);
}

.empty-icon svg {
  width: 24px;
  height: 24px;
}

.empty-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.empty-sub {
  font-size: 13px;
  color: var(--fg-2);
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
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--signal);
  background: var(--signal-soft);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(242, 169, 59, 0.4);
}

.scheduled-time svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.btn-cancel-schedule:hover {
  color: #f2a594;
  border-color: rgba(229, 103, 79, 0.5);
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
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fg-3);
}

.schedule-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.schedule-picker-row {
  display: flex;
  gap: 8px;
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
  color: var(--fg-3);
}

.schedule-error {
  font-size: 13px;
  color: #f2a594;
  background: var(--error-soft);
  border: 1px solid rgba(229, 103, 79, 0.45);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
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

  .actions-row > *,
  .scheduled-actions > *,
  .btn-schedule {
    width: 100%;
    justify-content: center;
  }

  .scheduled-info {
    flex-direction: column;
    align-items: stretch;
  }

  .scheduled-actions {
    flex-direction: column;
  }

  .schedule-picker-row {
    flex-direction: column;
    align-items: stretch;
  }

  .schedule-picker-row > :first-child {
    min-width: 0;
  }
}

/* Publishing Progress */
.publishing-card {
  border-color: rgba(242, 169, 59, 0.45);
  border-left: 2px solid var(--signal);
}

.publishing-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.publishing-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--line-strong);
  border-top-color: var(--signal);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.publishing-text h3 {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--signal);
  margin-bottom: 2px;
}

.publishing-text p {
  font-size: 13px;
  color: var(--fg-2);
}

.publishing-progress-list {
  margin-top: 12px;
}

.publishing-progress-item {
  display: flex;
  align-items: center;
  gap: 10px;
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
  font-family: var(--font-mono);
  font-size: 12px;
  text-transform: lowercase;
}

.progress-status svg {
  width: 14px;
  height: 14px;
}

.progress-status.status-pending {
  color: var(--fg-3);
}

.status-dot {
  width: 6px;
  height: 6px;
}

.status-dot.pending {
  background: var(--fg-3);
}

.status-dot.processing {
  background: var(--signal);
}

/* Publish Confirmation Modal */
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

.publish-modal {
  background: var(--ink-1);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

.publish-modal-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--line);
}

.publish-modal-header svg {
  width: 18px;
  height: 18px;
  color: var(--signal);
}

.publish-modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.publish-modal-body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.publish-message {
  font-size: 14px;
  color: var(--text);
  line-height: 1.5;
  margin: 0;
}

.tiktok-consent-section {
  background: var(--ink-0);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 14px;
}

/* TikTok brand colour identifies the platform */
.consent-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #ff0050;
}

.tiktok-icon {
  width: 18px;
  height: 18px;
}

.policy-links {
  margin-bottom: 12px;
}

.policy-links p {
  font-size: 13px;
  color: var(--fg-2);
  margin: 0 0 6px 0;
}

.policy-links ul {
  margin: 0;
  padding: 0 0 0 20px;
  list-style: disc;
}

.policy-links li {
  font-size: 13px;
  margin-bottom: 4px;
}

.policy-links a {
  color: var(--signal);
}

.policy-links a:hover {
  text-decoration: underline;
}

.consent-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  padding: 10px 12px;
  background: var(--ink-1);
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  transition: border-color 0.15s;
}

.consent-checkbox:hover {
  border-color: var(--line-strong);
}

.consent-checkbox input {
  display: none;
}

.checkbox-mark {
  width: 16px;
  height: 16px;
  margin-top: 1px;
  border: 1px solid var(--line-strong);
  border-radius: 2px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s, background-color 0.15s;
  background: var(--ink-0);
}

.checkbox-mark::after {
  content: '';
  width: 8px;
  height: 8px;
  background: var(--ink-0);
  opacity: 0;
  transition: opacity 0.15s;
}

.consent-checkbox input:checked + .checkbox-mark {
  border-color: var(--signal);
  background: var(--signal);
}

.consent-checkbox input:checked + .checkbox-mark::after {
  opacity: 1;
}

.checkbox-label {
  font-size: 13px;
  color: var(--text);
  line-height: 1.4;
}

.tiktok-processing-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 12px;
  padding: 10px 12px;
  background: var(--signal-soft);
  border: 1px solid rgba(242, 169, 59, 0.4);
  border-radius: var(--radius-sm);
}

.tiktok-processing-notice svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--signal);
}

.tiktok-processing-notice .notice-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tiktok-processing-notice strong {
  font-size: 13px;
  font-weight: 600;
  color: var(--signal);
}

.tiktok-processing-notice p {
  font-size: 12px;
  color: var(--fg-2);
  line-height: 1.5;
  margin: 0;
}

.processing-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: var(--ink-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--fg-2);
  margin: 0;
  line-height: 1.4;
}

.processing-note svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--cyan);
}

.publish-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 18px;
  border-top: 1px solid var(--line);
}

.btn-spinner {
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
}

@media (max-width: 500px) {
  .publish-modal-footer {
    flex-direction: column;
  }

  .publish-modal-footer button {
    width: 100%;
    justify-content: center;
  }
}
</style>
