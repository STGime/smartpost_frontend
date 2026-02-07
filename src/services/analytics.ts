import api from './api'
import type {
  AnalyticsOverview,
  PostAnalyticsDetail,
  TrendsResponse,
  PostAnalyticsListResponse,
  AnalyticsMetric,
  AnalyticsPeriod,
  AnalyticsGroupBy,
  ScopeStatusResponse,
  AnalyticsCapabilities,
  BestTimesResponse,
  ContentTypesResponse,
  HashtagsResponse,
  BenchmarksResponse,
  PostComparisonResponse,
} from '@/types'

interface OverviewParams {
  startDate?: string
  endDate?: string
  platforms?: string[]
}

interface PostsAnalyticsParams {
  limit?: number
  offset?: number
  sortBy?: 'engagement' | 'likes' | 'comments' | 'views' | 'date'
  order?: 'asc' | 'desc'
  platforms?: string[]
}

interface TrendsParams {
  metric: AnalyticsMetric
  period: AnalyticsPeriod
  groupBy?: AnalyticsGroupBy
  platforms?: string[]
  startDate?: string
  endDate?: string
}

interface PlatformFilterParams {
  platforms?: string[]
}

interface HashtagsParams {
  sortBy?: 'engagement' | 'usage' | 'views'
  limit?: number
  platforms?: string[]
}

interface ExportParams {
  startDate?: string
  endDate?: string
  platforms?: string[]
}

export const analyticsService = {
  async getCapabilities(): Promise<AnalyticsCapabilities> {
    const response = await api.get<AnalyticsCapabilities>('/analytics/capabilities')
    return response.data
  },

  async getOverview(params?: OverviewParams): Promise<AnalyticsOverview> {
    const queryParams: Record<string, string> = {}

    if (params?.startDate) queryParams.startDate = params.startDate
    if (params?.endDate) queryParams.endDate = params.endDate
    if (params?.platforms?.length) queryParams.platforms = params.platforms.join(',')

    const response = await api.get<AnalyticsOverview>('/analytics/overview', { params: queryParams })
    return response.data
  },

  async getPostsAnalytics(params?: PostsAnalyticsParams): Promise<PostAnalyticsListResponse> {
    const queryParams: Record<string, string | number> = {}

    if (params?.limit) queryParams.limit = params.limit
    if (params?.offset !== undefined) queryParams.offset = params.offset
    if (params?.sortBy) queryParams.sortBy = params.sortBy
    if (params?.order) queryParams.order = params.order
    if (params?.platforms?.length) queryParams.platforms = params.platforms.join(',')

    const response = await api.get<PostAnalyticsListResponse>('/analytics/posts', { params: queryParams })
    return response.data
  },

  async getPostAnalytics(postId: string): Promise<PostAnalyticsDetail> {
    const response = await api.get<PostAnalyticsDetail>(`/analytics/posts/${postId}`)
    return response.data
  },

  async getTrends(params: TrendsParams): Promise<TrendsResponse> {
    const queryParams: Record<string, string> = {
      metric: params.metric,
      period: params.period,
    }

    if (params.groupBy) queryParams.groupBy = params.groupBy
    if (params.platforms?.length) queryParams.platforms = params.platforms.join(',')
    if (params.startDate) queryParams.startDate = params.startDate
    if (params.endDate) queryParams.endDate = params.endDate

    const response = await api.get<TrendsResponse>('/analytics/trends', { params: queryParams })
    return response.data
  },

  async refreshPostAnalytics(postResultId: string): Promise<PostAnalyticsDetail> {
    const response = await api.post<PostAnalyticsDetail>(`/analytics/refresh/${postResultId}`)
    return response.data
  },

  async getScopeStatus(): Promise<ScopeStatusResponse> {
    const response = await api.get<ScopeStatusResponse>('/analytics/scope-status')
    return response.data
  },

  async initiateUpgrade(accountId: string, redirectUrl?: string): Promise<{ authUrl: string }> {
    const response = await api.post<{ authUrl: string }>(`/analytics/upgrade/${accountId}`, { redirectUrl })
    return response.data
  },

  async refreshAll(): Promise<{
    success: boolean
    message: string
    refreshedCount: number
    failedCount: number
    nextRefreshAt?: string
  }> {
    const response = await api.post<{
      success: boolean
      message: string
      refreshedCount: number
      failedCount: number
      nextRefreshAt?: string
    }>('/analytics/refresh-all')
    return response.data
  },

  async getBestTimes(params?: PlatformFilterParams): Promise<BestTimesResponse> {
    const queryParams: Record<string, string> = {}
    if (params?.platforms?.length) queryParams.platforms = params.platforms.join(',')

    const response = await api.get<BestTimesResponse>('/analytics/best-times', { params: queryParams })
    return response.data
  },

  async getContentTypes(params?: PlatformFilterParams): Promise<ContentTypesResponse> {
    const queryParams: Record<string, string> = {}
    if (params?.platforms?.length) queryParams.platforms = params.platforms.join(',')

    const response = await api.get<ContentTypesResponse>('/analytics/content-types', { params: queryParams })
    return response.data
  },

  async getHashtags(params?: HashtagsParams): Promise<HashtagsResponse> {
    const queryParams: Record<string, string | number> = {}
    if (params?.sortBy) queryParams.sortBy = params.sortBy
    if (params?.limit) queryParams.limit = params.limit
    if (params?.platforms?.length) queryParams.platforms = params.platforms.join(',')

    const response = await api.get<HashtagsResponse>('/analytics/hashtags', { params: queryParams })
    return response.data
  },

  async comparePosts(postIds: string[]): Promise<PostComparisonResponse> {
    const response = await api.get<PostComparisonResponse>('/analytics/compare', {
      params: { postIds: postIds.join(',') },
    })
    return response.data
  },

  async getBenchmarks(params?: PlatformFilterParams): Promise<BenchmarksResponse> {
    const queryParams: Record<string, string> = {}
    if (params?.platforms?.length) queryParams.platforms = params.platforms.join(',')

    const response = await api.get<BenchmarksResponse>('/analytics/benchmarks', { params: queryParams })
    return response.data
  },

  async exportCsv(params?: ExportParams): Promise<Blob> {
    const queryParams: Record<string, string> = {}
    if (params?.startDate) queryParams.startDate = params.startDate
    if (params?.endDate) queryParams.endDate = params.endDate
    if (params?.platforms?.length) queryParams.platforms = params.platforms.join(',')

    const response = await api.get('/analytics/export/csv', {
      params: queryParams,
      responseType: 'blob',
    })
    return response.data
  },

  async exportPdf(params?: ExportParams): Promise<Blob> {
    const queryParams: Record<string, string> = {}
    if (params?.startDate) queryParams.startDate = params.startDate
    if (params?.endDate) queryParams.endDate = params.endDate
    if (params?.platforms?.length) queryParams.platforms = params.platforms.join(',')

    const response = await api.get('/analytics/export/pdf', {
      params: queryParams,
      responseType: 'blob',
    })
    return response.data
  },
}
