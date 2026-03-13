import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1'

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Refresh token proactively if it expires within this many seconds
const TOKEN_REFRESH_THRESHOLD_SECONDS = 300 // 5 minutes

// --- Refresh result type: distinguishes network errors from auth errors ---
export type RefreshResult =
  | { success: true; tokens: { access_token: string; refresh_token: string; expires_at: number } }
  | { success: false; reason: 'network' | 'auth_invalid' | 'no_token' }

// Shared refresh lock to prevent concurrent refresh attempts across the app.
// Supabase uses refresh token rotation, so concurrent refreshes with the same
// token will cause one to fail (the token is invalidated after first use).
let activeRefreshPromise: Promise<RefreshResult> | null = null

/**
 * Perform a token refresh with deduplication.
 * If a refresh is already in-flight, returns the same promise.
 * Returns a typed result distinguishing network errors from auth errors.
 */
export const performTokenRefresh = async (): Promise<RefreshResult> => {
  if (activeRefreshPromise) return activeRefreshPromise

  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) return { success: false, reason: 'no_token' }

  const oldRtSuffix = refreshToken.slice(-4)

  activeRefreshPromise = axios.post(`${API_BASE_URL}/auth/refresh`, {
    refresh_token: refreshToken,
  }).then((response): RefreshResult => {
    const { access_token, refresh_token: newRefreshToken, expires_at } = response.data
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', newRefreshToken)
    if (expires_at) {
      localStorage.setItem('token_expires_at', expires_at.toString())
    }
    console.log(`[API] Token refreshed: RT ...${oldRtSuffix} → ...${newRefreshToken.slice(-4)}`)
    return { success: true, tokens: { access_token, refresh_token: newRefreshToken, expires_at } }
  }).catch((error): RefreshResult => {
    const status = error?.response?.status
    // 401 or 403 from refresh endpoint = token is truly invalid
    if (status === 401 || status === 403) {
      console.error('[API] Token refresh failed: auth invalid (HTTP', status, ')')
      return { success: false, reason: 'auth_invalid' }
    }
    // Everything else (network timeout, connection reset, 5xx) = transient
    console.warn('[API] Token refresh failed: network/transient error:', error?.message || error)
    return { success: false, reason: 'network' }
  }).finally(() => {
    activeRefreshPromise = null
  })

  return activeRefreshPromise
}

// --- Wake lock: prevents 401 handler from expiring the session during wake refresh ---
let wakeRefreshInProgress = false
let wakeRefreshPromise: Promise<void> | null = null
let resolveWakeRefresh: (() => void) | null = null

export const setWakeRefreshInProgress = (value: boolean) => {
  wakeRefreshInProgress = value
  if (value) {
    // Create a promise that queued 401 handlers can await
    wakeRefreshPromise = new Promise<void>((resolve) => {
      resolveWakeRefresh = resolve
    })
  } else {
    // Signal queued requests that wake refresh is done
    if (resolveWakeRefresh) {
      resolveWakeRefresh()
      resolveWakeRefresh = null
    }
    wakeRefreshPromise = null
  }
}

// Track proactive refresh to prevent duplicate refreshes
let isProactivelyRefreshing = false

/**
 * Check if the token is about to expire (within threshold)
 */
const isTokenExpiringSoon = (): boolean => {
  const expiresAt = localStorage.getItem('token_expires_at')
  if (!expiresAt) return false

  const expiresAtSeconds = parseInt(expiresAt, 10)
  const nowSeconds = Math.floor(Date.now() / 1000)

  return (expiresAtSeconds - nowSeconds) < TOKEN_REFRESH_THRESHOLD_SECONDS
}

/**
 * Check if the token is already past its expiry time
 */
const isTokenExpired = (): boolean => {
  const expiresAt = localStorage.getItem('token_expires_at')
  if (!expiresAt) return false

  const expiresAtSeconds = parseInt(expiresAt, 10)
  const nowSeconds = Math.floor(Date.now() / 1000)

  return nowSeconds >= expiresAtSeconds
}

