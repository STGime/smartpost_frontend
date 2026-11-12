<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { usePostsStore } from '@/stores'
import ConfirmModal from '@/components/ConfirmModal.vue'
import PlatformIcon from '@/components/PlatformIcon.vue'
import type { PostStatus } from '@/types'

const postsStore = usePostsStore()

const showDeleteModal = ref(false)
const postToDelete = ref<string | null>(null)
const isLoadingMore = ref(false)

const pageSize = 12

const statusTabs: { label: string; value: PostStatus | null }[] = [
  { label: 'All', value: null },
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Posted', value: 'posted' },
  { label: 'Failed', value: 'failed' },
]

const sortOptions = [
  { label: 'Newest first', sortBy: 'created_at' as const, sortOrder: 'desc' as const },
  { label: 'Oldest first', sortBy: 'created_at' as const, sortOrder: 'asc' as const },
  { label: 'Scheduled date', sortBy: 'scheduled_at' as const, sortOrder: 'asc' as const },
  { label: 'Recently updated', sortBy: 'updated_at' as const, sortOrder: 'desc' as const },
]

const currentSortIndex = computed(() => {
  return sortOptions.findIndex(
    (o) => o.sortBy === postsStore.sortBy && o.sortOrder === postsStore.sortOrder
  )
})

const onSortChange = (e: Event) => {
  const idx = Number((e.target as HTMLSelectElement).value)
  const opt = sortOptions[idx]
  if (opt) {
    postsStore.setSort(opt.sortBy, opt.sortOrder, pageSize)
  }
}

const onFilterChange = (status: PostStatus | null) => {
  postsStore.setStatusFilter(status, pageSize)
}

const loadMore = async () => {
  isLoadingMore.value = true
  try {
    await postsStore.fetchPosts({
      limit: pageSize,
      offset: postsStore.posts.length
    })
  } finally {
    isLoadingMore.value = false
  }
}

onMounted(() => {
  postsStore.fetchPosts({ limit: pageSize })
})

const openDeleteModal = (e: Event, postId: string) => {
  e.preventDefault()
  e.stopPropagation()
  postToDelete.value = postId
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (postToDelete.value) {
    await postsStore.deletePost(postToDelete.value)
  }
  showDeleteModal.value = false
  postToDelete.value = null
}

const cancelDelete = () => {
  showDeleteModal.value = false
  postToDelete.value = null
}
</script>

<template>
  <div class="posts-page">
    <div class="page-header">
      <div>
        <h1>Posts</h1>
        <p>Manage and schedule your social media posts</p>
      </div>
      <RouterLink to="/app/posts/new" class="btn-primary">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="btn-icon">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Post
      </RouterLink>
    </div>

    <div class="filter-sort-bar">
      <div class="status-tabs">
        <button
          v-for="tab in statusTabs"
          :key="tab.label"
          :class="['tab-btn', { active: postsStore.statusFilter === tab.value }]"
          @click="onFilterChange(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
      <select
        class="sort-select"
        :value="currentSortIndex"
        @change="onSortChange"
      >
        <option v-for="(opt, i) in sortOptions" :key="i" :value="i">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <div v-if="postsStore.isLoading && postsStore.posts.length === 0" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else-if="!postsStore.isLoading && postsStore.posts.length === 0 && postsStore.statusFilter" class="empty-state card">
      <div class="empty-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </div>
      <p class="empty-title">No {{ postsStore.statusFilter }} posts</p>
      <p class="empty-sub">There are no posts matching this filter</p>
    </div>

    <div v-else-if="!postsStore.isLoading && postsStore.posts.length === 0" class="empty-state card">
      <div class="empty-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      </div>
      <p class="empty-title">No posts yet</p>
      <p class="empty-sub">Create your first post to get started</p>
      <RouterLink to="/app/posts/new" class="btn-primary">Create your first post</RouterLink>
    </div>

    <div v-else class="posts-grid">
      <RouterLink
        v-for="post in postsStore.posts"
        :key="post.id"
        :to="`/app/posts/${post.id}`"
        class="post-card"
      >
        <div class="post-media">
          <img
            v-if="post.media?.[0]?.thumbnailUrl || post.media?.[0]?.originalUrl"
            :src="post.media[0].thumbnailUrl || post.media[0].originalUrl"
            alt=""
          />
          <div v-else class="post-media-empty">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <!-- Video play indicator -->
          <div v-if="post.media?.[0]?.type === 'video'" class="video-indicator">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <!-- Media count badge if multiple -->
          <span v-if="post.media?.length > 1" class="media-count">
            +{{ post.media.length - 1 }}
          </span>
          <span :class="['post-badge', `badge-${post.status}`]">{{ post.status }}</span>
          <button
            class="delete-btn"
            @click="openDeleteModal($event, post.id)"
            title="Delete post"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        <div class="post-body">
          <p class="post-caption">{{ post.caption || 'No caption' }}</p>
          <div class="post-meta">
            <div class="post-platforms" v-if="post.socialAccounts?.length">
              <PlatformIcon
                v-for="account in post.socialAccounts.slice(0, 4)"
                :key="account.id"
                :platform="account.platform"
                size="xs"
              />
              <span v-if="post.socialAccounts.length > 4" class="more-platforms">
                +{{ post.socialAccounts.length - 4 }}
              </span>
            </div>
            <span v-else class="no-accounts">No accounts</span>
            <span class="meta-dot"></span>
            <span>{{ new Date(post.scheduledAt || post.publishedAt || post.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) }}</span>
            <span
              v-if="(post.unreadCommentCount ?? 0) > 0"
              class="unread-pill"
              :title="`${post.unreadCommentCount} unread comment${post.unreadCommentCount === 1 ? '' : 's'}`"
            >
              {{ post.unreadCommentCount }} new
            </span>
          </div>
        </div>
      </RouterLink>
    </div>

    <!-- Load More -->
    <div v-if="postsStore.hasMore" class="load-more">
      <button
        class="load-more-btn"
        :disabled="isLoadingMore"
        @click="loadMore"
      >
        <div v-if="isLoadingMore" class="spinner spinner-sm"></div>
        <span v-else>Load More</span>
      </button>
      <span class="load-more-info">
        Showing {{ postsStore.posts.length }} of {{ postsStore.total }} posts
      </span>
    </div>

    <ConfirmModal
      :show="showDeleteModal"
      title="Delete Post"
      message="Are you sure you want to delete this post? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      variant="danger"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped>
