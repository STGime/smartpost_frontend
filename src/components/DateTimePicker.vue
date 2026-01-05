<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string | null
    placeholder?: string
    min?: string
    disabled?: boolean
  }>(),
  {
    placeholder: 'Select date and time',
    disabled: false,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

// Default min to now (format: YYYY-MM-DDTHH:mm)
const minDateTime = computed(() => {
  if (props.min) return props.min
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  if (value) {
    // Convert local datetime to ISO string
    const date = new Date(value)
    emit('update:modelValue', date.toISOString())
  } else {
    emit('update:modelValue', null)
  }
}

// Convert ISO string back to datetime-local format for input
const displayValue = computed(() => {
  if (!props.modelValue) return ''
  const date = new Date(props.modelValue)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
})
</script>

<template>
  <div class="datetime-picker">
    <input
      type="datetime-local"
      class="datetime-input"
      :value="displayValue"
      :min="minDateTime"
      :disabled="disabled"
      @input="handleInput"
    />
    <svg class="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  </div>
</template>

<style scoped>
.datetime-picker {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.datetime-input {
  width: 100%;
  padding: 10px 12px;
  padding-right: 40px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: rgba(15, 23, 42, 0.9);
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
  cursor: pointer;
}

.datetime-input:focus {
  outline: none;
  border-color: var(--accent);
}

.datetime-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Style the calendar picker icon */
.datetime-input::-webkit-calendar-picker-indicator {
  position: absolute;
  right: 12px;
  width: 20px;
  height: 20px;
  opacity: 0;
  cursor: pointer;
}

.calendar-icon {
  position: absolute;
  right: 12px;
  width: 18px;
  height: 18px;
  color: var(--muted);
  pointer-events: none;
}

/* Dark theme for date picker dropdown */
.datetime-input::-webkit-datetime-edit {
  color: var(--text);
}

.datetime-input::-webkit-datetime-edit-fields-wrapper {
  color: var(--text);
}

.datetime-input::-webkit-datetime-edit-text {
  color: var(--muted);
}

.datetime-input::-webkit-datetime-edit-month-field,
.datetime-input::-webkit-datetime-edit-day-field,
.datetime-input::-webkit-datetime-edit-year-field,
.datetime-input::-webkit-datetime-edit-hour-field,
.datetime-input::-webkit-datetime-edit-minute-field,
.datetime-input::-webkit-datetime-edit-ampm-field {
  color: var(--text);
}

.datetime-input::-webkit-datetime-edit-month-field:focus,
.datetime-input::-webkit-datetime-edit-day-field:focus,
.datetime-input::-webkit-datetime-edit-year-field:focus,
.datetime-input::-webkit-datetime-edit-hour-field:focus,
.datetime-input::-webkit-datetime-edit-minute-field:focus,
.datetime-input::-webkit-datetime-edit-ampm-field:focus {
  background: var(--accent-soft);
  color: var(--text);
}
</style>
