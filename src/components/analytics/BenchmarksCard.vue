<script setup lang="ts">
import type { BenchmarkData } from '@/types'

const props = defineProps<{
  benchmarks: BenchmarkData[]
  userEngagementRate: number
  platformEngagementRates?: Record<string, number>
}>()

const platformLabels: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  pinterest: 'Pinterest',
  threads: 'Threads',
  bluesky: 'Bluesky',
}

// Get user's engagement rate for a specific platform, falling back to global rate
const getUserRate = (platform: string): number => {
  const rate = props.platformEngagementRates?.[platform]
  return rate ?? props.userEngagementRate
}
</script>

<template>
  <div class="benchmarks-card card">
    <div class="card-header">
      <h2>Engagement Benchmarks</h2>
      <span class="pro-badge">Pro</span>
    </div>
    <div class="card-body">
      <div v-if="benchmarks.length" class="benchmarks-list">
        <div
          v-for="benchmark in benchmarks"
          :key="benchmark.platform + '-' + benchmark.contentType"
          class="benchmark-item"
        >
          <div class="benchmark-header">
            <span class="benchmark-platform">
              {{ platformLabels[benchmark.platform] || benchmark.platform }}
            </span>
            <span
              v-if="benchmark.contentType !== 'all'"
              class="benchmark-type"
            >
              {{ benchmark.contentType }}
            </span>
          </div>
          <div class="benchmark-comparison">
            <div class="benchmark-bar-container">
              <div class="benchmark-bar-label">Industry avg</div>
              <div class="benchmark-bar-track">
                <div
                  class="benchmark-bar benchmark-bar-industry"
                  :style="{ width: `${Math.min(benchmark.avgEngagementRate / Math.max(benchmark.avgEngagementRate, userEngagementRate) * 100, 100)}%` }"
                ></div>
              </div>
              <span class="benchmark-bar-value">{{ benchmark.avgEngagementRate.toFixed(2) }}%</span>
            </div>
            <div class="benchmark-bar-container">
              <div class="benchmark-bar-label">Your rate</div>
              <div class="benchmark-bar-track">
                <div
                  class="benchmark-bar benchmark-bar-user"
                  :style="{ width: `${Math.min(getUserRate(benchmark.platform) / Math.max(benchmark.avgEngagementRate, getUserRate(benchmark.platform)) * 100, 100)}%` }"
                ></div>
              </div>
              <span class="benchmark-bar-value">{{ getUserRate(benchmark.platform).toFixed(2) }}%</span>
            </div>
          </div>
          <div class="benchmark-indicator">
            <template v-if="getUserRate(benchmark.platform) > benchmark.avgEngagementRate">
              <span class="indicator-up">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
                {{ ((getUserRate(benchmark.platform) - benchmark.avgEngagementRate) / benchmark.avgEngagementRate * 100).toFixed(0) }}% above average
              </span>
            </template>
            <template v-else-if="getUserRate(benchmark.platform) < benchmark.avgEngagementRate">
              <span class="indicator-down">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                {{ ((benchmark.avgEngagementRate - getUserRate(benchmark.platform)) / benchmark.avgEngagementRate * 100).toFixed(0) }}% below average
              </span>
            </template>
            <template v-else>
              <span class="indicator-equal">At industry average</span>
            </template>
          </div>
          <div v-if="benchmark.source" class="benchmark-source">
            Source: {{ benchmark.source }}
          </div>
        </div>
      </div>
      <div v-else class="no-data">
        <p>No benchmark data available</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.benchmarks-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.benchmark-item {
  padding: 12px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: var(--radius-md);
}

.benchmark-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.benchmark-platform {
  font-size: 13px;
  font-weight: 500;
}

.benchmark-type {
  font-size: 11px;
  padding: 1px 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-sm);
  color: var(--muted);
  text-transform: capitalize;
}

.benchmark-comparison {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}

.benchmark-bar-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.benchmark-bar-label {
  font-size: 11px;
  color: var(--muted);
  width: 72px;
  flex-shrink: 0;
}

.benchmark-bar-track {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  overflow: hidden;
}

.benchmark-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
  min-width: 4px;
}

.benchmark-bar-industry {
  background: var(--muted);
}

.benchmark-bar-user {
  background: var(--accent);
}

.benchmark-bar-value {
  font-size: 12px;
  font-weight: 500;
  width: 52px;
  text-align: right;
  flex-shrink: 0;
}

.benchmark-indicator {
  font-size: 12px;
}

.indicator-up {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #22c55e;
}

.indicator-down {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #ef4444;
}

.indicator-equal {
  color: var(--muted);
}

.benchmark-source {
  margin-top: 6px;
  font-size: 10px;
  color: var(--muted);
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
