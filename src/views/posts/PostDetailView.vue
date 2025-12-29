<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostsStore } from '@/stores'
import PlatformIcon from '@/components/PlatformIcon.vue'

const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()

const postId = route.params.id as string

onMounted(() => {
  postsStore.fetchPostById(postId)
})

const post = computed(() => postsStore.currentPost)

const handleDelete = async () => {
  if (confirm('Are you sure you want to delete this post?')) {
    await postsStore.deletePost(postId)
    router.push('/app/posts')
  }
}

const handlePublish = async () => {
  await postsStore.publishPost(postId)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}
</script>

<template>
  <div class="post-detail-page">
    <div class="page-header">
      <div>
        <h1>Post Details</h1>
        <p>View and manage your post</p>
      </div>
      <RouterLink to="/app/posts" class="btn-secondary">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="btn-icon">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Posts
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
            <span class="media-type-badge">{{ media.type }}</span>
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

      <!-- Publishing Results -->
      <div v-if="post.results && post.results.length > 0" class="card detail-card">
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
            <div v-if="result.status === 'success' && result.platformPostUrl" class="result-link">
              <a :href="result.platformPostUrl" target="_blank" rel="noopener noreferrer">
                View on {{ result.platform }}
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <div v-if="result.status === 'failed' && result.errorMessage" class="result-error">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ result.errorMessage }}</span>
            </div>
            <div v-if="result.publishedAt" class="result-time">
              Published {{ formatDate(result.publishedAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-row">
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
          v-if="['draft', 'failed'].includes(post.status)"
          @click="handleDelete"
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
}
</style>
