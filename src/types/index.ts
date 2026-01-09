// User types
export interface User {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
  created_at: string
}

export interface UserProfile extends User {
  role: 'user' | 'admin'
  onboarding_completed: boolean
  updated_at: string
}

// Auth types
export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest extends LoginRequest {
  display_name?: string
}

export interface AuthResponse extends AuthTokens {
  user: User
}

// Plan types
export type PlanName = 'free' | 'starter' | 'professional' | 'business'
export type PlanStatus = 'active' | 'cancelled' | 'expired' | 'trial'

export interface PlanLimits {
  posts_per_month: number
  media_storage_mb: number
  connected_accounts: number
  scheduled_posts: number
}

export interface PlanUsage {
  posts_this_month: number
  storage_used_mb: number
  connected_accounts: number
  scheduled_posts: number
}

export interface Plan {
  plan: {
    name: PlanName
    status: PlanStatus
    started_at: string
    expires_at?: string
  }
  limits: PlanLimits
  usage: PlanUsage
}

// Media types
export type MediaType = 'image' | 'video' | 'document'
export type MediaStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type MimeType = 'image/jpeg' | 'image/png' | 'image/webp' | 'video/mp4' | 'video/quicktime' | 'video/webm' | 'application/pdf'

export type VariantPlatform =
  | 'tiktok'
  | 'instagram_reels'
  | 'instagram_feed_square'
  | 'instagram_feed_portrait'
  | 'instagram_story'
  | 'youtube_shorts'
  | 'youtube_landscape'
  | 'pinterest'
  | 'pinterest_square'
  | 'facebook_feed'
  | 'facebook_story'
  | 'facebook_reels'
  | 'twitter'
  | 'twitter_square'
  | 'linkedin_square'
  | 'linkedin_landscape'
  | 'linkedin_portrait'
  | 'bluesky'
  | 'bluesky_square'
  | 'threads'
  | 'threads_portrait'
  | 'threads_reels'

export type AspectRatio = '9:16' | '1:1' | '4:5' | '16:9' | '2:3' | '1.91:1'

export interface MediaVariant {
  id: string
  platform: VariantPlatform
  aspect_ratio: AspectRatio
  width: number
  height: number
  url: string
}

export interface Media {
  id: string
  name: string
  type: MediaType
  mime_type: MimeType
  size_bytes: number
  width: number
  height: number
  duration?: number
  status: MediaStatus
  thumbnail_url?: string
  original_url?: string
  variants?: MediaVariant[]
  created_at: string
}

export interface MediaListItem {
  id: string
  name: string
  type: MediaType
  mime_type: MimeType
  size_bytes: number
  width: number
  height: number
  duration?: number
  processing_status: MediaStatus
  thumbnail_url?: string
  created_at: string
}

export interface CreateUploadUrlRequest {
  name: string
  mime_type: MimeType
  size_bytes: number
}

export interface CreateUploadUrlResponse {
  media_id: string
  upload_url: string
  expires_at: string
}

// Tag types
export interface Tag {
  id: string
  tag: string
  usage_count: number
  last_used_at: string | null
  created_at: string
}

export interface TagsResponse {
  items: Tag[]
  total: number
}

// Social Account types
export type SocialPlatform =
  | 'tiktok'
  | 'instagram'
  | 'youtube'
  | 'facebook'
  | 'twitter'
  | 'x'
  | 'linkedin'
  | 'pinterest'
  | 'bluesky'
  | 'threads'

export interface SocialAccount {
  id: string
  platform: SocialPlatform
  username: string
  displayName?: string
  profileImageUrl?: string
  isActive: boolean
  connectionError?: string | null
  tokenExpiresAt?: string
  connectedAt: string
  lastUsedAt?: string
}

export interface PlatformInfo {
  id: SocialPlatform
  name: string
  color: string
  features: string[]
  supportsImage: boolean
  supportsVideo: boolean
  isConfigured?: boolean
}

// Post types
export type PostStatus = 'draft' | 'scheduled' | 'processing' | 'posted' | 'partially_posted' | 'failed'

