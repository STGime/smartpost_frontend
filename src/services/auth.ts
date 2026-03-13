import axios from 'axios'
import api from './api'
import type { AuthResponse, LoginRequest, SignupRequest, User, ApiToken } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1'

export const authService = {
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signup', data)
    return response.data
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string; expires_at: string }> {
    // Use raw axios to avoid triggering the api interceptors, which can cause
    // a race condition with proactiveRefresh (both try to use the same refresh
    // token, but Supabase's refresh token rotation invalidates it after first use)
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken })
    return response.data
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  async resetPassword(password: string): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', { password })
    return response.data
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.patch('/auth/password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  },

  async createToken(name: string): Promise<{ id: string; token: string; name: string }> {
    const response = await api.post<{ id: string; token: string; name: string }>('/auth/tokens', { name })
    return response.data
  },

  async listTokens(): Promise<{ tokens: ApiToken[] }> {
    const response = await api.get<{ tokens: ApiToken[] }>('/auth/tokens')
    return response.data
  },

  async revokeToken(id: string): Promise<void> {
    await api.delete(`/auth/tokens/${id}`)
  },
}
