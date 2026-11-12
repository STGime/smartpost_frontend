<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSocialAccountsStore } from '@/stores'
import type { SocialPlatform, PlatformInfo } from '@/types'
import PlatformIcon from '@/components/PlatformIcon.vue'

const socialAccountsStore = useSocialAccountsStore()

// Filter out platforms that are not yet supported
// X (Twitter) is commented out for now - backend logic is preserved for future use
const availablePlatforms = computed(() =>
  socialAccountsStore.platforms.filter(p => p.id !== 'x')
)

const blueskyIdentifier = ref('')
const blueskyPassword = ref('')
const isConnectingBluesky = ref(false)

// Modal state for platforms requiring logout
const showLogoutModal = ref(false)
const pendingPlatform = ref<PlatformInfo | null>(null)

// Platforms that require manual logout to connect a different account
// These platforms don't support forcing account selection via OAuth parameters
const platformLogoutUrls: Record<string, string> = {
  tiktok: 'https://www.tiktok.com/logout',
  x: 'https://twitter.com/logout',
  linkedin: 'https://www.linkedin.com/m/logout',
}

const requiresLogoutPlatforms: SocialPlatform[] = ['tiktok', 'x', 'linkedin']

const requiresLogout = (platform: SocialPlatform): boolean => {
  return requiresLogoutPlatforms.includes(platform)
}

// Check if user already has accounts connected for this platform
const hasExistingAccount = (platform: SocialPlatform): boolean => {
  return socialAccountsStore.accounts.some(acc => acc.platform === platform)
}

onMounted(() => {
  socialAccountsStore.fetchPlatforms()
  socialAccountsStore.fetchAccounts()
})

const handleConnect = async (platform: SocialPlatform) => {
  if (platform === 'bluesky') {
    return // Use the Bluesky form instead
  }

  // If platform requires logout and user has existing account, show modal
  if (requiresLogout(platform) && hasExistingAccount(platform)) {
    const platformInfo = socialAccountsStore.platforms.find(p => p.id === platform)
    if (platformInfo) {
      pendingPlatform.value = platformInfo
      showLogoutModal.value = true
      return
    }
  }

  await proceedWithOAuth(platform)
}

