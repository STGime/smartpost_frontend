<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue'
import { useMediaStore } from '@/stores'
import type { MediaListItem, MediaVariant } from '@/types'

// File size limits (must match backend)
const MAX_IMAGE_SIZE_MB = 20
const MAX_VIDEO_SIZE_MB = 20
const MAX_AUDIO_SIZE_MB = 50
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024
const MAX_AUDIO_SIZE_BYTES = MAX_AUDIO_SIZE_MB * 1024 * 1024

const mediaStore = useMediaStore()
const fileInput = ref<HTMLInputElement | null>(null)
const showDeleteModal = ref(false)
const mediaToDelete = ref<MediaListItem | null>(null)
const isDeleting = ref(false)
const showPreviewModal = ref(false)
const mediaToPreview = ref<MediaListItem | null>(null)
const isLoadingPreview = ref(false)
const isLoadingMore = ref(false)
const copiedId = ref(false)

// Multi-select for bulk delete
const selectedIds = ref<Set<string>>(new Set())
const showBulkDeleteModal = ref(false)
const isBulkDeleting = ref(false)

function formatDate(iso?: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function copyMediaId(id?: string) {
  if (!id) return
  try {
    await navigator.clipboard.writeText(id)
    copiedId.value = true
    setTimeout(() => (copiedId.value = false), 1500)
  } catch {
    // Clipboard unavailable (e.g. insecure context) — ignore.
  }
}

// Filters
const mediaTypeFilter = ref<'all' | 'image' | 'video' | 'document' | 'audio'>('all')
const mediaSizeFilter = ref<'all' | 'small' | 'medium' | 'large'>('all')
const mediaSortOrder = ref<'newest' | 'oldest'>('newest')

const pageSize = 48

// Filtered and sorted media
const filteredMedia = computed(() => {
  let items = [...mediaStore.items]

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

// ── Selection ──────────────────────────────────────────────────────────────
const selectedCount = computed(() => selectedIds.value.size)
const isSelectionMode = computed(() => selectedIds.value.size > 0)
const allFilteredSelected = computed(
  () =>
    filteredMedia.value.length > 0 &&
    filteredMedia.value.every((m) => selectedIds.value.has(m.id))
)

function isSelected(id: string): boolean {
  return selectedIds.value.has(id)
}

function toggleSelect(media: MediaListItem) {
  const next = new Set(selectedIds.value)
  if (next.has(media.id)) next.delete(media.id)
  else next.add(media.id)
  selectedIds.value = next
}

function toggleSelectAll() {
  if (allFilteredSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(filteredMedia.value.map((m) => m.id))
  }
}

function clearSelection() {
  selectedIds.value = new Set()
}

// Clicking a tile opens the preview normally, but once a selection is active it
// toggles selection instead — standard multi-select behaviour.
function onItemClick(media: MediaListItem) {
  if (isSelectionMode.value) {
    toggleSelect(media)
  } else {
    openPreviewModal(media)
  }
}

const loadMore = async () => {
  isLoadingMore.value = true
  try {
    await mediaStore.fetchMedia({
      limit: pageSize,
      offset: mediaStore.items.length
    })
  } finally {
    isLoadingMore.value = false
  }
}

onMounted(() => {
  mediaStore.fetchMedia({ limit: pageSize })
})

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files?.length) return

  for (const file of Array.from(files)) {
    // Validate file size before uploading
    const isVideo = file.type.startsWith('video/')
    const isAudio = file.type.startsWith('audio/')
    const maxSize = isVideo ? MAX_VIDEO_SIZE_BYTES : isAudio ? MAX_AUDIO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES
    const maxSizeMB = isVideo ? MAX_VIDEO_SIZE_MB : isAudio ? MAX_AUDIO_SIZE_MB : MAX_IMAGE_SIZE_MB
    const kind = isVideo ? 'videos' : isAudio ? 'audio' : 'images'

    if (file.size > maxSize) {
      mediaStore.error = `File "${file.name}" is too large. Maximum size is ${maxSizeMB}MB for ${kind}.`
      continue
    }

    try {
      await mediaStore.uploadMedia(file)
    } catch {
      // Error handled in store
    }
  }

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const openDeleteModal = (media: MediaListItem) => {
  mediaToDelete.value = media
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  mediaToDelete.value = null
}

const confirmDelete = async () => {
  if (!mediaToDelete.value) return

  isDeleting.value = true
  try {
    await mediaStore.deleteMedia(mediaToDelete.value.id)
    closeDeleteModal()
  } catch {
    // Error handled in store
  } finally {
    isDeleting.value = false
  }
}

// Download a single media item's original file. The signed GCS URL opens inline
// in the browser, so we blob-fetch it to force a real download with the original
// filename — falling back to opening the URL in a new tab if CORS blocks fetch.
const downloadingId = ref<string | null>(null)
const downloadMedia = async (media: MediaListItem) => {
  if (downloadingId.value) return
  downloadingId.value = media.id
  try {
    const url = await mediaStore.fetchOriginalUrl(media.id)
    if (!url) return

    let objectUrl: string | null = null
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('fetch failed')
      const blob = await res.blob()
      objectUrl = URL.createObjectURL(blob)
    } catch {
      objectUrl = null // CORS / network — fall back to opening the signed URL
    }

    const a = document.createElement('a')
    a.href = objectUrl || url
    a.download = media.name || 'download'
    if (!objectUrl) a.target = '_blank'
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
    if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl!), 10_000)
  } finally {
    downloadingId.value = null
  }
}