// Base platform configuration
export interface BasePlatformConfiguration {
  caption?: string
  media?: string[] // Media IDs to override default
}

// TikTok configuration
export interface TikTokConfiguration extends BasePlatformConfiguration {
  title?: string
  videoCoverTimestampMs?: number
  draft?: boolean
  isAigc?: boolean
  disableComment?: boolean
  disableDuet?: boolean
  disableStitch?: boolean
  brandContentToggle?: boolean
  brandOrganicToggle?: boolean
}

// Instagram configuration
export interface InstagramConfiguration extends BasePlatformConfiguration {
  video_cover_timestamp_ms?: number
  placement?: 'feed' | 'reels' | 'story'
}

// YouTube configuration
export interface YouTubeConfiguration extends BasePlatformConfiguration {
  title?: string
  description?: string
  tags?: string[]
  privacyStatus?: 'public' | 'unlisted' | 'private'
  categoryId?: string
  isShort?: boolean
  madeForKids?: boolean
  notifySubscribers?: boolean
}

// Pinterest configuration
export interface PinterestConfiguration extends BasePlatformConfiguration {
  board_ids?: string[]
  link?: string
  video_cover_timestamp_ms?: number
  title?: string
  alt_text?: string
}

// Facebook configuration
export interface FacebookConfiguration extends BasePlatformConfiguration {
  placement?: 'feed' | 'reels' | 'story'
}

// X (Twitter) configuration
export interface XConfiguration extends BasePlatformConfiguration {
  threadMode?: boolean
  threadSeparator?: string
  altText?: string[]
  replySettings?: 'everyone' | 'following' | 'mentionedUsers'
  quoteTweetId?: string
}

// LinkedIn configuration
export interface LinkedInConfiguration extends BasePlatformConfiguration {
  visibility?: 'PUBLIC' | 'CONNECTIONS'
  postType?: 'post' | 'document' | 'article'
  documentTitle?: string
  carouselMediaId?: string  // Generated PDF media ID for carousel posts
  articleTitle?: string
  articleUrl?: string
  shareCommentary?: string
}

// Bluesky configuration
export interface BlueskyConfiguration extends BasePlatformConfiguration {
  threadMode?: boolean
  threadSeparator?: string
  altText?: string[]
  embedUrl?: string
  languages?: string[]
  labels?: ('nsfw' | 'nudity' | 'suggestive' | 'gore' | 'spoiler')[]
}

// Threads configuration
export interface ThreadsConfiguration extends BasePlatformConfiguration {
  location?: 'reels' | 'timeline'
}

// Combined platform configurations type
export interface PlatformConfigurations {
  tiktok?: TikTokConfiguration
  instagram?: InstagramConfiguration
  youtube?: YouTubeConfiguration
  pinterest?: PinterestConfiguration
  facebook?: FacebookConfiguration
  twitter?: XConfiguration
  x?: XConfiguration
  linkedin?: LinkedInConfiguration
  bluesky?: BlueskyConfiguration
  threads?: ThreadsConfiguration
}

export interface PostResult {
  socialAccountId: string
  platform: SocialPlatform
  status: 'pending' | 'processing' | 'success' | 'failed'
  platformPostId?: string | null
  platformPostUrl?: string | null
  platformUrl?: string
  errorCode?: string | null
  errorMessage?: string | null
  error?: string
  publishedAt?: string | null
  postedAt?: string
}

export interface Post {
  id: string
  caption?: string
  hashtags?: string[]
  status: PostStatus
  isDraft: boolean
  processingEnabled: boolean
  scheduledAt?: string
  publishedAt?: string
  media: PostMedia[]
  socialAccounts: PostSocialAccount[]
  platformConfigurations?: PlatformConfigurations
  results?: PostResult[]
  createdAt: string
  updatedAt: string
}

export interface PostMedia {
  id: string
  mediaId: string
  position: number
  name: string
  type: MediaType
  thumbnailUrl?: string
  originalUrl?: string
  variants?: MediaVariant[]
}

