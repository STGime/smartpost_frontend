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
  message?: string
}

// Plan types
export type PlanName = 'trial' | 'starter' | 'professional' | 'premium'
export type PlanStatus = 'active' | 'cancelled' | 'expired' | 'grace_period'

export interface PlanLimits {
  max_posts_per_month: number | null
  max_networks_per_post: number
  max_social_accounts: number | null
}

export interface PlanUsage {
  posts_this_month: number
  posts_remaining: number
  connected_accounts: number
  accounts_remaining: number
  period_start: string
  period_end: string
}

export interface Plan {
  plan: {
    type: PlanName
    status: PlanStatus
    is_active: boolean
    is_in_grace_period: boolean
    grace_period_ends_at: string | null
    trial_ends_at: string | null
    subscription_ends_at: string | null
    days_remaining: number | null
    hours_remaining: number | null
    limits: PlanLimits
  }
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

export interface SocialAccountMetadata {
  // Instagram-specific
  accountType?: 'BUSINESS' | 'MEDIA_CREATOR' | 'PERSONAL'
  facebookPageId?: string
  // TikTok-specific
  creatorMarketplaceEnabled?: boolean
  // YouTube-specific
  channelId?: string
}

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
  metadata?: SocialAccountMetadata
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

// Lightweight post type for calendar view
export interface CalendarPost {
  id: string
  caption: string | null
  status: PostStatus
  scheduledAt: string | null
  publishedAt: string | null
  createdAt: string
  platforms: string[]
  hasThumbnail: boolean
  dateKey: string // YYYY-MM-DD format for grouping
}

// Base platform configuration
export interface BasePlatformConfiguration {
  caption?: string
  media?: string[] // Media IDs to override default
}

// TikTok privacy levels
export type TikTokPrivacyLevel = 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'FOLLOWER_OF_CREATOR' | 'SELF_ONLY'

// TikTok policy URLs
export interface TikTokPolicyUrls {
  musicUsageConfirmation: string
  brandedContentPolicy: string
  communityGuidelines: string
  termsOfService: string
}

// TikTok UX guidance from backend
export interface TikTokUxGuidance {
  privacyLevelRequired: boolean
  interactionControlsDefaultOff: boolean
  brandedContentRestrictsPrivacy: string[]
}

// TikTok creator info (from creator_info API)
export interface TikTokCreatorInfo {
  creatorAvatarUrl: string
  creatorUsername: string
  creatorNickname: string
  privacyLevelOptions: TikTokPrivacyLevel[]
  commentDisabled: boolean
  duetDisabled: boolean
  stitchDisabled: boolean
  maxVideoPostDurationSec: number
  canPost: boolean
  cannotPostReason: string | null
  policyUrls: TikTokPolicyUrls
  uxGuidance: TikTokUxGuidance
}

// TikTok configuration
export interface TikTokConfiguration extends BasePlatformConfiguration {
  title?: string
  videoCoverTimestampMs?: number
  draft?: boolean
  isAigc?: boolean
  privacyLevel?: TikTokPrivacyLevel
  allowComment?: boolean // Per TikTok UX guidelines: unchecked by default
  allowDuet?: boolean // Per TikTok UX guidelines: unchecked by default
  allowStitch?: boolean // Per TikTok UX guidelines: unchecked by default
  brandContentToggle?: boolean // Branded content (paid partnership)
  brandOrganicToggle?: boolean // Your brand promotion
  contentDisclosureEnabled?: boolean // Wrapper toggle for brand content options
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

// Pinterest board
export interface PinterestBoard {
  id: string
  name: string
  description?: string
  privacy?: 'PUBLIC' | 'PROTECTED' | 'SECRET'
  pinCount?: number
}

// Pinterest configuration
export interface PinterestConfiguration extends BasePlatformConfiguration {
  board_id?: string
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
  planType: 'starter' | 'professional'
  billingInterval: BillingInterval
  priceCents: number
  currency: string
  maxPostsPerMonth: number | null
  maxSocialAccounts: number | null
  maxScheduledPosts: number | null
  features: string[]
  lemonSqueezyVariantId: string
  lemonSqueezyProductId: string
}

export interface Subscription {
  id: string
  status: 'active' | 'on_trial' | 'cancelled' | 'past_due'
  planType: PlanName
  billingInterval: BillingInterval
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  cancelledAt?: string
  customerPortalUrl?: string
  lemonSqueezySubscriptionId?: string
  lemonSqueezyCustomerId?: string
  lemonSqueezyVariantId?: string
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
export type AnalyticsPeriod = '7d' | '30d' | '90d' | '12m' | 'custom'
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

// Analytics capabilities (from GET /analytics/capabilities)
export interface AnalyticsCapabilities {
  tier: 'trial' | 'starter' | 'professional'
  maxPeriod: '7d' | '90d' | 'unlimited'
  features: {
    postDetail: boolean
    manualRefresh: boolean
    bestTimes: boolean
    contentTypes: boolean
    hashtags: boolean
    customDateRange: boolean
    export: boolean
    postComparison: boolean
    benchmarks: boolean
  }
}

export interface BestTimeSlot {
  day: number    // 0-6 (Sun-Sat)
  hour: number   // 0-23
  avgEngagement: number
  postCount: number
}

export interface BestTimesResponse {
  heatmap: BestTimeSlot[]
}

export interface ContentTypeStats {
  type: 'image' | 'video' | 'carousel' | 'document'
  postCount: number
  avgLikes: number
  avgComments: number
  avgShares: number
  avgViews: number
  avgEngagementRate: number
}

export interface ContentTypesResponse {
  types: ContentTypeStats[]
}

export interface HashtagStats {
  tag: string
  usageCount: number
  avgLikes: number
  avgComments: number
  avgViews: number
  avgEngagementRate: number
}

export interface HashtagsResponse {
  hashtags: HashtagStats[]
}

export interface BenchmarkData {
  platform: string
  contentType: string
  avgEngagementRate: number
  avgLikesPerPost: number | null
  avgCommentsPerPost: number | null
  source: string | null
}

export interface BenchmarksResponse {
  benchmarks: BenchmarkData[]
}

export interface PostComparisonResponse {
  posts: PostAnalyticsDetail[]
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
