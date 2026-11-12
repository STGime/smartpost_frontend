/**
 * Platform Media Limits Configuration
 *
 * This file defines the media limitations for each social platform.
 * Update this file when platform limits change.
 *
 * Source: Backend OpenAPI spec and platform documentation
 */

import type { SocialPlatform } from '@/types'

export interface PlatformMediaLimits {
  maxImages: number
  maxVideos: number
  supportsImages: boolean
  supportsVideos: boolean
  canMixImagesAndVideo: boolean
  /** Platform API rejects posts without at least one photo or video. */
  requiresMedia: boolean
  notes: string[]
}

export const PLATFORM_MEDIA_LIMITS: Record<SocialPlatform, PlatformMediaLimits> = {
  instagram: {
    maxImages: 10,
    maxVideos: 10,
    supportsImages: true,
    supportsVideos: true,
    canMixImagesAndVideo: true,
    requiresMedia: true,
    notes: ['Carousel posts support up to 10 items (mix of images and videos)'],
  },
  threads: {
    maxImages: 10,
    maxVideos: 10,
    supportsImages: true,
    supportsVideos: true,
    canMixImagesAndVideo: true,
    requiresMedia: false,
    notes: ['Up to 10 items (mix of images and videos)'],
  },
  linkedin: {
    maxImages: 20,
    maxVideos: 1,
    supportsImages: true,
    supportsVideos: true,
    canMixImagesAndVideo: false,
    requiresMedia: false,
    notes: ['Multi-image posts supported', 'Cannot mix images and video in same post'],
  },
  facebook: {
    maxImages: 10,
    maxVideos: 10,
    supportsImages: true,
    supportsVideos: true,
    canMixImagesAndVideo: true,
    requiresMedia: false,
    notes: ['Carousel posts support mix of images and videos'],
  },
  pinterest: {
    maxImages: 5,
    maxVideos: 1,
    supportsImages: true,
    supportsVideos: true,
    canMixImagesAndVideo: false,
    requiresMedia: true,
    notes: ['Carousel pins supported'],
  },
  twitter: {
    maxImages: 4,
    maxVideos: 1,
    supportsImages: true,
    supportsVideos: true,
    canMixImagesAndVideo: false,
    requiresMedia: false,
    notes: ['Cannot mix images and video', 'GIFs count as video'],
  },
  x: {
    maxImages: 4,
    maxVideos: 1,
    supportsImages: true,
    supportsVideos: true,
    canMixImagesAndVideo: false,
    requiresMedia: false,
    notes: ['Cannot mix images and video', 'GIFs count as video'],
  },
  bluesky: {
    maxImages: 4,
    maxVideos: 0,
    supportsImages: true,
    supportsVideos: false,
    canMixImagesAndVideo: false,
    requiresMedia: false,
    notes: ['No video support yet'],
  },
  tiktok: {
    maxImages: 1,
    maxVideos: 1,
    supportsImages: true,
    supportsVideos: true,
    canMixImagesAndVideo: false,
    requiresMedia: true,
    notes: ['Primarily video platform'],
  },
  youtube: {
    maxImages: 0,
    maxVideos: 1,
    supportsImages: false,
    supportsVideos: true,
    canMixImagesAndVideo: false,
    requiresMedia: true,
    notes: ['Video only', 'Thumbnail is separate'],
  },
}

export interface MediaCompatibilityResult {
  isCompatible: boolean
  reason: string | null
}

/**
 * Message shown when a media-only platform is selected without media,
 * or null when the platform accepts text-only posts.
 */
export function getMissingMediaMessage(platform: SocialPlatform): string | null {
  if (!PLATFORM_MEDIA_LIMITS[platform]?.requiresMedia) return null
  const name = getPlatformDisplayName(platform)
  return PLATFORM_MEDIA_LIMITS[platform].supportsImages
    ? `${name} needs at least one photo or video`
    : `${name} needs a video`
}

/**
 * Check if a platform is compatible with the selected media
 */
export function checkPlatformMediaCompatibility(
  platform: SocialPlatform,
  imageCount: number,
  videoCount: number
): MediaCompatibilityResult {
  const limits = PLATFORM_MEDIA_LIMITS[platform]

  if (!limits) {
    return { isCompatible: true, reason: null }
  }

  // Check if platform supports images
  if (imageCount > 0 && !limits.supportsImages) {
    return {
      isCompatible: false,
      reason: `${getPlatformDisplayName(platform)} does not support images`,
    }
  }

  // Check if platform supports videos
  if (videoCount > 0 && !limits.supportsVideos) {
    return {
      isCompatible: false,
      reason: `${getPlatformDisplayName(platform)} does not support videos`,
    }
  }

  // Check if mixing images and video is allowed
  if (imageCount > 0 && videoCount > 0 && !limits.canMixImagesAndVideo) {
    return {
      isCompatible: false,
      reason: `${getPlatformDisplayName(platform)} cannot mix images and video`,
    }
  }

  // Check image count limit
  if (imageCount > limits.maxImages) {
    return {
      isCompatible: false,
      reason: `${getPlatformDisplayName(platform)} allows max ${limits.maxImages} image${limits.maxImages !== 1 ? 's' : ''}`,
    }
  }

  // Check video count limit
  if (videoCount > limits.maxVideos) {
    if (limits.maxVideos === 0) {
      return {
        isCompatible: false,
        reason: `${getPlatformDisplayName(platform)} does not support video`,
      }
    }
    return {
      isCompatible: false,
      reason: `${getPlatformDisplayName(platform)} allows max ${limits.maxVideos} video${limits.maxVideos !== 1 ? 's' : ''}`,
    }
  }

  return { isCompatible: true, reason: null }
}

/**
 * Get display name for a platform
 */
export function getPlatformDisplayName(platform: SocialPlatform): string {
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

/**
 * Get all compatible platforms for given media selection
 */
export function getCompatiblePlatforms(
  imageCount: number,
  videoCount: number
): { platform: SocialPlatform; compatible: boolean; reason: string | null }[] {
  const platforms = Object.keys(PLATFORM_MEDIA_LIMITS) as SocialPlatform[]

  return platforms.map(platform => {
    const result = checkPlatformMediaCompatibility(platform, imageCount, videoCount)
    return {
      platform,
      compatible: result.isCompatible,
      reason: result.reason,
    }
  })
}
