<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore, useMediaStore, useSocialAccountsStore, useTagsStore } from '@/stores'
import PlatformIcon from '@/components/PlatformIcon.vue'
import PlatformConfigSection from '@/components/platform/PlatformConfigSection.vue'
import HashtagInput from '@/components/HashtagInput.vue'
import HashtagLimitWarnings from '@/components/HashtagLimitWarnings.vue'
import { checkPlatformMediaCompatibility } from '@/config/platformLimits'
import type { MediaListItem, PlatformConfigurations, SocialPlatform } from '@/types'

// File size limits (must match backend)
const MAX_IMAGE_SIZE_MB = 20
const MAX_VIDEO_SIZE_MB = 20
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024

// Props for edit mode
const props = defineProps<{
  id?: string
}>()

const router = useRouter()
const postsStore = usePostsStore()
const mediaStore = useMediaStore()
const socialAccountsStore = useSocialAccountsStore()
const tagsStore = useTagsStore()

// Edit mode detection
const isEditMode = computed(() => !!props.id)
const isLoadingPost = ref(false)

const caption = ref('')
const hashtags = ref<string[]>([])
const saveHashtagsToLibrary = ref(true)
const selectedMediaIds = ref<string[]>([])
const selectedAccountIds = ref<string[]>([])
const platformConfigurations = ref<PlatformConfigurations>({})

// Media filters
const mediaTypeFilter = ref<'all' | 'image' | 'video' | 'document'>('all')
const mediaSizeFilter = ref<'all' | 'small' | 'medium' | 'large'>('all')
const mediaSortOrder = ref<'newest' | 'oldest'>('newest')

// Media pagination ("Show more" + infinite scroll). The backend caps a page at
// 100; we append pages via offset so older media stays reachable.
const MEDIA_PAGE_SIZE = 100
const loadMoreSentinel = ref<HTMLElement | null>(null)
const mediaScrollContainer = ref<HTMLElement | null>(null)
let mediaObserver: IntersectionObserver | null = null

const loadMedia = async ({ reset }: { reset: boolean }) => {
  // Reset always reloads page 0; "load more" is guarded against re-entry / running past the end.
  if (!reset && (mediaStore.isLoading || !mediaStore.hasMore)) return
  await mediaStore.fetchMedia({
    limit: MEDIA_PAGE_SIZE,
    offset: reset ? 0 : mediaStore.items.length,
    sort: mediaSortOrder.value,
  })
}

// Changing sort refetches ordered pages from the server so "Oldest" surfaces the
// genuinely oldest items immediately (not just a client re-sort of the first page).
watch(mediaSortOrder, () => {
  loadMedia({ reset: true })
})

// Observe the sentinel at the end of the grid; auto-load the next page when it scrolls into view.
watch(loadMoreSentinel, (el, prev) => {
  if (!mediaObserver) {
    mediaObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMedia({ reset: false })
      },
      { root: mediaScrollContainer.value, rootMargin: '200px' }
    )
  }
  if (prev) mediaObserver.unobserve(prev)
  if (el) mediaObserver.observe(el)
})

onUnmounted(() => {
  mediaObserver?.disconnect()
  mediaObserver = null
})

// File upload
const fileInput = ref<HTMLInputElement | null>(null)

// Preview modal
const showPreviewModal = ref(false)
const mediaToPreview = ref<MediaListItem | null>(null)
const isLoadingPreview = ref(false)

// Count selected media by type
const selectedMediaCounts = computed(() => {
  const selectedMedia = mediaStore.items.filter(m => selectedMediaIds.value.includes(m.id))
  return {
    images: selectedMedia.filter(m => m.type === 'image').length,
    videos: selectedMedia.filter(m => m.type === 'video').length,
    total: selectedMedia.length,
  }
})

// Check compatibility for each account based on selected media
const accountCompatibility = computed(() => {
  const compatibility: Record<string, { compatible: boolean; reason: string | null }> = {}

  for (const account of socialAccountsStore.accounts) {
    const result = checkPlatformMediaCompatibility(
      account.platform as SocialPlatform,
      selectedMediaCounts.value.images,
      selectedMediaCounts.value.videos
    )
    compatibility[account.id] = {
      compatible: result.isCompatible,
      reason: result.reason,
    }
  }

  return compatibility
})

// Use all accounts, not just active ones (the store might filter incorrectly)
// Sort by platform to group same platforms together
const availableAccounts = computed(() => {
  // First try activeAccounts, if empty fall back to all accounts
  const active = socialAccountsStore.activeAccounts
  const accounts = active.length > 0 ? active : socialAccountsStore.accounts

  // Sort by platform name, then by username within same platform
  return [...accounts].sort((a, b) => {
    const platformCompare = a.platform.localeCompare(b.platform)
    if (platformCompare !== 0) return platformCompare
    return (a.username || '').localeCompare(b.username || '')
  })
})

// Get full account objects for selected accounts
const selectedAccountsData = computed(() => {
  return availableAccounts.value.filter(account =>
    selectedAccountIds.value.includes(account.id)
  )
})

