import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, postSSEService, setSessionExpiredHandler, performTokenRefresh, setWakeRefreshInProgress } from '@/services'
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
  // Track last active time for wake detection
  let lastActiveTimestamp = Date.now()

  // Refresh token 5 minutes before expiry
  const REFRESH_BEFORE_EXPIRY_MS = 5 * 60 * 1000
  // Periodic check interval
  const PERIODIC_CHECK_MS = 60 * 1000
  // If more than this elapsed since last activity, always refresh on wake
  const WAKE_ELAPSED_THRESHOLD_MS = 5 * 60 * 1000

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

  const checkTokenOnVisibilityChange = async () => {
    if (document.visibilityState === 'hidden') {
      // Record timestamp when going to sleep/background
      lastActiveTimestamp = Date.now()
      return
    }

    if (document.visibilityState !== 'visible') return
    if (!localStorage.getItem('refresh_token')) return

    const elapsed = Date.now() - lastActiveTimestamp
    const elapsedMinutes = Math.round(elapsed / 1000 / 60)
    const needsRefresh = elapsed > WAKE_ELAPSED_THRESHOLD_MS || isTokenExpiringSoon()

    console.log(`[Auth] Tab became visible after ~${elapsedMinutes}min, needsRefresh=${needsRefresh}`)

    if (needsRefresh) {
      // Signal the API layer to queue 401s instead of expiring the session
      setWakeRefreshInProgress(true)
      console.log('[Auth] Wake refresh: blocking 401 handler, refreshing token...')

      try {
        const result = await performTokenRefresh()
        if (result.success) {
          scheduleTokenRefresh(result.tokens.expires_at)
          lastActiveTimestamp = Date.now()
          console.log('[Auth] Wake refresh successful, reconnecting SSE')
          // Reconnect SSE with fresh token
          disconnectSSE()
          connectSSE()
          return
        }

        // If network error, retry with backoff
        if (result.reason === 'network') {
          console.warn('[Auth] Wake refresh failed (network), retrying...')
          const retryDelays = [3000, 6000, 12000]
          for (const delayMs of retryDelays) {
            await delay(delayMs)
            const retryResult = await performTokenRefresh()
            if (retryResult.success) {
              scheduleTokenRefresh(retryResult.tokens.expires_at)
              lastActiveTimestamp = Date.now()
              console.log('[Auth] Wake refresh succeeded on retry, reconnecting SSE')
              disconnectSSE()
              connectSSE()
              return
            }
            if (retryResult.reason === 'auth_invalid') {
              console.error('[Auth] Wake refresh: token permanently invalid')
              break
            }
          }
        }

        // auth_invalid or all network retries exhausted — let 401 handler deal with it
        console.warn('[Auth] Wake refresh failed permanently, session may expire')
      } finally {
        setWakeRefreshInProgress(false)
      }
    } else {
      // Re-schedule the timer — it may have been killed during sleep
      const storedExpiresAt = localStorage.getItem('token_expires_at')
      if (storedExpiresAt) {
        const expiresAt = parseInt(storedExpiresAt, 10)
        if (!isNaN(expiresAt)) {
          scheduleTokenRefresh(expiresAt)
        }
      }
      lastActiveTimestamp = Date.now()
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

  // Guard to prevent overlapping background refresh calls from timer/periodic/visibility
  let backgroundRefreshInProgress = false

  const refreshTokenInBackground = async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      console.log('[Auth] No refresh token available for background refresh')
      return
    }

    if (backgroundRefreshInProgress) {
      console.log('[Auth] Background refresh already in progress, skipping')
      return
    }
    backgroundRefreshInProgress = true

    try {
      const result = await performTokenRefresh()
      if (result.success) {
        scheduleTokenRefresh(result.tokens.expires_at)
        lastActiveTimestamp = Date.now()
        console.log('[Auth] Background token refresh successful')
        return
      }

      // Auth permanently invalid — don't retry
      if (result.reason === 'auth_invalid') {
        console.error('[Auth] Background refresh: token permanently invalid')
        return
      }

      // Network error — retry with backoff
      console.warn('[Auth] Background token refresh failed (network), retrying in 5s')
      await delay(5000)
      const retryResult = await performTokenRefresh()
      if (retryResult.success) {
        scheduleTokenRefresh(retryResult.tokens.expires_at)
        lastActiveTimestamp = Date.now()
        console.log('[Auth] Background token refresh succeeded on retry')
        return
      }

      if (retryResult.reason === 'auth_invalid') {
        console.error('[Auth] Background refresh retry: token permanently invalid')
        return
      }

      // Still network error — schedule another attempt in 30s
      console.warn('[Auth] Background refresh retry failed (network), scheduling another attempt in 30s')
      clearRefreshTimer()
      refreshTimer = setTimeout(() => {
        console.log('[Auth] Deferred background refresh attempt')
        refreshTokenInBackground()
      }, 30000)
    } finally {
      backgroundRefreshInProgress = false
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
    if (!accessToken) return null
    if (!localStorage.getItem('refresh_token')) return null

    // If token is still valid, reuse it — no need to rotate the refresh token
    if (!isTokenExpiringSoon()) {
      return accessToken
    }

    // Token is expiring soon — refresh through the shared lock to prevent races
    console.log('[Auth] getValidToken: token expiring soon, refreshing via performTokenRefresh')
    const result = await performTokenRefresh()
    if (result.success) {
      scheduleTokenRefresh(result.tokens.expires_at)
      return result.tokens.access_token
    }
    // Refresh failed — return current token (may still work for a short time)
    return accessToken
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
