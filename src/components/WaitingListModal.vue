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

.btn-full {
  width: 100%;
}

.auth-footer {
  text-align: center;
  font-size: 11px;
  color: var(--muted);
  margin-top: 20px;
}

/* Success state */
.success-state {
  text-align: center;
  padding: 12px 0;
}

.success-icon {
  color: #22c55e;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.success-state h2 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 8px;
}

.success-state p {
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 24px;
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
