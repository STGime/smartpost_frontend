import api from './api'
import type {
  CommentPlatform,
  PaginatedResponse,
  PostComment,
} from '@/types'

export interface ListCommentsParams {
  limit?: number
  offset?: number
  platform?: CommentPlatform
  socialAccountId?: number
  unreadOnly?: boolean
}

export const commentsService = {
  async list(
    postId: string,
    params?: ListCommentsParams,
  ): Promise<PaginatedResponse<PostComment>> {
    const response = await api.get<PaginatedResponse<PostComment>>(
      `/posts/${postId}/comments`,
      { params },
    )
    return response.data
  },

  async markRead(postId: string): Promise<{ markedCount: number }> {
    const response = await api.post<{ markedCount: number }>(
      `/posts/${postId}/comments/read`,
    )
    return response.data
  },

  async reply(
    postId: string,
    commentId: string,
    text: string,
  ): Promise<PostComment> {
    const response = await api.post<PostComment>(
      `/posts/${postId}/comments/${commentId}/reply`,
      { text },
    )
    return response.data
  },
}
