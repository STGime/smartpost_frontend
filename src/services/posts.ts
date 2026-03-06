import api from './api'
import type {
  Post,
  PostStatus,
  CreatePostRequest,
  UpdatePostRequest,
  PaginatedResponse,
  CalendarPost,
} from '@/types'

interface ListPostsParams {
  limit?: number
  offset?: number
  status?: PostStatus
  isDraft?: boolean
  sortBy?: 'created_at' | 'scheduled_at' | 'published_at' | 'status' | 'updated_at'
  sortOrder?: 'asc' | 'desc'
}

export const postsService = {
  async listPosts(params?: ListPostsParams): Promise<PaginatedResponse<Post>> {
    const response = await api.get<PaginatedResponse<Post>>('/posts', { params })
    return response.data
  },

  async getPost(postId: string): Promise<Post> {
    const response = await api.get<Post>(`/posts/${postId}`)
    return response.data
  },

  async createPost(data: CreatePostRequest): Promise<Post> {
    const response = await api.post<Post>('/posts', data)
    return response.data
  },

  async updatePost(postId: string, data: UpdatePostRequest): Promise<Post> {
    const response = await api.patch<Post>(`/posts/${postId}`, data)
    return response.data
  },

  async deletePost(postId: string): Promise<void> {
    await api.delete(`/posts/${postId}`)
  },

  async schedulePost(postId: string, scheduledAt: string): Promise<Post> {
    const response = await api.post<Post>(`/posts/${postId}/schedule`, { scheduledAt })
    return response.data
  },

  async publishPost(postId: string): Promise<Post> {
    const response = await api.post<Post>(`/posts/${postId}/publish`)
    return response.data
  },

  async cancelScheduledPost(postId: string): Promise<Post> {
    const response = await api.post<Post>(`/posts/${postId}/cancel`)
    return response.data
  },

  async fetchCalendarPosts(start: string, end: string): Promise<CalendarPost[]> {
    const response = await api.get<{ items: CalendarPost[] }>('/posts/calendar', {
      params: { start, end }
    })
    return response.data.items
  },
}
