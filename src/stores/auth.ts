import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, postSSEService, setSessionExpiredHandler, performTokenRefresh } from '@/services'
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

  // Background refresh timer
  let refreshTimer: ReturnType<typeof setTimeout> | null = null
  // Periodic safety-net interval (catches missed setTimeout)
  let refreshInterval: ReturnType<typeof setInterval> | null = null
  // Visibility change handler reference for cleanup
  let visibilityHandler: (() => void) | null = null

  // Refresh token 5 minutes before expiry
  const REFRESH_BEFORE_EXPIRY_MS = 5 * 60 * 1000
  // Periodic check interval
  const PERIODIC_CHECK_MS = 60 * 1000

  const setTokens = (accessToken: string, refreshToken: string, expiresAt?: number) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    if (expiresAt) {
      localStorage.setItem('token_expires_at', expiresAt.toString())
      scheduleTokenRefresh(expiresAt)
    }
    startPeriodicCheck()
    startVisibilityListener()
  }

  const clearTokens = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token_expires_at')
    clearRefreshTimer()
    stopPeriodicCheck()
    stopVisibilityListener()
  }

  const clearRefreshTimer = () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
  }

  const isTokenExpiringSoon = (): boolean => {
    const storedExpiresAt = localStorage.getItem('token_expires_at')
    if (!storedExpiresAt) return false
    const expiresAtMs = parseInt(storedExpiresAt, 10) * 1000
    return (expiresAtMs - Date.now()) < REFRESH_BEFORE_EXPIRY_MS
  }

  const startPeriodicCheck = () => {
    if (refreshInterval) return
    refreshInterval = setInterval(() => {
      if (isTokenExpiringSoon() && localStorage.getItem('refresh_token')) {
        console.log('[Auth] Periodic check: token expiring soon, refreshing')
        refreshTokenInBackground()
      }
    }, PERIODIC_CHECK_MS)
  }

  const stopPeriodicCheck = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  }

  const checkTokenOnVisibilityChange = () => {
    if (document.visibilityState !== 'visible') return
    if (!localStorage.getItem('refresh_token')) return

    console.log('[Auth] Tab became visible, checking token')
    if (isTokenExpiringSoon()) {
      console.log('[Auth] Token expiring soon after wake/tab switch, refreshing')
      refreshTokenInBackground()
    } else {
      // Re-schedule the timer — it may have been killed during sleep
      const storedExpiresAt = localStorage.getItem('token_expires_at')
      if (storedExpiresAt) {
        const expiresAt = parseInt(storedExpiresAt, 10)
        if (!isNaN(expiresAt)) {
          scheduleTokenRefresh(expiresAt)
        }
      }
    }
  }

  const startVisibilityListener = () => {
    if (visibilityHandler) return
    visibilityHandler = checkTokenOnVisibilityChange
    document.addEventListener('visibilitychange', visibilityHandler)
  }

  const stopVisibilityListener = () => {
    if (visibilityHandler) {
      document.removeEventListener('visibilitychange', visibilityHandler)
      visibilityHandler = null
    }
  }

  const scheduleTokenRefresh = (expiresAt: number) => {
    clearRefreshTimer()

    const nowMs = Date.now()
    const expiresAtMs = expiresAt * 1000
    const refreshAtMs = expiresAtMs - REFRESH_BEFORE_EXPIRY_MS

    // If token expires in less than 5 minutes, refresh immediately
    // Otherwise, schedule refresh for 5 minutes before expiry
    const delayMs = Math.max(0, refreshAtMs - nowMs)

    console.log(`[Auth] Token expires at ${new Date(expiresAtMs).toISOString()}, scheduling refresh in ${Math.round(delayMs / 1000 / 60)} minutes`)

    refreshTimer = setTimeout(async () => {
      console.log('[Auth] Background token refresh triggered')
      await refreshTokenInBackground()
    }, delayMs)
  }

  const parseExpiresAt = (expiresAt: string | number | undefined): number | undefined => {
    if (!expiresAt) return undefined
    if (typeof expiresAt === 'number') return expiresAt
    const parsed = parseInt(expiresAt, 10)
    return isNaN(parsed) ? undefined : parsed
  }

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const refreshTokenInBackground = async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      console.log('[Auth] No refresh token available for background refresh')
      return
    }

    try {
      const result = await performTokenRefresh()
      if (result) {
        scheduleTokenRefresh(result.expires_at)
        console.log('[Auth] Background token refresh successful')
        return
      }
      throw new Error('Token refresh returned null')
    } catch (err) {
      console.warn('[Auth] Background token refresh failed, retrying in 5s:', err)
      // Retry once after 5 seconds
      await delay(5000)
      try {
        const result = await performTokenRefresh()
        if (result) {
          scheduleTokenRefresh(result.expires_at)
          console.log('[Auth] Background token refresh succeeded on retry')
          return
        }
        throw new Error('Token refresh returned null on retry')
      } catch (retryErr) {
        // Schedule another attempt in 30 seconds instead of giving up
        console.warn('[Auth] Background refresh retry failed, scheduling another attempt in 30s:', retryErr)
        clearRefreshTimer()
        refreshTimer = setTimeout(() => {
          console.log('[Auth] Deferred background refresh attempt')
          refreshTokenInBackground()
        }, 30000)
      }
    }
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
      setTokens(response.access_token, response.refresh_token, parseExpiresAt(response.expires_at))
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

      // If email confirmation is required, tokens will be empty
      if (response.access_token) {
        setTokens(response.access_token, response.refresh_token, parseExpiresAt(response.expires_at))
        connectSSE()
        // New users go to onboarding
        router.push({ name: 'onboarding' })
      } else {
        // Email confirmation required - show message and stay on signup
        error.value = response.message || 'Please check your email to confirm your account'
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      error.value = e.response?.data?.error || 'Signup failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Handle Google OAuth callback tokens (from URL hash)
   * This is called when user returns from Google OAuth flow
   */
  const loginWithGoogleTokens = (tokens: {
    accessToken: string
    refreshToken: string
    expiresAt: number
    userId: string
    userEmail: string
    userName: string
  }) => {
    user.value = {
      id: tokens.userId,
      email: tokens.userEmail,
      display_name: tokens.userName || undefined,
      created_at: new Date().toISOString(),
    }
    setTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresAt)
    connectSSE()
    // Google signup/login goes to onboarding (guard will redirect if already completed)
    router.push({ name: 'onboarding' })
  }

  /**
   * Redirect to Google OAuth
   */
  const loginWithGoogle = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    window.location.href = `${apiUrl}/v1/auth/google`
  }

  const login = async (data: LoginRequest, stayOnPage = false) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await authService.login(data)
      user.value = response.user
      setTokens(response.access_token, response.refresh_token, parseExpiresAt(response.expires_at))
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
      // Restore refresh timer and safety nets on page reload
      const storedExpiresAt = localStorage.getItem('token_expires_at')
      if (storedExpiresAt) {
        const expiresAt = parseInt(storedExpiresAt, 10)
        if (!isNaN(expiresAt)) {
          scheduleTokenRefresh(expiresAt)
        }
      }
      startPeriodicCheck()
      startVisibilityListener()
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
    loginWithGoogle,
    loginWithGoogleTokens,
  }
})