const openBulkDeleteModal = () => {
  if (selectedIds.value.size === 0) return
  showBulkDeleteModal.value = true
}

const closeBulkDeleteModal = () => {
  showBulkDeleteModal.value = false
}

const confirmBulkDelete = async () => {
  if (selectedIds.value.size === 0) return

  isBulkDeleting.value = true
  try {
    const ids = Array.from(selectedIds.value)
    await mediaStore.deleteMediaBulk(ids)
    // Keep only ids that still exist (i.e. failed deletes) selected for retry.
    const stillPresent = new Set(mediaStore.items.map((m) => m.id))
    selectedIds.value = new Set(ids.filter((id) => stillPresent.has(id)))
    if (selectedIds.value.size === 0) closeBulkDeleteModal()
  } catch {
    // Error handled in store
  } finally {
    isBulkDeleting.value = false
  }
}

// --- Variant carousel ---
// Lets the user step through each cropped aspect ratio the backend already
// generated. `null` = showing original; otherwise the (string) variant id of
// the first variant in that aspect-ratio bucket.
const selectedVariantId = ref<string | null>(null)

interface VariantSlide {
  id: string | null // null = original
  url: string
  aspectRatio: string // 'Original' | '9:16' | '1:1' | ...
  platforms: string[] // ['Tiktok', 'Instagram Reels', ...] (empty for original)
  width: number | null
  height: number | null
}

// Brand-case overrides for the per-platform labels — naive title-case turns
// 'tiktok' into "Tiktok" etc., which doesn't match the platforms' own casing.
const PLATFORM_BRAND_CASE: Record<string, string> = {
  tiktok: 'TikTok',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  bluesky: 'Bluesky',
}

