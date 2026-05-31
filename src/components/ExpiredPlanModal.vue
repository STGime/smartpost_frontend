<script setup lang="ts">
import { useAuthStore } from '@/stores'
import { useRouter } from 'vue-router'

defineProps<{
  show: boolean
}>()

const router = useRouter()
const authStore = useAuthStore()

const emit = defineEmits<{ choosePlan: [] }>()

const goToPlans = () => {
  // Navigate to billing (no-op if already there) and dismiss the overlay so the
  // "Available Plans" cards underneath become reachable for checkout.
  router.push({ name: 'billing' })
  emit('choosePlan')
}

const signOut = () => {
  authStore.logout()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <div class="icon-wrapper">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>Your plan has expired</h3>
          </div>

          <div class="modal-body">
            <p>Choose a plan to continue using Posta and manage your social media content.</p>
          </div>

          <div class="modal-footer">
            <button class="btn-signout" @click="signOut">
              Sign out
            </button>
            <button class="btn-choose-plan" @click="goToPlans">
              Choose a Plan
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  max-width: 420px;
  width: 100%;
  overflow: hidden;
}

.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px 16px;
  text-align: center;
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.icon-wrapper svg {
  width: 28px;
  height: 28px;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
}

.modal-body {
  padding: 0 24px 24px;
  text-align: center;
}

.modal-body p {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  background: rgba(15, 23, 42, 0.3);
}

.btn-signout {
  flex: 1;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  background: rgba(100, 116, 139, 0.15);
  color: var(--text);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.15s;
}

.btn-signout:hover {
  background: rgba(100, 116, 139, 0.25);
}

.btn-choose-plan {
  flex: 1;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  background: var(--accent);
  color: white;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-choose-plan:hover {
  background: var(--accent-hover, var(--accent));
  filter: brightness(1.1);
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}
</style>
