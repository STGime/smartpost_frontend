<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'

const props = defineProps<{
  show: boolean
  isReauth?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const title = computed(() => props.isReauth ? 'Session expired' : 'Welcome back')
const subtitle = computed(() => props.isReauth
  ? 'Please sign in again to continue'
  : 'Sign in to your Posta account')

watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth && !props.isReauth) {
    emit('close')
    router.push('/app')
  }
})

watch(() => props.show, (visible) => {
  if (visible) {
    authStore.error = null
    email.value = ''
    password.value = ''
  }
})

const handleSubmit = async () => {
  try {
    await authStore.login({ email: email.value, password: password.value }, props.isReauth)
    if (props.isReauth) {
      emit('close')
    }
  } catch {
    // Error handled in store
  }
}

const handleBackdropClick = (e: MouseEvent) => {
  // Don't allow closing reauth modal by clicking backdrop
  if (e.target === e.currentTarget && !props.isReauth) {
    emit('close')
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  // Don't allow closing reauth modal with Escape
  if (e.key === 'Escape' && !props.isReauth) {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="modal-backdrop"
        @click="handleBackdropClick"
        @keydown="handleKeydown"
      >
        <div class="modal-content" role="dialog" aria-modal="true">
          <button v-if="!isReauth" class="modal-close" @click="emit('close')" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div class="auth-header">
            <h2>{{ title }}</h2>
            <p>{{ subtitle }}</p>
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
          </div>

          <form @submit.prevent="handleSubmit" class="auth-form">
            <div v-if="authStore.error" class="alert-error">
              {{ authStore.error }}
            </div>

            <div class="form-group">
              <label for="modal-email" class="form-label">Email</label>
              <input
                id="modal-email"
                v-model="email"
                type="email"
                required
                class="form-input"
                placeholder="you@example.com"
                autofocus
              />
            </div>

            <div class="form-group">
              <label for="modal-password" class="form-label">Password</label>
              <div class="input-wrapper">
                <input
                  id="modal-password"
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
              <RouterLink to="/forgot-password" class="link-muted" @click="emit('close')">
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
              <RouterLink to="/signup" class="link-accent" @click="emit('close')">Sign up</RouterLink>
            </p>
          </form>

          <p class="auth-footer">
            By continuing, you agree to our
            <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 400px;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  background: radial-gradient(circle at top left, rgba(79, 70, 229, 0.15), rgba(15, 23, 42, 0.98));
  padding: 32px 28px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius);
  transition: color 0.2s, background 0.2s;
}

.modal-close:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 24px;
}

.auth-header h2 {
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
  margin-top: 20px;
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

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(-10px);
  opacity: 0;
}
</style>
