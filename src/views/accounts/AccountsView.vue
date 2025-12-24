<script setup lang="ts">
import { onMounted } from 'vue'
import { useSocialAccountsStore } from '@/stores'
import PlatformIcon from '@/components/PlatformIcon.vue'

const socialAccountsStore = useSocialAccountsStore()

onMounted(() => {
  socialAccountsStore.fetchAccounts()
})

const handleDelete = async (accountId: string) => {
  if (confirm('Are you sure you want to disconnect this account?')) {
    await socialAccountsStore.deleteAccount(accountId)
  }
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
        v-for="account in socialAccountsStore.accounts"
        :key="account.id"
        class="account-card card"
      >
        <div class="account-info">
          <PlatformIcon :platform="account.platform" size="lg" />
          <div class="account-details">
            <p class="account-name">{{ account.display_name || account.username }}</p>
            <p class="account-username">@{{ account.username }}</p>
            <p class="account-platform">{{ account.platform }}</p>
          </div>
        </div>
        <div class="account-actions">
          <span :class="['status-badge', `status-${account.status}`]">
            {{ account.status }}
          </span>
          <button @click="handleDelete(account.id)" class="disconnect-btn">
            Disconnect
          </button>
        </div>
      </div>
    </div>
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
</style>
