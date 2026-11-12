<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSocialAccountsStore } from '@/stores'
import PlatformIcon from '@/components/PlatformIcon.vue'
import type { SocialAccount } from '@/types'

const socialAccountsStore = useSocialAccountsStore()
const route = useRoute()
const router = useRouter()

const showDisconnectModal = ref(false)
const pendingDeleteAccount = ref<SocialAccount | null>(null)
const isDeleting = ref(false)

const oauthBanner = ref<{ kind: 'success' | 'error'; platform: string; message: string } | null>(null)

const prettyPlatform = (p: string) => p.charAt(0).toUpperCase() + p.slice(1)

const consumeOAuthQueryParams = () => {
  const { platform, error, success, connected, skipped } = route.query
  if (!platform) return

  const platformStr = String(platform)
  if (error) {
    oauthBanner.value = {
      kind: 'error',
      platform: platformStr,
      message: String(error),
    }
  } else if (success) {
    const connectedCount = Number(connected) || 0
    const skippedCount = Number(skipped) || 0
    let message = `${prettyPlatform(platformStr)} connected successfully.`
    if (platformStr === 'facebook' && connectedCount > 1) {
      message = `${connectedCount} Facebook Pages connected. Each Page is its own account.`
    }
    if (skippedCount > 0) {
      message += ` ${skippedCount} more Page${skippedCount === 1 ? ' was' : 's were'} not added because your plan's account limit is reached.`
    }
    oauthBanner.value = { kind: 'success', platform: platformStr, message }
  }

  const {
    platform: _p,
    error: _e,
    success: _s,
    accountId: _a,
    connected: _c,
    skipped: _k,
    ...rest
  } = route.query
  router.replace({ path: route.path, query: rest })
}

onMounted(() => {
  consumeOAuthQueryParams()
  socialAccountsStore.fetchAccounts()
})

// Sort accounts by platform to group same platforms together
const sortedAccounts = computed(() => {
  return [...socialAccountsStore.accounts].sort((a, b) => {
    // First sort by platform name
    const platformCompare = a.platform.localeCompare(b.platform)
    if (platformCompare !== 0) return platformCompare
    // Then by username within same platform
    return (a.username || '').localeCompare(b.username || '')
  })
})

const getAccountStatus = (account: SocialAccount): string => {
  if (!account.isActive) {
    if (account.connectionError?.includes('revoked')) return 'revoked'
    if (account.connectionError?.includes('expired')) return 'expired'
    return 'error'
  }
  return 'active'
}

const handleDelete = (account: SocialAccount) => {
  pendingDeleteAccount.value = account
  showDisconnectModal.value = true
}

const confirmDisconnect = async () => {
  if (!pendingDeleteAccount.value) return
  isDeleting.value = true
  try {
    await socialAccountsStore.deleteAccount(pendingDeleteAccount.value.id)
    closeModal()
  } catch {
    // Error is set in store, will be displayed to user
  } finally {
    isDeleting.value = false
  }
}

const closeModal = () => {
  showDisconnectModal.value = false
  pendingDeleteAccount.value = null
}
</script>

