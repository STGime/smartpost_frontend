import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, postSSEService, setSessionExpiredHandler } from '@/services'
import type { User, LoginRequest, SignupRequest } from '@/types'
import router from '@/router'
import { usePostsStore } from './posts'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const showReauthModal = ref(false)
  const isReauthenticating = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
  }

  const clearTokens = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  const requireReauth = () => {
    clearTokens()
    user.value = null
    isReauthenticating.value = true
    showReauthModal.value = true
  }

  const closeReauthModal = () => {
    showReauthModal.value = false
    isReauthenticating.value = false
  }

  // Register session expired handler
  setSessionExpiredHandler(requireReauth)

  const getValidToken = async (): Promise<string | null> => {
    const accessToken = localStorage.getItem('access_token')
    const refreshToken = localStorage.getItem('refresh_token')

    if (!accessToken || !refreshToken) {
      return null
    }

    // Try to refresh the token to get a fresh one
    try {
      const response = await authService.refreshToken(refreshToken)
      setTokens(response.access_token, response.refresh_token)
      return response.access_token
    } catch {
      // Refresh failed, token is invalid
      return null
    }
  }

  const connectSSE = () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      console.log('[Auth] Connecting SSE')

      // Set up token provider for SSE reconnections
      postSSEService.setTokenProvider(getValidToken)

      // Set up auth error handler to trigger reauth modal
      postSSEService.setAuthErrorHandler(() => {
        console.log('[Auth] SSE auth error, requiring reauth')
        requireReauth()
      })

      postSSEService.connect(token)
      // Subscribe posts store to SSE events
      const postsStore = usePostsStore()
      postsStore.subscribeToSSE()
    }
  }

  const disconnectSSE = () => {
    console.log('[Auth] Disconnecting SSE')
    // Unsubscribe posts store from SSE events
    const postsStore = usePostsStore()
    postsStore.unsubscribeFromSSE()
    postSSEService.disconnect()
  }

  const signup = async (data: SignupRequest) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await authService.signup(data)
      user.value = response.user
      setTokens(response.access_token, response.refresh_token)
      connectSSE()
      router.push({ name: 'dashboard' })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Signup failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const login = async (data: LoginRequest, stayOnPage = false) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await authService.login(data)
      user.value = response.user
      setTokens(response.access_token, response.refresh_token)
      connectSSE()

      // If reauthenticating or stayOnPage flag is set, stay on current page
      if (isReauthenticating.value || stayOnPage) {
        closeReauthModal()
      } else {
        const redirect = router.currentRoute.value.query.redirect as string
        router.push(redirect || { name: 'dashboard' })
      }
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
      disconnectSSE()
      user.value = null
      clearTokens()
      router.push({ name: 'home' })
    }
  }

  const fetchCurrentUser = async () => {
    if (!localStorage.getItem('access_token')) {
      return
    }

    isLoading.value = true
    try {
      user.value = await authService.getCurrentUser()
      // Connect SSE on successful user fetch (page reload with valid token)
      connectSSE()
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

  const changePassword = async (currentPassword: string, newPassword: string) => {
    isLoading.value = true
    error.value = null
    try {
      await authService.changePassword(currentPassword, newPassword)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Failed to change password'
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
    showReauthModal,
    signup,
    login,
    logout,
    fetchCurrentUser,
    forgotPassword,
    resetPassword,
    changePassword,
    requireReauth,
    closeReauthModal,
  }
})
