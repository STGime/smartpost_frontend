import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { postsService } from '@/services'
import type { Post, PostStatus, CreatePostRequest, UpdatePostRequest } from '@/types'

export const usePostsStore = defineStore('posts', () => {
  const posts = ref<Post[]>([])
  const currentPost = ref<Post | null>(null)
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

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
      const response = await postsService.listPosts(params)
      if (params?.offset === 0 || !params?.offset) {
        posts.value = response.items
      } else {
        posts.value = [...posts.value, ...response.items]
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

  return {
    posts,
    currentPost,
    total,
    isLoading,
    error,
    hasMore,
    draftPosts,
    scheduledPosts,
    publishedPosts,
    fetchPosts,
    fetchPostById,
    createPost,
    updatePost,
    deletePost,
    schedulePost,
    publishPost,
    cancelScheduledPost,
  }
})
