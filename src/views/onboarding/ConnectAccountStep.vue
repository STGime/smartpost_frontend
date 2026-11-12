<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSocialAccountsStore } from '@/stores'
import PlatformIcon from '@/components/PlatformIcon.vue'
import type { SocialPlatform } from '@/types'
import { describeOAuthSuccess, type OAuthResult } from '@/utils/oauthResult'

const props = defineProps<{
  oauthReturn?: OAuthResult | null
}>()

const emit = defineEmits<{
  connected: []
  skip: []
}>()

const socialAccountsStore = useSocialAccountsStore()
const isConnecting = ref<SocialPlatform | null>(null)
const error = ref<string | null>(props.oauthReturn?.error ?? null)

// Platform configurations
const platforms: { id: SocialPlatform; name: string; description: string }[] = [
  { id: 'instagram', name: 'Instagram', description: 'Share photos and reels' },
  { id: 'tiktok', name: 'TikTok', description: 'Upload short videos' },
  { id: 'youtube', name: 'YouTube', description: 'Upload videos and shorts' },
  { id: 'facebook', name: 'Facebook', description: 'Post to your Pages' },
  // { id: 'x', name: 'X (Twitter)', description: 'Share tweets' }, // X not supported yet
  { id: 'linkedin', name: 'LinkedIn', description: 'Professional posts' },
  { id: 'pinterest', name: 'Pinterest', description: 'Create pins' },
  { id: 'threads', name: 'Threads', description: 'Share text posts' },
  // Bluesky connects with an app password, not a login redirect, so it is
  // connected from Accounts after setup instead of here.
]

const hasConnectedAccount = computed(() => socialAccountsStore.accounts.length > 0)

// What to say on the success screen: the login result when we just returned
// from one, otherwise the accounts that are connected.
const connectedSummary = computed(() => {
  const result = props.oauthReturn
  if (result?.success) return describeOAuthSuccess(result)

  const accounts = socialAccountsStore.accounts
  const first = accounts[0]
  if (accounts.length === 1 && first) return [`You've connected ${first.displayName || first.username}.`]
  return [`You've connected ${accounts.length} accounts.`]
})

// A login result (success or error) stays on screen until the user continues
const holdForResult = computed(() => !!props.oauthReturn)

// Poll for account changes (in case OAuth completes in another tab)
let pollInterval: ReturnType<typeof setInterval> | null = null
let unmounted = false

onMounted(async () => {
  await socialAccountsStore.fetchAccounts()
  // The step may have closed while accounts were loading
  if (unmounted) return

  // Polling covers logins finished in another tab. When a login result is
  // shown, accounts still refresh but the user continues manually.
  pollInterval = setInterval(async () => {
    await socialAccountsStore.fetchAccounts()
    if (hasConnectedAccount.value && !holdForResult.value) {
      emit('connected')
    }
  }, 3000)
})

onUnmounted(() => {
  unmounted = true
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})

const handleConnect = async (platform: SocialPlatform) => {
  isConnecting.value = platform
  error.value = null

  try {
    // Come back to onboarding (not the backend's success page) after the login
    const response = await socialAccountsStore.initiateOAuth(
      platform,
      `${window.location.origin}/app/onboarding`
    )
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

    <div v-if="error" class="alert-error step-error">
      {{ error }}
    </div>

    <!-- Success state -->
    <div v-if="hasConnectedAccount" class="success-state">
      <div class="success-icon">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </div>
      <h2>Account connected!</h2>
      <p v-for="line in connectedSummary" :key="line">{{ line }}</p>
      <button class="btn-primary btn-continue" @click="handleContinue">
        Continue to dashboard
      </button>
    </div>

    <!-- Platform grid -->
    <div v-else class="platforms-container">

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

      <p class="platform-notes">
        <strong>Facebook:</strong> every Page you select during the Facebook login is added as its
        own account. <strong>Bluesky</strong> can be connected from Accounts after setup.
      </p>

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

.step-error {
  margin-bottom: 16px;
}

.platform-notes {
  margin: 16px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--fg-2);
  text-align: center;
}

.platform-notes strong {
  color: var(--text);
  font-weight: 500;
}

.step-header {
  text-align: center;
  margin-bottom: 28px;
}

.step-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 6px;
}

.step-header p {
  color: var(--fg-2);
  font-size: 15px;
}

/* Success state */
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 24px;
  background: var(--ink-1);
  border-radius: var(--radius-md);
  border: 1px solid var(--line);
}

.success-icon {
  display: flex;
  padding: 8px;
  margin-bottom: 16px;
  color: var(--success);
  background: var(--success-soft);
  border: 1px solid rgba(95, 191, 138, 0.45);
  border-radius: var(--radius-sm);
}

.success-icon svg {
  width: 24px;
  height: 24px;
}

.success-state h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 6px;
}

.success-state p {
  color: var(--fg-2);
  font-size: 14px;
  margin-bottom: 24px;
}

.btn-continue {
  padding: 10px 24px;
}

/* Platforms container */
.platforms-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.alert-error {
  width: 100%;
  margin-bottom: 24px;
  text-align: center;
}

.platforms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
  width: 100%;
  margin-bottom: 20px;
}

.platform-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--line);
  background: var(--ink-1);
  color: inherit;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
  text-align: left;
}

.platform-card:hover:not(:disabled) {
  border-color: var(--line-strong);
  background: var(--ink-2);
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
  color: var(--fg-3);
}

.connecting-indicator {
  flex-shrink: 0;
}

/* Uses the global `spin` keyframes from style.css */
.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid var(--line-strong);
  border-top-color: var(--signal);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.btn-skip {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid transparent;
  color: var(--fg-2);
  font-family: var(--font-sans);
  font-size: 14px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.btn-skip:hover {
  color: var(--text);
  border-color: var(--line-strong);
}

@media (max-width: 640px) {
  .platforms-grid {
    grid-template-columns: 1fr;
  }
}
</style>
