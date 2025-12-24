<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores'

const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const handleSubmit = async () => {
  try {
    await authStore.login({ email: email.value, password: password.value })
  } catch {
    // Error handled in store
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Logo -->
      <RouterLink to="/" class="auth-logo">
        <div class="logo-mark">
          <div class="logo-inner">P</div>
        </div>
        <span class="logo-text">Posta</span>
      </RouterLink>

      <div class="auth-card">
        <div class="auth-header">
          <h1>Welcome back</h1>
          <p>Sign in to your Posta account</p>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div v-if="authStore.error" class="alert-error">
            {{ authStore.error }}
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="form-input"
              placeholder="you@example.com"
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <div class="input-wrapper">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="form-input"
                placeholder="Enter your password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="input-toggle"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>

          <div class="form-footer">
            <RouterLink to="/forgot-password" class="link-muted">
              Forgot password?
            </RouterLink>
          </div>

          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="btn-primary btn-full"
          >
            {{ authStore.isLoading ? 'Signing in...' : 'Sign in' }}
          </button>

          <p class="auth-switch">
            Don't have an account?
            <RouterLink to="/signup" class="link-accent">Sign up</RouterLink>
          </p>
        </form>
      </div>

      <p class="auth-footer">
        By continuing, you agree to our
        <a href="/terms.html">Terms</a> and <a href="/privacy.html">Privacy Policy</a>.
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
}

.auth-container {
  width: 100%;
  max-width: 400px;
}

.auth-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 32px;
}

.logo-text {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.auth-card {
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  background: radial-gradient(circle at top left, rgba(79, 70, 229, 0.1), rgba(15, 23, 42, 0.95));
  padding: 28px 24px;
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(18px);
}

.auth-header {
  text-align: center;
  margin-bottom: 24px;
}

.auth-header h1 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 6px;
}

.auth-header p {
  font-size: 14px;
  color: var(--muted);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-wrapper {
  position: relative;
}

.input-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--muted);
  font-size: 12px;
  cursor: pointer;
  padding: 4px;
}

.input-toggle:hover {
  color: var(--text);
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: -8px;
}

.link-muted {
  font-size: 13px;
  color: var(--muted);
  transition: color 0.2s;
}

.link-muted:hover {
  color: var(--text);
}

.link-accent {
  color: var(--accent-light);
  font-weight: 500;
}

.link-accent:hover {
  text-decoration: underline;
}

.btn-full {
  width: 100%;
}

.auth-switch {
  text-align: center;
  font-size: 13px;
  color: var(--muted);
}

.auth-footer {
  text-align: center;
  font-size: 11px;
  color: var(--muted);
  margin-top: 24px;
}

.auth-footer a {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.auth-footer a:hover {
  color: var(--text);
}
</style>