// Get unique platforms from selected accounts
const selectedPlatforms = computed(() => {
  const platforms = selectedAccountsData.value.map(a => a.platform as SocialPlatform)
  return [...new Set(platforms)]
})

// Validation for TikTok posts — privacy level is required for direct publish
// only. Drafts skip the check because TikTok's inbox/draft endpoint doesn't
// accept privacy at all (the user picks it when they finish the post inside
// the TikTok app), and the backend explicitly mirrors this
// (see tiktokValidationService.validateConfigLocally: `if (draft !== true)`).
const tiktokValidation = computed(() => {
  const hasTikTok = selectedPlatforms.value.includes('tiktok')
  if (!hasTikTok) return { valid: true, message: null }

  const tiktokConfig = platformConfigurations.value.tiktok

  if (tiktokConfig?.draft === true) return { valid: true, message: null }

  if (!tiktokConfig?.privacyLevel) {
    return {
      valid: false,
      message: 'TikTok requires you to select who can view your video'
    }
  }

  return { valid: true, message: null }
})

// Validation for Pinterest posts - board is required
const pinterestValidation = computed(() => {
  const hasPinterest = selectedPlatforms.value.includes('pinterest')
  if (!hasPinterest) return { valid: true, message: null }

  const pinterestConfig = platformConfigurations.value.pinterest
  if (!pinterestConfig?.board_id) {
    return {
      valid: false,
      message: 'Pinterest requires you to select a board for your Pin'
    }
  }

  return { valid: true, message: null }
})

// Platform validation errors (from config panels)
const platformValidationErrors = ref<Record<string, string[]>>({})

// Handle validation changes from platform config panels
const handlePlatformValidation = (platform: string, valid: boolean, errors: string[]) => {
  if (valid) {
    delete platformValidationErrors.value[platform]
  } else {
    platformValidationErrors.value[platform] = errors
  }
  // Trigger reactivity
  platformValidationErrors.value = { ...platformValidationErrors.value }
}

// Get all platform validation errors as a flat array
const allPlatformErrors = computed(() => {
  return Object.values(platformValidationErrors.value).flat()
})

// Overall form validation
const formValidation = computed(() => {
  const errors: string[] = []

  if (selectedAccountIds.value.length === 0) {
    errors.push('Select at least one social account')
  }

  if (!tiktokValidation.value.valid && tiktokValidation.value.message) {
    errors.push(tiktokValidation.value.message)
  }

  if (!pinterestValidation.value.valid && pinterestValidation.value.message) {
    errors.push(pinterestValidation.value.message)
  }

  // Add platform validation errors (excluding ones already shown inline)
  // Note: We don't add allPlatformErrors here as they're shown inline in the config panels

  return {
    valid: errors.length === 0 && allPlatformErrors.value.length === 0,
    errors
  }
})

// Tooltip message for disabled button
const disabledButtonTooltip = computed(() => {
  if (allPlatformErrors.value.length > 0) {
    return allPlatformErrors.value[0]
  }
  if (formValidation.value.errors.length > 0) {
    return formValidation.value.errors[0]
  }
  return ''
})

// Get full media objects for selected media (for carousel ordering)
const selectedMediaItems = computed(() => {
  return mediaStore.items.filter(item => selectedMediaIds.value.includes(item.id))
})

