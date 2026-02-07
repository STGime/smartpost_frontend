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

/* Logout Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  max-width: 480px;
  width: 100%;
  overflow: hidden;
}

.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 24px 16px;
  text-align: center;
}

.modal-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.modal-body {
  padding: 0 24px 24px;
}

.modal-description {
  font-size: 14px;
  color: var(--muted);
  text-align: center;
  margin-bottom: 20px;
}

.modal-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-text {
  font-size: 13px;
  color: var(--text);
  padding-top: 2px;
}

.modal-reassurance {
  font-size: 12px;
  color: var(--muted);
  text-align: center;
  padding: 12px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: var(--radius-md);
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 10px;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid var(--border);
}

.btn-cancel {
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  background: transparent;
  color: var(--muted);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
}

.btn-open-platform {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.15s;
}

.btn-open-platform svg {
  width: 16px;
  height: 16px;
}

.btn-open-platform:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-continue {
  flex: 1;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  background: var(--accent);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-continue:hover {
  opacity: 0.9;
}
</style>
