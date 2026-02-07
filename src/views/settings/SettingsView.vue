<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, useAuthStore } from '@/stores'
import { userService } from '@/services'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()

// Profile edit state
const displayName = ref('')
const isEditingName = ref(false)
const isSavingName = ref(false)
const nameSuccess = ref(false)
const nameError = ref<string | null>(null)

// Password change state
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isChangingPassword = ref(false)
const passwordSuccess = ref(false)
const passwordError = ref<string | null>(null)

// Delete account state
const showDeleteConfirm = ref(false)
const deleteConfirmText = ref('')
const isDeletingAccount = ref(false)
const deleteError = ref<string | null>(null)

const passwordsMatch = computed(() => newPassword.value === confirmPassword.value)
const isPasswordValid = computed(() => newPassword.value.length >= 8)
const canSubmitPassword = computed(() =>
  currentPassword.value &&
  newPassword.value &&
  confirmPassword.value &&
  passwordsMatch.value &&
  isPasswordValid.value
)

onMounted(async () => {
  await Promise.all([
    userStore.fetchProfile(),
    userStore.fetchPlan()
  ])
  displayName.value = userStore.profile?.display_name || ''
})

// Update displayName when profile changes
watch(() => userStore.profile?.display_name, (newName) => {
  if (!isEditingName.value) {
    displayName.value = newName || ''
  }
})

const startEditingName = () => {
  displayName.value = userStore.profile?.display_name || ''
  isEditingName.value = true
}

const cancelEditingName = () => {
  displayName.value = userStore.profile?.display_name || ''
  isEditingName.value = false
  nameError.value = null
}

const saveName = async () => {
  isSavingName.value = true
  nameSuccess.value = false
  nameError.value = null

  try {
    await userStore.updateProfile({ display_name: displayName.value || undefined })
    isEditingName.value = false
    nameSuccess.value = true
    setTimeout(() => nameSuccess.value = false, 3000)
  } catch {
    nameError.value = userStore.error || 'Failed to update name'
  } finally {
    isSavingName.value = false
  }
}

const handlePasswordChange = async () => {
  if (!canSubmitPassword.value) return

  isChangingPassword.value = true
  passwordSuccess.value = false
  passwordError.value = null

  try {
    await authStore.changePassword(currentPassword.value, newPassword.value)
    passwordSuccess.value = true
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    setTimeout(() => passwordSuccess.value = false, 3000)
  } catch {
    passwordError.value = authStore.error || 'Failed to change password'
  } finally {
    isChangingPassword.value = false
  }
}

const canDeleteAccount = computed(() => deleteConfirmText.value === 'DELETE')

