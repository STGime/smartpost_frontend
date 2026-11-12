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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  background: var(--ink-1);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  max-width: 420px;
  width: 100%;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 22px 20px 10px;
}

.icon-wrapper {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--signal-soft);
  border: 1px solid rgba(242, 169, 59, 0.45);
  color: var(--signal);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper svg {
  width: 18px;
  height: 18px;
}

.modal-header h3 {
  font-size: 17px;
  font-weight: 600;
}

.modal-body {
  padding: 0 20px 22px 64px;
}

.modal-body p {
  font-size: 14px;
  color: var(--fg-2);
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid var(--line);
}

.btn-signout,
.btn-choose-plan {
  padding: 9px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s, color 0.15s;
}

.btn-signout {
  background: transparent;
  color: var(--fg-2);
  border-color: var(--line-strong);
}

.btn-signout:hover {
  color: var(--text);
  border-color: var(--fg-3);
}

.btn-choose-plan {
  background: var(--text);
  color: var(--ink-0);
  border-color: var(--text);
}

.btn-choose-plan:hover {
  background: #fff;
  border-color: #fff;
}

@media (max-width: 420px) {
  .modal-body {
    padding-left: 20px;
  }

  .btn-signout,
  .btn-choose-plan {
    flex: 1;
  }
}

/* Transition: short opacity fade */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
