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
 * Proactively refresh the token before it expires
 */
const proactiveRefresh = async (): Promise<string | null> => {
  if (isProactivelyRefreshing) return localStorage.getItem('access_token')

  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) return null

  isProactivelyRefreshing = true

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    })

    const { access_token, refresh_token: newRefreshToken, expires_at } = response.data
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', newRefreshToken)
    if (expires_at) {
      localStorage.setItem('token_expires_at', expires_at.toString())
    }

    console.log('[API] Token proactively refreshed')
    return access_token
  } catch (error) {
    console.error('[API] Proactive token refresh failed:', error)
    return null
  } finally {
    isProactivelyRefreshing = false
  }
}

// Request interceptor to add auth token (with proactive refresh)
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = localStorage.getItem('access_token')

    // Proactively refresh if token is about to expire
    if (token && isTokenExpiringSoon()) {
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

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        })

        const { access_token, refresh_token: newRefreshToken } = response.data
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', newRefreshToken)

        originalRequest.headers.Authorization = `Bearer ${access_token}`
        processQueue(null, access_token)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as Error, null)
        handleSessionExpired()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
