import { defineStore } from 'pinia'
import { ref } from 'vue'
import { tagsService } from '@/services'
import type { Tag } from '@/types'

export const useTagsStore = defineStore('tags', () => {
  const tags = ref<Tag[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchTags = async (params?: { search?: string; limit?: number; sort?: 'usage' | 'recent' | 'alpha' }) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await tagsService.listTags(params)
      tags.value = response.items
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to fetch tags'
    } finally {
      isLoading.value = false
    }
  }

  const saveTags = async (newTags: string[]): Promise<Tag[]> => {
    error.value = null
    try {
      const response = await tagsService.saveTags(newTags)
      // Update local tags list with new/updated tags
      const existingIds = new Set(tags.value.map(t => t.id))
      for (const tag of response.items) {
        if (!existingIds.has(tag.id)) {
          tags.value.push(tag)
        }
      }
      // Sort by usage count
      tags.value.sort((a, b) => b.usage_count - a.usage_count)
      return response.items
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to save tags'
      throw err
    }
  }

  const deleteTag = async (id: string) => {
    error.value = null
    try {
      await tagsService.deleteTag(id)
      tags.value = tags.value.filter(t => t.id !== id)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to delete tag'
      throw err
    }
  }

  const searchTags = (query: string): Tag[] => {
    if (!query) return tags.value
    const lower = query.toLowerCase()
    return tags.value.filter(t => t.tag.toLowerCase().includes(lower))
  }

  return {
    tags,
    isLoading,
    error,
    fetchTags,
    saveTags,
    deleteTag,
    searchTags,
  }
})
