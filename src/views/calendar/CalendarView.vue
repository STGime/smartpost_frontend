<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { postsService } from '@/services/posts'
import type { CalendarPost } from '@/types'
import CalendarGrid from '@/components/calendar/CalendarGrid.vue'
import CalendarDayModal from '@/components/calendar/CalendarDayModal.vue'

const router = useRouter()

// Current view month/year
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())

// Local state for calendar posts
const calendarPosts = ref<CalendarPost[]>([])
const isLoading = ref(false)

// Modal state
const showDayModal = ref(false)
const selectedDate = ref<Date | null>(null)

// Month names for display
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const currentMonthName = computed(() => MONTH_NAMES[currentMonth.value])

// Calculate date range for the visible calendar (includes partial weeks from prev/next months)
const getCalendarDateRange = () => {
  // First day of the month (Monday = 0, Sunday = 6)
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7

  // Start from the first visible day (may be in previous month)
  const startDate = new Date(currentYear.value, currentMonth.value, 1 - firstDayOfWeek)

  // End date: 42 days from start (6 weeks)
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 41)

  // Format as YYYY-MM-DD
  const formatDate = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return { start: formatDate(startDate), end: formatDate(endDate) }
}

// Fetch posts for the visible calendar range
const fetchMonthPosts = async () => {
  isLoading.value = true
  try {
    const { start, end } = getCalendarDateRange()
    calendarPosts.value = await postsService.fetchCalendarPosts(start, end)
  } catch (error) {
    console.error('Failed to fetch calendar posts:', error)
    calendarPosts.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchMonthPosts)
watch([currentYear, currentMonth], fetchMonthPosts)

// Group posts by date using pre-computed dateKey from backend
const postsByDate = computed(() => {
  const grouped: Record<string, CalendarPost[]> = {}

  calendarPosts.value.forEach((post) => {
    const key = post.dateKey
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(post)
  })

  // Sort posts within each day by time (backend returns sorted, but ensure order)
  Object.keys(grouped).forEach((key) => {
    const posts = grouped[key]
    if (posts) {
      posts.sort((a, b) => {
        const dateA = new Date(a.scheduledAt || a.publishedAt || a.createdAt)
        const dateB = new Date(b.scheduledAt || b.publishedAt || b.createdAt)
        return dateA.getTime() - dateB.getTime()
      })
    }
  })

  return grouped
})

// Navigation
const goToPreviousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const goToNextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const goToToday = () => {
  const today = new Date()
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth()
}

// Event handlers
const handlePostClick = (post: CalendarPost) => {
  router.push(`/app/posts/${post.id}?from=calendar`)
}

const handleShowAll = (date: Date) => {
  selectedDate.value = date
  showDayModal.value = true
}

const handleViewPost = (post: CalendarPost) => {
  showDayModal.value = false
  router.push(`/app/posts/${post.id}?from=calendar`)
}

const handleCancelPost = async (post: CalendarPost) => {
  if (confirm('Are you sure you want to cancel this scheduled post?')) {
    try {
      await postsService.cancelScheduledPost(post.id)
      // Refresh the calendar after cancellation
      await fetchMonthPosts()
    } catch (error) {
      console.error('Failed to cancel post:', error)
    }
  }
}

const closeDayModal = () => {
  showDayModal.value = false
  selectedDate.value = null
}

// Format date to YYYY-MM-DD for lookup
const formatLocalDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Get posts for selected date in modal
const selectedDatePosts = computed(() => {
  if (!selectedDate.value) return []
  const key = formatLocalDateKey(selectedDate.value)
  return postsByDate.value[key] || []
})
</script>

<template>
  <div class="calendar-page">
    <div class="page-header">
      <div>
        <h1>Calendar</h1>
        <p>View and manage your scheduled posts</p>
      </div>
    </div>

    <!-- Calendar Navigation -->
    <div class="calendar-nav">
      <button class="nav-btn" @click="goToPreviousMonth">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <h2 class="month-title">{{ currentMonthName }} {{ currentYear }}</h2>

      <button class="nav-btn" @click="goToNextMonth">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <button class="today-btn" @click="goToToday">Today</button>
    </div>

    <!-- Status Legend -->
    <div class="status-legend">
      <span class="legend-item">
        <span class="legend-dot scheduled"></span>
        Scheduled
      </span>
      <span class="legend-item">
        <span class="legend-dot posted"></span>
        Posted
      </span>
      <span class="legend-item">
        <span class="legend-dot failed"></span>
        Failed
      </span>
      <span class="legend-item">
        <span class="legend-dot draft"></span>
        Draft
      </span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <!-- Calendar Grid -->
    <div v-else class="calendar-container">
      <CalendarGrid
        :year="currentYear"
        :month="currentMonth"
        :posts-by-date="postsByDate"
        @post-click="handlePostClick"
        @show-all="handleShowAll"
      />
    </div>

    <!-- Day Modal -->
    <CalendarDayModal
      :show="showDayModal"
      :date="selectedDate"
      :posts="selectedDatePosts"
      @close="closeDayModal"
      @view-post="handleViewPost"
      @cancel-post="handleCancelPost"
    />
  </div>
</template>

<style scoped>
.calendar-page {
  max-width: 100%;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 4px;
}

.page-header p {
  font-size: 14px;
  color: var(--muted);
}

/* Calendar Navigation */
.calendar-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border);
  color: var(--muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.nav-btn:hover {
  background: rgba(15, 23, 42, 0.9);
  color: var(--text);
  border-color: var(--border-hover);
}

.nav-btn svg {
  width: 18px;
  height: 18px;
}

.month-title {
  font-size: 18px;
  font-weight: 600;
  min-width: 180px;
  text-align: center;
}

.today-btn {
  margin-left: auto;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  background: var(--accent-soft);
  border: 1px solid rgba(79, 70, 229, 0.3);
  color: #c7d2fe;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.today-btn:hover {
  background: rgba(79, 70, 229, 0.25);
}

/* Status Legend */
.status-legend {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  padding: 10px 14px;
  background: rgba(15, 23, 42, 0.4);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--muted);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-dot.scheduled {
  background: #3b82f6;
}

.legend-dot.posted {
  background: var(--success);
}

.legend-dot.failed {
  background: var(--error);
}

.legend-dot.draft {
  background: #94a3b8;
}

/* Loading State */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 64px;
}

/* Calendar Container */
.calendar-container {
  background: rgba(15, 23, 42, 0.3);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  overflow: hidden;
}

@media (max-width: 768px) {
  .calendar-nav {
    flex-wrap: wrap;
  }

  .month-title {
    order: -1;
    width: 100%;
    margin-bottom: 8px;
    text-align: left;
  }

  .today-btn {
    margin-left: 0;
  }

  .status-legend {
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>
