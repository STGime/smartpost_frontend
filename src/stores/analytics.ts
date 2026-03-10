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
  AnalyticsCapabilities,
  BestTimeSlot,
  ContentTypeStats,
  HashtagStats,
  BenchmarkData,
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

  // Health state
  const healthData = ref<{
    lastDataDate: string | null
    isStale: boolean
    staleDays: number | null
    accounts: Array<{
      id: string
      platform: string
      username: string
      isActive: boolean
      connectionError: string | null
      tokenRefreshFailures: number
      lastFetchStatus: string | null
      lastFetchError: string | null
      lastFetchAt: string | null
    }>
  } | null>(null)

  // Tiered analytics state
  const capabilities = ref<AnalyticsCapabilities | null>(null)
  const bestTimes = ref<{ heatmap: BestTimeSlot[] } | null>(null)
  const contentTypes = ref<{ types: ContentTypeStats[] } | null>(null)
  const hashtags = ref<{ hashtags: HashtagStats[] } | null>(null)
  const benchmarks = ref<{ benchmarks: BenchmarkData[] } | null>(null)
  const comparisonPosts = ref<PostAnalyticsDetail[]>([])

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

  // Tier-aware computed properties
  const isTrial = computed(() => capabilities.value?.tier === 'trial')
  const isStarter = computed(() => capabilities.value?.tier === 'starter')
  const isProfessional = computed(() => capabilities.value?.tier === 'professional')

  const features = computed(() => capabilities.value?.features ?? {
    postDetail: false,
    manualRefresh: false,
    bestTimes: false,
    contentTypes: false,
    hashtags: false,
    customDateRange: false,
    export: false,
    postComparison: false,
    benchmarks: false,
  })

  const availablePeriods = computed<AnalyticsPeriod[]>(() => {
    if (!capabilities.value) return ['7d']
    switch (capabilities.value.maxPeriod) {
      case '7d': return ['7d']
      case '90d': return ['7d', '30d', '90d']
      case 'unlimited': return ['7d', '30d', '90d', '12m']
      default: return ['7d']
    }
  })

  const availableMetrics = computed<AnalyticsMetric[]>(() => {
    return ['likes', 'comments', 'shares', 'views', 'impressions', 'engagement']
  })

  // Actions
  const fetchCapabilities = async () => {
    try {
      const caps = await analyticsService.getCapabilities()

      // Trial is a 14-day free trial of Starter — treat it as starter tier
      if (caps.tier === 'trial') {
        caps.tier = 'starter'
      }

      capabilities.value = caps

      // Adjust current filters if they exceed the user's tier
      if (!availablePeriods.value.includes(selectedPeriod.value)) {
        selectedPeriod.value = availablePeriods.value[availablePeriods.value.length - 1] || '7d'
      }
      if (!availableMetrics.value.includes(selectedMetric.value)) {
        selectedMetric.value = 'engagement'
      }
    } catch (err: unknown) {
      console.error('Failed to fetch capabilities:', err)
      // Default to starter if capabilities fetch fails
      capabilities.value = {
        tier: 'starter',
        maxPeriod: '90d',
        features: {
          postDetail: true,
          manualRefresh: true,
          bestTimes: true,
          contentTypes: true,
          hashtags: true,
          customDateRange: true,
          export: false,
          postComparison: false,
          benchmarks: false,
        },
      }
    }
  }

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
        startDate: dateRange.value.start || undefined,
        endDate: dateRange.value.end || undefined,
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
    selectedPeriod.value = availablePeriods.value[availablePeriods.value.length - 1] || '30d'
    selectedMetric.value = 'engagement'
    selectedGroupBy.value = 'day'
    selectedPlatforms.value = []
    dateRange.value = { start: null, end: null }
  }

  const fetchHealth = async () => {
    try {
      healthData.value = await analyticsService.getHealth()
    } catch (err) {
      console.error('Failed to fetch health:', err)
    }
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
  }

  const canRefresh = computed(() => {
    return true // Disabled for testing
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

      // Build descriptive message with failure details
      if (result.failedCount > 0 && result.failureDetails) {
        const details: string[] = []
        const needsReconnect = (result.failureDetails['no_token']?.count || 0) +
          (result.failureDetails['inactive_account']?.count || 0)
        const rateLimited = result.failureDetails['rate_limited']?.count || 0
        const missingScopes = result.failureDetails['missing_scopes']?.count || 0

        if (needsReconnect > 0) details.push(`${needsReconnect} need reconnection`)
        if (rateLimited > 0) details.push(`${rateLimited} rate limited`)
        if (missingScopes > 0) details.push(`${missingScopes} missing permissions`)

        const total = result.refreshedCount + result.failedCount
        refreshMessage.value = `Refreshed ${result.refreshedCount} of ${total} posts.` +
          (details.length > 0 ? ` ${details.join(', ')}.` : '')
      } else {
        refreshMessage.value = result.message
      }

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

  // Tiered analytics actions
  const fetchBestTimes = async () => {
    try {
      bestTimes.value = await analyticsService.getBestTimes({
        platforms: selectedPlatforms.value.length > 0 ? selectedPlatforms.value : undefined,
      })
    } catch (err) {
      console.error('Failed to fetch best times:', err)
    }
  }

  const fetchContentTypes = async () => {
    try {
      contentTypes.value = await analyticsService.getContentTypes({
        platforms: selectedPlatforms.value.length > 0 ? selectedPlatforms.value : undefined,
      })
    } catch (err) {
      console.error('Failed to fetch content types:', err)
    }
  }

  const fetchHashtags = async (params?: { sortBy?: 'engagement' | 'usage' | 'views'; limit?: number }) => {
    try {
      hashtags.value = await analyticsService.getHashtags({
        sortBy: params?.sortBy,
        limit: params?.limit,
        platforms: selectedPlatforms.value.length > 0 ? selectedPlatforms.value : undefined,
      })
    } catch (err) {
      console.error('Failed to fetch hashtags:', err)
    }
  }

  const fetchBenchmarks = async () => {
    try {
      benchmarks.value = await analyticsService.getBenchmarks({
        platforms: selectedPlatforms.value.length > 0 ? selectedPlatforms.value : undefined,
      })
    } catch (err) {
      console.error('Failed to fetch benchmarks:', err)
    }
  }

  const fetchComparison = async (postIds: string[]) => {
    try {
      const result = await analyticsService.comparePosts(postIds)
      comparisonPosts.value = result.posts
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to compare posts'
      throw err
    }
  }

  const downloadCsv = async () => {
    try {
      const blob = await analyticsService.exportCsv({
        startDate: dateRange.value.start || undefined,
        endDate: dateRange.value.end || undefined,
        platforms: selectedPlatforms.value.length > 0 ? selectedPlatforms.value : undefined,
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `smartpost-analytics-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to export CSV'
      throw err
    }
  }

  const downloadPdf = async () => {
    try {
      const blob = await analyticsService.exportPdf({
        startDate: dateRange.value.start || undefined,
        endDate: dateRange.value.end || undefined,
        platforms: selectedPlatforms.value.length > 0 ? selectedPlatforms.value : undefined,
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `smartpost-analytics-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to export PDF'
      throw err
    }
  }

  const fetchAll = async () => {
    await fetchCapabilities() // must be first
    const promises: Promise<void>[] = [
      fetchOverview(),
      fetchPostsAnalytics(),
      fetchTrends(),
      fetchScopeStatus(),
      fetchHealth(),
    ]
    if (features.value.bestTimes) promises.push(fetchBestTimes())
    if (features.value.contentTypes) promises.push(fetchContentTypes())
    if (features.value.hashtags) promises.push(fetchHashtags())
    if (features.value.benchmarks) promises.push(fetchBenchmarks())
    await Promise.allSettled(promises)
  }

  // Computed for upgrade banner
  const needsUpgrade = computed(() => accountsNeedingUpgrade.value.length > 0)

  // Stale data computed
  const isStale = computed(() => healthData.value?.isStale ?? false)
  const staleDays = computed(() => healthData.value?.staleDays ?? null)
  const problemAccounts = computed(() =>
    (healthData.value?.accounts ?? []).filter(
      a => !a.isActive || a.connectionError || a.lastFetchStatus === 'failed' || a.lastFetchStatus === 'rate_limited'
    )
  )

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

    // Tiered state
    capabilities,
    bestTimes,
    contentTypes,
    hashtags,
    benchmarks,
    comparisonPosts,

    // Filters
    selectedPeriod,
    selectedMetric,
    selectedGroupBy,
    selectedPlatforms,
    dateRange,

    // Health state
    healthData,
    isStale,
    staleDays,
    problemAccounts,

    // Computed
    hasMore,
    topPosts,
    platformBreakdown,
    needsUpgrade,

    // Tier-aware computed
    isTrial,
    isStarter,
    isProfessional,
    features,
    availablePeriods,
    availableMetrics,

    // Manual refresh state
    isRefreshing,
    lastRefreshAt,
    nextRefreshAt,
    refreshMessage,
    canRefresh,
    timeUntilNextRefresh,

    // Actions
    fetchCapabilities,
    fetchOverview,
    fetchPostsAnalytics,
    fetchPostAnalytics,
    fetchTrends,
    refreshPostAnalytics,
    setFilters,
    clearFilters,
    fetchAll,
    fetchScopeStatus,
    fetchHealth,
    initiateUpgrade,
    dismissUpgradeBanner,
    refreshAllAnalytics,
    loadRefreshState,

    // Tiered actions
    fetchBestTimes,
    fetchContentTypes,
    fetchHashtags,
    fetchBenchmarks,
    fetchComparison,
    downloadCsv,
    downloadPdf,
  }
})
