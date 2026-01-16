<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
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

// Validation for TikTok direct posts - privacy level is required
const tiktokValidation = computed(() => {
  const hasTikTok = selectedPlatforms.value.includes('tiktok')
  if (!hasTikTok) return { valid: true, message: null }

  const tiktokConfig = platformConfigurations.value.tiktok
  const isDraft = tiktokConfig?.draft === true

  // Privacy level only required for direct posts, not drafts
  if (!isDraft && !tiktokConfig?.privacyLevel) {
    return {
      valid: false,
      message: 'TikTok requires you to select who can view your video for direct posts'
    }
  }

  return { valid: true, message: null }
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

  return {
    valid: errors.length === 0,
    errors
  }
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
  // Fetch all media items without status filter (matches MediaView behavior)
  await mediaStore.fetchMedia({ limit: 100 })
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
        const validAccountIds: string[] = []
        if (post.socialAccounts) {
          for (const account of post.socialAccounts) {
            const exists = availableAccounts.value.find(a => a.id === account.id)
            if (exists) {
              validAccountIds.push(account.id)
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
    const validAccountIds: string[] = []
    if (template.socialAccounts) {
      for (const account of template.socialAccounts) {
        const exists = availableAccounts.value.find(a => a.id === account.id)
        if (exists) {
          validAccountIds.push(account.id)
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
        socialAccountIds: selectedAccountIds.value,
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
        socialAccountIds: selectedAccountIds.value,
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
  await mediaStore.fetchMedia({ limit: 100 })

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

        <div v-if="socialAccountsStore.isLoading" class="loading-state-sm">
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
            {{ filteredMedia.length }} of {{ mediaStore.items.length }} items
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

        <div v-if="mediaStore.isLoading" class="loading-state-sm">
          <div class="spinner"></div>
        </div>

        <div v-else-if="mediaStore.items.length === 0" class="empty-inline">
          <p>No media uploaded yet.</p>
          <button type="button" @click="triggerFileInput" class="link-accent">Upload media</button>
        </div>

        <div v-else-if="filteredMedia.length === 0" class="empty-inline">
          <p>No media matches the current filters.</p>
          <button type="button" @click="mediaTypeFilter = 'all'; mediaSizeFilter = 'all'" class="link-accent">Clear filters</button>
        </div>

        <div v-else class="media-grid-container">
          <div class="media-grid">
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
  margin-bottom: 24px;
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

/* Template notice */
.template-notice {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 16px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.template-notice-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.template-notice-content > svg {
  width: 20px;
  height: 20px;
  color: #818cf8;
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
  color: var(--muted);
}

.template-notice-warning {
  color: #fbbf24;
}

.template-notice-dismiss {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--muted);
  border-radius: var(--radius-sm);
  transition: all 0.15s;
  flex-shrink: 0;
}

.template-notice-dismiss:hover {
  background: rgba(255, 255, 255, 0.1);
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
  gap: 16px;
}

.form-section {
  padding: 18px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 14px;
  color: var(--text);
}

.section-label svg {
  width: 18px;
  height: 18px;
  color: var(--muted);
}

.selection-count {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--accent-soft);
  color: #a5b4fc;
  font-size: 11px;
  font-weight: 500;
}

/* Media compatibility notice */
.media-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 14px;
  border-radius: var(--radius-md);
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  font-size: 12px;
  color: #93c5fd;
}

.media-notice svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.caption-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  gap: 12px;
}

.char-count {
  font-size: 11px;
  color: var(--muted);
}

.btn-extract {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  background: var(--accent-soft);
  border: 1px solid rgba(79, 70, 229, 0.3);
  color: #c7d2fe;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-extract:hover:not(:disabled) {
  background: rgba(79, 70, 229, 0.25);
  border-color: rgba(79, 70, 229, 0.5);
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
  padding: 24px;
  color: var(--muted);
  font-size: 13px;
}

.empty-inline .link-accent {
  display: block;
  margin-top: 6px;
  color: var(--accent-light);
}

.link-accent:hover {
  text-decoration: underline;
}

/* Media Grid */
.media-grid-container {
  max-height: 400px;
  overflow-y: auto;
  border-radius: var(--radius-md);
  padding: 2px;
}

.media-grid-container::-webkit-scrollbar {
  width: 8px;
}

.media-grid-container::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.4);
  border-radius: 4px;
}

.media-grid-container::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 4px;
}

.media-grid-container::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}

@media (min-width: 600px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

.media-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.15s;
}

.media-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-item.selected {
  border-color: var(--accent);
}

.media-overlay {
  position: absolute;
  inset: 0;
  background: rgba(79, 70, 229, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.media-item.selected .media-overlay {
  background: rgba(79, 70, 229, 0.3);
}

.check-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.15s;
}

.media-item.selected .check-icon {
  opacity: 1;
  transform: scale(1);
}

.check-icon svg {
  width: 16px;
  height: 16px;
  color: white;
}

.media-type-badge {
  position: absolute;
  bottom: 6px;
  left: 6px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.6);
  font-size: 10px;
  text-transform: uppercase;
  color: white;
}

.media-type-badge.badge-pdf {
  background: rgba(239, 68, 68, 0.8);
}

/* Accounts Grid */
.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

@media (max-width: 500px) {
  .accounts-grid {
    grid-template-columns: 1fr;
  }
}

.account-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  background: rgba(15, 23, 42, 0.6);
  border: 2px solid var(--border);
  cursor: pointer;
  transition: all 0.15s;
}

