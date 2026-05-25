import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { postsService, postSSEService, type PostStatusUpdateEvent, type PostResultUpdateEvent } from '@/services'
import type { Post, PostStatus, CreatePostRequest, UpdatePostRequest } from '@/types'

type SortField = 'created_at' | 'scheduled_at' | 'published_at' | 'status' | 'updated_at'

export const usePostsStore = defineStore('posts', () => {
  const posts = ref<Post[]>([])
  const currentPost = ref<Post | null>(null)
  const templatePost = ref<Post | null>(null)
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const sseSubscribed = ref(false)
  const statusFilter = ref<PostStatus | null>(null)
  const sortBy = ref<SortField>('created_at')
  const sortOrder = ref<'asc' | 'desc'>('desc')

  const hasMore = computed(() => posts.value.length < total.value)

  const draftPosts = computed(() =>
    posts.value.filter((post) => post.status === 'draft')
  )

  const scheduledPosts = computed(() =>
    posts.value.filter((post) => post.status === 'scheduled')
  )

  const publishedPosts = computed(() =>
    posts.value.filter((post) => ['posted', 'partially_posted'].includes(post.status))
  )

  const fetchPosts = async (params?: {
    limit?: number
    offset?: number
    status?: PostStatus
    isDraft?: boolean
  }) => {
    isLoading.value = true
    error.value = null
    try {
      const mergedParams = {
        ...params,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
        ...(statusFilter.value ? { status: statusFilter.value } : {}),
      }
      const response = await postsService.listPosts(mergedParams)
      if (params?.offset && params.offset > 0) {
        posts.value = [...posts.value, ...response.items]
      } else {
        posts.value = response.items
      }
      total.value = response.total
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to fetch posts'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const setStatusFilter = async (status: PostStatus | null, pageSize = 12) => {
    statusFilter.value = status
    posts.value = []
    total.value = 0
    await fetchPosts({ limit: pageSize, offset: 0 })
  }

  const setSort = async (field: SortField, order: 'asc' | 'desc', pageSize = 12) => {
    sortBy.value = field
    sortOrder.value = order
    posts.value = []
    total.value = 0
    await fetchPosts({ limit: pageSize, offset: 0 })
  }

  const fetchPostById = async (postId: string) => {
    isLoading.value = true
    error.value = null
    try {
      currentPost.value = await postsService.getPost(postId)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to fetch post'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createPost = async (data: CreatePostRequest) => {
    isLoading.value = true
    error.value = null
    try {
      const post = await postsService.createPost(data)
      posts.value = [post, ...posts.value]
      total.value++
      return post
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to create post'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updatePost = async (postId: string, data: UpdatePostRequest) => {
    isLoading.value = true
    error.value = null
    try {
      const updatedPost = await postsService.updatePost(postId, data)
      const index = posts.value.findIndex((p) => p.id === postId)
      if (index !== -1) {
        posts.value[index] = updatedPost
      }
      if (currentPost.value?.id === postId) {
        currentPost.value = updatedPost
      }
      return updatedPost
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to update post'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deletePost = async (postId: string) => {
    error.value = null
    try {
      await postsService.deletePost(postId)
      posts.value = posts.value.filter((post) => post.id !== postId)
      total.value--
      if (currentPost.value?.id === postId) {
        currentPost.value = null
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to delete post'
      throw err
    }
  }

  const schedulePost = async (postId: string, scheduledAt: string) => {
    isLoading.value = true
    error.value = null
    try {
      const updatedPost = await postsService.schedulePost(postId, scheduledAt)
      const index = posts.value.findIndex((p) => p.id === postId)
      if (index !== -1) {
        posts.value[index] = updatedPost
      }
      if (currentPost.value?.id === postId) {
        currentPost.value = updatedPost
      }
      return updatedPost
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to schedule post'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const publishPost = async (postId: string) => {
    isLoading.value = true
    error.value = null
    try {
      const updatedPost = await postsService.publishPost(postId)
      const index = posts.value.findIndex((p) => p.id === postId)
      if (index !== -1) {
        posts.value[index] = updatedPost
      }
      if (currentPost.value?.id === postId) {
        currentPost.value = updatedPost
      }
      return updatedPost
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to publish post'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const cancelScheduledPost = async (postId: string) => {
    isLoading.value = true
    error.value = null
    try {
      const updatedPost = await postsService.cancelScheduledPost(postId)
      const index = posts.value.findIndex((p) => p.id === postId)
      if (index !== -1) {
        posts.value[index] = updatedPost
      }
      if (currentPost.value?.id === postId) {
        currentPost.value = updatedPost
      }
      return updatedPost
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to cancel scheduled post'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // SSE Event Handlers
  const handlePostStatusUpdate = (data: PostStatusUpdateEvent) => {
    // Update post in posts list
    const postIndex = posts.value.findIndex((p) => p.id === data.postId)
    if (postIndex !== -1) {
      const post = posts.value[postIndex]
      if (post) {
        post.status = data.status
        post.publishedAt = data.publishedAt ?? undefined
        post.isDraft = data.isDraft
        // Trigger reactivity by replacing the array
        posts.value = [...posts.value]
      }
    }

    // Update current post if it's the same
    if (currentPost.value?.id === data.postId) {
      currentPost.value.status = data.status
      currentPost.value.publishedAt = data.publishedAt ?? undefined
      currentPost.value.isDraft = data.isDraft
      // Trigger reactivity
      currentPost.value = { ...currentPost.value }
    }
  }

  const handlePostResultUpdate = (data: PostResultUpdateEvent) => {
    // Update result in current post
    if (currentPost.value?.id === data.postId && currentPost.value.results) {
      const resultIndex = currentPost.value.results.findIndex(
        (r) => r.socialAccountId === data.socialAccountId
      )
      if (resultIndex !== -1) {
        const result = currentPost.value.results[resultIndex]
        if (result) {
          result.status = data.status
          result.platformPostId = data.platformPostId
          result.platformPostUrl = data.platformPostUrl
          result.errorCode = data.errorCode
          result.errorMessage = data.errorMessage
          result.publishedAt = data.publishedAt
          // Trigger reactivity by replacing the whole object
          currentPost.value = { ...currentPost.value }
        }
      }
    }
  }

  // Subscribe to SSE events
  const subscribeToSSE = () => {
    if (sseSubscribed.value) return

    console.log('[Posts Store] Subscribing to SSE events')
    postSSEService.on<PostStatusUpdateEvent>('post-status-update', handlePostStatusUpdate)
    postSSEService.on<PostResultUpdateEvent>('post-result-update', handlePostResultUpdate)
    sseSubscribed.value = true
  }

  // Unsubscribe from SSE events
  const unsubscribeFromSSE = () => {
    if (!sseSubscribed.value) return

    console.log('[Posts Store] Unsubscribing from SSE events')
    postSSEService.off<PostStatusUpdateEvent>('post-status-update', handlePostStatusUpdate)
    postSSEService.off<PostResultUpdateEvent>('post-result-update', handlePostResultUpdate)
    sseSubscribed.value = false
  }

  // Template functions for "Use as Template" feature
  const setTemplate = (post: Post) => {
    templatePost.value = post
  }

  const clearTemplate = () => {
    templatePost.value = null
  }

  // Called by the comments store after a successful mark-read so the unread
  // pill on the posts list card and the badge on the post detail tab clear
  // immediately, without waiting for a refetch.
  const clearUnreadCommentCount = (postId: string) => {
    if (currentPost.value?.id === postId) {
      currentPost.value.unreadCommentCount = 0
    }
    const row = posts.value.find((p) => p.id === postId)
    if (row) row.unreadCommentCount = 0
  }

  return {
    posts,
    currentPost,
    templatePost,
    total,
    isLoading,
    error,
    hasMore,
    statusFilter,
    sortBy,
    sortOrder,
    draftPosts,
    scheduledPosts,
    publishedPosts,
    fetchPosts,
    setStatusFilter,
    setSort,
    fetchPostById,
    createPost,
    updatePost,
    deletePost,
    schedulePost,
    publishPost,
    cancelScheduledPost,
    subscribeToSSE,
    unsubscribeFromSSE,
    setTemplate,
    clearTemplate,
    clearUnreadCommentCount,
  }
})
