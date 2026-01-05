import api from './api'
import type { TagsResponse } from '@/types'

interface ListTagsParams {
  search?: string
  limit?: number
  sort?: 'usage' | 'recent' | 'alpha'
}

export const tagsService = {
  async listTags(params?: ListTagsParams): Promise<TagsResponse> {
    const response = await api.get<TagsResponse>('/tags', { params })
    return response.data
  },

  async saveTags(tags: string[]): Promise<TagsResponse> {
    const response = await api.post<TagsResponse>('/tags', { tags })
    return response.data
  },

  async deleteTag(id: string): Promise<void> {
    await api.delete(`/tags/${id}`)
  },
}
