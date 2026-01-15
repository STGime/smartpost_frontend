<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'

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

// State
const isOpen = ref(false)
const activeTab = ref<'date' | 'time'>('date')
const viewYear = ref(new Date().getFullYear())
const viewMonth = ref(new Date().getMonth())
const dropdownRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)

// Dropdown positioning
const dropdownStyle = ref({
  top: '0px',
  left: '0px',
  width: '0px'
})

function updateDropdownPosition() {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    top: `${rect.bottom + window.scrollY + 8}px`,
    left: `${rect.left + window.scrollX}px`,
    width: `${rect.width}px`
  }
}

// Constants
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Hour options (0-23)
const hours = Array.from({ length: 24 }, (_, i) => i)

// Minute options (every 5 minutes)
const minutes = Array.from({ length: 12 }, (_, i) => i * 5)

// Parsed model value
const selectedDate = computed(() => {
  if (!props.modelValue) return null
  return new Date(props.modelValue)
})

// Selected values for internal use
const selectedYear = computed(() => selectedDate.value?.getFullYear() ?? null)
const selectedMonth = computed(() => selectedDate.value?.getMonth() ?? null)
const selectedDay = computed(() => selectedDate.value?.getDate() ?? null)
const selectedHour = computed(() => selectedDate.value?.getHours() ?? 12)
const selectedMinute = computed(() => {
  if (!selectedDate.value) return 0
  // Round to nearest 5 minutes for display
  const mins = selectedDate.value.getMinutes()
  return Math.round(mins / 5) * 5
})

// Display values
const displayDate = computed(() => {
  if (!selectedDate.value) return 'Select date'
  return selectedDate.value.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
})

const displayTime = computed(() => {
  if (!selectedDate.value) return '--:--'
  return selectedDate.value.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
})

// Calendar day interface
interface CalendarDay {
  day: number
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isPast: boolean
  isSelected: boolean
  dateKey: string
}

// Get min date for comparison
const minDate = computed(() => {
  const min = props.min ? new Date(props.min) : new Date()
  min.setHours(0, 0, 0, 0)
  return min
})

// Calendar grid generation (from CalendarGrid.vue pattern)
const calendarDays = computed((): CalendarDay[] => {
  const days: CalendarDay[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // First day of the month
  const firstDay = new Date(viewYear.value, viewMonth.value, 1)
  const firstDayOfWeek = firstDay.getDay()

  // Last day of the month
  const lastDay = new Date(viewYear.value, viewMonth.value + 1, 0)
  const daysInMonth = lastDay.getDate()

  // Days from previous month
  const prevMonthLastDay = new Date(viewYear.value, viewMonth.value, 0)
  const prevMonthDays = prevMonthLastDay.getDate()

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    const date = new Date(viewYear.value, viewMonth.value - 1, day)
    days.push(createDayObject(date, false, today))
  }

  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(viewYear.value, viewMonth.value, day)
    days.push(createDayObject(date, true, today))
  }

  // Days from next month to fill 42 cells (6 weeks)
  const remainingDays = 42 - days.length
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(viewYear.value, viewMonth.value + 1, day)
    days.push(createDayObject(date, false, today))
  }

  return days
})

function createDayObject(date: Date, isCurrentMonth: boolean, today: Date): CalendarDay {
  const dateOnly = new Date(date)
  dateOnly.setHours(0, 0, 0, 0)

  const selectedDateOnly = selectedDate.value ? new Date(selectedDate.value) : null
  if (selectedDateOnly) {
    selectedDateOnly.setHours(0, 0, 0, 0)
  }

  return {
    day: date.getDate(),
    date,
    isCurrentMonth,
    isToday: dateOnly.getTime() === today.getTime(),
    isPast: dateOnly < minDate.value,
    isSelected: selectedDateOnly ? dateOnly.getTime() === selectedDateOnly.getTime() : false,
    dateKey: formatDateKey(date)
  }
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Date selection
function selectDate(day: CalendarDay) {
  if (day.isPast || props.disabled) return

  const hour = selectedHour.value
  const minute = selectedMinute.value

  const newDate = new Date(
    day.date.getFullYear(),
    day.date.getMonth(),
    day.date.getDate(),
    hour,
    minute
  )

  emit('update:modelValue', newDate.toISOString())
  activeTab.value = 'time' // Auto-switch to time picker
}

// Time selection
function selectTime(hour: number, minute: number) {
  if (!selectedDate.value) {
    // If no date selected, use today
    const today = new Date()
    const newDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      hour,
      minute
    )
    emit('update:modelValue', newDate.toISOString())
  } else {
    const newDate = new Date(selectedDate.value)
    newDate.setHours(hour, minute)
    emit('update:modelValue', newDate.toISOString())
  }
}

