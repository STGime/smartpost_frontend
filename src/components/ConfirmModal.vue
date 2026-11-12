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
  max-width: 400px;
  width: 100%;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 10px;
}

.icon-wrapper {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper.danger {
  background: var(--error-soft);
  border-color: rgba(229, 103, 79, 0.45);
  color: var(--error);
}

.icon-wrapper.warning {
  background: var(--signal-soft);
  border-color: rgba(242, 169, 59, 0.45);
  color: var(--signal);
}

.icon-wrapper.default {
  background: var(--ink-2);
  border-color: var(--line-strong);
  color: var(--fg-2);
}

.icon-wrapper svg {
  width: 18px;
  height: 18px;
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.modal-body {
  padding: 0 20px 20px 64px;
}

.modal-body p {
  font-size: 14px;
  color: var(--fg-2);
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid var(--line);
}

.btn-cancel,
.btn-confirm {
  padding: 9px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}

.btn-cancel {
  background: var(--ink-1);
  color: var(--text);
  border-color: var(--line-strong);
}

.btn-cancel:hover {
  background: var(--ink-2);
  border-color: var(--fg-3);
}

.btn-confirm.danger {
  background: var(--error);
  border-color: var(--error);
  color: #fff;
}

.btn-confirm.danger:hover {
  background: #d4573f;
  border-color: #d4573f;
}

.btn-confirm.warning {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.btn-confirm.warning:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}

.btn-confirm.default {
  background: var(--text);
  border-color: var(--text);
  color: var(--ink-0);
}

.btn-confirm.default:hover {
  background: #fff;
  border-color: #fff;
}

@media (max-width: 420px) {
  .modal-body {
    padding-left: 20px;
  }

  .btn-cancel,
  .btn-confirm {
    flex: 1;
  }
}
</style>
