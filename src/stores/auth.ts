import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services'
import type { User, LoginRequest, SignupRequest } from '@/types'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
  }

  const clearTokens = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  const signup = async (data: SignupRequest) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await authService.signup(data)
      user.value = response.user
      setTokens(response.access_token, response.refresh_token)
      router.push({ name: 'dashboard' })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Signup failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const login = async (data: LoginRequest) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await authService.login(data)
      user.value = response.user
      setTokens(response.access_token, response.refresh_token)
      const redirect = router.currentRoute.value.query.redirect as string
      router.push(redirect || { name: 'dashboard' })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch {
      // Ignore logout errors
    } finally {
      user.value = null
      clearTokens()
      router.push({ name: 'login' })
    }
  }

  const fetchCurrentUser = async () => {
    if (!localStorage.getItem('access_token')) {
      return
    }

    isLoading.value = true
    try {
      user.value = await authService.getCurrentUser()
    } catch {
      clearTokens()
      user.value = null
    } finally {
      isLoading.value = false
    }
  }

  const forgotPassword = async (email: string) => {
    isLoading.value = true
    error.value = null
    try {
      await authService.forgotPassword(email)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to send reset email'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const resetPassword = async (password: string) => {
    isLoading.value = true
    error.value = null
    try {
      await authService.resetPassword(password)
      router.push({ name: 'login' })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to reset password'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    signup,
    login,
    logout,
    fetchCurrentUser,
    forgotPassword,
    resetPassword,
  }
})