// Check if caption has extractable hashtags
const captionHashtags = computed(() => {
  const matches = caption.value.match(/#\w+/g) || []
  return matches.map(h => h.slice(1).toLowerCase())
})

const hasExtractableHashtags = computed(() => {
  return captionHashtags.value.some(tag => !hashtags.value.includes(tag))
})

// Extract hashtags from caption (removes them from caption, adds to hashtags)
const extractHashtagsFromCaption = () => {
  const newTags = captionHashtags.value.filter(tag => !hashtags.value.includes(tag))
  if (newTags.length > 0) {
    // Add to hashtags array
    hashtags.value = [...hashtags.value, ...newTags]
    // Remove hashtags from caption
    caption.value = caption.value
      .replace(/#\w+/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }
}

// Media items that are still processing (shown as placeholders)
const processingMedia = computed(() => {
  return mediaStore.items.filter(m => m.processing_status === 'processing')
})

// Filtered and sorted media
const filteredMedia = computed(() => {
  // Exclude items that are still processing (they can't be used in posts yet)
  let items = mediaStore.items.filter(m => m.processing_status !== 'processing')

  // Filter by type
  if (mediaTypeFilter.value !== 'all') {
    items = items.filter(m => m.type === mediaTypeFilter.value)
  }

  // Filter by size
  if (mediaSizeFilter.value !== 'all') {
    items = items.filter(m => {
      const sizeMB = m.size_bytes / (1024 * 1024)
      switch (mediaSizeFilter.value) {
        case 'small': return sizeMB < 1
        case 'medium': return sizeMB >= 1 && sizeMB <= 10
        case 'large': return sizeMB > 10
        default: return true
      }
    })
  }

  // Sort by date
  return items.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return mediaSortOrder.value === 'newest' ? dateB - dateA : dateA - dateB
  })
})

// Template loading state
const loadedFromTemplate = ref(false)
const templateMediaMissing = ref<string[]>([])

onMounted(async () => {
  // Fetch the first page of media (server-ordered; more pages load on demand)
  await loadMedia({ reset: true })
  await socialAccountsStore.fetchAccounts()

  // Edit mode: Load existing post data
  if (isEditMode.value && props.id) {
    isLoadingPost.value = true
    try {
      await postsStore.fetchPostById(props.id)
      const post = postsStore.currentPost
      if (post) {
        // Populate form fields from existing post
        caption.value = post.caption || ''
        hashtags.value = post.hashtags || []

        // Copy platform configurations if they exist
        if (post.platformConfigurations) {
          platformConfigurations.value = { ...post.platformConfigurations }
        }

        // Copy social accounts - only those that still exist and are active
        // Use accountId (real social account ID) with fallback to id (may be join table ID)
        const validAccountIds: string[] = []
        if (post.socialAccounts) {
          for (const account of post.socialAccounts) {
            const realId = account.accountId || account.id
            const exists = availableAccounts.value.find(a => a.id === realId)
            if (exists) {
              validAccountIds.push(realId)
            }
          }
        }
        selectedAccountIds.value = validAccountIds

        // Copy media - check if media still exists
        const validMediaIds: string[] = []
        if (post.media) {
          for (const media of post.media) {
            const exists = mediaStore.items.find(m => m.id === media.mediaId)
            if (exists) {
              validMediaIds.push(media.mediaId)
            }
          }
        }
        selectedMediaIds.value = validMediaIds
      }
    } finally {
      isLoadingPost.value = false
    }
    return
  }

  // Check if there's a template to load
  if (postsStore.templatePost) {
    const template = postsStore.templatePost
    loadedFromTemplate.value = true

    // Copy caption and hashtags
    caption.value = template.caption || ''
    hashtags.value = template.hashtags || []

    // Copy platform configurations if they exist
    if (template.platformConfigurations) {
      platformConfigurations.value = { ...template.platformConfigurations }
    }

    // Copy social accounts - only those that still exist and are active
    // Use accountId (real social account ID) with fallback to id (may be join table ID)
    const validAccountIds: string[] = []
    if (template.socialAccounts) {
      for (const account of template.socialAccounts) {
        const realId = account.accountId || account.id
        const exists = availableAccounts.value.find(a => a.id === realId)
        if (exists) {
          validAccountIds.push(realId)
        }
      }
    }
    selectedAccountIds.value = validAccountIds

    // Copy media - check if media still exists
    // Note: PostMedia has both 'id' (join table ID) and 'mediaId' (actual media ID)
    const validMediaIds: string[] = []
    const missingMedia: string[] = []
    if (template.media) {
      for (const media of template.media) {
        const exists = mediaStore.items.find(m => m.id === media.mediaId)
        if (exists) {
          validMediaIds.push(media.mediaId)
        } else {
          missingMedia.push(media.name || media.mediaId)
        }
      }
    }
    selectedMediaIds.value = validMediaIds
    templateMediaMissing.value = missingMedia

    // Clear the template after loading
    postsStore.clearTemplate()
  }
})

// Watch for media changes and auto-deselect incompatible accounts
watch(selectedMediaIds, () => {
  // Filter out accounts that are no longer compatible
  const stillCompatible = selectedAccountIds.value.filter(accountId => {
    const compat = accountCompatibility.value[accountId]
    return compat?.compatible !== false
  })

  // Only update if something changed
  if (stillCompatible.length !== selectedAccountIds.value.length) {
    selectedAccountIds.value = stillCompatible
  }
}, { deep: true })

const handleSubmit = async () => {
  try {
    // Save hashtags to library if enabled
    if (saveHashtagsToLibrary.value && hashtags.value.length > 0) {
      try {
        await tagsStore.saveTags(hashtags.value)
      } catch {
        // Silently fail - don't block post creation/update
      }
    }

    if (isEditMode.value && props.id) {
      // Update existing post
      await postsStore.updatePost(props.id, {
        caption: caption.value,
        hashtags: hashtags.value,
        mediaIds: selectedMediaIds.value,
        // SocialAccount.id is still a string on the frontend (separate refactor);
        // coerce to number to match the API's numeric id contract.
        socialAccountIds: selectedAccountIds.value.map(Number),
        platformConfigurations: Object.keys(platformConfigurations.value).length > 0
          ? platformConfigurations.value
          : undefined,
      })
      router.push(`/app/posts/${props.id}`)
    } else {
      // Create new post
      const post = await postsStore.createPost({
        caption: caption.value,
        hashtags: hashtags.value,
        mediaIds: selectedMediaIds.value,
        // SocialAccount.id is still a string on the frontend (separate refactor);
        // coerce to number to match the API's numeric id contract.
        socialAccountIds: selectedAccountIds.value.map(Number),
        isDraft: true,
        platformConfigurations: Object.keys(platformConfigurations.value).length > 0
          ? platformConfigurations.value
          : undefined,
      })
      router.push(`/app/posts/${post.id}`)
    }
  } catch {
    // Error handled in store
  }
}

const toggleMedia = (id: string) => {
  const index = selectedMediaIds.value.indexOf(id)
  if (index === -1) {
    selectedMediaIds.value.push(id)
  } else {
    selectedMediaIds.value.splice(index, 1)
  }
}

const toggleAccount = (id: string) => {
  // Check if account is compatible with current media selection
  const compat = accountCompatibility.value[id]
  if (compat && !compat.compatible) {
    // Don't allow selecting incompatible accounts
    return
  }

  const index = selectedAccountIds.value.indexOf(id)
  if (index === -1) {
    selectedAccountIds.value.push(id)
  } else {
    selectedAccountIds.value.splice(index, 1)
  }
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files?.length) return

  for (const file of Array.from(files)) {
    // Validate file size before uploading
    const isVideo = file.type.startsWith('video/')
    const maxSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES
    const maxSizeMB = isVideo ? MAX_VIDEO_SIZE_MB : MAX_IMAGE_SIZE_MB

    if (file.size > maxSize) {
      mediaStore.error = `File "${file.name}" is too large. Maximum size is ${maxSizeMB}MB for ${isVideo ? 'videos' : 'images'}.`
      continue
    }

    try {
      await mediaStore.uploadMedia(file)
    } catch {
      // Error handled in store
    }
  }

  // Refresh media list to show newly uploaded items
  await loadMedia({ reset: true })

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const openPreviewModal = async (media: MediaListItem, event: Event) => {
  event.stopPropagation() // Prevent selection toggle
  mediaToPreview.value = media
  showPreviewModal.value = true

  // Fetch full media details for original_url
  isLoadingPreview.value = true
  try {
    await mediaStore.fetchMediaById(media.id)
  } catch {
    // Error handled in store
  } finally {
    isLoadingPreview.value = false
  }
}

const closePreviewModal = () => {
  showPreviewModal.value = false
  mediaToPreview.value = null
  mediaStore.currentMedia = null
}

</script>

<template>
  <div class="create-post-page">
    <div class="page-header">
      <h1>{{ isEditMode ? 'Edit Post' : 'Create Post' }}</h1>
      <p>{{ isEditMode ? 'Update your post content and settings' : 'Compose and schedule your social media content' }}</p>
    </div>

    <!-- Loading state for edit mode -->
    <div v-if="isLoadingPost" class="loading-state">
      <div class="spinner"></div>
    </div>

    <!-- Template loaded notice (only show in create mode) -->
    <div v-if="loadedFromTemplate && !isEditMode" class="template-notice card">
      <div class="template-notice-content">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <div class="template-notice-text">
          <span class="template-notice-title">Loaded from template</span>
          <span v-if="templateMediaMissing.length === 0" class="template-notice-sub">Content copied from previous post. Make any changes and save as draft.</span>
          <span v-else class="template-notice-sub template-notice-warning">
            {{ templateMediaMissing.length }} media file{{ templateMediaMissing.length !== 1 ? 's were' : ' was' }} not found: {{ templateMediaMissing.join(', ') }}
          </span>
        </div>
      </div>
      <button type="button" class="template-notice-dismiss" @click="loadedFromTemplate = false" title="Dismiss">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <form v-if="!isLoadingPost" @submit.prevent="handleSubmit" class="create-form">
      <!-- Account selection (FIRST) -->
      <div class="form-section card">
        <div class="section-label">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Select Accounts
          <span v-if="selectedAccountIds.length > 0" class="selection-count">{{ selectedAccountIds.length }} selected</span>
        </div>
        <!-- Media compatibility notice -->
        <div v-if="selectedMediaCounts.total > 0" class="media-notice">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Selected: {{ selectedMediaCounts.images }} image{{ selectedMediaCounts.images !== 1 ? 's' : '' }}{{ selectedMediaCounts.videos > 0 ? `, ${selectedMediaCounts.videos} video${selectedMediaCounts.videos !== 1 ? 's' : ''}` : '' }}.
            Some platforms may be unavailable based on media limits.
          </span>
        </div>

        <div v-if="socialAccountsStore.isLoading && availableAccounts.length === 0" class="loading-state-sm">
          <div class="spinner"></div>
        </div>

        <div v-else-if="availableAccounts.length === 0" class="empty-inline">
          <p>No accounts connected.</p>
          <RouterLink to="/app/accounts" class="link-accent">Connect accounts</RouterLink>
        </div>

        <div v-else class="accounts-grid">
          <div
            v-for="account in availableAccounts"
            :key="account.id"
            @click="toggleAccount(account.id)"
            :class="[
              'account-item',
              {
                selected: selectedAccountIds.includes(account.id),
                disabled: accountCompatibility[account.id]?.compatible === false
              }
            ]"
            :title="accountCompatibility[account.id]?.reason || ''"
          >
            <PlatformIcon :platform="account.platform" size="md" />
            <div class="account-info">
              <p class="account-username">{{ account.username }}</p>
              <p class="account-platform">{{ account.platform }}</p>
            </div>
            <div v-if="accountCompatibility[account.id]?.compatible === false" class="incompatible-indicator" :title="accountCompatibility[account.id]?.reason || ''">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span class="incompatible-tooltip">{{ accountCompatibility[account.id]?.reason }}</span>
            </div>
            <div v-else class="check-indicator">
              <svg v-if="selectedAccountIds.includes(account.id)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Caption (SECOND) -->
      <div class="form-section card">
        <div class="section-label">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Caption
        </div>
        <textarea
          v-model="caption"
          rows="4"
          class="form-input form-textarea"
          placeholder="What do you want to say? Include #hashtags to extract them."
        ></textarea>
        <div class="caption-footer">
          <p class="char-count">{{ caption.length }} characters</p>
          <button
            type="button"
            class="btn-extract"
            :disabled="!hasExtractableHashtags"
            @click="extractHashtagsFromCaption"
            title="Extract #hashtags from caption and move to Hashtags section"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            Extract Hashtags
          </button>
        </div>
      </div>

      <!-- Hashtags -->
      <div class="form-section card">
        <div class="section-label">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          Hashtags
          <span v-if="hashtags.length > 0" class="selection-count">{{ hashtags.length }} tags</span>
        </div>
        <HashtagInput v-model="hashtags" v-model:save-to-library="saveHashtagsToLibrary" />
        <HashtagLimitWarnings
          :hashtags="hashtags"
          :platforms="selectedPlatforms"
        />
      </div>

      <!-- Media selection (THIRD) -->
      <div class="form-section card">
        <div class="section-label">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Select Media
          <span v-if="selectedMediaIds.length > 0" class="selection-count">{{ selectedMediaIds.length }} selected</span>
          <button type="button" @click="triggerFileInput" class="btn-add-media">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Media
          </button>
        </div>

        <!-- Hidden file input -->
        <input
          ref="fileInput"
          type="file"
          accept="image/*,video/*"
          multiple
          @change="handleFileSelect"
          style="display: none"
        />

        <!-- Upload progress -->
        <div v-if="mediaStore.isUploading" class="upload-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${mediaStore.uploadProgress}%` }"></div>
          </div>
          <span class="progress-text">Uploading... {{ mediaStore.uploadProgress }}%</span>
        </div>

        <!-- Filter toolbar -->
        <div v-if="mediaStore.items.length > 0" class="filter-toolbar">
          <div class="filter-count">
            {{ filteredMedia.length }} of {{ mediaStore.total }} items
          </div>
          <div class="filter-group">
            <span class="filter-label">Type:</span>
            <div class="filter-pills">
              <button
                type="button"
                :class="['filter-pill', { active: mediaTypeFilter === 'all' }]"
                @click="mediaTypeFilter = 'all'"
              >All</button>
              <button
                type="button"
                :class="['filter-pill', { active: mediaTypeFilter === 'image' }]"
                @click="mediaTypeFilter = 'image'"
              >Images</button>
              <button
                type="button"
                :class="['filter-pill', { active: mediaTypeFilter === 'video' }]"
                @click="mediaTypeFilter = 'video'"
              >Videos</button>
              <button
                type="button"
                :class="['filter-pill', { active: mediaTypeFilter === 'document' }]"
                @click="mediaTypeFilter = 'document'"
              >PDFs</button>
            </div>
          </div>

          <div class="filter-group">
            <span class="filter-label">Size:</span>
            <div class="filter-pills">
              <button
                type="button"
                :class="['filter-pill', { active: mediaSizeFilter === 'all' }]"
                @click="mediaSizeFilter = 'all'"
              >All</button>
              <button
                type="button"
                :class="['filter-pill', { active: mediaSizeFilter === 'small' }]"
                @click="mediaSizeFilter = 'small'"
              >&lt;1MB</button>
              <button
                type="button"
                :class="['filter-pill', { active: mediaSizeFilter === 'medium' }]"
                @click="mediaSizeFilter = 'medium'"
              >1-10MB</button>
              <button
                type="button"
                :class="['filter-pill', { active: mediaSizeFilter === 'large' }]"
                @click="mediaSizeFilter = 'large'"
              >&gt;10MB</button>
            </div>
          </div>

          <div class="filter-group">
            <span class="filter-label">Sort:</span>
            <div class="filter-pills">
              <button
                type="button"
                :class="['filter-pill', { active: mediaSortOrder === 'newest' }]"
                @click="mediaSortOrder = 'newest'"
              >Newest</button>
              <button
                type="button"
                :class="['filter-pill', { active: mediaSortOrder === 'oldest' }]"
                @click="mediaSortOrder = 'oldest'"
              >Oldest</button>
            </div>
          </div>
        </div>

        <!-- Full-area spinner only on the initial load; "Show more" keeps the grid visible -->
        <div v-if="mediaStore.isLoading && mediaStore.items.length === 0" class="loading-state-sm">
          <div class="spinner"></div>
        </div>

        <div v-else-if="mediaStore.items.length === 0" class="empty-inline">
          <p>No media uploaded yet.</p>
          <button type="button" @click="triggerFileInput" class="link-accent">Upload media</button>
        </div>

        <div v-else-if="filteredMedia.length === 0 && processingMedia.length === 0" class="empty-inline">
          <p>No media matches the current filters.</p>
          <button type="button" @click="mediaTypeFilter = 'all'; mediaSizeFilter = 'all'" class="link-accent">Clear filters</button>
        </div>

        <div v-else ref="mediaScrollContainer" class="media-grid-container">
          <div class="media-grid">
            <!-- Processing media items (shown first as placeholders) -->
            <div
              v-for="media in processingMedia"
              :key="media.id"
              class="media-item processing"
            >
              <img :src="media.thumbnail_url || '/placeholder.png'" alt="" />
              <div class="processing-overlay">
                <div class="processing-spinner"></div>
                <span class="processing-text">Processing...</span>
              </div>
              <span class="media-type-badge">{{ media.type }}</span>
            </div>
            <!-- Ready media items -->
            <div
              v-for="media in filteredMedia"
              :key="media.id"
              @click="toggleMedia(media.id)"
              :class="['media-item', { selected: selectedMediaIds.includes(media.id) }]"
            >
            <img :src="media.thumbnail_url || '/placeholder.png'" alt="" />
            <div class="media-overlay">
              <div class="check-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <button
              type="button"
              class="preview-btn"
              @click="openPreviewModal(media, $event)"
              title="Preview"
            >
              <svg v-if="media.type === 'image'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              <svg v-else-if="media.type === 'document'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <span class="media-type-badge" :class="{ 'badge-pdf': media.type === 'document' }">{{ media.type === 'document' ? 'PDF' : media.type }}</span>
            </div>
          </div>
          <!-- Load older media: auto-loads on scroll, with an explicit button fallback -->
          <div v-if="mediaStore.hasMore" ref="loadMoreSentinel" class="media-load-more">
            <button
              type="button"
              class="btn-show-more"
              :disabled="mediaStore.isLoading"
              @click="loadMedia({ reset: false })"
            >
              {{ mediaStore.isLoading ? 'Loading…' : 'Show more' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Platform Settings (FOURTH) -->
      <div v-if="selectedAccountsData.length > 0" class="form-section card">
        <PlatformConfigSection
          :selected-accounts="selectedAccountsData"
          :selected-media="selectedMediaItems"
          :caption="caption"
          :hashtags="hashtags"
          v-model="platformConfigurations"
          @validation-change="handlePlatformValidation"
        />
      </div>

      <!-- Validation Errors -->
      <div v-if="!formValidation.valid && formValidation.errors.length > 0" class="validation-errors">
        <div v-for="error in formValidation.errors" :key="error" class="validation-error">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {{ error }}
        </div>
      </div>

      <!-- Submit -->
      <div class="form-actions">
        <RouterLink :to="isEditMode ? `/app/posts/${id}` : '/app/posts'" class="btn-secondary">
          Cancel
        </RouterLink>
        <div class="submit-btn-wrapper" :title="(!formValidation.valid || allPlatformErrors.length > 0) ? disabledButtonTooltip : ''">
          <button
            type="submit"
            :disabled="!formValidation.valid || postsStore.isLoading"
            class="btn-primary"
          >
            <svg v-if="!postsStore.isLoading" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="btn-icon">
              <path v-if="isEditMode" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ postsStore.isLoading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Draft') }}
          </button>
        </div>
      </div>
    </form>

    <!-- Preview Modal -->
    <Teleport to="body">
      <div v-if="showPreviewModal" class="preview-backdrop" @click="closePreviewModal">
        <button @click="closePreviewModal" class="preview-close">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Loading state -->
        <div v-if="isLoadingPreview" class="preview-loading">
          <div class="spinner"></div>
        </div>

        <div v-else class="preview-container" @click.stop>
          <!-- Image preview -->
          <img
            v-if="mediaToPreview?.type === 'image'"
            :src="mediaStore.currentMedia?.original_url || mediaToPreview?.thumbnail_url || '/placeholder.png'"
            alt=""
            class="preview-image"
          />
          <!-- Video preview -->
          <video
            v-else-if="mediaToPreview?.type === 'video' && mediaStore.currentMedia?.original_url"
            :src="mediaStore.currentMedia.original_url"
            controls
            autoplay
            playsinline
            class="preview-video"
          >
            Your browser does not support the video tag.
          </video>
          <!-- Video loading placeholder -->
          <div v-else-if="mediaToPreview?.type === 'video'" class="preview-video-placeholder">
            <div class="spinner"></div>
          </div>
          <!-- Document/PDF preview -->
          <iframe
            v-else-if="mediaToPreview?.type === 'document' && mediaStore.currentMedia?.original_url"
            :src="mediaStore.currentMedia.original_url"
            class="preview-document"
          ></iframe>
          <!-- Document info fallback -->
          <div v-else-if="mediaToPreview?.type === 'document'" class="preview-document-info">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>PDF Document</p>
            <a
              v-if="mediaStore.currentMedia?.original_url"
              :href="mediaStore.currentMedia.original_url"
              target="_blank"
              class="pdf-link"
            >Open in new tab</a>
          </div>
        </div>
        <div class="preview-info">
          <p class="preview-name">{{ mediaToPreview?.name }}</p>
          <p class="preview-meta">
            {{ mediaToPreview?.width }} × {{ mediaToPreview?.height }}
            <span v-if="mediaToPreview?.duration"> · {{ Math.round(mediaToPreview.duration) }}s</span>
          </p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.create-post-page {
  max-width: 800px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 4px;
}

.page-header p {
  font-size: 14px;
  color: var(--fg-2);
}

/* Template notice */
.template-notice {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  margin-bottom: 12px;
  background: var(--ink-1);
  border: 1px solid var(--line);
  border-left: 2px solid var(--signal);
}

.template-notice-content {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.template-notice-content > svg {
  width: 18px;
  height: 18px;
  color: var(--signal);
  flex-shrink: 0;
  margin-top: 2px;
}

.template-notice-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.template-notice-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.template-notice-sub {
  font-size: 13px;
  color: var(--fg-2);
}

.template-notice-warning {
  color: var(--signal);
}

.template-notice-dismiss {
  background: none;
  border: 1px solid transparent;
  padding: 4px;
  cursor: pointer;
  color: var(--fg-3);
  border-radius: var(--radius-sm);
  transition: background-color 0.15s, color 0.15s;
  flex-shrink: 0;
}

.template-notice-dismiss:hover {
  background: var(--ink-2);
  color: var(--text);
}

.template-notice-dismiss svg {
  width: 16px;
  height: 16px;
}

/* Form */
.create-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-section {
  padding: 16px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
  color: var(--fg-2);
}

.section-label svg {
  width: 16px;
  height: 16px;
  color: var(--fg-3);
}

.selection-count {
  margin-left: auto;
  padding: 2px 6px;
  border-radius: 2px;
  border: 1px solid rgba(242, 169, 59, 0.5);
  color: var(--signal);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
}

/* Media compatibility notice */
.media-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  margin-bottom: 12px;
  border-radius: var(--radius-sm);
  background: var(--ink-2);
  border: 1px solid var(--line);
  font-size: 12px;
  color: var(--fg-2);
}

.media-notice svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--cyan);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.caption-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  gap: 12px;
}

