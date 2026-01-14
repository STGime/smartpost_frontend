<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSocialAccountsStore } from '@/stores'
import PlatformIcon from '@/components/PlatformIcon.vue'
import type { SocialAccount } from '@/types'

const socialAccountsStore = useSocialAccountsStore()

const showDisconnectModal = ref(false)
const pendingDeleteAccount = ref<SocialAccount | null>(null)
const isDeleting = ref(false)

onMounted(() => {
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
  await socialAccountsStore.deleteAccount(pendingDeleteAccount.value.id)
  isDeleting.value = false
  closeModal()
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
  width: 18px;
  height: 18px;
}

/* Loading State */
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
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: var(--radius-full);
  background: rgba(6, 182, 212, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #67e8f9;
}

.empty-icon svg {
  width: 28px;
  height: 28px;
}

.empty-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.empty-sub {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 20px;
}

/* Accounts List */
.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.account-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
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
  gap: 14px;
}

.account-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.account-name {
  font-size: 14px;
  font-weight: 500;
}

.account-username {
  font-size: 13px;
  color: var(--muted);
}

.account-platform {
  font-size: 11px;
  color: var(--muted);
  text-transform: capitalize;
  margin-top: 2px;
}

.account-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-active {
  background: var(--success-soft);
  color: #bbf7d0;
}

.status-expired {
  background: var(--warning-soft);
  color: #fcd34d;
}

.status-error,
.status-revoked {
  background: var(--error-soft);
  color: #fca5a5;
}

.disconnect-btn {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--muted);
  background: none;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.15s;
}

.disconnect-btn:hover {
  background: var(--error-soft);
  border-color: rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

/* Disconnect Modal */
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
  max-width: 400px;
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
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon.warning {
  background: var(--warning-soft);
  color: #fcd34d;
}

.modal-icon svg {
  width: 24px;
  height: 24px;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.modal-body {
  padding: 0 24px 24px;
}

.account-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  margin-bottom: 16px;
}

.account-preview-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.account-preview-name {
  font-size: 14px;
  font-weight: 500;
}

.account-preview-username {
  font-size: 12px;
  color: var(--muted);
}

.modal-description {
  font-size: 14px;
  color: var(--muted);
  text-align: center;
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
  flex: 1;
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

.btn-cancel:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
}

.btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-disconnect {
  flex: 1;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  background: #ef4444;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-disconnect:hover:not(:disabled) {
  background: #dc2626;
}

.btn-disconnect:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