// Month navigation
function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value--
  } else {
    viewMonth.value--
  }
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value++
  } else {
    viewMonth.value++
  }
}

// Toggle dropdown
function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

// Clear value
function clearValue() {
  emit('update:modelValue', null)
  activeTab.value = 'date'
}

// Close dropdown
function closeDropdown() {
  isOpen.value = false
}

// Click outside handler (from HashtagInput.vue pattern)
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (
    dropdownRef.value &&
    !dropdownRef.value.contains(target) &&
    triggerRef.value &&
    !triggerRef.value.contains(target)
  ) {
    isOpen.value = false
  }
}

// Watch for dropdown open/close to manage click outside listener
watch(isOpen, async (open) => {
  if (open) {
    await nextTick()
    updateDropdownPosition()
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('scroll', updateDropdownPosition, true)
    window.addEventListener('resize', updateDropdownPosition)
    // Initialize view to selected date or today
    if (selectedDate.value) {
      viewYear.value = selectedDate.value.getFullYear()
      viewMonth.value = selectedDate.value.getMonth()
    } else {
      const today = new Date()
      viewYear.value = today.getFullYear()
      viewMonth.value = today.getMonth()
    }
    // Reset to date tab if no value
    if (!props.modelValue) {
      activeTab.value = 'date'
    }
  } else {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('scroll', updateDropdownPosition, true)
    window.removeEventListener('resize', updateDropdownPosition)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', updateDropdownPosition, true)
  window.removeEventListener('resize', updateDropdownPosition)
})
</script>

<template>
  <div class="datetime-picker">
    <!-- Trigger Button -->
    <button
      ref="triggerRef"
      type="button"
      class="picker-trigger"
      :class="{ open: isOpen, disabled: disabled }"
      :disabled="disabled"
      @click="toggleDropdown"
    >
      <div class="trigger-content">
        <div class="trigger-date">
          <svg class="trigger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span :class="{ placeholder: !modelValue }">{{ displayDate }}</span>
        </div>
        <div class="trigger-time" :class="{ disabled: !modelValue }">
          <svg class="trigger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span :class="{ placeholder: !modelValue }">{{ displayTime }}</span>
        </div>
      </div>
      <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <!-- Dropdown Panel (teleported to body to avoid overflow clipping) -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="picker-dropdown"
        :style="dropdownStyle"
      >
      <!-- Tab Switcher -->
      <div class="tab-header">
        <button
          type="button"
          :class="['tab-btn', { active: activeTab === 'date' }]"
          @click="activeTab = 'date'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Date
        </button>
        <button
          type="button"
          :class="['tab-btn', { active: activeTab === 'time', disabled: !modelValue }]"
          :disabled="!modelValue"
          @click="activeTab = 'time'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 6v6l4 2" />
          </svg>
          Time
        </button>
      </div>

      <!-- Date Panel -->
      <div v-if="activeTab === 'date'" class="date-panel">
        <!-- Month Navigation -->
        <div class="month-nav">
          <button type="button" class="nav-btn" @click="prevMonth">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span class="month-label">
            {{ MONTH_NAMES[viewMonth] }} {{ viewYear }}
          </span>
          <button type="button" class="nav-btn" @click="nextMonth">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <!-- Weekday Headers -->
        <div class="weekday-row">
          <span v-for="day in WEEKDAYS" :key="day" class="weekday">{{ day }}</span>
        </div>

        <!-- Calendar Grid -->
        <div class="calendar-grid">
          <button
            v-for="(day, index) in calendarDays"
            :key="index"
            type="button"
            :class="[
              'day-cell',
              {
                'other-month': !day.isCurrentMonth,
                'is-today': day.isToday,
                'is-selected': day.isSelected,
                'is-disabled': day.isPast
              }
            ]"
            :disabled="day.isPast"
            @click="selectDate(day)"
          >
            {{ day.day }}
          </button>
        </div>
      </div>

      <!-- Time Panel -->
      <div v-if="activeTab === 'time'" class="time-panel">
        <div class="time-columns">
          <!-- Hour Column -->
          <div class="time-column">
            <div class="column-label">Hour</div>
            <div class="time-scroll">
              <button
                v-for="hour in hours"
                :key="hour"
                type="button"
                :class="['time-option', { selected: hour === selectedHour }]"
                @click="selectTime(hour, selectedMinute)"
              >
                {{ String(hour).padStart(2, '0') }}
              </button>
            </div>
          </div>
          <!-- Minute Column -->
          <div class="time-column">
            <div class="column-label">Minute</div>
            <div class="time-scroll">
              <button
                v-for="minute in minutes"
                :key="minute"
                type="button"
                :class="['time-option', { selected: minute === selectedMinute }]"
                @click="selectTime(selectedHour, minute)"
              >
                {{ String(minute).padStart(2, '0') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="picker-footer">
        <button type="button" class="btn-clear" @click="clearValue">
          Clear
        </button>
        <button type="button" class="btn-confirm" @click="closeDropdown">
          Done
        </button>
      </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.datetime-picker {
  position: relative;
  width: 100%;
}

/* Trigger Button */
.picker-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: rgba(15, 23, 42, 0.9);
  color: var(--text);
  cursor: pointer;
  transition: border-color 0.2s;
}

.picker-trigger:hover:not(.disabled) {
  border-color: var(--border-hover);
}

.picker-trigger:focus {
  outline: none;
  border-color: var(--accent);
}

.picker-trigger.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.trigger-content {
  display: flex;
  gap: 16px;
}

.trigger-date,
.trigger-time {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trigger-time.disabled {
  opacity: 0.5;
}

.trigger-icon {
  width: 16px;
  height: 16px;
  color: var(--muted);
}

.trigger-content span {
  font-size: 14px;
}

.trigger-content span.placeholder {
  color: var(--muted);
}

.chevron-icon {
  width: 16px;
  height: 16px;
  color: var(--muted);
  transition: transform 0.2s;
}

.picker-trigger.open .chevron-icon {
  transform: rotate(180deg);
}

/* Mobile Responsiveness */
@media (max-width: 400px) {
  .trigger-content {
    flex-direction: column;
    gap: 8px;
  }
}
</style>

<!-- Global styles for teleported dropdown -->
<style>
/* Dropdown Panel (teleported to body) */
.picker-dropdown {
  position: absolute;
  background: rgba(15, 23, 42, 0.98);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 14px;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.8);
  z-index: 9999;
  overflow: hidden;
}

/* Tab Header */
.picker-dropdown .tab-header {
  display: flex;
  border-bottom: 1px solid rgba(148, 163, 184, 0.3);
}

.picker-dropdown .tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  background: transparent;
  border: none;
  color: #9ca3af;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.picker-dropdown .tab-btn svg {
  width: 14px;
  height: 14px;
}

