<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAnalyticsStore } from '@/stores'
import PlatformIcon from '@/components/PlatformIcon.vue'

const analyticsStore = useAnalyticsStore()

const selectedPostIds = ref<string[]>([])
const isComparing = ref(false)
const compareError = ref<string | null>(null)

const availablePosts = computed(() => analyticsStore.postsAnalytics)

const togglePost = (postId: string) => {
  const idx = selectedPostIds.value.indexOf(postId)
  if (idx >= 0) {
    selectedPostIds.value.splice(idx, 1)
  } else if (selectedPostIds.value.length < 4) {
    selectedPostIds.value.push(postId)
  }
  compareError.value = null
}

const canCompare = computed(() =>
  selectedPostIds.value.length >= 2 && selectedPostIds.value.length <= 4
)

const handleCompare = async () => {
  if (!canCompare.value) return
  isComparing.value = true
  compareError.value = null
  try {
    await analyticsStore.fetchComparison(selectedPostIds.value)
  } catch (err: unknown) {
    const e = err as { response?: { status?: number; data?: { error?: string; message?: string } } }
    if (e.response?.status === 403) {
      compareError.value = 'Post comparison requires a Professional plan.'
    } else if (e.response?.status === 404) {
      compareError.value = 'Selected posts not found. They may have been deleted.'
    } else {
      compareError.value = e.response?.data?.error || e.response?.data?.message || 'Failed to compare posts. Please try again.'
    }
  } finally {
    isComparing.value = false
  }
}

