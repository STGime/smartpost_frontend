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
  flex-wrap: wrap;
}

.date-input {
  padding: 5px 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  background: var(--ink-0);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  color: var(--text);
  color-scheme: dark;
  transition: border-color 0.15s;
}

.date-input:focus {
  outline: none;
  border-color: var(--signal);
}

.date-separator {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
}

.btn-apply {
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 500;
  background: var(--text);
  border: 1px solid var(--text);
  border-radius: var(--radius-sm);
  color: var(--ink-0);
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-apply:hover:not(:disabled) {
  background: #ffffff;
}

.btn-apply:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