const proceedWithOAuth = async (platform: SocialPlatform) => {
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

const openPlatformLogout = () => {
  if (pendingPlatform.value) {
    const logoutUrl = platformLogoutUrls[pendingPlatform.value.id]
    if (logoutUrl) {
      window.open(logoutUrl, '_blank')
    }
  }
}

const continueConnect = async () => {
  if (pendingPlatform.value) {
    showLogoutModal.value = false
    await proceedWithOAuth(pendingPlatform.value.id)
  }
}

const closeModal = () => {
  showLogoutModal.value = false
  pendingPlatform.value = null
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
        v-for="platform in availablePlatforms"
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

    <!-- Logout Modal for platforms requiring account switch -->
    <Teleport to="body">
      <div v-if="showLogoutModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-icon">
              <PlatformIcon v-if="pendingPlatform" :platform="pendingPlatform.id" size="lg" />
            </div>
            <h2>Connect Another {{ pendingPlatform?.name }} Account</h2>
          </div>

          <div class="modal-body">
            <p class="modal-description">
              To connect a different {{ pendingPlatform?.name }} account, you need to log out of
              {{ pendingPlatform?.name }} in your browser first.
            </p>

            <div class="modal-steps">
              <div class="step">
                <span class="step-number">1</span>
                <span class="step-text">Click the button below to open {{ pendingPlatform?.name }} and log out</span>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <span class="step-text">Log in with the account you want to connect</span>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <span class="step-text">Come back here and click "Continue"</span>
              </div>
            </div>

            <p class="modal-reassurance">
              This won't affect your existing connections — you can post to all connected accounts.
            </p>
          </div>

          <div class="modal-actions">
            <button @click="closeModal" class="btn-cancel">Cancel</button>
            <button @click="openPlatformLogout" class="btn-open-platform">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open {{ pendingPlatform?.name }}
            </button>
            <button @click="continueConnect" class="btn-continue">
              Continue to Connect
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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
  flex-wrap: wrap;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 4px;
}

.page-header p {
  font-size: 14px;
  color: var(--fg-2);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.alert-error {
  margin-bottom: 16px;
}

/* Loading State */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 64px;
}

/* Platforms list: hairline rows inside one panel */
.platforms-grid {
  display: flex;
  flex-direction: column;
  background: var(--ink-1);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.platform-card {
  padding: 14px 16px;
  border: 0;
  border-radius: 0;
}

.platform-card + .platform-card {
  border-top: 1px solid var(--line);
}

.platform-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.platform-info {
  flex: 1;
  min-width: 0;
}

.platform-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.platform-supports {
  display: flex;
  gap: 6px;
}

.support-tag {
  padding: 1px 6px;
  border: 1px solid var(--line-strong);
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--fg-3);
  text-transform: lowercase;
}

.connect-btn {
  flex-shrink: 0;
  padding: 7px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  background: var(--text);
  color: var(--ink-0);
  border: 1px solid var(--text);
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}

.connect-btn:hover:not(:disabled) {
  background: #ffffff;
  border-color: #ffffff;
}

.connect-btn.btn-disabled {
  background: transparent;
  border-color: var(--line-strong);
  color: var(--fg-3);
  font-family: var(--font-mono);
  font-size: 12px;
  cursor: not-allowed;
}

/* Bluesky Form */
.bluesky-form {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}

.bluesky-note {
  font-size: 12px;
  color: var(--fg-2);
  margin-bottom: 12px;
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

/* Bluesky brand blue kept: the button identifies the platform */
.btn-bluesky {
  width: 100%;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  background: #0085ff;
  color: white;
  border: 1px solid #0085ff;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-bluesky:hover:not(:disabled) {
  background: #0070dd;
}

.btn-bluesky:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Logout Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  background: var(--ink-1);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  max-width: 480px;
  width: 100%;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line);
}

.modal-icon {
  display: flex;
  flex-shrink: 0;
}

.modal-header h2 {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

.modal-body {
  padding: 16px 20px 20px;
}

.modal-description {
  font-size: 14px;
  color: var(--fg-2);
  margin-bottom: 16px;
}

.modal-steps {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  margin-bottom: 16px;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
}

.step + .step {
  border-top: 1px solid var(--line);
}

.step-number {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--signal);
  flex-shrink: 0;
  padding-top: 1px;
}

.step-text {
  font-size: 13px;
  color: var(--text);
}

.modal-reassurance {
  font-size: 12px;
  color: var(--fg-2);
  padding: 10px 12px;
  background: var(--success-soft);
  border: 1px solid rgba(95, 191, 138, 0.35);
  border-radius: var(--radius-sm);
  margin: 0;
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid var(--line);
}

.btn-cancel,
.btn-open-platform,
.btn-continue {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s, color 0.15s;
}

.btn-cancel {
  background: transparent;
  color: var(--fg-2);
  border: 1px solid var(--line-strong);
}

.btn-cancel:hover {
  border-color: var(--fg-3);
  color: var(--text);
}

.btn-open-platform {
  flex: 1;
  background: var(--ink-1);
  color: var(--text);
  border: 1px solid var(--line-strong);
}

.btn-open-platform svg {
  width: 16px;
  height: 16px;
}

.btn-open-platform:hover {
  background: var(--ink-2);
  border-color: var(--fg-3);
}

.btn-continue {
  flex: 1;
  background: var(--text);
  color: var(--ink-0);
  border: 1px solid var(--text);
  white-space: nowrap;
}

.btn-continue:hover {
  background: #ffffff;
  border-color: #ffffff;
}
</style>
