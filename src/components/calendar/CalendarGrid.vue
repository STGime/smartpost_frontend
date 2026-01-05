<script setup lang="ts">
import { computed } from 'vue'
import type { Post } from '@/types'
import CalendarCell from './CalendarCell.vue'

const props = defineProps<{
  year: number
  month: number // 0-indexed (0 = January)
  postsByDate: Record<string, Post[]>
}>()

const emit = defineEmits<{
  'post-click': [post: Post]
  'show-all': [date: Date]
}>()

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface CalendarDay {
  day: number
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  dateKey: string
}

const calendarDays = computed((): CalendarDay[] => {
  const days: CalendarDay[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // First day of the month
  const firstDay = new Date(props.year, props.month, 1)
  const firstDayOfWeek = firstDay.getDay()

  // Last day of the month
  const lastDay = new Date(props.year, props.month + 1, 0)
  const daysInMonth = lastDay.getDate()

  // Days from previous month
  const prevMonthLastDay = new Date(props.year, props.month, 0)
  const prevMonthDays = prevMonthLastDay.getDate()

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    const date = new Date(props.year, props.month - 1, day)
    days.push({
      day,
      date,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
      dateKey: formatDateKey(date),
    })
  }

  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(props.year, props.month, day)
    days.push({
      day,
      date,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      dateKey: formatDateKey(date),
    })
  }

  // Days from next month to fill 42 cells (6 weeks)
  const remainingDays = 42 - days.length
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(props.year, props.month + 1, day)
    days.push({
      day,
      date,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
      dateKey: formatDateKey(date),
    })
  }

  return days
})

// Format date to YYYY-MM-DD using local time (not UTC)
function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getPostsForDate(dateKey: string): Post[] {
  return props.postsByDate[dateKey] || []
}
</script>

<template>
  <div class="calendar-grid">
    <!-- Weekday headers -->
    <div class="weekday-header" v-for="day in WEEKDAYS" :key="day">
      {{ day }}
    </div>

    <!-- Calendar cells -->
    <CalendarCell
      v-for="(calDay, index) in calendarDays"
      :key="index"
      :day="calDay.day"
      :date="calDay.date"
      :posts="getPostsForDate(calDay.dateKey)"
      :is-today="calDay.isToday"
      :is-current-month="calDay.isCurrentMonth"
      @post-click="emit('post-click', $event)"
      @show-all="emit('show-all', $event)"
    />
  </div>
</template>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.weekday-header {
  padding: 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  text-align: center;
  background: rgba(15, 23, 42, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
