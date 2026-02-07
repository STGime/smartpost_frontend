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
  min-height: 100px;
  padding: 6px;
  border: 1px solid var(--border);
  background: rgba(15, 23, 42, 0.3);
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: background 0.15s;
}

.calendar-cell:hover {
  background: rgba(15, 23, 42, 0.5);
}

.calendar-cell.is-today {
  background: rgba(79, 70, 229, 0.08);
  border-color: rgba(79, 70, 229, 0.3);
}

.calendar-cell.other-month {
  opacity: 0.5;
  background: rgba(15, 23, 42, 0.15);
}

.day-number {
  font-size: 12px;
  font-weight: 500;
  color: var(--muted);
  padding: 2px 4px;
}

.day-number.today {
  background: var(--accent);
  color: white;
  border-radius: 4px;
  width: fit-content;
}

.cell-posts {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  overflow: hidden;
}

.more-posts-btn {
  font-size: 10px;
  color: var(--accent-light);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  text-align: left;
  transition: color 0.15s;
}

.more-posts-btn:hover {
  color: var(--text);
}
</style>