export interface PostSocialAccount {
  id: string
  platform: SocialPlatform
  username: string
  displayName?: string
  avatarUrl?: string
}

export interface CreatePostRequest {
  caption?: string
  hashtags?: string[]
  mediaIds: string[]
  socialAccountIds: string[]
  scheduledAt?: string
  isDraft?: boolean
  processingEnabled?: boolean
  platformConfigurations?: PlatformConfigurations
}

export interface UpdatePostRequest {
  caption?: string
  hashtags?: string[]
  mediaIds?: string[]
  socialAccountIds?: string[]
  scheduledAt?: string | null
  isDraft?: boolean
  processingEnabled?: boolean
  platformConfigurations?: PlatformConfigurations
}

// Payment types
export type BillingInterval = 'month' | 'year'

export interface PricingPlan {
  id: string
  name: string
  displayName: string
  price: number
  currency: string
  interval: BillingInterval
  features: string[]
  limits: PlanLimits
  stripePriceId: string
}

export interface Subscription {
  id: string
  status: 'active' | 'cancelled' | 'past_due' | 'incomplete'
  planType: PlanName
  billingInterval: BillingInterval
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  cancelledAt?: string
}

export interface PaymentHistoryItem {
  id: string
  amount: number
  currency: string
  status: 'succeeded' | 'failed' | 'pending'
  description: string
  created_at: string
  invoiceUrl?: string
}

// API response types
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export interface ApiError {
  error: string
  code?: string
  details?: Record<string, unknown>
}

// Analytics types
export interface PlatformAnalytics {
  platform: string
  postsCount: number
  likes: number
  comments: number
  shares: number
  views: number
  impressions: number
  reach: number
  engagementRate: number
}

export interface AnalyticsOverview {
  totalPosts: number
  totalLikes: number
  totalComments: number
  totalShares: number
  totalViews: number
  totalImpressions: number
  totalReach: number
  engagementRate: number
  byPlatform: PlatformAnalytics[]
}

export interface PostAnalyticsSummary {
  postId: string
  postResultId: string
  caption: string | null
  platform: string
  platformPostUrl: string | null
  publishedAt: string
  thumbnailUrl: string | null
  likes: number
  comments: number
  shares: number
  views: number
  impressions: number
  reach: number
  totalEngagement: number
  lastUpdated: string
}

export interface PostAnalyticsDetail extends PostAnalyticsSummary {
  timeSeriesData: {
    date: string
    likes: number
    comments: number
    shares: number
    views: number
    impressions: number
  }[]
  platformMetrics: Record<string, unknown>
}

export interface AnalyticsTrendData {
  date: string
  value: number
}

export interface TrendsResponse {
  data: AnalyticsTrendData[]
  metric: string
  period: string
}

export interface PostAnalyticsListResponse {
  items: PostAnalyticsSummary[]
  total: number
  limit: number
  offset: number
}

export type AnalyticsMetric = 'likes' | 'comments' | 'shares' | 'views' | 'impressions' | 'engagement'
export type AnalyticsPeriod = '7d' | '30d' | '90d' | '12m'
export type AnalyticsGroupBy = 'day' | 'week' | 'month'

export interface AccountNeedingUpgrade {
  id: string
  platform: string
  username: string | null
  displayName: string | null
  profileImageUrl: string | null
  missingScopes: string[]
  description: string
}

export interface ScopeStatusResponse {
  needsUpgrade: boolean
  accounts: AccountNeedingUpgrade[]
}

// Platform specifications
export interface PlatformSpecification {
  platform: string
  id: SocialPlatform
  image?: {
    maxSize: string
    maxDimensions: string
    aspectRatios: string[]
    formats: string[]
  }
  video?: {
    maxSize: string
    maxDimensions: string
    duration: string
    aspectRatios: string[]
    formats: string[]
  }
  content: {
    maxCaption: number
    maxTitle?: number
    supportsLinks: boolean
    supportsHashtags: boolean
  }
  notes: string[]
}
