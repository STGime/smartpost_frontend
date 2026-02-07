<script setup lang="ts">
import { computed } from 'vue'
import type { ContentTypeStats } from '@/types'

const props = defineProps<{
  types: ContentTypeStats[]
}>()

const typeColors: Record<string, string> = {
  image: '#6366f1',
  video: '#a855f7',
  carousel: '#f97316',
  document: '#22c55e',
}

const typeLabels: Record<string, string> = {
  image: 'Image',
  video: 'Video',
  carousel: 'Carousel',
  document: 'Document',
}

const maxEngagement = computed(() => {
  if (!props.types.length) return 1
  return Math.max(...props.types.map(t => t.avgEngagementRate), 0.01)
})

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
</script>

<template>
  <div class="content-types-card card">
    <div class="card-header">
      <h2>Content Type Breakdown</h2>
    </div>
    <div class="card-body">
      <div v-if="types.length" class="content-types-list">
        <div
          v-for="type in types"
          :key="type.type"
          class="content-type-item"
        >
          <div class="content-type-header">
            <div class="content-type-label">
              <span
                class="type-dot"
                :style="{ background: typeColors[type.type] || '#6366f1' }"
              ></span>
              <span class="type-name">{{ typeLabels[type.type] || type.type }}</span>
              <span class="type-count">{{ type.postCount }} posts</span>
            </div>
            <span class="type-rate">{{ type.avgEngagementRate }}%</span>
          </div>
          <div class="content-type-bar-track">
            <div
              class="content-type-bar"
              :style="{
                width: `${(type.avgEngagementRate / maxEngagement) * 100}%`,
                background: typeColors[type.type] || '#6366f1',
              }"
            ></div>
          </div>
          <div class="content-type-stats">
            <span>{{ formatNumber(type.avgLikes) }} avg likes</span>
            <span>{{ formatNumber(type.avgComments) }} avg comments</span>
            <span>{{ formatNumber(type.avgViews) }} avg views</span>
          </div>
        </div>
      </div>
      <div v-else class="no-data">
        <p>No content type data available</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-types-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content-type-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.content-type-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.content-type-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.type-name {
  font-size: 13px;
  font-weight: 500;
}

.type-count {
  font-size: 11px;
  color: var(--muted);
}

.type-rate {
  font-size: 14px;
  font-weight: 600;
}

.content-type-bar-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  overflow: hidden;
}

.content-type-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
  min-width: 4px;
}

.content-type-stats {
  display: flex;
  gap: 16px;
  font-size: 11px;
  color: var(--muted);
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