.char-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
}

.btn-extract {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--line-strong);
  color: var(--fg-2);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s, color 0.15s;
}

.btn-extract:hover:not(:disabled) {
  background: var(--ink-2);
  border-color: var(--fg-3);
  color: var(--text);
}

.btn-extract:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-extract svg {
  width: 14px;
  height: 14px;
}

/* Loading/Empty States */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 64px;
}

.loading-state-sm {
  display: flex;
  justify-content: center;
  padding: 24px;
}

.empty-inline {
  text-align: center;
  padding: 20px;
  color: var(--fg-3);
  font-size: 13px;
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius-sm);
}

.empty-inline .link-accent {
  display: block;
  margin: 6px auto 0;
  color: var(--signal);
}

.empty-inline button.link-accent {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: inherit;
}

.link-accent:hover {
  text-decoration: underline;
}

/* Media Grid */
.media-grid-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 1px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 8px;
}

@media (min-width: 600px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
  }
}

.media-load-more {
  display: flex;
  justify-content: center;
  padding: 12px 0 4px;
}

.btn-show-more {
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line-strong);
  background: var(--ink-1);
  color: var(--fg-2);
  font-family: var(--font-mono);
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s, color 0.15s;
}

.btn-show-more:hover:not(:disabled) {
  background: var(--ink-2);
  border-color: var(--fg-3);
  color: var(--text);
}

