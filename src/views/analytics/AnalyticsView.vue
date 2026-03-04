<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue'
import { useAnalyticsStore } from '@/stores'
import type { AnalyticsPeriod, AnalyticsMetric } from '@/types'
import PlatformIcon from '@/components/PlatformIcon.vue'
import {
  TrialUpgradeBanner,
  LockedFeature,
  BestTimesHeatmap,
  ContentTypesChart,
  HashtagsTable,
  BenchmarksCard,
  ExportButtons,
  DateRangePicker,
  PostComparison,
} from '@/components/analytics'

const analyticsStore = useAnalyticsStore()

// All possible options (filtered by tier in template)
const allPeriodOptions: { value: AnalyticsPeriod; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '12m', label: '12 months' },
]

const allMetricOptions: { value: AnalyticsMetric; label: string }[] = [
  { value: 'engagement', label: 'Engagement' },
  { value: 'likes', label: 'Likes' },
  { value: 'comments', label: 'Comments' },
  { value: 'shares', label: 'Shares' },
  { value: 'views', label: 'Views' },
  { value: 'impressions', label: 'Impressions' },
]

// Filtered by available periods/metrics
const periodOptions = computed(() =>
  allPeriodOptions.filter(o => analyticsStore.availablePeriods.includes(o.value))
)

const metricOptions = computed(() =>
  allMetricOptions.filter(o => analyticsStore.availableMetrics.includes(o.value))
)

// Disabled period options (for showing as locked)
const disabledPeriods = computed(() =>
  allPeriodOptions.filter(o => !analyticsStore.availablePeriods.includes(o.value))
)

// Load data on mount
onMounted(async () => {
  try {
    analyticsStore.loadRefreshState()
    await analyticsStore.fetchAll()
  } catch (error) {
    console.error('Failed to load analytics:', error)
  }
})

// Re-fetch when filters change
watch(
  [() => analyticsStore.selectedPeriod, () => analyticsStore.selectedMetric],
  async () => {
    await analyticsStore.fetchTrends()
  }
)

// Format numbers with K/M suffix
const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// Compute max value for chart scaling
const maxTrendValue = computed(() => {
  if (!analyticsStore.trends.length) return 100
  return Math.max(...analyticsStore.trends.map(d => d.value), 1)
})

// Calculate bar height percentage
const getBarHeight = (value: number): string => {
  const percentage = (value / maxTrendValue.value) * 100
  return `${Math.max(percentage, 2)}%`
}