const handleDeleteAccount = async () => {
  if (!canDeleteAccount.value) return

  isDeletingAccount.value = true
  deleteError.value = null

  try {
    await userService.deleteAccount()
    // Clear auth tokens and redirect to home
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    router.push('/')
  } catch {
    deleteError.value = 'Failed to delete account. Please try again or contact support.'
  } finally {
    isDeletingAccount.value = false
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

      <div class="settings-form">
        <div v-if="nameSuccess" class="alert-success">
          Name updated successfully
        </div>
        <div v-if="nameError" class="alert-error">
          {{ nameError }}
        </div>

        <div class="form-group">
          <label class="form-label">Name</label>
          <div v-if="isEditingName" class="input-with-actions">
            <input
              v-model="displayName"
              type="text"
              class="form-input"
              placeholder="Enter your name"
            />
            <div class="input-actions">
              <button
                type="button"
                @click="saveName"
                :disabled="isSavingName"
                class="btn-primary btn-sm"
              >
                {{ isSavingName ? 'Saving...' : 'Save' }}
              </button>
              <button
                type="button"
                @click="cancelEditingName"
                :disabled="isSavingName"
                class="btn-secondary btn-sm"
              >
                Cancel
              </button>
            </div>
          </div>
          <div v-else class="value-with-edit">
            <span class="profile-value">{{ userStore.profile?.display_name || 'Not set' }}</span>
            <button type="button" @click="startEditingName" class="btn-link">
              Edit
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            :value="userStore.profile?.email"
            type="email"
            disabled
            class="form-input form-input-disabled"
          />
        </div>
      </div>
    </div>

    <!-- Security Section -->
    <div class="settings-section card">
      <div class="section-header">
        <div class="section-icon section-icon-security">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <h2>Security</h2>
          <p>Manage your password</p>
        </div>
      </div>

      <form @submit.prevent="handlePasswordChange" class="settings-form">
        <div v-if="passwordSuccess" class="alert-success">
          Password changed successfully
        </div>
        <div v-if="passwordError" class="alert-error">
          {{ passwordError }}
        </div>

        <div class="form-group">
          <label class="form-label">Current Password</label>
          <input
            v-model="currentPassword"
            type="password"
            class="form-input"
            placeholder="Enter your current password"
            autocomplete="current-password"
          />
        </div>

        <div class="form-group">
          <label class="form-label">New Password</label>
          <input
            v-model="newPassword"
            type="password"
            class="form-input"
            :class="{ 'form-input-error': newPassword && !isPasswordValid }"
            placeholder="Enter new password"
            autocomplete="new-password"
          />
          <p v-if="newPassword && !isPasswordValid" class="form-error">
            Password must be at least 8 characters
          </p>
        </div>

        <div class="form-group">
          <label class="form-label">Confirm New Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="form-input"
            :class="{ 'form-input-error': confirmPassword && !passwordsMatch }"
            placeholder="Confirm new password"
            autocomplete="new-password"
          />
          <p v-if="confirmPassword && !passwordsMatch" class="form-error">
            Passwords do not match
          </p>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            :disabled="!canSubmitPassword || isChangingPassword"
            class="btn-primary"
          >
            {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
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
            <span class="plan-badge">{{ userStore.plan?.plan?.type === 'trial' ? 'Starter (Trial)' : (userStore.plan?.plan?.type || 'Free') }}</span>
            <span class="plan-status">{{ userStore.plan?.plan?.status || 'Active' }}</span>
          </div>
          <div v-if="userStore.plan?.plan?.type === 'trial' && userStore.plan?.plan?.days_remaining" class="plan-trial">
            {{ userStore.plan.plan.days_remaining }} days remaining
          </div>
          <div class="plan-limits">
            <div class="limit-item">
              <span class="limit-label">Posts/month</span>
              <span class="limit-value">{{ userStore.plan?.usage?.posts_this_month ?? 0 }} / {{ userStore.plan?.plan?.limits?.max_posts_per_month ?? 0 }}</span>
            </div>
            <div class="limit-item">
              <span class="limit-label">Connected accounts</span>
              <span class="limit-value">{{ userStore.plan?.usage?.connected_accounts ?? 0 }} / {{ userStore.plan?.plan?.limits?.max_social_accounts ?? 0 }}</span>
            </div>
          </div>
        </div>
        <RouterLink to="/app/billing" class="btn-secondary">
          Manage Billing
        </RouterLink>
      </div>
    </div>

    <!-- Danger Zone Section -->
    <div class="settings-section card danger-section">
      <div class="section-header">
        <div class="section-icon section-icon-danger">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h2>Danger Zone</h2>
          <p>Irreversible account actions</p>
        </div>
      </div>

      <div class="danger-content">
        <div v-if="!showDeleteConfirm">
          <p class="danger-warning">
            Deleting your account will permanently remove all your data, including posts, connected social accounts, and media files. This action cannot be undone.
          </p>
          <button type="button" @click="showDeleteConfirm = true" class="btn-danger">
            Delete Account
          </button>
        </div>

        <div v-else class="delete-confirm">
          <div v-if="deleteError" class="alert-error">
            {{ deleteError }}
          </div>

          <p class="danger-warning">
            Are you sure? This will permanently delete:
          </p>
          <ul class="delete-list">
            <li>All your posts and scheduled content</li>
            <li>All connected social accounts</li>
            <li>All uploaded media files</li>
            <li>Your account and profile data</li>
          </ul>

          <div class="form-group">
            <label class="form-label">Type DELETE to confirm</label>
            <input
              v-model="deleteConfirmText"
              type="text"
              class="form-input"
              placeholder="DELETE"
              autocomplete="off"
            />
          </div>

          <div class="delete-actions">
            <button
              type="button"
              @click="handleDeleteAccount"
              :disabled="!canDeleteAccount || isDeletingAccount"
              class="btn-danger"
            >
              {{ isDeletingAccount ? 'Deleting...' : 'Permanently Delete Account' }}
            </button>
            <button
              type="button"
              @click="showDeleteConfirm = false; deleteConfirmText = ''; deleteError = null"
              :disabled="isDeletingAccount"
              class="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
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

.section-icon-security {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
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

.form-input-error {
  border-color: var(--error);
}

.form-error {
  font-size: 11px;
  color: var(--error);
}

.form-actions {
  margin-top: 8px;
}

.input-with-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.value-with-edit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  background: rgba(31, 41, 55, 0.5);
}

.profile-value {
  font-size: 14px;
  color: var(--text);
}

.profile-value:empty::before,
.value-with-edit .profile-value:not(:empty) + .btn-link {
  color: var(--muted);
}

.btn-link {
  background: none;
  border: none;
  color: var(--accent-light);
  font-size: 13px;
  cursor: pointer;
  padding: 0;
}

.btn-link:hover {
  text-decoration: underline;
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

.plan-trial {
  font-size: 13px;
  color: var(--accent-light);
  margin-bottom: 12px;
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

/* Danger Zone */
.danger-section {
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.section-icon-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.danger-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.danger-warning {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
  margin-bottom: 12px;
}

.delete-list {
  font-size: 13px;
  color: var(--muted);
  margin: 0 0 16px 0;
  padding-left: 20px;
}

.delete-list li {
  margin-bottom: 4px;
}

.delete-confirm {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.delete-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