.btn-show-more:disabled {
  opacity: 0.6;
  cursor: default;
}

.media-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  background: var(--ink-2);
  border: 1px solid var(--line);
  transition: border-color 0.15s;
}

.media-item:hover {
  border-color: var(--line-strong);
}

.media-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-item.selected {
  border-color: var(--signal);
  outline: 1px solid var(--signal);
  outline-offset: -1px;
}

.media-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 6px;
  transition: background-color 0.15s;
}

.media-item.selected .media-overlay {
  background: rgba(242, 169, 59, 0.18);
}

.check-icon {
  width: 20px;
  height: 20px;
  border-radius: 2px;
  background: var(--signal);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
}

.media-item.selected .check-icon {
  opacity: 1;
}

.check-icon svg {
  width: 12px;
  height: 12px;
  color: var(--ink-0);
}

.media-type-badge {
  position: absolute;
  bottom: 6px;
  left: 6px;
  padding: 1px 5px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.7);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text);
}

.media-type-badge.badge-pdf {
  color: var(--error);
}

/* Processing media items */
.media-item.processing {
  cursor: not-allowed;
}

.media-item.processing img {
  opacity: 0.35;
}

.processing-overlay {
  position: absolute;
  inset: 0;
  background: rgba(12, 13, 15, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.processing-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--line-strong);
  border-top-color: var(--signal);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.processing-text {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--signal);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Accounts Grid */
.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
}

