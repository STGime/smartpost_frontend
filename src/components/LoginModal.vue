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
