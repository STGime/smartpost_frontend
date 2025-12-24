<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores'

const userStore = useUserStore()

const displayName = ref('')
const isSaving = ref(false)
const saveSuccess = ref(false)

onMounted(() => {
  userStore.fetchProfile()
})

watch(() => userStore.profile, (profile) => {
  if (profile) {
    displayName.value = profile.display_name || ''
  }
}, { immediate: true })

const handleSave = async () => {
  isSaving.value = true
  saveSuccess.value = false
  try {
    await userStore.updateProfile({ display_name: displayName.value })
    saveSuccess.value = true
    setTimeout(() => saveSuccess.value = false, 3000)
  } catch {
    // Error handled in store
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="settings-page">
    <div class="page-header">
      <h1>Settings</h1>
      <p>Manage your account preferences</p>
    </div>

    <!-- Profile Section -->
    <div class="settings-section card">
      <div class="section-header">
        <div class="section-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h2>Profile</h2>
          <p>Your personal information</p>
        </div>
      </div>

      <form @submit.prevent="handleSave" class="settings-form">
        <div v-if="saveSuccess" class="alert-success">
          Profile updated successfully
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            :value="userStore.profile?.email"
            type="email"
            disabled
            class="form-input form-input-disabled"
          />
          <p class="form-hint">Email cannot be changed</p>
        </div>

        <div class="form-group">
          <label class="form-label">Display Name</label>
          <input
            v-model="displayName"
            type="text"
            class="form-input"
            placeholder="Your display name"
          />
        </div>

        <div class="form-actions">
          <button
            type="submit"
            :disabled="isSaving"
            class="btn-primary"
          >
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Plan Section -->
    <div class="settings-section card">
      <div class="section-header">
        <div class="section-icon section-icon-plan">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <div>
          <h2>Current Plan</h2>
          <p>Your subscription details</p>
        </div>
      </div>

      <div class="plan-info">
        <div class="plan-details">
          <div class="plan-name">
            <span class="plan-badge">{{ userStore.plan?.plan?.name || 'Free' }}</span>
            <span class="plan-status">{{ userStore.plan?.plan?.status || 'Active' }}</span>
          </div>
          <div class="plan-limits">
            <div class="limit-item">
              <span class="limit-label">Posts/month</span>
              <span class="limit-value">{{ userStore.plan?.usage?.posts_this_month ?? 0 }} / {{ userStore.plan?.limits?.posts_per_month ?? 0 }}</span>
            </div>
            <div class="limit-item">
              <span class="limit-label">Connected accounts</span>
              <span class="limit-value">{{ userStore.plan?.limits?.connected_accounts ?? 0 }}</span>
            </div>
          </div>
        </div>
        <RouterLink to="/app/billing" class="btn-secondary">
          Manage Billing
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 640px;
}

.page-header {
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

/* Settings Section */
.settings-section {
  padding: 20px;
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--accent-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a5b4fc;
  flex-shrink: 0;
}

.section-icon svg {
  width: 20px;
  height: 20px;
}

.section-icon-plan {
  background: var(--success-soft);
  color: #86efac;
}

.section-header h2 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 2px;
}

.section-header p {
  font-size: 13px;
  color: var(--muted);
}

/* Form */
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-input-disabled {
  background: rgba(31, 41, 55, 0.5);
  color: var(--muted);
  cursor: not-allowed;
}

.form-hint {
  font-size: 11px;
  color: var(--muted);
}

.form-actions {
  margin-top: 8px;
}

/* Plan Info */
.plan-info {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

@media (max-width: 500px) {
  .plan-info {
    flex-direction: column;
  }
}

.plan-details {
  flex: 1;
}

.plan-name {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.plan-badge {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 500;
  text-transform: capitalize;
  background: linear-gradient(135deg, var(--accent), var(--cyan));
  color: white;
}

.plan-status {
  font-size: 12px;
  color: var(--green);
  text-transform: capitalize;
}

.plan-limits {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.limit-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-size: 13px;
}

.limit-label {
  color: var(--muted);
}

.limit-value {
  font-weight: 500;
}
</style>
