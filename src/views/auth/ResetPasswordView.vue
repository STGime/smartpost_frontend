<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import { useAuthStore } from '@/stores'

useHead({
  title: 'Reset Password',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const authStore = useAuthStore()
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)

const handleSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    authStore.error = 'Passwords do not match'
    return
  }
  try {
    await authStore.resetPassword(password.value)
  } catch {
    // Error handled in store
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1>Set new password</h1>
        <p>Enter your new password below</p>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-card">
        <div v-if="authStore.error" class="alert-error">
          {{ authStore.error }}
        </div>

        <div class="form-group">
          <label for="password" class="form-label">New Password</label>
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            minlength="8"
            class="form-input"
            placeholder="At least 8 characters"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            required
            class="form-input"
            placeholder="Confirm your password"
          />
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="btn-primary btn-full"
        >
          {{ authStore.isLoading ? 'Resetting...' : 'Reset password' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  background: var(--ink-0);
}

.auth-container {
  width: 100%;
  max-width: 400px;
}

.auth-header {
  margin-bottom: 20px;
}

.auth-header h1 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.auth-header p {
  font-size: 14px;
  color: var(--fg-2);
}

.auth-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--line);
  background: var(--ink-1);
  padding: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fg-3);
}

.btn-full {
  width: 100%;
}
</style>
