import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mediaService } from '@/services'
import type { Media, MediaListItem, MediaStatus, MediaType, MimeType } from '@/types'

export const useMediaStore = defineStore('media', () => {
  const items = ref<MediaListItem[]>([])
  const currentMedia = ref<Media | null>(null)
  const total = ref(0)
  const isLoading = ref(false)
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const error = ref<string | null>(null)

  // Polling for processing status updates
  let pollingInterval: ReturnType<typeof setInterval> | null = null
  const processingMediaIds = ref<Set<string>>(new Set())

  const hasMore = computed(() => items.value.length < total.value)

  // Define polling functions first (using function declarations for hoisting)
  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
    processingMediaIds.value.clear()
  }

  function startPollingForProcessing(mediaId: string) {
    processingMediaIds.value.add(mediaId)

    // Start polling if not already running
    if (!pollingInterval) {
      pollingInterval = setInterval(async () => {
        if (processingMediaIds.value.size === 0) {
          stopPolling()
          return
        }

        try {
          // Fetch updated media list
          const response = await mediaService.listMedia({ limit: 50 })

          // Update items with new data - replace entire array for reactivity
          items.value = items.value.map((existingItem) => {
            const updatedItem = response.items.find((m) => m.id === existingItem.id)
            if (updatedItem) {
              // Remove from processing set if completed or failed
              if (
                updatedItem.processing_status === 'completed' ||
                updatedItem.processing_status === 'failed'
              ) {
                processingMediaIds.value.delete(updatedItem.id)
              }
              // Return updated item (triggers Vue reactivity)
              return { ...existingItem, ...updatedItem }
            }
            return existingItem
          })
        } catch {
          // Silently ignore polling errors
        }
      }, 3000) // Poll every 3 seconds
    }
  }

  const fetchMedia = async (params?: {
    limit?: number
    offset?: number
    type?: MediaType
    status?: MediaStatus
  }) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await mediaService.listMedia(params)
      if (params?.offset === 0 || !params?.offset) {
        items.value = response.items
      } else {
        items.value = [...items.value, ...response.items]
      }
      total.value = response.total

      // Start polling for any media that's still processing
      for (const item of response.items) {
        if (item.processing_status === 'processing') {
          startPollingForProcessing(item.id)
        }
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to fetch media'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchMediaById = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      currentMedia.value = await mediaService.getMedia(id)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to fetch media'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const uploadMedia = async (file: File) => {
    isUploading.value = true
    uploadProgress.value = 0
    error.value = null

    try {
      // Get upload URL
      const { media_id, upload_url } = await mediaService.createUploadUrl({
        name: file.name,
        mime_type: file.type as MimeType,
        size_bytes: file.size,
      })

      // Upload file to GCS
      uploadProgress.value = 50
      await mediaService.uploadFile(upload_url, file)

      // Confirm upload
      uploadProgress.value = 90
      const result = await mediaService.confirmUpload(media_id)
      uploadProgress.value = 100

      // Add to list
      const listItem: MediaListItem = {
        id: result.media.id,
        name: result.media.name,
        type: result.media.type,
        mime_type: result.media.mime_type,
        size_bytes: result.media.size_bytes,
        width: result.media.width,
        height: result.media.height,
        duration: result.media.duration,
        processing_status: result.media.status,
        thumbnail_url: result.media.thumbnail_url,
        created_at: result.media.created_at,
      }
      items.value = [listItem, ...items.value]
      total.value++

      // Start polling for processing status updates
      if (result.media.status === 'processing') {
        startPollingForProcessing(result.media.id)
      }

      return result.media
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to upload media'
      throw err
    } finally {
      isUploading.value = false
      uploadProgress.value = 0
    }
  }

  const deleteMedia = async (id: string) => {
    error.value = null
    try {
      await mediaService.deleteMedia(id)
      items.value = items.value.filter((item) => item.id !== id)
      total.value--
      if (currentMedia.value?.id === id) {
        currentMedia.value = null
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to delete media'
      throw err
    }
  }

  // Bulk-delete several media items. There's no batch endpoint, so we fire the
  // single-delete calls in parallel and remove whichever succeed; if some fail,
  // the rest still go through and we surface a count.
  const deleteMediaBulk = async (ids: string[]) => {
    error.value = null
    const results = await Promise.allSettled(ids.map((id) => mediaService.deleteMedia(id)))

    const deleted = new Set<string>()
    let failed = 0
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') deleted.add(ids[i]!)
      else failed++
    })

    if (deleted.size > 0) {
      items.value = items.value.filter((item) => !deleted.has(item.id))
      total.value -= deleted.size
      if (currentMedia.value && deleted.has(currentMedia.value.id)) {
        currentMedia.value = null
      }
    }

    if (failed > 0) {
      error.value = `Failed to delete ${failed} of ${ids.length} item${ids.length === 1 ? '' : 's'}.`
    }

    return { deleted: deleted.size, failed }
  }

  // Resolve a freshly-signed original-file URL for download, without disturbing
  // `currentMedia` (which backs the preview modal).
  const fetchOriginalUrl = async (id: string): Promise<string | null> => {
    error.value = null
    try {
      const media = await mediaService.getMedia(id)
      return media.original_url ?? null
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to fetch media'
      return null
    }
  }

  const updateMediaStatus = (id: string, status: MediaStatus) => {
    const item = items.value.find((m) => m.id === id)
    if (item) {
      item.processing_status = status
    }
    if (currentMedia.value?.id === id) {
      currentMedia.value.status = status
    }
  }

  const generateCarouselPDF = async (mediaIds: string[], title?: string) => {
    isLoading.value = true
    error.value = null
    try {
      const result = await mediaService.generateCarouselPDF(mediaIds, title)

      // Add generated PDF to items list
      const pdfItem: MediaListItem = {
        id: result.media_id,
        name: title || 'LinkedIn Carousel',
        type: 'document',
        mime_type: 'application/pdf',
        size_bytes: 0,
        width: 1080,
        height: 1080,
        processing_status: 'completed',
        thumbnail_url: result.thumbnail_url,
        created_at: new Date().toISOString(),
      }
      items.value = [pdfItem, ...items.value]
      total.value++

      return result
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to generate carousel PDF'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    items,
    currentMedia,
    total,
    isLoading,
    isUploading,
    uploadProgress,
    error,
    hasMore,
    fetchMedia,
    fetchMediaById,
    uploadMedia,
    deleteMedia,
    deleteMediaBulk,
    fetchOriginalUrl,
    updateMediaStatus,
    generateCarouselPDF,
    startPollingForProcessing,
    stopPolling,
  }
})
