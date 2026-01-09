/**
 * Platform Hashtag Limits Configuration
 *
 * This file defines the hashtag limitations for each social platform.
 * Updated based on 2025 platform changes.
 */

import type { SocialPlatform } from '@/types'

export interface PlatformHashtagLimit {
  /** Maximum hashtags allowed (null = no hard limit) */
  maxHashtags: number | null
  /** Recommended number for best engagement */
  bestPractice: number
  /** If true, platform will reject or ignore excess hashtags */
  enforced: boolean
  /** Additional notes about hashtag usage */
  notes: string
}

export const PLATFORM_HASHTAG_LIMITS: Record<SocialPlatform, PlatformHashtagLimit> = {
  tiktok: {
    maxHashtags: 5,
    bestPractice: 4,
    enforced: true,
    notes: 'Hard limit of 5 hashtags since August 2025',
  },
  instagram: {
    maxHashtags: 5,
    bestPractice: 4,
    enforced: true,
    notes: 'Reduced from 30 to 5 in 2025',
  },
  threads: {
    maxHashtags: 1,
    bestPractice: 1,
    enforced: true,
    notes: 'Only 1 tag allowed per post',
  },
  youtube: {
    maxHashtags: 15,
    bestPractice: 3,
    enforced: false,
    notes: 'More than 60 tags may cause search suppression',
  },
  facebook: {
    maxHashtags: null,
    bestPractice: 2,
    enforced: false,
    notes: 'Hashtags have minimal impact on reach',
  },
  linkedin: {
    maxHashtags: null,
    bestPractice: 4,
    enforced: false,
    notes: '3-5 hashtags recommended for best reach',
  },
  twitter: {
    maxHashtags: null,
    bestPractice: 2,
    enforced: false,
    notes: 'Part of 280 character limit',
  },
  x: {
    maxHashtags: null,
    bestPractice: 2,
    enforced: false,
    notes: 'Part of 280 character limit',
  },
  pinterest: {
    maxHashtags: 20,
    bestPractice: 4,
    enforced: false,
    notes: '2-5 hashtags recommended',
  },
  bluesky: {
    maxHashtags: null,
    bestPractice: 3,
    enforced: false,
    notes: 'Part of 300 character limit',
  },
}

export interface HashtagLimitStatus {
  platform: SocialPlatform
  displayName: string
  limit: number | null
  count: number
  status: 'ok' | 'warning' | 'exceeded'
  message: string
  usedCount: number // How many will actually be used
}

/**
 * Get hashtag limit status for a platform
 */
export function getHashtagLimitStatus(
  platform: SocialPlatform,
  hashtagCount: number
): HashtagLimitStatus {
  const limits = PLATFORM_HASHTAG_LIMITS[platform]
  const displayName = getPlatformDisplayName(platform)

  // No limit
  if (limits.maxHashtags === null) {
    const status = hashtagCount > limits.bestPractice ? 'warning' : 'ok'
    return {
      platform,
      displayName,
      limit: null,
      count: hashtagCount,
      status,
      message:
        status === 'warning'
          ? `${hashtagCount} tags (${limits.bestPractice} recommended)`
          : `${hashtagCount} tags`,
      usedCount: hashtagCount,
    }
  }

  // Under limit
  if (hashtagCount <= limits.maxHashtags) {
    const status = hashtagCount > limits.bestPractice ? 'warning' : 'ok'
    return {
      platform,
      displayName,
      limit: limits.maxHashtags,
      count: hashtagCount,
      status,
      message: `${hashtagCount}/${limits.maxHashtags} tags`,
      usedCount: hashtagCount,
    }
  }

  // Over limit
  return {
    platform,
    displayName,
    limit: limits.maxHashtags,
    count: hashtagCount,
    status: 'exceeded',
    message: `Only first ${limits.maxHashtags} of ${hashtagCount} tags will be used`,
    usedCount: limits.maxHashtags,
  }
}

/**
 * Get hashtag limit statuses for multiple platforms
 */
export function getHashtagLimitStatuses(
  platforms: SocialPlatform[],
  hashtagCount: number
): HashtagLimitStatus[] {
  return platforms.map((platform) => getHashtagLimitStatus(platform, hashtagCount))
}

/**
 * Check if any platform exceeds hashtag limit
 */
export function hasHashtagLimitExceeded(
  platforms: SocialPlatform[],
  hashtagCount: number
): boolean {
  return platforms.some((platform) => {
    const limits = PLATFORM_HASHTAG_LIMITS[platform]
    return limits.maxHashtags !== null && hashtagCount > limits.maxHashtags
  })
}

/**
 * Get the most restrictive hashtag limit across platforms
 */
export function getMostRestrictiveLimit(platforms: SocialPlatform[]): number | null {
  let mostRestrictive: number | null = null

  for (const platform of platforms) {
    const limit = PLATFORM_HASHTAG_LIMITS[platform].maxHashtags
    if (limit !== null) {
      if (mostRestrictive === null || limit < mostRestrictive) {
        mostRestrictive = limit
      }
    }
  }

  return mostRestrictive
}

/**
 * Get display name for a platform
 */
function getPlatformDisplayName(platform: SocialPlatform): string {
  const names: Record<SocialPlatform, string> = {
    instagram: 'Instagram',
    threads: 'Threads',
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
    pinterest: 'Pinterest',
    twitter: 'X',
    x: 'X',
    bluesky: 'Bluesky',
    tiktok: 'TikTok',
    youtube: 'YouTube',
  }
  return names[platform] || platform
}