@media (max-width: 500px) {
  .accounts-grid {
    grid-template-columns: 1fr;
  }
}

.account-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--ink-0);
  border: 1px solid var(--line);
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}

.account-item:hover {
  border-color: var(--line-strong);
  background: var(--ink-2);
}

.account-item.selected {
  border-color: var(--signal);
  background: var(--signal-soft);
}

.account-info {
  flex: 1;
  min-width: 0;
}

.account-username {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-platform {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
  text-transform: lowercase;
}

.check-indicator {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  border: 1px solid var(--line-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.15s, border-color 0.15s;
}

.account-item.selected .check-indicator {
  background: var(--signal);
  border-color: var(--signal);
}

.check-indicator svg {
  width: 12px;
  height: 12px;
  color: var(--ink-0);
}

/* Disabled/Incompatible Account */
.account-item.disabled {
  opacity: 0.55;
  cursor: not-allowed;
  border-color: rgba(229, 103, 79, 0.35);
  background: var(--ink-0);
}

.account-item.disabled:hover {
  border-color: rgba(229, 103, 79, 0.6);
  background: var(--error-soft);
}

.incompatible-indicator {
  position: relative;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--error);
}

.incompatible-indicator svg {
  width: 14px;
  height: 14px;
}

.incompatible-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  background: var(--ink-3);
  border: 1px solid var(--line-strong);
  color: var(--text);
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s, visibility 0.15s;
  z-index: 10;
  pointer-events: none;
}

