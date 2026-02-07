<script setup lang="ts">
import { ref, computed } from 'vue'
import type { HashtagStats } from '@/types'

const props = defineProps<{
  hashtags: HashtagStats[]
}>()

type SortField = 'tag' | 'usageCount' | 'avgLikes' | 'avgComments' | 'avgViews' | 'avgEngagementRate'

const sortField = ref<SortField>('avgEngagementRate')
const sortDirection = ref<'asc' | 'desc'>('desc')
const showAll = ref(false)

const INITIAL_DISPLAY = 10

const sortedHashtags = computed(() => {
  const sorted = [...props.hashtags].sort((a, b) => {
    const aVal = a[sortField.value]
    const bVal = b[sortField.value]
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection.value === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    const numA = Number(aVal)
    const numB = Number(bVal)
    return sortDirection.value === 'asc' ? numA - numB : numB - numA
  })
  return showAll.value ? sorted : sorted.slice(0, INITIAL_DISPLAY)
})

const toggleSort = (field: SortField) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'desc'
  }
}

const getSortIcon = (field: SortField): string => {
  if (sortField.value !== field) return ''
  return sortDirection.value === 'asc' ? ' \u2191' : ' \u2193'
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
</script>

<template>
  <div class="hashtags-card card">
    <div class="card-header">
      <h2>Hashtag Performance</h2>
      <span class="pro-badge">Pro</span>
    </div>
    <div class="card-body">
      <div v-if="hashtags.length" class="hashtags-table-wrapper">
        <table class="hashtags-table">
          <thead>
            <tr>
              <th class="col-tag" @click="toggleSort('tag')">
                Hashtag{{ getSortIcon('tag') }}
              </th>
              <th class="col-num" @click="toggleSort('usageCount')">
                Used{{ getSortIcon('usageCount') }}
              </th>
              <th class="col-num" @click="toggleSort('avgLikes')">
                Avg Likes{{ getSortIcon('avgLikes') }}
              </th>
              <th class="col-num" @click="toggleSort('avgComments')">
                Avg Comments{{ getSortIcon('avgComments') }}
              </th>
              <th class="col-num" @click="toggleSort('avgViews')">
                Avg Views{{ getSortIcon('avgViews') }}
              </th>
              <th class="col-num" @click="toggleSort('avgEngagementRate')">
                Eng. Rate{{ getSortIcon('avgEngagementRate') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tag in sortedHashtags" :key="tag.tag">
              <td class="col-tag">
                <span class="hashtag-tag">#{{ tag.tag }}</span>
              </td>
              <td class="col-num">{{ tag.usageCount }}</td>
              <td class="col-num">{{ formatNumber(tag.avgLikes) }}</td>
              <td class="col-num">{{ formatNumber(tag.avgComments) }}</td>
              <td class="col-num">{{ formatNumber(tag.avgViews) }}</td>
              <td class="col-num">
                <span class="engagement-badge">{{ tag.avgEngagementRate }}%</span>
              </td>
            </tr>
          </tbody>
        </table>
        <button
          v-if="hashtags.length > INITIAL_DISPLAY"
          class="show-more-btn"
          @click="showAll = !showAll"
        >
          {{ showAll ? 'Show less' : `Show all ${hashtags.length} hashtags` }}
        </button>
      </div>
      <div v-else class="no-data">
        <p>No hashtag data available</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hashtags-table-wrapper {
  overflow-x: auto;
}

.hashtags-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.hashtags-table th {
  text-align: left;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
}

.hashtags-table th:hover {
  color: var(--text);
}

.hashtags-table td {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.hashtags-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.col-tag {
  min-width: 120px;
}

.col-num {
  text-align: right !important;
  min-width: 80px;
}

.hashtag-tag {
  font-weight: 500;
  color: var(--accent-light);
}

.engagement-badge {
  display: inline-block;
  padding: 2px 8px;
  background: var(--accent-soft);
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 12px;
}

.show-more-btn {
  display: block;
  width: 100%;
  padding: 10px;
  margin-top: 8px;
  font-size: 13px;
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
}

.show-more-btn:hover {
  color: var(--text);
  border-color: var(--accent);
}

.pro-badge {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  background: linear-gradient(135deg, var(--accent), var(--cyan));
  border-radius: var(--radius-sm);
  color: white;
}

.no-data {
  text-align: center;
  padding: 32px;
  color: var(--muted);
  font-size: 14px;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.card-header h2 {
  font-size: 15px;
  font-weight: 600;
}

.card-body {
  padding: 16px;
}
</style>
