/**
 * Server-Sent Events service for real-time post updates
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1'

export interface PostStatusUpdateEvent {
  postId: string
  status: 'draft' | 'scheduled' | 'processing' | 'posted' | 'partially_posted' | 'failed'
  publishedAt: string | null
  isDraft: boolean
}

export interface PostResultUpdateEvent {
  postId: string
  socialAccountId: string
  platform: string
  status: 'pending' | 'processing' | 'success' | 'failed'
  platformPostId: string | null
  platformPostUrl: string | null
  errorCode: string | null
  errorMessage: string | null
  publishedAt: string | null
}

type SSEEventType = 'post-status-update' | 'post-result-update' | 'connected'
type SSEEventCallback<T> = (data: T) => void

class PostSSEService {
  private eventSource: EventSource | null = null
  private listeners: Map<SSEEventType, Set<SSEEventCallback<unknown>>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 2000
  private isManuallyDisconnected = false
  private tokenProvider: (() => Promise<string | null>) | null = null

  /**
   * Set the token provider function that returns a fresh token
   */
  setTokenProvider(provider: () => Promise<string | null>): void {
    this.tokenProvider = provider
  }


  /**
   * Connect to the SSE endpoint
   */
  connect(token: string): void {
    if (this.eventSource) {
      console.log('[SSE] Already connected')
      return
    }

    this.isManuallyDisconnected = false
    const url = `${API_BASE_URL}/sse/posts?token=${encodeURIComponent(token)}`
    console.log('[SSE] Connecting to', url.replace(token, '[REDACTED]'))

    this.eventSource = new EventSource(url)

    this.eventSource.onopen = () => {
      console.log('[SSE] Connection opened')
      this.reconnectAttempts = 0
    }

    this.eventSource.onerror = async () => {
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        this.eventSource = null

        if (!this.isManuallyDisconnected && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
          console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

          setTimeout(async () => {
            // Try to get a fresh token before reconnecting
            if (this.tokenProvider) {
              const freshToken = await this.tokenProvider()
              if (freshToken) {
                this.connect(freshToken)
              } else {
                console.log('[SSE] No valid token available, stopping SSE reconnection')
                // Don't trigger auth error - let the API interceptor handle real auth failures
              }
            } else {
              // Fallback: reconnect with original token
              this.connect(token)
            }
          }, delay)
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.log('[SSE] Max reconnection attempts reached, giving up on SSE')
          // Don't trigger auth error - SSE failures are not auth failures.
          // The API interceptor handles real 401s independently.
        }
      }
    }

    // Handle connected event
    this.eventSource.addEventListener('connected', (event) => {
      const data = JSON.parse((event as MessageEvent).data)
      this.emit('connected', data)
    })

    // Handle post status updates
    this.eventSource.addEventListener('post-status-update', (event) => {
      const data = JSON.parse((event as MessageEvent).data) as PostStatusUpdateEvent
      this.emit('post-status-update', data)
    })

    // Handle post result updates
    this.eventSource.addEventListener('post-result-update', (event) => {
      const data = JSON.parse((event as MessageEvent).data) as PostResultUpdateEvent
      this.emit('post-result-update', data)
    })
  }

  /**
   * Disconnect from the SSE endpoint
   */
  disconnect(): void {
    this.isManuallyDisconnected = true
    if (this.eventSource) {
      console.log('[SSE] Disconnecting')
      this.eventSource.close()
      this.eventSource = null
    }
    this.reconnectAttempts = 0
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN
  }

  /**
   * Subscribe to an event type
   */
  on<T>(event: SSEEventType, callback: SSEEventCallback<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback as SSEEventCallback<unknown>)
  }

  /**
   * Unsubscribe from an event type
   */
  off<T>(event: SSEEventType, callback: SSEEventCallback<T>): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(callback as SSEEventCallback<unknown>)
    }
  }

  /**
   * Emit an event to all listeners
   */
  private emit(event: SSEEventType, data: unknown): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data))
    }
  }

}

// Export singleton instance
export const postSSEService = new PostSSEService()