const clearComparison = () => {
  selectedPostIds.value = []
  analyticsStore.comparisonPosts = []
  compareError.value = null
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const metrics = ['likes', 'comments', 'shares', 'views', 'impressions', 'reach'] as const

const getMetricMax = (metric: typeof metrics[number]) => {
  return Math.max(...analyticsStore.comparisonPosts.map(p => p[metric] || 0), 1)
}

const isWinner = (postIndex: number, metric: typeof metrics[number]) => {
  const posts = analyticsStore.comparisonPosts
  if (posts.length < 2) return false
  const val = posts[postIndex]?.[metric] || 0
  return val > 0 && val >= Math.max(...posts.map(p => p[metric] || 0))
}
</script>

<template>
  <div class="comparison-card card">
    <div class="card-header">
      <h2>Post Comparison</h2>
      <span class="pro-badge">Pro</span>
    </div>
    <div class="card-body">
      <!-- Post selector -->
      <div v-if="!analyticsStore.comparisonPosts.length" class="comparison-selector">
        <p class="selector-label">Select 2-4 posts to compare:</p>
        <div class="post-select-list">
          <div
            v-for="post in availablePosts.slice(0, 20)"
            :key="post.postId"
            :class="['post-select-item', { selected: selectedPostIds.includes(post.postId) }]"
            @click="togglePost(post.postId)"
          >
            <div class="post-select-check">
              <svg v-if="selectedPostIds.includes(post.postId)" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <PlatformIcon :platform="post.platform" size="xs" />
            <span class="post-select-caption">{{ post.caption || 'No caption' }}</span>
            <span v-if="post.views > 0" class="post-select-views">{{ formatNumber(post.views) }} views</span>
            <span class="post-select-engagement">{{ formatNumber(post.totalEngagement) }} eng.</span>
          </div>
        </div>
        <div class="selector-actions">
          <button
            class="btn-compare"
            :disabled="!canCompare || isComparing"
            @click="handleCompare"
          >
            {{ isComparing ? 'Comparing...' : `Compare ${selectedPostIds.length} posts` }}
          </button>
          <span v-if="selectedPostIds.length < 2" class="selector-hint">Select at least 2 posts</span>
          <span v-else-if="selectedPostIds.length >= 4" class="selector-hint">Maximum 4 posts</span>
        </div>
        <div v-if="compareError" class="compare-error">
          {{ compareError }}
        </div>
      </div>

      <!-- Comparison results -->
      <div v-else class="comparison-results">
        <button class="btn-clear" @click="clearComparison">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Select different posts
        </button>

        <div class="comparison-grid">
          <!-- Post headers -->
          <div class="comparison-header">
            <div class="metric-label-cell"></div>
            <div
              v-for="post in analyticsStore.comparisonPosts"
              :key="post.postId"
              class="comparison-post-header"
            >
              <PlatformIcon :platform="post.platform" size="xs" />
              <span class="comparison-caption">{{ post.caption?.substring(0, 40) || 'No caption' }}{{ (post.caption?.length || 0) > 40 ? '...' : '' }}</span>
            </div>
          </div>

          <!-- Metric rows -->
          <div
            v-for="metric in metrics"
            :key="metric"
            class="comparison-row"
          >
            <div class="metric-label-cell">{{ metric }}</div>
            <div
              v-for="(post, idx) in analyticsStore.comparisonPosts"
              :key="post.postId + metric"
              class="comparison-metric-cell"
            >
              <div class="metric-bar-track">
                <div
                  class="metric-bar"
                  :class="{ winner: isWinner(idx, metric) }"
                  :style="{ width: `${((post[metric] || 0) / getMetricMax(metric)) * 100}%` }"
                ></div>
              </div>
              <span :class="['metric-value', { winner: isWinner(idx, metric) }]">
                {{ formatNumber(post[metric] || 0) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comparison-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selector-label {
  font-size: 13px;
  color: var(--muted);
}

.post-select-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.post-select-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s;
}

.post-select-item:hover {
  background: rgba(15, 23, 42, 0.8);
}

.post-select-item.selected {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.post-select-check {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 3px;
  flex-shrink: 0;
  color: var(--accent-light);
}

.post-select-item.selected .post-select-check {
  background: var(--accent);
  border-color: var(--accent);
}

.post-select-check svg {
  width: 14px;
  height: 14px;
  color: white;
}

.post-select-caption {
  flex: 1;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-select-views {
  font-size: 11px;
  color: var(--accent-light);
  flex-shrink: 0;
}

.post-select-engagement {
  font-size: 12px;
  color: var(--muted);
  flex-shrink: 0;
}

.selector-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selector-hint {
  font-size: 12px;
  color: var(--muted);
}

.compare-error {
  font-size: 13px;
  color: #f87171;
  padding: 8px 12px;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.2);
  border-radius: var(--radius-sm);
}

.btn-compare {
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 500;
  background: linear-gradient(135deg, var(--accent), var(--cyan));
  border: none;
  border-radius: var(--radius-md);
  color: white;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-compare:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-compare:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-clear {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--muted);
  cursor: pointer;
  margin-bottom: 16px;
}

.btn-clear:hover {
  color: var(--text);
  border-color: var(--accent);
}

.comparison-results {
  overflow-x: auto;
}

.comparison-grid {
  min-width: 400px;
}

.comparison-header {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.metric-label-cell {
  width: 100px;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--muted);
  text-transform: capitalize;
  display: flex;
  align-items: center;
}

.comparison-post-header {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: var(--radius-sm);
}

.comparison-caption {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.comparison-row {
  display: flex;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.comparison-metric-cell {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-bar-track {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  overflow: hidden;
}

.metric-bar {
  height: 100%;
  border-radius: 3px;
  background: var(--muted);
  transition: width 0.3s ease;
  min-width: 2px;
}

.metric-bar.winner {
  background: var(--accent);
}

.metric-value {
  font-size: 12px;
  width: 48px;
  text-align: right;
  flex-shrink: 0;
}

.metric-value.winner {
  color: var(--accent-light);
  font-weight: 600;
}

.pro-badge {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  background: linear-gradient(135deg, var(--accent), var(--cyan));
  border-radius: var(--radius-sm);
  color: white;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.card-header h2 {
  font-size: 15px;
  font-weight: 600;
}

.card-body {
  padding: 16px;
}
</style>
