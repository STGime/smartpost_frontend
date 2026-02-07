<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSocialAccountsStore } from '@/stores'
import PlatformIcon from '@/components/PlatformIcon.vue'
import type { SocialPlatform } from '@/types'

const emit = defineEmits<{
  connected: []
  skip: []
}>()

const socialAccountsStore = useSocialAccountsStore()
const isConnecting = ref<SocialPlatform | null>(null)
const error = ref<string | null>(null)

// Platform configurations
const platforms: { id: SocialPlatform; name: string; description: string }[] = [
  { id: 'instagram', name: 'Instagram', description: 'Share photos and reels' },
  { id: 'tiktok', name: 'TikTok', description: 'Upload short videos' },
  { id: 'youtube', name: 'YouTube', description: 'Upload videos and shorts' },
  { id: 'facebook', name: 'Facebook', description: 'Post to your page' },
  // { id: 'x', name: 'X (Twitter)', description: 'Share tweets' }, // X not supported yet
  { id: 'linkedin', name: 'LinkedIn', description: 'Professional posts' },
  { id: 'pinterest', name: 'Pinterest', description: 'Create pins' },
  { id: 'threads', name: 'Threads', description: 'Share text posts' },
  { id: 'bluesky', name: 'Bluesky', description: 'Decentralized social' },
]

const hasConnectedAccount = computed(() => socialAccountsStore.accounts.length > 0)

// Poll for account changes (in case OAuth completes in another tab)
let pollInterval: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  await socialAccountsStore.fetchAccounts()

  // Start polling while on this step
  pollInterval = setInterval(async () => {
    await socialAccountsStore.fetchAccounts()
    if (hasConnectedAccount.value) {
      emit('connected')
    }
  }, 3000)
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})

const handleConnect = async (platform: SocialPlatform) => {
  isConnecting.value = platform
  error.value = null

  try {
    const response = await socialAccountsStore.initiateOAuth(platform)
    // Redirect to OAuth authorization URL
    window.location.href = response.authorizationUrl
  } catch (err) {
    console.error(`Failed to start ${platform} OAuth:`, err)
    error.value = `Failed to connect ${platform}. Please try again.`
    isConnecting.value = null
  }
}

const handleContinue = () => {
  emit('connected')
}
</script>

<template>
  <div class="connect-account">
    <div class="step-header">
      <h1>Connect your first account</h1>
      <p>Connect at least one social account to start posting.</p>
    </div>

    <!-- Success state -->
    <div v-if="hasConnectedAccount" class="success-state">
      <div class="success-icon">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </div>
      <h2>Account connected!</h2>
      <p>You've connected {{ socialAccountsStore.accounts[0]?.displayName || socialAccountsStore.accounts[0]?.username }}</p>
      <button class="btn-primary btn-continue" @click="handleContinue">
        Continue to dashboard
      </button>
    </div>

    <!-- Platform grid -->
    <div v-else class="platforms-container">
      <div v-if="error" class="alert-error">
        {{ error }}
      </div>

      <div class="platforms-grid">
        <button
          v-for="platform in platforms"
          :key="platform.id"
          class="platform-card"
          :disabled="isConnecting !== null"
          @click="handleConnect(platform.id)"
        >
          <div class="platform-icon-wrapper">
            <PlatformIcon :platform="platform.id" size="lg" />
          </div>
          <div class="platform-info">
            <span class="platform-name">{{ platform.name }}</span>
            <span class="platform-desc">{{ platform.description }}</span>
          </div>
          <div v-if="isConnecting === platform.id" class="connecting-indicator">
            <div class="spinner-sm"></div>
          </div>
        </button>
      </div>

      <button class="btn-skip" @click="emit('skip')">
        Skip for now
      </button>
    </div>
  </div>
</template>

<style scoped>
.connect-account {
  width: 100%;
}

.step-header {
  text-align: center;
  margin-bottom: 32px;
}

.step-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.step-header p {
  color: var(--muted);
  font-size: 15px;
}

/* Success state */
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
}

.success-icon {
  width: 64px;
  height: 64px;
  color: var(--success);
  margin-bottom: 16px;
}

.success-icon svg {
  width: 100%;
  height: 100%;
}

.success-state h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.success-state p {
  color: var(--muted);
  font-size: 14px;
  margin-bottom: 24px;
}

.btn-continue {
  padding: 12px 32px;
  font-size: 14px;
}

/* Platforms container */
.platforms-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.alert-error {
  width: 100%;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  margin-bottom: 24px;
  text-align: center;
  font-size: 14px;
}

.platforms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  width: 100%;
  margin-bottom: 24px;
}

.platform-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: rgba(15, 23, 42, 0.6);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, transform 0.1s;
  text-align: left;
}

.platform-card:hover:not(:disabled) {
  border-color: var(--border-hover);
  background: rgba(15, 23, 42, 0.8);
}

.platform-card:active:not(:disabled) {
  transform: scale(0.98);
}

.platform-card:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.platform-icon-wrapper {
  flex-shrink: 0;
}

.platform-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.platform-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.platform-desc {
  font-size: 12px;
  color: var(--muted);
}

.connecting-indicator {
  flex-shrink: 0;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-skip {
  padding: 10px 24px;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: var(--muted);
  font-size: 14px;
  cursor: pointer;
  transition: color 0.15s;
}

.btn-skip:hover {
  color: var(--text);
}

@media (max-width: 640px) {
  .platforms-grid {
    grid-template-columns: 1fr;
  }
}
</style>
