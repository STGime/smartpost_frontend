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
}
