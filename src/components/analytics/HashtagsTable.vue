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
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--fg-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-bottom: 1px solid var(--line-strong);
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  transition: color 0.15s;
}

.hashtags-table th:hover {
  color: var(--text);
}

.hashtags-table td {
  padding: 9px 12px;
  border-bottom: 1px solid var(--line);
}

.hashtags-table td.col-num {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  color: var(--fg-2);
}

.hashtags-table tbody tr:hover {
  background: var(--ink-2);
}

.col-tag {
  min-width: 120px;
}

.col-num {
  text-align: right !important;
  min-width: 80px;
}

.hashtag-tag {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text);
}

.engagement-badge {
  font-weight: 500;
  color: var(--signal);
}

.show-more-btn {
  display: block;
  width: 100%;
  padding: 9px;
  margin-top: 12px;
  font-size: 13px;
  background: none;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  color: var(--fg-2);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.show-more-btn:hover {
  color: var(--text);
  border-color: var(--fg-3);
}

.pro-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 2px 7px;
  border: 1px solid rgba(242, 169, 59, 0.5);
  border-radius: 2px;
  color: var(--signal);
}

.no-data {
  text-align: center;
  padding: 32px;
  color: var(--fg-3);
  font-size: 13px;
}

.card {
  background: var(--ink-1);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
}

.card-header h2 {
  font-size: 14px;
  font-weight: 600;
}

.card-body {
  padding: 16px;
}
</style>