.account-item.disabled:hover .incompatible-tooltip {
  opacity: 1;
  visibility: visible;
}

/* Form Actions */
.validation-errors {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  background: var(--error-soft);
  border: 1px solid rgba(229, 103, 79, 0.45);
  border-radius: var(--radius-sm);
}

.validation-error {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #f2a594;
}

.validation-error svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--error);
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 4px;
}

.submit-btn-wrapper {
  display: inline-block;
  cursor: not-allowed;
}

.submit-btn-wrapper:has(button:not(:disabled)) {
  cursor: auto;
}

.submit-btn-wrapper button:disabled {
  pointer-events: none;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

/* Add Media Button */
.btn-add-media {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: var(--radius-sm);
  background: var(--ink-1);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
  border: 1px solid var(--line-strong);
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}

.btn-add-media:hover {
  background: var(--ink-2);
  border-color: var(--fg-3);
}

.btn-add-media svg {
  width: 14px;
  height: 14px;
  color: var(--signal);
}

/* Upload Progress */
.upload-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  margin-bottom: 12px;
  background: var(--ink-0);
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--ink-3);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--signal);
  transition: width 0.15s linear;
}

.progress-text {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--signal);
  white-space: nowrap;
}

/* Filter Toolbar */
.filter-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fg-3);
  white-space: nowrap;
}