function prettifyPlatform(slug: string): string {
  // 'instagram_feed_square' → 'Instagram Feed Square'
  // 'tiktok'                → 'TikTok'  (via brand-case map)
  return slug
    .split('_')
    .map((w) => PLATFORM_BRAND_CASE[w] ?? w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// One slide per unique aspect_ratio. The backend stores one variant per
// (platform, aspect_ratio) tuple — ~22 rows for a fully-processed image —
// but most of those are visually identical (e.g. 7 different "1:1" variants
// for Instagram/Facebook/LinkedIn/Twitter/Bluesky/Pinterest/Threads square).
// Collapse them into one slide per aspect and list the platforms in the label.
const carouselSlides = computed<VariantSlide[]>(() => {
  const media = mediaStore.currentMedia
  if (!media || media.type !== 'image' || !media.original_url) return []
  const slides: VariantSlide[] = [
    {
      id: null,
      url: media.original_url,
      aspectRatio: 'Original',
      platforms: [],
      width: media.width,
      height: media.height,
    },
  ]
  const byAspect = new Map<string, VariantSlide>()
  for (const v of (media.variants ?? []) as MediaVariant[]) {
    const existing = byAspect.get(v.aspect_ratio)
    if (existing) {
      existing.platforms.push(prettifyPlatform(v.platform))
    } else {
      const slide: VariantSlide = {
        id: v.id,
        url: v.url,
        aspectRatio: v.aspect_ratio,
        platforms: [prettifyPlatform(v.platform)],
        width: v.width,
        height: v.height,
      }
      byAspect.set(v.aspect_ratio, slide)
      slides.push(slide)
    }
  }
  return slides
})

const selectedSlide = computed<VariantSlide | undefined>(() => {
  const slides = carouselSlides.value
  return (
    slides.find((s) => s.id === selectedVariantId.value) ?? slides[0]
  )
})

function stepVariant(delta: 1 | -1): void {
  const slides = carouselSlides.value
  if (slides.length <= 1) return
  const i = slides.findIndex((s) => s.id === selectedVariantId.value)
  const next = slides[(i + delta + slides.length) % slides.length]
  if (next) selectedVariantId.value = next.id
}

// Reset to "Original" whenever the modal opens on a new media item.
watch(
  () => mediaStore.currentMedia?.id,
  () => {
    selectedVariantId.value = null
  },
)

// Keep the active thumb visible when stepping with arrow keys — without this
// the active thumb can sit off-screen in the horizontally-scrollable strip.
const thumbStripEl = ref<HTMLDivElement | null>(null)
watch(
  () => selectedSlide.value?.id ?? 'original',
  async (key) => {
    await nextTick()
    const strip = thumbStripEl.value
    if (!strip) return
    const active = strip.querySelector<HTMLElement>(
      `[data-slide-key="${CSS.escape(String(key))}"]`,
    )
    active?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' })
  },
)

// Esc closes; Left/Right step. Only bound while the modal is open.
function onModalKeydown(e: KeyboardEvent): void {
  if (!showPreviewModal.value) return
  if (e.key === 'Escape') {
    closePreviewModal()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    stepVariant(-1)
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    stepVariant(1)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onModalKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onModalKeydown)
})

const openPreviewModal = async (media: MediaListItem) => {
  mediaToPreview.value = media
  showPreviewModal.value = true
  selectedVariantId.value = null

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
  selectedVariantId.value = null
}
</script>

<template>
  <div class="media-page">
    <div class="page-header">
      <div>
        <h1>Media Library</h1>
        <p>Upload and manage your images, videos, and audio</p>
        <p class="size-limit-info">Maximum file size: {{ MAX_IMAGE_SIZE_MB }}MB for images, {{ MAX_VIDEO_SIZE_MB }}MB for videos, {{ MAX_AUDIO_SIZE_MB }}MB for audio</p>
      </div>
      <div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*,video/*,audio/*"
          multiple
          class="hidden"
          @change="handleFileSelect"
        />
        <button
          @click="fileInput?.click()"
          :disabled="mediaStore.isUploading"
          class="btn-primary"
        >
          <svg v-if="!mediaStore.isUploading" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="btn-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {{ mediaStore.isUploading ? 'Uploading...' : 'Upload Media' }}
        </button>
      </div>
    </div>

    <!-- Upload progress -->
    <div v-if="mediaStore.isUploading" class="upload-progress card">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${mediaStore.uploadProgress}%` }"></div>
      </div>
      <span class="progress-text">{{ mediaStore.uploadProgress }}%</span>
    </div>

    <div v-if="mediaStore.error" class="alert-error">
      {{ mediaStore.error }}
    </div>

    <!-- Filter toolbar -->
    <div v-if="mediaStore.items.length > 0" class="filter-toolbar card">
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
          <button
            type="button"
            :class="['filter-pill', { active: mediaTypeFilter === 'audio' }]"
            @click="mediaTypeFilter = 'audio'"
          >Audio</button>
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

      <div class="filter-count">
        {{ filteredMedia.length }} of {{ mediaStore.items.length }} items
      </div>
    </div>

    <!-- Bulk selection action bar -->
    <div v-if="isSelectionMode" class="selection-bar card">
      <span class="selection-count">{{ selectedCount }} selected</span>
      <button type="button" class="selection-link" @click="toggleSelectAll">
        {{ allFilteredSelected ? 'Deselect all' : 'Select all' }}
      </button>
      <button type="button" class="selection-link" @click="clearSelection">Clear</button>
      <button type="button" class="btn-danger selection-delete" @click="openBulkDeleteModal">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="btn-icon-sm">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete selected
      </button>
    </div>

    <div v-if="mediaStore.isLoading && mediaStore.items.length === 0" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else-if="!mediaStore.isLoading && mediaStore.items.length === 0" class="empty-state card">
      <div class="empty-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p class="empty-title">No media uploaded yet</p>
      <p class="empty-sub">Upload images and videos to use in your posts</p>
      <button @click="fileInput?.click()" class="btn-primary">Upload your first media</button>
    </div>

    <div v-else-if="filteredMedia.length === 0" class="empty-state card">
      <div class="empty-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <p class="empty-title">No media matches your filters</p>
      <p class="empty-sub">Try adjusting your filter criteria</p>
      <button @click="mediaTypeFilter = 'all'; mediaSizeFilter = 'all'" class="btn-secondary">
        Clear Filters
      </button>
    </div>

    <div v-else class="media-grid">
      <div
        v-for="media in filteredMedia"
        :key="media.id"
        class="media-item"
        :class="{ selected: isSelected(media.id) }"
        @click="onItemClick(media)"
      >
        <img v-if="media.type !== 'audio'" :src="media.thumbnail_url || '/placeholder.png'" alt="" />
        <div v-else class="media-audio-tile">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l11-2v13M9 19a2 2 0 11-4 0 2 2 0 014 0zm11-2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>

        <!-- Selection checkbox in top left -->
        <button
          type="button"
          class="select-checkbox"
          :class="{ checked: isSelected(media.id) }"
          :aria-pressed="isSelected(media.id)"
          :title="isSelected(media.id) ? 'Deselect' : 'Select'"
          @click.stop="toggleSelect(media)"
        >
          <svg v-if="isSelected(media.id)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </button>

        <!-- Action buttons in top right -->
        <div class="media-actions">
          <button
            type="button"
            class="action-btn download-btn"
            :disabled="downloadingId === media.id"
            title="Download"
            @click.stop="downloadMedia(media)"
          >
            <div v-if="downloadingId === media.id" class="spinner spinner-xs"></div>
            <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button type="button" class="action-btn delete-btn" title="Delete" @click.stop="openDeleteModal(media)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="media-type" :class="{ 'media-type-pdf': media.type === 'document' }">
          <svg v-if="media.type === 'video'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="media.type === 'document'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <svg v-else-if="media.type === 'audio'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l11-2v13M9 19a2 2 0 11-4 0 2 2 0 014 0zm11-2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div v-if="media.processing_status === 'processing'" class="media-processing">
          <div class="spinner spinner-sm"></div>
          <span class="processing-text">Creating variants...</span>
        </div>
      </div>
    </div>

    <!-- Load More -->
    <div v-if="mediaStore.hasMore" class="load-more">
      <button
        class="load-more-btn"
        :disabled="isLoadingMore"
        @click="loadMore"
      >
        <div v-if="isLoadingMore" class="spinner spinner-sm"></div>
        <span v-else>Load More</span>
      </button>
      <span class="load-more-info">
        Showing {{ mediaStore.items.length }} of {{ mediaStore.total }} items
      </span>
    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-backdrop" @click="closeDeleteModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Delete Media</h3>
            <button @click="closeDeleteModal" class="modal-close">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="delete-preview">
              <img :src="mediaToDelete?.thumbnail_url || '/placeholder.png'" alt="" />
            </div>
            <p class="delete-message">
              Are you sure you want to delete <strong>{{ mediaToDelete?.name }}</strong>?
            </p>
            <p class="delete-warning">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button @click="closeDeleteModal" class="btn-secondary" :disabled="isDeleting">
              Cancel
            </button>
            <button @click="confirmDelete" class="btn-danger" :disabled="isDeleting">
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Bulk Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showBulkDeleteModal" class="modal-backdrop" @click="closeBulkDeleteModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Delete {{ selectedCount }} item{{ selectedCount === 1 ? '' : 's' }}</h3>
            <button @click="closeBulkDeleteModal" class="modal-close">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="delete-message">
              Are you sure you want to delete
              <strong>{{ selectedCount }}</strong> selected
              item{{ selectedCount === 1 ? '' : 's' }}?
            </p>
            <p class="delete-warning">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button @click="closeBulkDeleteModal" class="btn-secondary" :disabled="isBulkDeleting">
              Cancel
            </button>
            <button @click="confirmBulkDelete" class="btn-danger" :disabled="isBulkDeleting">
              {{ isBulkDeleting ? 'Deleting...' : `Delete ${selectedCount}` }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

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

        <div
          v-else
          class="preview-container"
          :class="{ 'preview-container-doc': mediaToPreview?.type === 'document' }"
          @click.stop
        >
          <!-- Image preview (swappable via the variant carousel below) -->
          <img
            v-if="mediaToPreview?.type === 'image'"
            :key="selectedSlide?.id ?? 'original'"
            :src="selectedSlide?.url || mediaToPreview?.thumbnail_url || '/placeholder.png'"
            :alt="mediaToPreview?.name ? `${mediaToPreview.name} — ${selectedSlide?.aspectRatio ?? 'Original'}` : ''"
            class="preview-image"
            @error="selectedVariantId = null"
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
          <!-- Audio preview -->
          <div
            v-else-if="mediaToPreview?.type === 'audio' && mediaStore.currentMedia?.original_url"
            class="preview-audio"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l11-2v13M9 19a2 2 0 11-4 0 2 2 0 014 0zm11-2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <audio :src="mediaStore.currentMedia.original_url" controls autoplay class="preview-audio-player">
              Your browser does not support the audio element.
            </audio>
          </div>
          <!-- Audio loading placeholder -->
          <div v-else-if="mediaToPreview?.type === 'audio'" class="preview-audio">
            <div class="spinner"></div>
          </div>
        </div>

        <!-- Variant carousel: only for images that already have variants. -->
        <div
          v-if="mediaToPreview?.type === 'image' && carouselSlides.length > 1"
          class="variant-carousel"
          @click.stop
        >
          <div class="variant-meta">
            <span class="variant-aspect">{{ selectedSlide?.aspectRatio }}</span>
            <span
              v-if="selectedSlide?.platforms?.length"
              class="variant-platforms"
              :title="selectedSlide?.platforms?.join(' · ')"
            >{{ selectedSlide?.platforms?.join(' · ') }}</span>
            <span
              v-if="selectedSlide?.width && selectedSlide?.height"
              class="variant-dims"
            >{{ selectedSlide.width }} × {{ selectedSlide.height }}</span>
          </div>

          <div class="variant-strip-row">
            <button
              class="variant-nav"
              type="button"
              aria-label="Previous variant"
              @click="stepVariant(-1)"
            >‹</button>
            <div ref="thumbStripEl" class="variant-thumbs">
              <button
                v-for="slide in carouselSlides"
                :key="slide.id ?? 'original'"
                type="button"
                :data-slide-key="slide.id ?? 'original'"
                :class="['variant-thumb', { 'variant-thumb-active': slide.id === (selectedSlide?.id ?? null) }]"
                :aria-pressed="slide.id === (selectedSlide?.id ?? null)"
                :title="slide.platforms.length ? `${slide.aspectRatio} — ${slide.platforms.join(' · ')}` : slide.aspectRatio"
                @click="selectedVariantId = slide.id"
              >
                <img :src="slide.url" :alt="slide.aspectRatio" loading="lazy" />
                <span class="variant-thumb-label">{{ slide.aspectRatio }}</span>
              </button>
            </div>
            <button
              class="variant-nav"
              type="button"
              aria-label="Next variant"
              @click="stepVariant(1)"
            >›</button>
          </div>
        </div>

        <div class="preview-info">
          <p class="preview-name">{{ mediaToPreview?.name }}</p>
          <p class="preview-meta">
            {{ mediaToPreview?.width }} × {{ mediaToPreview?.height }}
            <span v-if="mediaToPreview?.duration"> · {{ Math.round(mediaToPreview.duration) }}s</span>
            <span v-if="mediaToPreview?.created_at"> · {{ formatDate(mediaToPreview.created_at) }}</span>
          </p>
          <button
            v-if="mediaToPreview?.id"
            type="button"
            class="preview-id"
            :title="copiedId ? 'Copied!' : 'Click to copy media ID'"
            @click="copyMediaId(mediaToPreview.id)"
          >
            <span class="preview-id-label">ID</span>
            <code>{{ mediaToPreview.id }}</code>
            <span class="preview-id-copy">{{ copiedId ? '✓ Copied' : 'Copy' }}</span>
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.media-page {
  max-width: 1200px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-bottom: 4px;
}

.page-header p {
  font-size: 14px;
  color: var(--fg-2);
}

.size-limit-info {
  font-family: var(--font-mono);
  font-size: 11px !important;
  color: var(--fg-3) !important;
  margin-top: 4px;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.hidden {
  display: none;
}

/* Upload Progress */
.upload-progress {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
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
  font-size: 12px;
  color: var(--fg-2);
  min-width: 40px;
  text-align: right;
}

/* Filter Toolbar */
.filter-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  padding: 12px 14px;
  margin-bottom: 16px;
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
  flex-wrap: wrap;
  gap: 4px;
}

