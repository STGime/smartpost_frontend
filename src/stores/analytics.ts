import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { analyticsService } from '@/services'
import type {
  AnalyticsOverview,
  PostAnalyticsSummary,
  PostAnalyticsDetail,
  AnalyticsTrendData,
  AnalyticsMetric,
  AnalyticsPeriod,
  AnalyticsGroupBy,
  AccountNeedingUpgrade,
} from '@/types'

export const useAnalyticsStore = defineStore('analytics', () => {
  // State
  const overview = ref<AnalyticsOverview | null>(null)
  const postsAnalytics = ref<PostAnalyticsSummary[]>([])
  const currentPostAnalytics = ref<PostAnalyticsDetail | null>(null)
  const trends = ref<AnalyticsTrendData[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Scope upgrade state
  const accountsNeedingUpgrade = ref<AccountNeedingUpgrade[]>([])
  const scopeStatusLoaded = ref(false)

  // Filter state
  const selectedPeriod = ref<AnalyticsPeriod>('30d')
  const selectedMetric = ref<AnalyticsMetric>('engagement')
  const selectedGroupBy = ref<AnalyticsGroupBy>('day')
  const selectedPlatforms = ref<string[]>([])
  const dateRange = ref<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  })

  // Computed
  const hasMore = computed(() => postsAnalytics.value.length < total.value)

  const topPosts = computed(() =>
    [...postsAnalytics.value]
      .filter(p => p.totalEngagement > 0) // Only show posts with actual engagement data
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, 5)
  )

  const platformBreakdown = computed(() => {
    if (!overview.value?.byPlatform) return []
    return overview.value.byPlatform
      .filter(p => p.postsCount > 0)
      .sort((a, b) => b.likes - a.likes)
  })

  // Actions
  const fetchOverview = async () => {
    isLoading.value = true
    error.value = null
    try {
      overview.value = await analyticsService.getOverview({
        startDate: dateRange.value.start || undefined,
        endDate: dateRange.value.end || undefined,
        platforms: selectedPlatforms.value.length > 0 ? selectedPlatforms.value : undefined,
      })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to fetch analytics overview'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchPostsAnalytics = async (params?: {
    limit?: number
    offset?: number
    sortBy?: 'engagement' | 'likes' | 'comments' | 'views' | 'date'
    order?: 'asc' | 'desc'
    append?: boolean
  }) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await analyticsService.getPostsAnalytics({
        limit: params?.limit || 20,
        offset: params?.offset || 0,
        sortBy: params?.sortBy || 'date',
        order: params?.order || 'desc',
        platforms: selectedPlatforms.value.length > 0 ? selectedPlatforms.value : undefined,
      })

      if (params?.append && params.offset && params.offset > 0) {
        postsAnalytics.value = [...postsAnalytics.value, ...response.items]
      } else {
        postsAnalytics.value = response.items
      }
      total.value = response.total
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to fetch posts analytics'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchPostAnalytics = async (postId: string) => {
    isLoading.value = true
    error.value = null
    try {
      currentPostAnalytics.value = await analyticsService.getPostAnalytics(postId)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to fetch post analytics'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchTrends = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await analyticsService.getTrends({
        metric: selectedMetric.value,
        period: selectedPeriod.value,
        groupBy: selectedGroupBy.value,
        platforms: selectedPlatforms.value.length > 0 ? selectedPlatforms.value : undefined,
      })
      trends.value = response.data
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to fetch trends'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const refreshPostAnalytics = async (postResultId: string) => {
    isLoading.value = true
    error.value = null
    try {
      currentPostAnalytics.value = await analyticsService.refreshPostAnalytics(postResultId)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to refresh analytics'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const setFilters = (filters: {
    period?: AnalyticsPeriod
    metric?: AnalyticsMetric
    groupBy?: AnalyticsGroupBy
    platforms?: string[]
    dateRange?: { start: string | null; end: string | null }
  }) => {
    if (filters.period !== undefined) selectedPeriod.value = filters.period
    if (filters.metric !== undefined) selectedMetric.value = filters.metric
    if (filters.groupBy !== undefined) selectedGroupBy.value = filters.groupBy
    if (filters.platforms !== undefined) selectedPlatforms.value = filters.platforms
    if (filters.dateRange !== undefined) dateRange.value = filters.dateRange
  }

  const clearFilters = () => {
    selectedPeriod.value = '30d'
    selectedMetric.value = 'engagement'
    selectedGroupBy.value = 'day'
    selectedPlatforms.value = []
    dateRange.value = { start: null, end: null }
  }

  const fetchScopeStatus = async () => {
    try {
      const response = await analyticsService.getScopeStatus()
      accountsNeedingUpgrade.value = response.accounts
      scopeStatusLoaded.value = true
    } catch (err) {
      console.error('Failed to fetch scope status:', err)
      scopeStatusLoaded.value = true
    }
  }

  const initiateUpgrade = async (accountId: string) => {
    try {
      const response = await analyticsService.initiateUpgrade(accountId)
      // Redirect to OAuth authorization URL
      window.location.href = response.authUrl
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to initiate upgrade'
      throw err
    }
  }

  const dismissUpgradeBanner = (accountId: string) => {
    accountsNeedingUpgrade.value = accountsNeedingUpgrade.value.filter(
      a => a.id !== accountId
    )
  }

  // Manual refresh state
  const isRefreshing = ref(false)
  const lastRefreshAt = ref<Date | null>(null)
  const nextRefreshAt = ref<Date | null>(null)
  const refreshMessage = ref<string | null>(null)

  // TODO: Re-enable rate limit after testing
  // const REFRESH_COOLDOWN_MS = 60 * 60 * 1000 // 1 hour
  const REFRESH_COOLDOWN_MS = 0 // Disabled for testing

  // Load last refresh time from localStorage
  const loadRefreshState = () => {
    // Disabled for testing - clear any stored value
    localStorage.removeItem('analytics_last_refresh')
    /*
    const stored = localStorage.getItem('analytics_last_refresh')
    if (stored) {
      lastRefreshAt.value = new Date(stored)
      nextRefreshAt.value = new Date(lastRefreshAt.value.getTime() + REFRESH_COOLDOWN_MS)
    }
    */
  }

  const canRefresh = computed(() => {
    return true // Disabled for testing
    // if (!lastRefreshAt.value) return true
    // return Date.now() >= lastRefreshAt.value.getTime() + REFRESH_COOLDOWN_MS
  })

  const timeUntilNextRefresh = computed(() => {
    if (!lastRefreshAt.value) return null
    const remaining = lastRefreshAt.value.getTime() + REFRESH_COOLDOWN_MS - Date.now()
    if (remaining <= 0) return null
    const minutes = Math.ceil(remaining / 60000)
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  })

  const refreshAllAnalytics = async () => {
    if (!canRefresh.value) {
      refreshMessage.value = `Please wait ${timeUntilNextRefresh.value} before refreshing again`
      return
    }

    isRefreshing.value = true
    refreshMessage.value = null
    error.value = null

    try {
      const result = await analyticsService.refreshAll()
      refreshMessage.value = result.message
      lastRefreshAt.value = new Date()
      nextRefreshAt.value = result.nextRefreshAt ? new Date(result.nextRefreshAt) : null
      localStorage.setItem('analytics_last_refresh', lastRefreshAt.value.toISOString())

      // Re-fetch data to show updated analytics
      await fetchAll()
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { error?: string; message?: string; nextRefreshAt?: string } } }
      if (e.response?.status === 429) {
        refreshMessage.value = e.response.data?.message || 'Rate limited. Try again later.'
        if (e.response.data?.nextRefreshAt) {
          nextRefreshAt.value = new Date(e.response.data.nextRefreshAt)
        }
      } else {
        error.value = e.response?.data?.error || 'Failed to refresh analytics'
      }
    } finally {
      isRefreshing.value = false
    }
  }

  const fetchAll = async () => {
    await Promise.all([
      fetchOverview(),
      fetchPostsAnalytics(),
      fetchTrends(),
      fetchScopeStatus(),
    ])
  }

  // Computed for upgrade banner
  const needsUpgrade = computed(() => accountsNeedingUpgrade.value.length > 0)

  return {
    // State
    overview,
    postsAnalytics,
    currentPostAnalytics,
    trends,
    total,
    isLoading,
    error,
    accountsNeedingUpgrade,
    scopeStatusLoaded,

    // Filters
    selectedPeriod,
    selectedMetric,
    selectedGroupBy,
    selectedPlatforms,
    dateRange,

    // Computed
    hasMore,
    topPosts,
    platformBreakdown,
    needsUpgrade,

    // Manual refresh state
    isRefreshing,
    lastRefreshAt,
    nextRefreshAt,
    refreshMessage,
    canRefresh,
    timeUntilNextRefresh,

    // Actions
    fetchOverview,
    fetchPostsAnalytics,
    fetchPostAnalytics,
    fetchTrends,
    refreshPostAnalytics,
    setFilters,
    clearFilters,
    fetchAll,
    fetchScopeStatus,
    initiateUpgrade,
    dismissUpgradeBanner,
    refreshAllAnalytics,
    loadRefreshState,
  }
})
