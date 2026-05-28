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

/**
 * Per-platform polling status sent by the backend on every list response.
 * Lets the UI distinguish "no comments yet" from "the polling API is blocked".
 */
export interface PlatformCommentStatus {
  platform: CommentPlatform
  pollingEnabled: boolean
  unsupportedReason: string | null
  lastFetchedAt: string | null
}

export interface ListCommentsResponse extends PaginatedResponse<PostComment> {
  platformStatus: PlatformCommentStatus[]
}

export const commentsService = {
  async list(
    postId: string,
    params?: ListCommentsParams,
  ): Promise<ListCommentsResponse> {
    const response = await api.get<ListCommentsResponse>(
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
