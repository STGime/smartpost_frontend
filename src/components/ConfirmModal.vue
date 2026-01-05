<script setup lang="ts">
defineProps<{
  show: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="emit('cancel')">
      <div class="modal-content">
        <div class="modal-header">
          <div class="icon-wrapper" :class="variant || 'danger'">
            <svg v-if="variant === 'warning'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3>{{ title || 'Confirm Action' }}</h3>
        </div>

        <div class="modal-body">
          <p>{{ message }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="emit('cancel')">
            {{ cancelText || 'Cancel' }}
          </button>
          <button
            :class="['btn-confirm', variant || 'danger']"
            @click="emit('confirm')"
          >
            {{ confirmText || 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
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
  max-width: 400px;
  width: 100%;
  overflow: hidden;
}

.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 24px 16px;
  text-align: center;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.icon-wrapper.danger {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.icon-wrapper.warning {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.icon-wrapper.default {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.icon-wrapper svg {
  width: 24px;
  height: 24px;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
}

.modal-body {
  padding: 0 24px 24px;
  text-align: center;
}

.modal-body p {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  background: rgba(15, 23, 42, 0.3);
}

.btn-cancel {
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

.btn-cancel:hover {
  background: rgba(100, 116, 139, 0.25);
}

.btn-confirm {
  flex: 1;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-confirm.danger {
  background: #dc2626;
  color: white;
}

.btn-confirm.danger:hover {
  background: #b91c1c;
}

.btn-confirm.warning {
  background: #d97706;
  color: white;
}

.btn-confirm.warning:hover {
  background: #b45309;
}

.btn-confirm.default {
  background: #2563eb;
  color: white;
}

.btn-confirm.default:hover {
  background: #1d4ed8;
}
</style>
