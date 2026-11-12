<script setup lang="ts">
import { ref, watch } from 'vue'
import { feedbackService, type FeedbackCategory } from '@/services'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const categories: { value: FeedbackCategory; label: string; icon: string }[] = [
  { value: 'bug', label: 'Bug', icon: 'bug' },
  { value: 'feature', label: 'Feature request', icon: 'feature' },
  { value: 'improvement', label: 'Improvement', icon: 'improvement' },
  { value: 'other', label: 'Other', icon: 'other' },
]

const selectedCategory = ref<FeedbackCategory>('bug')
const comment = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)
const isSuccess = ref(false)

watch(() => props.show, (visible) => {
  if (visible) {
    selectedCategory.value = 'bug'
    comment.value = ''
    error.value = null
    isSuccess.value = false
  }
})

const handleSubmit = async () => {
  const trimmed = comment.value.trim()
  if (!trimmed) {
    error.value = 'Please describe your feedback'
    return
  }
  if (trimmed.length > 2000) {
    error.value = 'Feedback must be under 2000 characters'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    await feedbackService.submit(selectedCategory.value, trimmed)
    isSuccess.value = true
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
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="modal-backdrop"
        @click="handleBackdropClick"
        @keydown.escape="emit('close')"
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
              <h2>Thanks for your feedback!</h2>
              <p>We appreciate you taking the time to help us improve Posta.</p>
              <button class="btn-primary btn-full" @click="emit('close')">
                Done
              </button>
            </div>
          </template>

          <!-- Form State -->
          <template v-else>
            <div class="feedback-header">
              <h2>Send feedback</h2>
              <p>Help us improve Posta by sharing your thoughts.</p>
            </div>

            <form @submit.prevent="handleSubmit" class="feedback-form">
              <div v-if="error" class="alert-error">
                {{ error }}
              </div>

              <div class="form-group">
                <label class="form-label">Category</label>
                <div class="category-grid">
                  <button
                    v-for="cat in categories"
                    :key="cat.value"
                    type="button"
                    :class="['category-btn', { 'category-btn-active': selectedCategory === cat.value }]"
                    @click="selectedCategory = cat.value"
                  >
                    <svg v-if="cat.icon === 'bug'" class="category-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <svg v-else-if="cat.icon === 'feature'" class="category-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <svg v-else-if="cat.icon === 'improvement'" class="category-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <svg v-else class="category-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{{ cat.label }}</span>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label for="feedback-comment" class="form-label">Description</label>
                <textarea
                  id="feedback-comment"
                  v-model="comment"
                  class="form-input form-textarea"
                  placeholder="Describe your issue, idea, or suggestion..."
                  rows="4"
                  maxlength="2000"
                  required
                ></textarea>
                <span class="char-count" :class="{ 'char-count-warn': comment.length > 1800 }">{{ comment.length }} / 2000</span>
              </div>

              <button
                type="submit"
                :disabled="isLoading || !comment.trim()"
                class="btn-primary btn-full"
              >
                {{ isLoading ? 'Sending...' : 'Send feedback' }}
              </button>
            </form>
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
  max-width: 440px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
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

.feedback-header {
  margin-bottom: 22px;
  padding-right: 24px;
}

.feedback-header h2,
.success-state h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.feedback-header p {
  font-size: 14px;
  color: var(--fg-2);
}

.feedback-form {
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

.category-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  background: var(--ink-2);
  color: var(--fg-2);
  font-family: var(--font-sans);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s, color 0.15s;
}

.category-btn:hover {
  border-color: var(--line-strong);
  color: var(--text);
}

.category-btn-active,
.category-btn-active:hover {
  border-color: var(--signal);
  background: var(--signal-soft);
  color: var(--text);
}

.category-btn-active .category-icon {
  color: var(--signal);
}

.category-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  max-height: 250px;
  font-family: inherit;
}

.char-count {
  margin-top: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
  text-align: right;
}

.char-count-warn {
  color: var(--signal);
}

.btn-full {
  width: 100%;
}

/* Success state */
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