/**
 * Proactively refresh the token before it expires
 */
const proactiveRefresh = async (): Promise<string | null> => {
  if (isProactivelyRefreshing) return localStorage.getItem('access_token')

  isProactivelyRefreshing = true

  try {
    const result = await performTokenRefresh()
    if (result.success) {
      console.log('[API] Token proactively refreshed')
      return result.tokens.access_token
    }
    return null
  } finally {
    isProactivelyRefreshing = false
  }
}

// Request interceptor to add auth token (with proactive refresh)
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = localStorage.getItem('access_token')

    // Force refresh if token is already expired, or proactively refresh if expiring soon
    if (token && (isTokenExpired() || isTokenExpiringSoon())) {
      const newToken = await proactiveRefresh()
      if (newToken) {
        token = newToken
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Track if we're currently refreshing to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

// Callback for session expiration - set by auth store
let onSessionExpired: (() => void) | null = null

export const setSessionExpiredHandler = (handler: () => void) => {
  onSessionExpired = handler
}

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const handleSessionExpired = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  if (onSessionExpired) {
    onSessionExpired()
  } else {
    // Fallback: redirect to login if no handler registered
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login'
    }
  }
}

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refresh_token')

      // No refresh token available, redirect to login
      if (!refreshToken) {
        handleSessionExpired()
        return Promise.reject(error)
      }

      // If wake refresh is in progress, wait for it (with timeout) instead of running our own refresh
      if (wakeRefreshInProgress && wakeRefreshPromise) {
        console.log('[API] 401 interceptor: wake refresh in progress, waiting (max 15s)...')
        const WAKE_TIMEOUT_MS = 15000
        const timedOut = Symbol('timeout')
        const result = await Promise.race([
          wakeRefreshPromise.then(() => 'done' as const),
          new Promise<typeof timedOut>(resolve => setTimeout(() => resolve(timedOut), WAKE_TIMEOUT_MS))
        ])
        if (result === timedOut) {
          console.warn('[API] Wake refresh timed out after 15s, falling through to normal refresh')
        }
        // After wake refresh completes (or times out), retry with the new token
        const newToken = localStorage.getItem('access_token')
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          originalRequest._retry = true
          return api(originalRequest)
        }
        // Wake refresh failed to produce a token — fall through to normal handling
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      // Retry with exponential backoff: 2s, 4s, 6s
      const retryDelays = [0, 2000, 4000, 6000] as const

      try {
        for (let attempt = 0; attempt < retryDelays.length; attempt++) {
          const delayMs = retryDelays[attempt]!
          if (delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs))
          }

          // If wake refresh started while we were waiting, defer to it (with timeout)
          if (wakeRefreshInProgress && wakeRefreshPromise) {
            console.log('[API] 401 interceptor: wake refresh started mid-retry, deferring (max 15s)...')
            const MID_RETRY_TIMEOUT_MS = 15000
            await Promise.race([
              wakeRefreshPromise,
              new Promise<void>(resolve => setTimeout(resolve, MID_RETRY_TIMEOUT_MS))
            ])
            const newToken = localStorage.getItem('access_token')
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              processQueue(null, newToken)
              return api(originalRequest)
            }
          }

          const result = await performTokenRefresh()

          if (result.success) {
            originalRequest.headers.Authorization = `Bearer ${result.tokens.access_token}`
            processQueue(null, result.tokens.access_token)
            return api(originalRequest)
          }

          // Auth truly invalid — no point retrying
          if (result.reason === 'auth_invalid') {
            console.error('[API] Refresh token is permanently invalid')
            break
          }

          // Network error — retry on next iteration
          if (attempt < retryDelays.length - 1) {
            console.warn(`[API] 401 refresh attempt ${attempt + 1} failed (network), retrying...`)
          }
        }

        // All retries exhausted or auth_invalid
        processQueue(new Error('Token refresh failed'), null)
        handleSessionExpired()
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
