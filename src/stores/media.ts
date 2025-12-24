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

  const hasMore = computed(() => items.value.length < total.value)

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

  const updateMediaStatus = (id: string, status: MediaStatus) => {
    const item = items.value.find((m) => m.id === id)
    if (item) {
      item.processing_status = status
    }
    if (currentMedia.value?.id === id) {
      currentMedia.value.status = status
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
    updateMediaStatus,
  }
})