.posts-page {
  max-width: 1000px;
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
  letter-spacing: -0.01em;
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

/* Filter & Sort Bar */
.filter-sort-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.status-tabs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 5px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  background: transparent;
  color: var(--fg-2);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s, background-color 0.12s;
  white-space: nowrap;
}

.tab-btn:hover {
  border-color: var(--line-strong);
  color: var(--text);
}

.tab-btn.active {
  background: var(--signal-soft);
  border-color: var(--signal);
  color: var(--signal);
}

.sort-select {
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  background: var(--ink-2);
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  outline: none;
  min-width: 150px;
}

.sort-select:hover {
  border-color: var(--line-strong);
}

.sort-select:focus {
  border-color: var(--signal);
}

/* Loading State */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 64px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  margin: 0 auto 12px;
  display: flex;
  justify-content: center;
  color: var(--fg-3);
}

.empty-icon svg {
  width: 28px;
  height: 28px;
}

.empty-title {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
}

.empty-sub {
  font-size: 13px;
  color: var(--fg-2);
  margin-bottom: 20px;
}

/* Posts: table rows with hairline separators.
   .post-media is left static so the status tag + delete button
   (absolute children) anchor to the row, not the thumbnail. */
.posts-grid {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--ink-1);
  overflow: hidden;
}

.post-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 150px 10px 14px;
  border-bottom: 1px solid var(--line);
  color: var(--text);
  transition: background-color 0.12s;
}

.post-card:last-child {
  border-bottom: 0;
}

.post-card:hover {
  background: var(--ink-2);
}

.post-media {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  overflow: hidden;
  background: var(--ink-2);
}

.post-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-media-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fg-3);
}

.post-media-empty svg {
  width: 18px;
  height: 18px;
}

/* Thumbnail overlays: positioned against the row (thumb is 48px at left 14px) */
.video-indicator {
  position: absolute;
  top: 50%;
  left: 38px;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  pointer-events: none;
}

.video-indicator svg {
  width: 11px;
  height: 11px;
  margin-left: 1px;
}

.media-count {
  position: absolute;
  bottom: 12px;
  left: 16px;
  padding: 0 3px;
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 14px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
}

/* Status tag */
.post-badge {
  position: absolute;
  top: 50%;
  right: 54px;
  transform: translateY(-50%);
  padding: 2px 6px;
  border: 1px solid currentColor;
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--fg-3);
}

.badge-posted,
.badge-published {
  color: var(--success);
}

.badge-scheduled,
.badge-partially_posted,
.badge-processing {
  color: var(--signal);
}

.badge-failed {
  color: var(--error);
}

.delete-btn {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid transparent;
  color: var(--fg-3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.12s, border-color 0.12s, background-color 0.12s;
}

.delete-btn:hover {
  color: var(--error);
  border-color: rgba(229, 103, 79, 0.5);
  background: var(--error-soft);
}

.delete-btn svg {
  width: 15px;
  height: 15px;
}

.post-body {
  flex: 1;
  min-width: 0;
}

.post-caption {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
  white-space: nowrap;
}

.unread-pill {
  padding: 0 5px;
  border: 1px solid var(--signal);
  border-radius: 2px;
  color: var(--signal);
  font-size: 10.5px;
  font-weight: 500;
}

.meta-dot {
  width: 3px;
  height: 3px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--fg-3);
}

.post-platforms {
  display: flex;
  align-items: center;
  gap: 4px;
}

.more-platforms {
  font-size: 11px;
  color: var(--fg-3);
  margin-left: 2px;
}

@media (max-width: 500px) {
  .post-card {
    padding-right: 128px;
  }

  .post-badge {
    right: 46px;
  }

  .delete-btn {
    right: 8px;
  }
}

/* Load More */
.load-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 12px;
}

.load-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  padding: 8px 20px;
  border-radius: var(--radius-sm);
  background: var(--ink-1);
  border: 1px solid var(--line);
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.12s, background-color 0.12s;
}

.load-more-btn:hover:not(:disabled) {
  border-color: var(--line-strong);
  background: var(--ink-2);
}

.load-more-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.load-more-info {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border-width: 2px;
}
</style>