.filter-pill {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--line);
  color: var(--fg-2);
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s, background-color 0.12s;
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
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
}

@media (max-width: 600px) {
  .filter-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .filter-group {
    flex-wrap: wrap;
  }

  .filter-count {
    margin-left: 0;
  }
}

/* Loading State */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 64px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  margin: 0 auto 12px;
  display: flex;
  justify-content: center;
  color: var(--fg-3);
}

.empty-icon svg {
  width: 28px;
  height: 28px;
}

.empty-title {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
}

.empty-sub {
  font-size: 13px;
  color: var(--fg-2);
  margin-bottom: 20px;
}

/* Media Grid: flat thumbnails */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

@media (min-width: 768px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}

.media-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--ink-2);
  border: 1px solid var(--line);
  cursor: pointer;
  transition: border-color 0.12s;
}

.media-item:hover {
  border-color: var(--line-strong);
}

.media-item.selected {
  border-color: var(--signal);
  outline: 2px solid var(--signal);
  outline-offset: -1px;
}

.media-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Audio items have no thumbnail: centered sound icon on a flat tile */
.media-audio-tile {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ink-2);
}

.media-audio-tile svg {
  width: 36%;
  height: 36%;
  color: var(--fg-3);
}

/* Action cluster (download + delete) in the top-right */
.media-actions {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.12s;
  z-index: 2;
}

