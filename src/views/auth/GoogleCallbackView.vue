<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores'

const route = useRoute()
const authStore = useAuthStore()

const isLoading = ref(true)
const error = ref<string | null>(null)

onMounted(() => {
  // Check for error in query params first
  const errorParam = route.query.error as string
  if (errorParam) {
    error.value = errorParam
    isLoading.value = false
    return
  }

  // Parse tokens from URL hash (after #)
  const hash = window.location.hash.substring(1) // Remove the #
  if (!hash) {
    error.value = 'No authentication data received'
    isLoading.value = false
    return
  }

  const params = new URLSearchParams(hash)
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  const expiresAt = params.get('expires_at')

  // Support both formats: backend-provided (user_id, user_email) and Supabase direct (JWT)
  let userId: string | null = params.get('user_id')
  let userEmail: string | null = params.get('user_email')
  let userName: string = params.get('user_name') || ''

  // If user info not in params, decode from JWT access token (Supabase direct flow)
  if (accessToken && (!userId || !userEmail)) {
    try {
      const parts = accessToken.split('.')
      if (parts.length < 2) throw new Error('Invalid JWT')
      const payload = JSON.parse(atob(parts[1]!))
      userId = payload.sub || null
      userEmail = payload.email || null
      userName = payload.user_metadata?.full_name || payload.user_metadata?.name || ''
    } catch {
      // JWT decode failed
    }
  }

  if (!accessToken || !refreshToken || !userId || !userEmail) {
    error.value = 'Invalid authentication data'
    isLoading.value = false
    return
  }

  // Pass tokens to auth store
  authStore.loginWithGoogleTokens({
    accessToken,
    refreshToken,
    expiresAt: parseInt(expiresAt || '0', 10),
    userId: userId as string,
    userEmail: userEmail as string,
    userName,
  })

  // Clear the hash from URL for security
  window.history.replaceState(null, '', window.location.pathname)
})
</script>

<template>
  <div class="callback-page">
    <div class="callback-container">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Completing sign in...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="error-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2>Sign in failed</h2>
        <p>{{ error }}</p>
        <RouterLink to="/login" class="btn-primary">
          Try again
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
}

.callback-container {
  text-align: center;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-state p {
  color: var(--muted);
  font-size: 14px;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: var(--error);
}

.error-icon svg {
  width: 100%;
  height: 100%;
}

.error-state h2 {
  font-size: 18px;
  font-weight: 600;
}

.error-state p {
  color: var(--muted);
  font-size: 14px;
  margin-bottom: 8px;
}
</style>
