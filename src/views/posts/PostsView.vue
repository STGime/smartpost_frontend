<script setup lang="ts">
import { onMounted } from 'vue'
import { usePostsStore } from '@/stores'

const postsStore = usePostsStore()

onMounted(() => {
  postsStore.fetchPosts()
})
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

    <div v-if="postsStore.isLoading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else-if="postsStore.posts.length === 0" class="empty-state card">
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
        </div>
        <div class="post-body">
          <p class="post-caption">{{ post.caption || 'No caption' }}</p>
          <div class="post-meta">
            <span>{{ post.socialAccounts?.length ?? 0 }} account(s)</span>
            <span class="meta-dot"></span>
            <span>{{ new Date(post.createdAt).toLocaleDateString() }}</span>
          </div>
        </div>
      </RouterLink>
    </div>
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
  margin-bottom: 28px;
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

/* Posts Grid */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.post-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: var(--bg-card);
  overflow: hidden;
  transition: all 0.2s;
}

.post-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-soft);
}

.post-media {
  position: relative;
  aspect-ratio: 16 / 10;
  background: rgba(15, 23, 42, 0.9);
}

.post-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  pointer-events: none;
}

.video-indicator svg {
  width: 24px;
  height: 24px;
  margin-left: 3px;
}

.media-count {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 8px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  backdrop-filter: blur(8px);
}

.post-media-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
}

.post-media-empty svg {
  width: 32px;
  height: 32px;
}

.post-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
  backdrop-filter: blur(8px);
}

.badge-posted {
  background: rgba(34, 197, 94, 0.2);
  color: #bbf7d0;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.badge-scheduled {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge-draft {
  background: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.badge-processing {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge-failed {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.post-body {
  padding: 14px;
}

.post-caption {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 8px;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--muted);
}

.meta-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--muted);
}
</style>