.media-item:hover .media-actions {
  opacity: 1;
}

.action-btn {
  width: 26px;
  height: 26px;
  padding: 0;
  border-radius: var(--radius-sm);
  background: rgba(12, 13, 15, 0.85);
  border: 1px solid var(--line-strong);
  color: var(--text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.12s, border-color 0.12s, background-color 0.12s;
}

.action-btn svg {
  width: 13px;
  height: 13px;
}

.download-btn:hover:not(:disabled) {
  border-color: var(--signal);
  color: var(--signal);
}

.download-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.delete-btn:hover {
  border-color: var(--error);
  color: var(--error);
}

/* Selection checkbox in the top-left */
.select-checkbox {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 20px;
  height: 20px;
  padding: 0;
  border-radius: 2px;
  border: 1px solid var(--fg-2);
  background: rgba(12, 13, 15, 0.7);
  color: var(--ink-0);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.12s, background-color 0.12s, border-color 0.12s;
  z-index: 3;
}

.media-item:hover .select-checkbox {
  opacity: 1;
}

.select-checkbox.checked {
  opacity: 1;
  background: var(--signal);
  border-color: var(--signal);
}

.select-checkbox svg {
  width: 12px;
  height: 12px;
}

@media (hover: none) {
  .media-actions,
  .select-checkbox {
    opacity: 1;
  }
}

/* Selection action bar */
.selection-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  padding: 10px 14px;
  margin-bottom: 16px;
  border-color: var(--signal);
}

