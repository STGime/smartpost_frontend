<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { usePostsStore, useMediaStore, useSocialAccountsStore, useUserStore } from '@/stores'

const postsStore = usePostsStore()
const mediaStore = useMediaStore()
const socialAccountsStore = useSocialAccountsStore()
const userStore = useUserStore()

// Connected accounts - use actual count from social accounts store
const connectedAccountsCount = computed(() => socialAccountsStore.accounts.length)

const isUnlimited = (value: number | null | undefined) => value == null || value >= 100000

// Accounts with issues (inactive, has error, or expired token)
const accountsWithIssues = computed(() => {
  const now = new Date()
  return socialAccountsStore.accounts.filter(account => {
    // Check if inactive (covers connection errors and revoked tokens)
    if (!account.isActive) return true
    // Check if token is expired (active account but token needs refresh)
    if (account.tokenExpiresAt && new Date(account.tokenExpiresAt) < now) return true
    return false
  })
})

onMounted(async () => {
  // Fetch all data in parallel
  await Promise.all([
    postsStore.fetchPosts({ limit: 5 }),
    mediaStore.fetchMedia({ limit: 5 }),
    socialAccountsStore.fetchAccounts(),
    userStore.fetchPlan()
  ])
})
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p>Welcome back! Here's an overview of your activity.</p>
    </div>

    <!-- Account Issues Warning -->
    <div v-if="accountsWithIssues.length > 0" class="accounts-warning">
      <div class="warning-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div class="warning-content">
        <p class="warning-title">
          {{ accountsWithIssues.length }} account{{ accountsWithIssues.length > 1 ? 's' : '' }} need{{ accountsWithIssues.length === 1 ? 's' : '' }} attention
        </p>
        <p class="warning-accounts">
          {{ accountsWithIssues.map(a => `${a.username} (${a.platform})`).join(', ') }}
        </p>
      </div>
      <RouterLink to="/app/accounts" class="warning-action">
        View Accounts
      </RouterLink>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon-posts">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Posts this month</p>
          <p class="stat-value">{{ userStore.plan?.usage?.posts_this_month || postsStore.total }}</p>
          <p class="stat-sub">of {{ isUnlimited(userStore.plan?.plan?.limits?.max_posts_per_month) ? 'Unlimited*' : (userStore.plan?.plan?.limits?.max_posts_per_month ?? 0) }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon-accounts">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Connected accounts</p>
          <p class="stat-value">{{ connectedAccountsCount }}</p>
          <p class="stat-sub">of {{ isUnlimited(userStore.plan?.plan?.limits?.max_social_accounts) ? 'Unlimited*' : (userStore.plan?.plan?.limits?.max_social_accounts ?? 0) }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon-scheduled">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Scheduled posts</p>
          <p class="stat-value">{{ postsStore.posts.filter(p => p.status === 'scheduled').length }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon-media">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Media files</p>
          <p class="stat-value">{{ mediaStore.total }}</p>
        </div>
      </div>
    </div>

    <!-- Recent posts -->
    <div class="card">
      <div class="card-header">
        <h2>Recent Posts</h2>
        <RouterLink to="/app/posts" class="link-accent">View all</RouterLink>
      </div>

      <div class="card-body">
        <div v-if="postsStore.isLoading" class="loading-state">
          <div class="spinner"></div>
        </div>

        <div v-else-if="postsStore.posts.length === 0" class="empty-state">
          <p>No posts yet</p>
          <RouterLink to="/app/posts/new" class="link-accent">Create your first post</RouterLink>
        </div>

        <div v-else class="posts-list">
          <RouterLink
            v-for="post in postsStore.posts"
            :key="post.id"
            :to="`/app/posts/${post.id}`"
            class="post-item"
          >
            <div v-if="post.media?.[0]?.thumbnailUrl || post.media?.[0]?.originalUrl" class="post-thumb">
              <img :src="post.media[0].thumbnailUrl || post.media[0].originalUrl" alt="" />
            </div>
            <div v-else class="post-thumb post-thumb-empty">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="post-content">
              <p class="post-caption">{{ post.caption || 'No caption' }}</p>
              <p class="post-meta">
                {{ post.socialAccounts?.length ?? 0 }} account(s) &middot;
                {{ new Date(post.createdAt).toLocaleDateString() }}
              </p>
            </div>
            <span :class="['post-status', `status-${post.status}`]">
              {{ post.status }}
            </span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1000px;
}

.dashboard-header {
  margin-bottom: 28px;
}

.dashboard-header h1 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 4px;
}

.dashboard-header p {
  font-size: 14px;
  color: var(--muted);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 500px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: var(--bg-card);
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 20px;
  height: 20px;
}

.stat-icon-posts {
  background: var(--accent-soft);
  color: #a5b4fc;
}

.stat-icon-accounts {
  background: rgba(6, 182, 212, 0.15);
  color: #67e8f9;
}

.stat-icon-scheduled {
  background: var(--warning-soft);
  color: #fcd34d;
}

.stat-icon-media {
  background: var(--success-soft);
  color: #86efac;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 26px;
  font-weight: 600;
  line-height: 1.1;
}

.stat-sub {
  font-size: 11px;
  color: var(--muted);
  margin-top: 2px;
}

/* Card */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 14px;
}

.card-header h2 {
  font-size: 15px;
  font-weight: 600;
}

.link-accent {
  font-size: 13px;
  color: var(--accent-light);
  transition: color 0.15s;
}

.link-accent:hover {
  text-decoration: underline;
}

/* Loading/Empty States */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 32px;
}

.empty-state {
  text-align: center;
  padding: 32px;
  color: var(--muted);
  font-size: 14px;
}

.empty-state .link-accent {
  display: block;
  margin-top: 8px;
}

/* Posts List */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.post-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: var(--radius-md);
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid transparent;
  transition: all 0.15s;
}

.post-item:hover {
  background: rgba(15, 23, 42, 0.8);
  border-color: var(--border);
}

.post-thumb {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(15, 23, 42, 0.9);
}

.post-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-thumb-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
}

.post-thumb-empty svg {
  width: 20px;
  height: 20px;
}

.post-content {
  flex: 1;
  min-width: 0;
}

.post-caption {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.post-meta {
  font-size: 11px;
  color: var(--muted);
}

.post-status {
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
  flex-shrink: 0;
}

.status-posted {
  background: var(--success-soft);
  color: #bbf7d0;
}

.status-scheduled {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
}

.status-draft {
  background: rgba(100, 116, 139, 0.15);
  color: #94a3b8;
}

.status-processing {
  background: var(--warning-soft);
  color: #fcd34d;
}

.status-failed {
  background: var(--error-soft);
  color: #fca5a5;
}

/* Account Issues Warning */
.accounts-warning {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 20px;
  border-radius: var(--radius-lg);
  background: var(--warning-soft);
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.warning-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: rgba(251, 191, 36, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fbbf24;
}

.warning-icon svg {
  width: 20px;
  height: 20px;
}

.warning-content {
  flex: 1;
  min-width: 0;
}

.warning-title {
  font-size: 14px;
  font-weight: 600;
  color: #fcd34d;
  margin-bottom: 2px;
}

.warning-accounts {
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.warning-action {
  flex-shrink: 0;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
}

.warning-action:hover {
  background: rgba(251, 191, 36, 0.3);
}

@media (max-width: 600px) {
  .accounts-warning {
    flex-wrap: wrap;
  }

  .warning-content {
    flex-basis: calc(100% - 48px);
  }

  .warning-action {
    width: 100%;
    text-align: center;
  }
}
</style>
