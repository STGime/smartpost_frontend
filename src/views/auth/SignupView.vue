<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import { useAuthStore } from '@/stores'

useHead({
  title: 'Sign up',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const displayName = ref('')
const showPassword = ref(false)

const handleSubmit = async () => {
  try {
    await authStore.signup({
      email: email.value,
      password: password.value,
      display_name: displayName.value || undefined,
    })
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
          <h1>Create your account</h1>
          <p>Start posting to all platforms today</p>
        </div>

        <div class="auth-form">
          <button
            type="button"
            @click="authStore.loginWithGoogle()"
            class="btn-google"
          >
            <svg class="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div class="divider">
            <span>or</span>
          </div>

          <div v-if="authStore.error" class="alert-error">
            {{ authStore.error }}
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div class="form-group">
            <label for="displayName" class="form-label">Name <span class="optional">(optional)</span></label>
            <input
              id="displayName"
              v-model="displayName"
              type="text"
              class="form-input"
              placeholder="Your name"
            />
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
                minlength="8"
                class="form-input"
                placeholder="At least 8 characters"
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

          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="btn-primary btn-full"
          >
            {{ authStore.isLoading ? 'Creating account...' : 'Create account' }}
          </button>

          <p class="auth-switch">
            Already have an account?
            <RouterLink to="/login" class="link-accent">Sign in</RouterLink>
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

.optional {
  font-size: 11px;
  color: var(--muted);
  font-weight: 400;
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

.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: #fff;
  border: 1px solid #ddd;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s;
}

.btn-google:hover {
  background: #f8f8f8;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.google-icon {
  width: 18px;
  height: 18px;
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.divider span {
  font-size: 12px;
  color: var(--muted);
  text-transform: uppercase;
}
</style>
