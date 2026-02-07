<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  startDate?: string | null
  endDate?: string | null
}>()

const emit = defineEmits<{
  change: [{ startDate: string; endDate: string }]
}>()

const localStart = ref(props.startDate || '')
const localEnd = ref(props.endDate || '')

watch(() => props.startDate, (val) => {
  localStart.value = val || ''
})

watch(() => props.endDate, (val) => {
  localEnd.value = val || ''
})

const handleApply = () => {
  if (localStart.value && localEnd.value) {
    emit('change', {
      startDate: localStart.value,
      endDate: localEnd.value,
    })
  }
}
</script>

<template>
  <div class="date-range-picker">
    <input
      v-model="localStart"
      type="date"
      class="date-input"
      :max="localEnd || undefined"
    />
    <span class="date-separator">to</span>
    <input
      v-model="localEnd"
      type="date"
      class="date-input"
      :min="localStart || undefined"
      :max="new Date().toISOString().split('T')[0]"
    />
    <button
      class="btn-apply"
      :disabled="!localStart || !localEnd"
      @click="handleApply"
    >
      Apply
    </button>
  </div>
</template>

<style scoped>
.date-range-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-input {
  padding: 5px 8px;
  font-size: 12px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  color-scheme: dark;
}

.date-input:focus {
  outline: none;
  border-color: var(--accent);
}

.date-separator {
  font-size: 12px;
  color: var(--muted);
}

.btn-apply {
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 500;
  background: var(--accent-soft);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  color: var(--text);
  cursor: pointer;
  transition: all 0.15s;
}

.btn-apply:hover:not(:disabled) {
  background: var(--accent);
}

.btn-apply:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