.picker-dropdown .tab-btn.active {
  color: #6366f1;
  background: rgba(79, 70, 229, 0.12);
}

.picker-dropdown .tab-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Date Panel */
.picker-dropdown .date-panel {
  padding: 12px;
}

.picker-dropdown .month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.picker-dropdown .nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s;
}

.picker-dropdown .nav-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #f9fafb;
}

.picker-dropdown .nav-btn svg {
  width: 18px;
  height: 18px;
}

.picker-dropdown .month-label {
  font-size: 14px;
  font-weight: 500;
  color: #f9fafb;
}

/* Weekday Row */
.picker-dropdown .weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 8px;
}

.picker-dropdown .weekday {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  padding: 4px;
}

/* Calendar Grid */
.picker-dropdown .calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.picker-dropdown .day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #f9fafb;
  cursor: pointer;
  transition: all 0.15s;
}

.picker-dropdown .day-cell:hover:not(.is-disabled):not(.is-selected) {
  background: rgba(255, 255, 255, 0.05);
}

.picker-dropdown .day-cell.other-month {
  color: #9ca3af;
  opacity: 0.5;
}

.picker-dropdown .day-cell.is-today {
  background: rgba(79, 70, 229, 0.12);
  color: #6366f1;
}

.picker-dropdown .day-cell.is-selected {
  background: #4f46e5;
  color: white;
}

.picker-dropdown .day-cell.is-disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Time Panel */
.picker-dropdown .time-panel {
  padding: 12px;
}

.picker-dropdown .time-columns {
  display: flex;
  gap: 12px;
}

.picker-dropdown .time-column {
  flex: 1;
}

.picker-dropdown .column-label {
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 8px;
}

.picker-dropdown .time-scroll {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.picker-dropdown .time-option {
  padding: 8px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #f9fafb;
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
}

.picker-dropdown .time-option:hover {
  background: rgba(255, 255, 255, 0.05);
}

.picker-dropdown .time-option.selected {
  background: #4f46e5;
  color: white;
}

/* Footer */
.picker-dropdown .picker-footer {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(15, 23, 42, 0.3);
}

.picker-dropdown .btn-clear {
  flex: 1;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: transparent;
  color: #9ca3af;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.picker-dropdown .btn-clear:hover {
  border-color: rgba(148, 163, 184, 0.6);
  color: #f9fafb;
}

.picker-dropdown .btn-confirm {
  flex: 1;
  padding: 8px 12px;
  border-radius: 10px;
  border: none;
  background: #4f46e5;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.picker-dropdown .btn-confirm:hover {
  opacity: 0.9;
}
</style>
