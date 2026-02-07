import api from './api'
import type { UserProfile, Plan } from '@/types'

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get<UserProfile>('/users/profile')
    return response.data
  },

  async updateProfile(data: { display_name?: string; avatar_url?: string }): Promise<UserProfile> {
    const response = await api.patch<UserProfile>('/users/profile', data)
    return response.data
  },

  async getPlan(): Promise<Plan> {
    const response = await api.get<Plan>('/users/plan')
    return response.data
  },

  async completeOnboarding(selectedPlan: string): Promise<{ success: boolean }> {
    const response = await api.post<{ success: boolean }>('/users/onboarding/complete', {
      selectedPlan,
    })
    return response.data
  },

  async deleteAccount(): Promise<{ success: boolean }> {
    const response = await api.delete<{ success: boolean }>('/users/account')
    return response.data
  },
}