<template>
  <div class="accounts-page">
    <div class="page-header">
      <div>
        <h1>Connected Accounts</h1>
        <p>Manage your social media connections</p>
      </div>
      <RouterLink to="/app/accounts/connect" class="btn-primary">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="btn-icon">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Connect Account
      </RouterLink>
    </div>

    <div v-if="socialAccountsStore.error" class="error-banner">
      {{ socialAccountsStore.error }}
    </div>

    <div
      v-if="oauthBanner"
      :class="['oauth-banner', oauthBanner.kind === 'error' ? 'error-banner' : 'success-banner']"
    >
      <div class="oauth-banner-body">
        <strong>{{ prettyPlatform(oauthBanner.platform) }}:</strong>
        {{ oauthBanner.message }}
        <p
          v-if="oauthBanner.kind === 'error' && oauthBanner.platform === 'facebook' && /no facebook pages/i.test(oauthBanner.message)"
          class="oauth-banner-hint"
        >
          On Facebook's "Edit access" step, tick the Page checkbox for the Page you want to manage, then continue. Pages must be explicitly selected each time.
        </p>
      </div>
      <button type="button" class="oauth-banner-close" aria-label="Dismiss" @click="oauthBanner = null">×</button>
    </div>

    <div v-if="socialAccountsStore.isLoading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else-if="socialAccountsStore.accounts.length === 0" class="empty-state card">
      <div class="empty-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </div>
      <p class="empty-title">No accounts connected</p>
      <p class="empty-sub">Connect your social media accounts to start posting</p>
      <RouterLink to="/app/accounts/connect" class="btn-primary">Connect your first account</RouterLink>
    </div>

    <div v-else class="accounts-list">
      <div
        v-for="account in sortedAccounts"
        :key="account.id"
        class="account-card card"
      >
        <div class="account-info">
          <PlatformIcon :platform="account.platform" size="lg" />
          <div class="account-details">
            <p class="account-name">{{ account.displayName || account.username }}</p>
            <p class="account-username">@{{ account.username }}</p>
            <p class="account-platform">{{ account.platform }}</p>
          </div>
        </div>
        <div class="account-actions">
          <span :class="['status-badge', `status-${getAccountStatus(account)}`]">
            {{ getAccountStatus(account) }}
          </span>
          <button @click="handleDelete(account)" class="disconnect-btn">
            Disconnect
          </button>
        </div>
      </div>
    </div>

    <!-- Disconnect Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDisconnectModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-icon warning">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2>Disconnect Account</h2>
          </div>

          <div class="modal-body">
            <div v-if="pendingDeleteAccount" class="account-preview">
              <PlatformIcon :platform="pendingDeleteAccount.platform" size="md" />
              <div class="account-preview-details">
                <p class="account-preview-name">{{ pendingDeleteAccount.displayName || pendingDeleteAccount.username }}</p>
                <p class="account-preview-username">@{{ pendingDeleteAccount.username }}</p>
              </div>
            </div>

            <p class="modal-description">
              Are you sure you want to disconnect this account? You can reconnect it later.
            </p>
          </div>

          <div class="modal-actions">
            <button @click="closeModal" class="btn-cancel" :disabled="isDeleting">
              Cancel
            </button>
            <button @click="confirmDisconnect" class="btn-disconnect" :disabled="isDeleting">
              {{ isDeleting ? 'Disconnecting...' : 'Disconnect' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.accounts-page {
  max-width: 800px;
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

/* Banners */
.error-banner,
.success-banner {
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  margin-bottom: 16px;
  font-size: 13px;
}

.error-banner {
  background: var(--error-soft);
  border: 1px solid rgba(229, 103, 79, 0.45);
  color: #f2a594;
}

.success-banner {
  background: var(--success-soft);
  border: 1px solid rgba(95, 191, 138, 0.45);
  color: #a8dcbf;
}

.oauth-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.oauth-banner-body {
  flex: 1;
  min-width: 0;
}

.oauth-banner-hint {
  margin: 6px 0 0;
  font-size: 12px;
  opacity: 0.85;
}

.oauth-banner-close {
  background: transparent;
  border: 0;
  color: inherit;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.15s;
}

.oauth-banner-close:hover {
  opacity: 1;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 64px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  border-radius: var(--radius-md);
  background: var(--ink-2);
  border: 1px solid var(--line-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--signal);
}

.empty-icon svg {
  width: 24px;
  height: 24px;
}

.empty-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.empty-sub {
  font-size: 13px;
  color: var(--fg-2);
  margin-bottom: 20px;
}

/* Accounts List: hairline rows inside one panel */
.accounts-list {
  display: flex;
  flex-direction: column;
  background: var(--ink-1);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.account-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border: 0;
  border-radius: 0;
  transition: background-color 0.15s;
}

.account-card + .account-card {
  border-top: 1px solid var(--line);
}

.account-card:hover {
  background: var(--ink-2);
}

@media (max-width: 600px) {
  .account-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .account-actions {
    width: 100%;
    justify-content: space-between;
  }
}

.account-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.account-details {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.account-name {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-username {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--fg-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-platform {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
  text-transform: lowercase;
}

.account-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 7px;
  border: 1px solid var(--line-strong);
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  text-transform: lowercase;
  color: var(--fg-2);
}

.status-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-active {
  border-color: rgba(95, 191, 138, 0.5);
  color: var(--success);
}

.status-expired,
.status-error,
.status-revoked {
  border-color: rgba(229, 103, 79, 0.5);
  color: var(--error);
}

.disconnect-btn {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--fg-2);
  background: transparent;
  border: 1px solid var(--line-strong);
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s, color 0.15s;
}

.disconnect-btn:hover {
  background: var(--error-soft);
  border-color: rgba(229, 103, 79, 0.45);
  color: #f2a594;
}

/* Disconnect Modal */
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
  max-width: 400px;
  width: 100%;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line);
}

.modal-icon {
  display: flex;
  flex-shrink: 0;
}

.modal-icon.warning {
  color: var(--signal);
}

.modal-icon svg {
  width: 18px;
  height: 18px;
}

.modal-header h2 {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

.modal-body {
  padding: 16px 20px 20px;
}

.account-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--ink-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  margin-bottom: 14px;
}

.account-preview-details {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.account-preview-name {
  font-size: 14px;
  font-weight: 500;
}

.account-preview-username {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--fg-2);
}

.modal-description {
  font-size: 14px;
  color: var(--fg-2);
  margin: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid var(--line);
}

.btn-cancel,
.btn-disconnect {
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

.btn-cancel:hover:not(:disabled) {
  border-color: var(--fg-3);
  color: var(--text);
}

.btn-disconnect {
  background: var(--error-soft);
  color: #f2a594;
  border: 1px solid rgba(229, 103, 79, 0.45);
}

.btn-disconnect:hover:not(:disabled) {
  background: rgba(229, 103, 79, 0.2);
}

.btn-cancel:disabled,
.btn-disconnect:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
