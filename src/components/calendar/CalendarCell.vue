<script setup lang="ts">
import type { CalendarPost } from '@/types'
import CalendarPostCard from './CalendarPostCard.vue'

defineProps<{
  day: number
  date: Date
  posts: CalendarPost[]
  isToday: boolean
  isCurrentMonth: boolean
}>()

const emit = defineEmits<{
  'post-click': [post: CalendarPost]
  'show-all': [date: Date]
}>()

const MAX_VISIBLE_POSTS = 3
</script>

<template>
  <div
    :class="[
      'calendar-cell',
      { 'is-today': isToday, 'other-month': !isCurrentMonth }
    ]"
  >
    <span :class="['day-number', { today: isToday }]">{{ day }}</span>

    <div class="cell-posts">
      <CalendarPostCard
        v-for="post in posts.slice(0, MAX_VISIBLE_POSTS)"
        :key="post.id"
        :post="post"
        @click="emit('post-click', post)"
      />

      <button
        v-if="posts.length > MAX_VISIBLE_POSTS"
        class="more-posts-btn"
        @click.stop="emit('show-all', date)"
      >
        +{{ posts.length - MAX_VISIBLE_POSTS }} more
      </button>
    </div>
  </div>
</template>

<style scoped>
.calendar-cell {
  position: relative;
  min-width: 0;
  min-height: 100px;
  padding: 6px;
  background: var(--ink-0);
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: background-color 0.12s;
}

.calendar-cell:hover {
  background: var(--ink-1);
}

.calendar-cell.is-today {
  background: var(--ink-1);
}

.calendar-cell.is-today::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--signal);
}

.calendar-cell.other-month > * {
  opacity: 0.4;
}

.day-number {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--fg-3);
  padding: 1px 3px;
  width: fit-content;
  font-variant-numeric: tabular-nums;
}

.day-number.today {
  background: var(--signal);
  color: var(--ink-0);
  border-radius: 2px;
}

.cell-posts {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.more-posts-btn {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--fg-2);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 1px 3px;
  text-align: left;
  transition: color 0.12s;
}

.more-posts-btn:hover {
  color: var(--signal);
}
</style>