.account-item:hover {
  border-color: var(--border-hover);
  background: rgba(15, 23, 42, 0.8);
}

.account-item.selected {
  border-color: var(--accent);
  background: rgba(79, 70, 229, 0.1);
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
  font-size: 11px;
  color: var(--muted);
  text-transform: capitalize;
}

.check-indicator {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}

.account-item.selected .check-indicator {
  background: var(--accent);
  border-color: var(--accent);
}

.check-indicator svg {
  width: 12px;
  height: 12px;
  color: white;
}

/* Disabled/Incompatible Account */
.account-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.account-item.disabled:hover {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.1);
}

.incompatible-indicator {
  position: relative;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  background: rgba(239, 68, 68, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fca5a5;
}

.incompatible-indicator svg {
  width: 14px;
  height: 14px;
}

.incompatible-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transform: translateY(4px);
  transition: all 0.15s;
  z-index: 10;
  pointer-events: none;
}

.incompatible-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 8px;
  border: 6px solid transparent;
  border-top-color: rgba(15, 23, 42, 0.95);
}

.account-item.disabled:hover .incompatible-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

/* Form Actions */
.validation-errors {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-md);
}

.validation-error {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #f87171;
}

.validation-error svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 8px;
}

.btn-icon {
  width: 18px;
  height: 18px;
}

/* Add Media Button */
.btn-add-media {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: var(--accent);
  color: white;
  font-size: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-add-media:hover {
  background: var(--accent-hover);
}

.btn-add-media svg {
  width: 14px;
  height: 14px;
}

/* Upload Progress */
.upload-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 12px;
  background: rgba(79, 70, 229, 0.1);
  border-radius: var(--radius-md);
  border: 1px solid var(--accent-soft);
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(148, 163, 184, 0.2);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
}

/* Filter Toolbar */
.filter-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
}

.filter-pills {
  display: flex;
  gap: 4px;
}

.filter-pill {
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border);
  color: var(--muted);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-pill:hover {
  border-color: var(--border-hover);
  color: var(--text);
}

.filter-pill.active {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: #a5b4fc;
}

.filter-count {
  font-size: 12px;
  color: var(--muted);
  margin-right: auto;
}

/* Empty inline button style */
.empty-inline button.link-accent {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: inherit;
}

@media (max-width: 600px) {
  .filter-toolbar {
    flex-direction: column;
    gap: 12px;
  }

  .filter-group {
    flex-wrap: wrap;
  }

  .btn-add-media {
    position: static;
    margin-top: 8px;
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
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.15s;
  z-index: 2;
}

.media-item:hover .preview-btn {
  opacity: 1;
}

.preview-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.preview-btn svg {
  width: 16px;
  height: 16px;
}

/* Preview Modal */
.preview-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
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
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  z-index: 10;
}

.preview-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.preview-close svg {
  width: 24px;
  height: 24px;
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
  border-radius: var(--radius-md);
}

.preview-video {
  max-width: 100%;
  max-height: 80vh;
  border-radius: var(--radius-md);
  background: black;
}

.preview-document {
  width: 100%;
  max-width: 800px;
  height: 80vh;
  border: none;
  border-radius: var(--radius-md);
  background: white;
}

.preview-document-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.preview-document-info svg {
  width: 64px;
  height: 64px;
  color: var(--muted);
}

.preview-document-info p {
  font-size: 16px;
  color: var(--text);
}

.pdf-link {
  color: var(--accent);
  text-decoration: none;
  font-size: 14px;
}

.pdf-link:hover {
  text-decoration: underline;
}

.preview-info {
  margin-top: 16px;
  text-align: center;
}

.preview-name {
  font-size: 14px;
  color: white;
  margin-bottom: 4px;
}

.preview-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
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
  min-width: 300px;
  min-height: 200px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: var(--radius-md);
}
</style>
