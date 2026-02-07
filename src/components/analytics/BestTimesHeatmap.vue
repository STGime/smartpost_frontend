<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BestTimeSlot } from '@/types'

const props = defineProps<{
  heatmap: BestTimeSlot[]
}>()

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const hourLabels = Array.from({ length: 24 }, (_, i) => {
  if (i === 0) return '12a'
  if (i < 12) return `${i}a`
  if (i === 12) return '12p'
  return `${i - 12}p`
})

const hoveredCell = ref<{ day: number; hour: number } | null>(null)

const cellMap = computed(() => {
  const map = new Map<string, BestTimeSlot>()
  for (const slot of props.heatmap) {
    map.set(`${slot.day}-${slot.hour}`, slot)
  }
  return map
})

const maxEngagement = computed(() => {
  if (!props.heatmap.length) return 1
  return Math.max(...props.heatmap.map(s => s.avgEngagement), 0.01)
})

const getCellIntensity = (day: number, hour: number): number => {
  const slot = cellMap.value.get(`${day}-${hour}`)
  if (!slot) return 0
  return slot.avgEngagement / maxEngagement.value
}

const getCellStyle = (day: number, hour: number) => {
  const intensity = getCellIntensity(day, hour)
  if (intensity === 0) return {}
  const alpha = 0.15 + intensity * 0.85
  return {
    background: `rgba(34, 197, 94, ${alpha})`,
  }
}

const getTooltip = (day: number, hour: number): string => {
  const slot = cellMap.value.get(`${day}-${hour}`)
  if (!slot) return `${dayLabels[day]} ${hourLabels[hour]} — No data`
  return `${dayLabels[day]} ${hourLabels[hour]} — ${slot.avgEngagement}% engagement (${slot.postCount} posts)`
}
</script>

<template>
  <div class="heatmap-card card">
    <div class="card-header">
      <h2>Best Time to Post</h2>
    </div>
    <div class="card-body">
      <div v-if="heatmap.length" class="heatmap-wrapper">
        <div class="heatmap-grid">
          <!-- Corner spacer -->
          <div class="heatmap-corner"></div>
          <!-- Hour labels -->
          <div
            v-for="(label, h) in hourLabels"
            :key="'h' + h"
            class="heatmap-hour-label"
            :style="{ visibility: h % 3 === 0 ? 'visible' : 'hidden' }"
          >
            {{ label }}
          </div>

          <template v-for="(dayLabel, d) in dayLabels" :key="'d' + d">
            <!-- Day label -->
            <div class="heatmap-day-label">{{ dayLabel }}</div>
            <!-- Cells -->
            <div
              v-for="h in 24"
              :key="d + '-' + (h - 1)"
              class="heatmap-cell"
              :style="getCellStyle(d, h - 1)"
              :title="getTooltip(d, h - 1)"
              @mouseenter="hoveredCell = { day: d, hour: h - 1 }"
              @mouseleave="hoveredCell = null"
            ></div>
          </template>
        </div>

        <!-- Legend -->
        <div class="heatmap-legend">
          <span class="legend-label">Less</span>
          <div class="legend-cells">
            <div class="legend-cell" style="background: rgba(34, 197, 94, 0.1)"></div>
            <div class="legend-cell" style="background: rgba(34, 197, 94, 0.3)"></div>
            <div class="legend-cell" style="background: rgba(34, 197, 94, 0.5)"></div>
            <div class="legend-cell" style="background: rgba(34, 197, 94, 0.7)"></div>
            <div class="legend-cell" style="background: rgba(34, 197, 94, 1)"></div>
          </div>
          <span class="legend-label">More</span>
        </div>
      </div>
      <div v-else class="no-data">
        <p>Not enough data yet. We need at least 3 posts per time slot to show recommendations.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.heatmap-wrapper {
  overflow-x: auto;
}

.heatmap-grid {
  display: grid;
  grid-template-columns: 36px repeat(24, 1fr);
  gap: 2px;
  min-width: 500px;
}

.heatmap-corner {
  /* empty top-left corner */
}

.heatmap-hour-label {
  font-size: 10px;
  color: var(--muted);
  text-align: center;
  padding-bottom: 4px;
}

.heatmap-day-label {
  font-size: 11px;
  color: var(--muted);
  display: flex;
  align-items: center;
  padding-right: 4px;
}

.heatmap-cell {
  aspect-ratio: 1;
  min-width: 14px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.04);
  cursor: default;
  transition: transform 0.1s;
}

.heatmap-cell:hover {
  transform: scale(1.2);
  z-index: 1;
  outline: 1px solid var(--accent-light);
}

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 12px;
}

.legend-label {
  font-size: 10px;
  color: var(--muted);
}

.legend-cells {
  display: flex;
  gap: 2px;
}

.legend-cell {
  width: 14px;
  height: 14px;
  border-radius: 2px;
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