.selection-count {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  color: var(--signal);
}

.selection-link {
  background: none;
  border: none;
  color: var(--fg-2);
  font-size: 13px;
  cursor: pointer;
  padding: 0;
}

.selection-link:hover {
  color: var(--text);
  text-decoration: underline;
}

.selection-delete {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-icon-sm {
  width: 14px;
  height: 14px;
}

.spinner-xs {
  width: 12px;
  height: 12px;
  border-width: 2px;
}

.media-type {
  position: absolute;
  bottom: 6px;
  left: 6px;
  width: 22px;
  height: 22px;
  border-radius: 2px;
  background: rgba(12, 13, 15, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
}

.media-type svg {
  width: 13px;
  height: 13px;
}

.media-type-pdf {
  color: var(--error);
}

.media-processing {
  position: absolute;
  inset: 0;
  background: rgba(12, 13, 15, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.processing-text {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-2);
  text-align: center;
}

.spinner-sm {
  width: 18px;
  height: 18px;
  border-width: 2px;
}

/* Delete Confirmation Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.modal-content {
  width: 100%;
  max-width: 400px;
  background: var(--ink-1);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
}

.modal-header h3 {
  font-size: 15px;
  font-weight: 600;
}

.modal-close {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: none;
  border: none;
  color: var(--fg-3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.12s, background-color 0.12s;
}

.modal-close:hover {
  background: var(--ink-2);
  color: var(--text);
}

.modal-close svg {
  width: 16px;
  height: 16px;
}

.modal-body {
  padding: 16px;
}

.delete-preview {
  width: 96px;
  height: 96px;
  margin: 0 auto 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  overflow: hidden;
  background: var(--ink-2);
}

.delete-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-message {
  font-size: 14px;
  text-align: center;
  margin-bottom: 8px;
}

.delete-message strong {
  color: var(--text);
}

.delete-warning {
  font-size: 12px;
  color: var(--fg-3);
  text-align: center;
}

.modal-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 12px 16px;
  border-top: 1px solid var(--line);
}

/* Preview Modal (lightbox) */
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
  transition: background-color 0.12s;
  z-index: 10;
}

.preview-close:hover {
  background: var(--ink-2);
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

/* PDFs/documents need far more room than images: let them fill the viewport. */
.preview-container-doc {
  width: 95vw;
  max-width: 1200px;
  max-height: 85vh;
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
  background: #000;
}

.preview-document {
  width: 100%;
  height: 85vh;
  border: none;
  border-radius: var(--radius-sm);
  background: #fff;
}

.preview-document-info,
.preview-audio {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--ink-1);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-md);
}

.preview-document-info {
  gap: 12px;
  padding: 48px;
}

.preview-document-info svg {
  width: 56px;
  height: 56px;
  color: var(--fg-3);
}

.preview-document-info p {
  font-size: 15px;
  color: var(--text);
}

.preview-audio {
  gap: 24px;
  padding: 48px 40px;
  min-width: min(480px, 80vw);
}

.preview-audio svg {
  width: 64px;
  height: 64px;
  color: var(--fg-3);
}

.preview-audio-player {
  width: 100%;
}

.pdf-link {
  color: var(--signal);
  text-decoration: none;
  font-size: 14px;
}

.pdf-link:hover {
  text-decoration: underline;
}

.variant-carousel {
  margin-top: 14px;
  width: 100%;
  max-width: min(720px, 90vw);
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: var(--fg-2);
}

.variant-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-2);
}

