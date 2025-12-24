import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userService } from '@/services'
import type { UserProfile, Plan } from '@/types'

export const useUserStore = defineStore('user', () => {
  const profile = ref<UserProfile | null>(null)
  const plan = ref<Plan | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchProfile = async () => {
    isLoading.value = true
    error.value = null
    try {
      profile.value = await userService.getProfile()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to fetch profile'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async (data: { display_name?: string; avatar_url?: string }) => {
    isLoading.value = true
    error.value = null
    try {
      profile.value = await userService.updateProfile(data)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to update profile'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchPlan = async () => {
    isLoading.value = true
    error.value = null
    try {
      plan.value = await userService.getPlan()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to fetch plan'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    profile,
    plan,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    fetchPlan,
  }
})