// Format date for chart labels
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  if (analyticsStore.selectedPeriod === '12m') {
    return date.toLocaleDateString('en-US', { month: 'short' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Calculate engagement rate
const engagementRate = computed(() => {
  const overview = analyticsStore.overview
  if (!overview || !overview.totalImpressions) return '0'
  const engagement = overview.totalLikes + overview.totalComments + overview.totalShares
  return ((engagement / overview.totalImpressions) * 100).toFixed(2)
})

// Calculate per-platform engagement rates for benchmarks comparison
const platformEngagementRates = computed(() => {
  const overview = analyticsStore.overview
  if (!overview?.byPlatform) return {}
  const rates: Record<string, number> = {}
  for (const p of overview.byPlatform) {
    rates[p.platform] = p.engagementRate
  }
  return rates
})

// Handle custom date range
const handleCustomDateRange = (range: { startDate: string; endDate: string }) => {
  analyticsStore.setFilters({
    period: 'custom',
    dateRange: { start: range.startDate, end: range.endDate },
  })
  analyticsStore.fetchTrends()
  analyticsStore.fetchOverview()
}

// Whether we're showing custom period
const isCustomPeriod = computed(() => analyticsStore.selectedPeriod === 'custom')

// Track posts with broken thumbnail images
const brokenThumbnails = reactive(new Set<string>())
const onThumbError = (postId: string) => {
  brokenThumbnails.add(postId)
}
</script>

<template>
  <div class="analytics-page">
    <!-- Trial upgrade banner -->
    <TrialUpgradeBanner v-if="analyticsStore.isTrial" />

    <div class="page-header">
      <div class="page-header-content">
        <div>
          <h1>Analytics</h1>
          <p>Track your post performance across all platforms</p>
        </div>
        <div class="header-actions">
          <!-- Export buttons (pro only) -->
          <RouterLink
            v-if="!analyticsStore.features.export"
            to="/app/billing"
            class="btn-locked-export"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="lock-icon-sm">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Export
          </RouterLink>
          <ExportButtons v-else />

          <!-- Refresh button (starter+) -->
          <button
            v-if="analyticsStore.features.manualRefresh"
            class="btn-refresh"
            :disabled="!analyticsStore.canRefresh || analyticsStore.isRefreshing"
            :title="analyticsStore.canRefresh ? 'Refresh analytics from social platforms' : `Next refresh available in ${analyticsStore.timeUntilNextRefresh}`"
            @click="analyticsStore.refreshAllAnalytics()"
          >
            <svg
              :class="{ spinning: analyticsStore.isRefreshing }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span v-if="analyticsStore.isRefreshing">Refreshing...</span>
            <span v-else-if="!analyticsStore.canRefresh">{{ analyticsStore.timeUntilNextRefresh }}</span>
            <span v-else>Refresh</span>
          </button>
        </div>
      </div>
      <div v-if="analyticsStore.refreshMessage" class="refresh-message">
        {{ analyticsStore.refreshMessage }}
      </div>
    </div>

    <!-- Scope upgrade banner -->
    <div v-if="analyticsStore.needsUpgrade" class="upgrade-banner">
      <div class="upgrade-content">
        <div class="upgrade-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="upgrade-text">
          <h3>Enable Analytics Access</h3>
          <p>
            Some accounts need additional permissions to collect analytics data.
            Re-authorize to enable insights for:
          </p>
          <div class="upgrade-accounts">
            <div
              v-for="account in analyticsStore.accountsNeedingUpgrade"
              :key="account.id"
              class="upgrade-account"
            >
              <PlatformIcon :platform="account.platform" size="xs" />
              <span>{{ account.displayName || account.username || account.platform }}</span>
              <button
                class="btn-upgrade"
                @click="analyticsStore.initiateUpgrade(account.id)"
              >
                Upgrade
              </button>
              <button
                class="btn-dismiss"
                @click="analyticsStore.dismissUpgradeBanner(account.id)"
                title="Dismiss"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="analyticsStore.isLoading && !analyticsStore.overview" class="loading-state">
      <div class="spinner"></div>
      <p>Loading analytics...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!analyticsStore.overview?.totalPosts" class="empty-state">
      <div class="empty-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h2>No analytics yet</h2>
      <p>Analytics will appear here once you've published some posts and we've collected engagement data.</p>
      <RouterLink to="/app/posts/new" class="btn-primary">Create your first post</RouterLink>
    </div>

    <!-- Analytics content -->
    <template v-else>
      <!-- Overview stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon stat-icon-posts">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Total Posts</p>
            <p class="stat-value">{{ formatNumber(analyticsStore.overview?.totalPosts || 0) }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon-likes">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Total Likes</p>
            <p class="stat-value">{{ formatNumber(analyticsStore.overview?.totalLikes || 0) }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon-comments">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Total Comments</p>
            <p class="stat-value">{{ formatNumber(analyticsStore.overview?.totalComments || 0) }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon-shares">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Total Shares</p>
            <p class="stat-value">{{ formatNumber(analyticsStore.overview?.totalShares || 0) }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon-views">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Total Views</p>
            <p class="stat-value">{{ formatNumber(analyticsStore.overview?.totalViews || 0) }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon-engagement">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Engagement Rate</p>
            <p class="stat-value">{{ engagementRate }}%</p>
          </div>
        </div>
      </div>

      <!-- Trends chart -->
      <div class="card">
        <div class="card-header">
          <h2>Engagement Trends</h2>
          <div class="chart-controls">
            <select v-model="analyticsStore.selectedMetric" class="select-control">
              <option v-for="option in metricOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <div class="period-tabs">
              <button
                v-for="option in periodOptions"
                :key="option.value"
                :class="['period-tab', { active: analyticsStore.selectedPeriod === option.value }]"
                @click="analyticsStore.selectedPeriod = option.value"
              >
                {{ option.label }}
              </button>
              <!-- Show disabled periods with tooltip -->
              <button
                v-for="option in disabledPeriods"
                :key="'d-' + option.value"
                class="period-tab disabled"
                :title="`Upgrade to unlock ${option.label}`"
                disabled
              >
                {{ option.label }}
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="lock-mini">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </button>
              <!-- Custom date range tab (pro only) -->
              <button
                v-if="analyticsStore.features.customDateRange"
                :class="['period-tab', { active: isCustomPeriod }]"
                @click="analyticsStore.selectedPeriod = 'custom'"
              >
                Custom
              </button>
            </div>
          </div>
        </div>

        <!-- Custom date range picker -->
        <div v-if="isCustomPeriod && analyticsStore.features.customDateRange" class="custom-date-row">
          <DateRangePicker
            :start-date="analyticsStore.dateRange.start"
            :end-date="analyticsStore.dateRange.end"
            @change="handleCustomDateRange"
          />
        </div>

        <div class="card-body">
          <div v-if="analyticsStore.trends.length" class="chart-container">
            <div class="chart-bars">
              <div
                v-for="(dataPoint, index) in analyticsStore.trends"
                :key="index"
                class="chart-bar-wrapper"
              >
                <div
                  class="chart-bar"
                  :style="{ height: getBarHeight(dataPoint.value) }"
                  :title="`${formatDate(dataPoint.date)}: ${formatNumber(dataPoint.value)}`"
                ></div>
                <span class="chart-label">{{ formatDate(dataPoint.date) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="no-data">
            <p>No trend data available for the selected period</p>
          </div>
        </div>
      </div>

      <!-- Two column layout: Platform breakdown + Best Times -->
      <div class="two-col-grid">
        <!-- Platform breakdown -->
        <div class="card">
          <div class="card-header">
            <h2>Platform Performance</h2>
          </div>
          <div class="card-body">
            <div v-if="analyticsStore.platformBreakdown.length" class="platform-list">
              <div
                v-for="platform in analyticsStore.platformBreakdown"
                :key="platform.platform"
                class="platform-item"
              >
                <div class="platform-info">
                  <PlatformIcon :platform="platform.platform" size="sm" />
                  <div class="platform-details">
                    <span class="platform-name">{{ platform.platform }}</span>
                    <span class="platform-posts">{{ platform.postsCount }} posts</span>
                  </div>
                </div>
                <div class="platform-stats">
                  <div class="platform-stat">
                    <span class="platform-stat-value">{{ formatNumber(platform.likes) }}</span>
                    <span class="platform-stat-label">Likes</span>
                  </div>
                  <div class="platform-stat">
                    <span class="platform-stat-value">{{ formatNumber(platform.comments) }}</span>
                    <span class="platform-stat-label">Comments</span>
                  </div>
                  <div class="platform-stat">
                    <span class="platform-stat-value">{{ platform.engagementRate.toFixed(1) }}%</span>
                    <span class="platform-stat-label">Engagement</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="no-data">
              <p>No platform data available</p>
            </div>

            <!-- LinkedIn coming soon note -->
            <div class="coming-soon-note">
              <PlatformIcon platform="linkedin" size="xs" />
              <span>LinkedIn analytics coming soon</span>
            </div>
          </div>
        </div>

        <!-- Best Times Heatmap (starter+) -->
        <LockedFeature
          v-if="!analyticsStore.features.bestTimes"
          required-tier="starter"
          feature-name="Best Time to Post"
        >
          <BestTimesHeatmap :heatmap="[]" />
        </LockedFeature>
        <BestTimesHeatmap
          v-else
          :heatmap="analyticsStore.bestTimes?.heatmap ?? []"
        />
      </div>

      <!-- Two column layout: Content Types + Benchmarks -->
      <div class="two-col-grid">
        <!-- Content Types Chart (starter+) -->
        <LockedFeature
          v-if="!analyticsStore.features.contentTypes"
          required-tier="starter"
          feature-name="Content Type Breakdown"
        >
          <ContentTypesChart :types="[]" />
        </LockedFeature>
        <ContentTypesChart
          v-else
          :types="analyticsStore.contentTypes?.types ?? []"
        />

        <!-- Benchmarks Card (pro) -->
        <LockedFeature
          v-if="!analyticsStore.features.benchmarks"
          required-tier="professional"
          feature-name="Engagement Benchmarks"
        >
          <BenchmarksCard
            :benchmarks="[]"
            :user-engagement-rate="0"
          />
        </LockedFeature>
        <BenchmarksCard
          v-else
          :benchmarks="analyticsStore.benchmarks?.benchmarks ?? []"
          :user-engagement-rate="parseFloat(engagementRate)"
          :platform-engagement-rates="platformEngagementRates"
        />
      </div>

      <!-- Hashtag Performance (pro) -->
      <LockedFeature
        v-if="!analyticsStore.features.hashtags"
        required-tier="professional"
        feature-name="Hashtag Performance"
      >
        <HashtagsTable :hashtags="[]" />
      </LockedFeature>
      <HashtagsTable
        v-else
        :hashtags="analyticsStore.hashtags?.hashtags ?? []"
      />

      <!-- Top posts -->
      <div class="card">
        <div class="card-header">
          <h2>Top Performing Posts</h2>
        </div>
        <div class="card-body">
          <div v-if="analyticsStore.topPosts.length" class="top-posts-list">
            <!-- Trial: no click-through -->
            <template v-if="analyticsStore.isTrial">
              <div
                v-for="(post, index) in analyticsStore.topPosts"
                :key="post.postId"
                class="top-post-item top-post-no-link"
              >
                <span class="top-post-rank">{{ index + 1 }}</span>
                <div class="top-post-thumb" :class="{ 'top-post-thumb-empty': !post.thumbnailUrl || brokenThumbnails.has(post.postId) }">
                  <img
                    v-if="post.thumbnailUrl && !brokenThumbnails.has(post.postId)"
                    :src="post.thumbnailUrl"
                    alt=""
                    @error="onThumbError(post.postId)"
                  />
                  <PlatformIcon v-else :platform="post.platform" size="sm" />
                </div>
                <div class="top-post-content">
                  <p class="top-post-caption">{{ post.caption || 'No caption' }}</p>
                  <div class="top-post-meta">
                    <PlatformIcon :platform="post.platform" size="xs" />
                    <span>{{ formatNumber(post.totalEngagement) }} engagement</span>
                    <span v-if="post.deletedOnPlatform" class="deleted-badge">Deleted</span>
                  </div>
                </div>
                <span class="top-post-upgrade-hint">Starter</span>
              </div>
            </template>

            <!-- Starter+: clickable posts -->
            <template v-else>
              <RouterLink
                v-for="(post, index) in analyticsStore.topPosts"
                :key="post.postId"
                :to="`/app/posts/${post.postId}`"
                class="top-post-item"
              >
                <span class="top-post-rank">{{ index + 1 }}</span>
                <div class="top-post-thumb" :class="{ 'top-post-thumb-empty': !post.thumbnailUrl || brokenThumbnails.has(post.postId) }">
                  <img
                    v-if="post.thumbnailUrl && !brokenThumbnails.has(post.postId)"
                    :src="post.thumbnailUrl"
                    alt=""
                    @error="onThumbError(post.postId)"
                  />
                  <PlatformIcon v-else :platform="post.platform" size="sm" />
                </div>
                <div class="top-post-content">
                  <p class="top-post-caption">{{ post.caption || 'No caption' }}</p>
                  <div class="top-post-meta">
                    <PlatformIcon :platform="post.platform" size="xs" />
                    <span>{{ formatNumber(post.totalEngagement) }} engagement</span>
                    <span v-if="post.deletedOnPlatform" class="deleted-badge">Deleted</span>
                  </div>
                </div>
              </RouterLink>
            </template>
          </div>
          <div v-else class="no-data">
            <p>No posts available</p>
          </div>
        </div>
      </div>

      <!-- Post Comparison (pro) -->
      <LockedFeature
        v-if="!analyticsStore.features.postComparison"
        required-tier="professional"
        feature-name="Post Comparison"
      >
        <PostComparison />
      </LockedFeature>
      <PostComparison v-else />
    </template>
  </div>
</template>

<style scoped>
.analytics-page {
  max-width: 1100px;
}

.page-header {
  margin-bottom: 28px;
}

.page-header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
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

.header-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-locked-export {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--muted);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-locked-export:hover {
  background: rgba(15, 23, 42, 0.8);
  border-color: var(--accent);
  color: var(--text);
}

.lock-icon-sm {
  width: 14px;
  height: 14px;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text);
  cursor: pointer;
  transition: all 0.15s;
}

.btn-refresh:hover:not(:disabled) {
  background: rgba(15, 23, 42, 0.8);
  border-color: var(--accent);
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-refresh svg {
  width: 16px;
  height: 16px;
}

.btn-refresh svg.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.refresh-message {
  margin-top: 12px;
  padding: 8px 12px;
  font-size: 13px;
  background: var(--accent-soft);
  border-radius: var(--radius-sm);
  color: var(--accent-light);
}

/* Loading/Empty states */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  color: var(--muted);
}

.loading-state p {
  margin-top: 16px;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 64px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: var(--accent-soft);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-light);
}

.empty-icon svg {
  width: 32px;
  height: 32px;
}

.empty-state h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 24px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 18px;
  height: 18px;
}

.stat-icon-posts {
  background: var(--accent-soft);
  color: #a5b4fc;
}

.stat-icon-likes {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}

.stat-icon-comments {
  background: rgba(6, 182, 212, 0.15);
  color: #67e8f9;
}

.stat-icon-shares {
  background: rgba(168, 85, 247, 0.15);
  color: #c4b5fd;
}

.stat-icon-views {
  background: rgba(34, 197, 94, 0.15);
  color: #86efac;
}

.stat-icon-engagement {
  background: rgba(245, 158, 11, 0.15);
  color: #fcd34d;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 11px;
  color: var(--muted);
  margin-bottom: 2px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
}

/* Card */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}

.card-header h2 {
  font-size: 15px;
  font-weight: 600;
}

.card-body {
  padding: 16px;
}

/* Chart controls */
.chart-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.select-control {
  padding: 6px 10px;
  font-size: 13px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
}

.period-tabs {
  display: flex;
  background: rgba(15, 23, 42, 0.5);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  overflow: hidden;
}

.period-tab {
  padding: 6px 12px;
  font-size: 12px;
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.period-tab:hover:not(:disabled) {
  color: var(--text);
}

.period-tab.active {
  background: var(--accent-soft);
  color: var(--text);
}

.period-tab.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.lock-mini {
  width: 10px;
  height: 10px;
}

.custom-date-row {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

/* Chart */
.chart-container {
  height: 200px;
  padding: 16px 0;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 100%;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  min-width: 20px;
}

.chart-bar {
  width: 100%;
  max-width: 40px;
  background: linear-gradient(180deg, var(--accent), var(--cyan));
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  transition: height 0.3s ease;
}

.chart-label {
  font-size: 10px;
  color: var(--muted);
  margin-top: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.no-data {
  text-align: center;
  padding: 32px;
  color: var(--muted);
  font-size: 14px;
}

/* Two column grid */
.two-col-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

@media (max-width: 800px) {
  .two-col-grid {
    grid-template-columns: 1fr;
  }
}

.two-col-grid > .card {
  margin-bottom: 0;
}

/* Platform list */
.platform-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.platform-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: var(--radius-md);
}

.platform-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.platform-details {
  display: flex;
  flex-direction: column;
}

.platform-name {
  font-size: 13px;
  font-weight: 500;
  text-transform: capitalize;
}

.platform-posts {
  font-size: 11px;
  color: var(--muted);
}

.platform-stats {
  display: flex;
  gap: 16px;
}

.platform-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.platform-stat-value {
  font-size: 14px;
  font-weight: 600;
}

.platform-stat-label {
  font-size: 10px;
  color: var(--muted);
}

/* Coming soon note */
.coming-soon-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 10px 12px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  font-size: 12px;
  color: var(--muted);
}

/* Top posts list */
.top-posts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.top-post-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: var(--radius-md);
  transition: all 0.15s;
}

.top-post-item:not(.top-post-no-link):hover {
  background: rgba(15, 23, 42, 0.8);
}

.top-post-no-link {
  cursor: default;
}

.top-post-rank {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  background: var(--accent-soft);
  border-radius: var(--radius-full);
  color: var(--accent-light);
}

.top-post-thumb {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: rgba(15, 23, 42, 0.9);
  flex-shrink: 0;
}

.top-post-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.top-post-thumb-empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.top-post-content {
  flex: 1;
  min-width: 0;
}

.top-post-caption {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.top-post-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--muted);
}

.top-post-upgrade-hint {
  font-size: 10px;
  padding: 2px 8px;
  background: var(--accent-soft);
  border-radius: var(--radius-sm);
  color: var(--accent-light);
  flex-shrink: 0;
}

.deleted-badge {
  font-size: 10px;
  padding: 1px 6px;
  background: rgba(239, 68, 68, 0.15);
  border-radius: var(--radius-sm);
  color: #fca5a5;
  flex-shrink: 0;
}

/* Upgrade banner */
.upgrade-banner {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(234, 88, 12, 0.1));
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 24px;
}

.upgrade-content {
  display: flex;
  gap: 14px;
}

.upgrade-icon {
  width: 40px;
  height: 40px;
  background: rgba(245, 158, 11, 0.2);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fcd34d;
  flex-shrink: 0;
}

.upgrade-icon svg {
  width: 22px;
  height: 22px;
}

.upgrade-text {
  flex: 1;
}

.upgrade-text h3 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #fcd34d;
}

.upgrade-text > p {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 12px;
}

.upgrade-accounts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upgrade-account {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: var(--radius-sm);
}

.upgrade-account span {
  flex: 1;
  font-size: 13px;
  text-transform: capitalize;
}

.btn-upgrade {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
  background: linear-gradient(135deg, var(--accent), var(--cyan));
  border: none;
  border-radius: var(--radius-sm);
  color: white;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-upgrade:hover {
  opacity: 0.9;
}

.btn-dismiss {
  width: 24px;
  height: 24px;
  padding: 0;
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;
}

.btn-dismiss:hover {
  color: var(--text);
}

.btn-dismiss svg {
  width: 16px;
  height: 16px;
}
</style>
