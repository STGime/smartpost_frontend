<script setup lang="ts">
import { ref, watch } from 'vue'
import { waitingListService, type WaitingListSource } from '@/services'

const props = defineProps<{
  show: boolean
  source: WaitingListSource
}>()

const emit = defineEmits<{
  close: []
}>()

const email = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)
const isSuccess = ref(false)
const successMessage = ref('')

watch(() => props.show, (visible) => {
  if (visible) {
    email.value = ''
    error.value = null
    isSuccess.value = false
    successMessage.value = ''
  }
})

const handleSubmit = async () => {
  if (!email.value.trim()) {
    error.value = 'Please enter your email address'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const response = await waitingListService.join(email.value, props.source)
    isSuccess.value = true
    successMessage.value = response.message
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { error?: string } } }
    error.value = axiosError.response?.data?.error || 'Something went wrong. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
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
          <button class="modal-close" @click="emit('close')" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <!-- Success State -->
          <template v-if="isSuccess">
            <div class="success-state">
              <div class="success-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2>You're on the list!</h2>
              <p>{{ successMessage }}</p>
              <button class="btn-primary btn-full" @click="emit('close')">
                Got it
              </button>
            </div>
          </template>

          <!-- Form State -->
          <template v-else>
            <div class="auth-header">
              <h2>Join the waiting list</h2>
              <p>Leave your email and we'll reach out when there's a spot for you.</p>
            </div>

            <form @submit.prevent="handleSubmit" class="auth-form">
              <div v-if="error" class="alert-error">
                {{ error }}
              </div>

              <div class="form-group">
                <label for="waitlist-email" class="form-label">Email</label>
                <input
                  id="waitlist-email"
                  v-model="email"
                  type="email"
                  required
                  class="form-input"
                  placeholder="you@example.com"
                  autofocus
                />
              </div>

              <button
                type="submit"
                :disabled="isLoading"
                class="btn-primary btn-full"
              >
                {{ isLoading ? 'Joining...' : 'Join waiting list' }}
              </button>
            </form>

            <p class="auth-footer">
              We'll only use your email to notify you about Posta. No spam, ever.
            </p>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1000;
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 400px;
  border-radius: var(--radius-md);
  border: 1px solid var(--line-strong);
  background: var(--ink-1);
  padding: 28px 24px 24px;
  box-shadow: var(--shadow-lg);
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  background: none;
  border: 1px solid transparent;
  color: var(--fg-3);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: color 0.15s, border-color 0.15s;
}

.modal-close:hover {
  color: var(--text);
  border-color: var(--line-strong);
}

.auth-header {
  margin-bottom: 22px;
  padding-right: 24px;
}

.auth-header h2,
.success-state h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.auth-header p {
  font-size: 14px;
  color: var(--fg-2);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.auth-footer {
  font-size: 12px;
  color: var(--fg-3);
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

/* Success state */
.success-state {
  padding: 4px 0 0;
}

.success-icon {
  display: inline-flex;
  padding: 8px;
  margin-bottom: 16px;
  color: var(--success);
  background: var(--success-soft);
  border: 1px solid rgba(95, 191, 138, 0.45);
  border-radius: var(--radius-sm);
}

.success-icon svg {
  width: 24px;
  height: 24px;
}

.success-state p {
  font-size: 14px;
  color: var(--fg-2);
  margin-bottom: 24px;
}

/* Modal transition: short opacity fade */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