.variant-aspect {
  font-weight: 500;
  color: var(--signal);
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 2px;
  border: 1px solid var(--signal);
}

.variant-platforms {
  max-width: 60ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.variant-dims {
  color: var(--fg-3);
}

.variant-strip-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.variant-nav {
  flex: 0 0 auto;
  width: 28px;
  height: 56px;
  border: 1px solid var(--line-strong);
  background: var(--ink-1);
  color: var(--fg-2);
  border-radius: var(--radius-sm);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.12s, color 0.12s;
}

.variant-nav:hover {
  background: var(--ink-2);
  color: var(--text);
}

.variant-thumbs {
  flex: 1 1 auto;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 4px 2px;
  scrollbar-width: thin;
}

.variant-thumb {
  flex: 0 0 auto;
  width: 64px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
  padding: 4px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  background: var(--ink-1);
  color: var(--fg-2);
  cursor: pointer;
  scroll-snap-align: start;
  transition: border-color 0.12s, background-color 0.12s;
}

.variant-thumb:hover {
  border-color: var(--line-strong);
}

.variant-thumb-active {
  border-color: var(--signal);
  background: var(--signal-soft);
  color: var(--signal);
}

.variant-thumb img {
  width: 100%;
  height: 48px;
  object-fit: contain;
  background: var(--ink-0);
  border-radius: 2px;
}

.variant-thumb-label {
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 1.1;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.preview-info {
  margin-top: 16px;
  text-align: center;
}

.preview-name {
  font-size: 14px;
  color: var(--text);
  margin-bottom: 4px;
}

.preview-meta {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
}

.preview-id {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line-strong);
  background: var(--ink-1);
  color: var(--fg-2);
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  transition: background-color 0.12s, border-color 0.12s;
}

.preview-id:hover {
  background: var(--ink-2);
}

.preview-id-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fg-3);
}

.preview-id code {
  font-family: var(--font-mono);
  color: var(--text);
}

.preview-id-copy {
  color: var(--signal);
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
  min-width: min(300px, 80vw);
  min-height: 200px;
  background: var(--ink-1);
  border-radius: var(--radius-sm);
}

/* Load More */
.load-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 12px;
}

.load-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  padding: 8px 20px;
  border-radius: var(--radius-sm);
  background: var(--ink-1);
  border: 1px solid var(--line);
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.12s, background-color 0.12s;
}

.load-more-btn:hover:not(:disabled) {
  border-color: var(--line-strong);
  background: var(--ink-2);
}

.load-more-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.load-more-info {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
}
</style>