.filter-pills {
  display: flex;
  gap: 4px;
}

.filter-pill {
  padding: 3px 8px;
  border-radius: 2px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--fg-2);
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s, color 0.15s;
}

.filter-pill:hover {
  border-color: var(--line-strong);
  color: var(--text);
}

.filter-pill.active {
  background: var(--signal-soft);
  border-color: var(--signal);
  color: var(--signal);
}

.filter-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
  margin-right: auto;
  align-self: center;
}

@media (max-width: 600px) {
  .filter-toolbar {
    flex-direction: column;
    gap: 10px;
  }

  .filter-group {
    flex-wrap: wrap;
  }

  .section-label {
    flex-wrap: wrap;
  }
}

/* Preview Button on Media Items */
.preview-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid var(--line-strong);
  color: var(--text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s, border-color 0.15s;
  z-index: 2;
}

.media-item:hover .preview-btn,
.preview-btn:focus-visible {
  opacity: 1;
}

.preview-btn:hover {
  border-color: var(--signal);
  color: var(--signal);
}

.preview-btn svg {
  width: 14px;
  height: 14px;
}

@media (hover: none) {
  .preview-btn {
    opacity: 1;
  }
}

/* Preview Modal */
.preview-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.preview-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--ink-1);
  border: 1px solid var(--line-strong);
  color: var(--text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s, border-color 0.15s;
  z-index: 10;
}

.preview-close:hover {
  background: var(--ink-2);
  border-color: var(--fg-3);
}

.preview-close svg {
  width: 18px;
  height: 18px;
}

.preview-container {
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: var(--radius-sm);
}

.preview-video {
  max-width: 100%;
  max-height: 80vh;
  border-radius: var(--radius-sm);
  background: black;
}

.preview-document {
  width: 100%;
  max-width: 800px;
  height: 80vh;
  border: none;
  border-radius: var(--radius-sm);
  background: white;
}

.preview-document-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  background: var(--ink-1);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-md);
}

.preview-document-info svg {
  width: 48px;
  height: 48px;
  color: var(--fg-3);
}

.preview-document-info p {
  font-size: 15px;
  color: var(--text);
}

.pdf-link {
  color: var(--signal);
  font-size: 14px;
}

.pdf-link:hover {
  text-decoration: underline;
}

.preview-info {
  margin-top: 14px;
  text-align: center;
}

.preview-name {
  font-size: 14px;
  color: var(--text);
  margin-bottom: 2px;
}

.preview-meta {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
}

.preview-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.preview-video-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(300px, 80vw);
  min-height: 200px;
  background: var(--ink-1);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
}
</style>
