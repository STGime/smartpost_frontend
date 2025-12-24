<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSocialAccountsStore } from '@/stores'
import type { SocialPlatform } from '@/types'
import PlatformIcon from '@/components/PlatformIcon.vue'

const socialAccountsStore = useSocialAccountsStore()

const blueskyIdentifier = ref('')
const blueskyPassword = ref('')
const isConnectingBluesky = ref(false)

onMounted(() => {
  socialAccountsStore.fetchPlatforms()
})

const handleConnect = async (platform: SocialPlatform) => {
  if (platform === 'bluesky') {
    return // Use the Bluesky form instead
  }

  try {
    const { authorizationUrl } = await socialAccountsStore.initiateOAuth(
      platform,
      `${window.location.origin}/oauth/callback`
    )
    window.location.href = authorizationUrl
  } catch {
    // Error handled in store
  }
}

const handleConnectBluesky = async () => {
  isConnectingBluesky.value = true
  try {
    await socialAccountsStore.connectBluesky(blueskyIdentifier.value, blueskyPassword.value)
    blueskyIdentifier.value = ''
    blueskyPassword.value = ''
  } catch {
    // Error handled in store
  } finally {
    isConnectingBluesky.value = false
  }
}
</script>

<template>
  <div class="connect-page">
    <div class="page-header">
      <div>
        <h1>Connect Account</h1>
        <p>Choose a platform to connect</p>
      </div>
      <RouterLink to="/app/accounts" class="btn-secondary">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="btn-icon">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </RouterLink>
    </div>

    <div v-if="socialAccountsStore.error" class="alert-error">
      {{ socialAccountsStore.error }}
    </div>

    <div v-if="socialAccountsStore.isLoading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else class="platforms-grid">
      <div
        v-for="platform in socialAccountsStore.platforms"
        :key="platform.id"
        class="platform-card card"
      >
        <div class="platform-header">
          <PlatformIcon :platform="platform.id" size="lg" />
          <div class="platform-info">
            <p class="platform-name">{{ platform.name }}</p>
            <p class="platform-supports">
              <span v-if="platform.supportsVideo" class="support-tag">Video</span>
              <span v-if="platform.supportsImage" class="support-tag">Image</span>
            </p>
          </div>
          <button
            v-if="platform.id !== 'bluesky'"
            @click="handleConnect(platform.id)"
            :disabled="!platform.isConfigured"
            :class="['connect-btn', { 'btn-disabled': !platform.isConfigured }]"
          >
            {{ platform.isConfigured ? 'Connect' : 'Coming Soon' }}
          </button>
        </div>

        <!-- Bluesky special form -->
        <div v-if="platform.id === 'bluesky'" class="bluesky-form">
          <p class="bluesky-note">
            Bluesky uses app passwords. Create one in your Bluesky settings under "App Passwords".
          </p>
          <form @submit.prevent="handleConnectBluesky" class="form-stack">
            <div class="form-group">
              <input
                v-model="blueskyIdentifier"
                type="text"
                placeholder="Handle (e.g., user.bsky.social)"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <input
                v-model="blueskyPassword"
                type="password"
                placeholder="App password"
                class="form-input"
              />
            </div>
            <button
              type="submit"
              :disabled="!blueskyIdentifier || !blueskyPassword || isConnectingBluesky"
              class="btn-bluesky"
            >
              {{ isConnectingBluesky ? 'Connecting...' : 'Connect Bluesky' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.connect-page {
  max-width: 700px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 4px;
}

.page-header p {
  font-size: 14px;
  color: var(--muted);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

/* Loading State */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 64px;
}

/* Platforms Grid */
.platforms-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.platform-card {
  padding: 18px;
}

.platform-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.platform-info {
  flex: 1;
  min-width: 0;
}

.platform-name {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
}

.platform-supports {
  display: flex;
  gap: 6px;
}

.support-tag {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 10px;
  background: rgba(100, 116, 139, 0.15);
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.connect-btn {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  background: var(--accent);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}

.connect-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-disabled {
  background: rgba(100, 116, 139, 0.2);
  color: var(--muted);
  cursor: not-allowed;
}

/* Bluesky Form */
.bluesky-form {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.bluesky-note {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 14px;
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.btn-bluesky {
  width: 100%;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  background: #0085FF;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-bluesky:hover:not(:disabled) {
  background: #0070DD;
}

.btn-bluesky:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
