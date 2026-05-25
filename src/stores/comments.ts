import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { commentsService, type ListCommentsParams } from '@/services'
import type { PostComment } from '@/types'
import { usePostsStore } from './posts'

interface PostCommentsState {
  items: PostComment[]
  total: number
  loading: boolean
  loadingMore: boolean
  replying: Record<string, boolean> // commentId -> in-flight
  error: string | null
}

const PAGE_SIZE = 20

function newState(): PostCommentsState {
  return {
    items: [],
    total: 0,
    loading: false,
    loadingMore: false,
    replying: {},
    error: null,
  }
}

function readError(err: unknown): string {
  const e = err as { response?: { data?: { error?: string } } }
  return e.response?.data?.error || 'Something went wrong'
}

export const useCommentsStore = defineStore('comments', () => {
  // Keyed by postId; reactive() lets nested mutations stay reactive
  const byPost = reactive<Record<string, PostCommentsState>>({})
  const lastMarkReadError = ref<string | null>(null)

  function getState(postId: string): PostCommentsState {
    if (!byPost[postId]) byPost[postId] = newState()
    return byPost[postId]
  }

  async function load(postId: string, params?: Partial<ListCommentsParams>) {
    const state = getState(postId)
    state.loading = true
    state.error = null
    try {
      const response = await commentsService.list(postId, {
        limit: PAGE_SIZE,
        offset: 0,
        ...params,
      })
      state.items = response.items
      state.total = response.total
    } catch (err) {
      state.error = readError(err)
    } finally {
      state.loading = false
    }
  }

  async function loadMore(postId: string, params?: Partial<ListCommentsParams>) {
    const state = getState(postId)
    if (state.items.length >= state.total) return
    state.loadingMore = true
    try {
      const response = await commentsService.list(postId, {
        limit: PAGE_SIZE,
        offset: state.items.length,
        ...params,
      })
      // De-dup by id (defensive against polling overlap)
      const known = new Set(state.items.map((c) => c.id))
      state.items.push(...response.items.filter((c) => !known.has(c.id)))
      state.total = response.total
    } catch (err) {
      state.error = readError(err)
    } finally {
      state.loadingMore = false
    }
  }

  async function submitReply(
    postId: string,
    commentId: string,
    text: string,
  ): Promise<PostComment | null> {
    const state = getState(postId)
    state.replying[commentId] = true
    try {
      const reply = await commentsService.reply(postId, commentId, text)
      // Insert reply right after its parent for a natural read order
      const parentIdx = state.items.findIndex((c) => c.id === commentId)
      if (parentIdx >= 0) {
        state.items.splice(parentIdx + 1, 0, reply)
      } else {
        state.items.unshift(reply)
      }
      state.total += 1
      return reply
    } catch (err) {
      state.error = readError(err)
      return null
    } finally {
      delete state.replying[commentId]
    }
  }

  async function markRead(postId: string): Promise<number> {
    lastMarkReadError.value = null
    try {
      const { markedCount } = await commentsService.markRead(postId)
      const state = getState(postId)
      state.items = state.items.map((c) =>
        c.isOwnReply ? c : { ...c, isRead: true },
      )
      // Zero the unread badge on the parent Post so the "N new" pill on the
      // posts list and the badge on the detail tab clear immediately, without
      // waiting for a refetch.
      usePostsStore().clearUnreadCommentCount(postId)
      return markedCount
    } catch (err) {
      lastMarkReadError.value = readError(err)
      return 0
    }
  }

  function reset(postId: string) {
    delete byPost[postId]
  }

  return {
    byPost,
    lastMarkReadError,
    load,
    loadMore,
    submitReply,
    markRead,
    reset,
  }
})
