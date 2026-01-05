import api from './api'
import type {
  Media,
  MediaListItem,
  MediaStatus,
  MediaType,
  CreateUploadUrlRequest,
  CreateUploadUrlResponse,
  PaginatedResponse,
} from '@/types'

interface ListMediaParams {
  limit?: number
  offset?: number
  type?: MediaType
  status?: MediaStatus
}

export const mediaService = {
  async createUploadUrl(data: CreateUploadUrlRequest): Promise<CreateUploadUrlResponse> {
    const response = await api.post<CreateUploadUrlResponse>('/media/create-upload-url', data)
    return response.data
  },

  async confirmUpload(mediaId: string): Promise<{ message: string; media: Media }> {
    const response = await api.post(`/media/${mediaId}/confirm-upload`)
    return response.data
  },

  async listMedia(params?: ListMediaParams): Promise<PaginatedResponse<MediaListItem>> {
    const response = await api.get<PaginatedResponse<MediaListItem>>('/media', { params })
    return response.data
  },

  async getMedia(id: string): Promise<Media> {
    const response = await api.get<Media>(`/media/${id}`)
    return response.data
  },

  async deleteMedia(id: string): Promise<void> {
    await api.delete(`/media/${id}`)
  },

  async uploadFile(uploadUrl: string, file: File): Promise<void> {
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })
  },

  async generateCarouselPDF(mediaIds: string[], title?: string): Promise<{
    media_id: string
    thumbnail_url: string
    original_url: string
    page_count: number
  }> {
    const response = await api.post('/media/generate-carousel-pdf', {
      media_ids: mediaIds,
      title,
    })
    return response.data
  },
}
