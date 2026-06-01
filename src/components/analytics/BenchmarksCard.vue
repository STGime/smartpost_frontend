<script setup lang="ts">
import { computed } from 'vue'
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

// The source line is identical across rows, so show it once in a footer.
const sources = computed(() =>
  Array.from(new Set(props.benchmarks.map((b) => b.source).filter(Boolean))),
)
</script>

<template>
  <div class="benchmarks-card card">
    <div class="card-header">
      <h2>Engagement Benchmarks</h2>
      <span class="pro-badge">Pro</span>
    </div>
    <div class="card-body">
      <template v-if="benchmarks.length">
        <div class="benchmarks-grid">
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
                <div class="benchmark-bar-label">Industry</div>
                <div class="benchmark-bar-track">
                  <div
                    class="benchmark-bar benchmark-bar-industry"
                    :style="{ width: `${Math.min(benchmark.avgEngagementRate / Math.max(benchmark.avgEngagementRate, getUserRate(benchmark.platform)) * 100, 100)}%` }"
                  ></div>
                </div>
                <span class="benchmark-bar-value">{{ benchmark.avgEngagementRate.toFixed(2) }}%</span>
              </div>
              <div class="benchmark-bar-container">
                <div class="benchmark-bar-label">You</div>
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
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="13" height="13">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                  {{ ((getUserRate(benchmark.platform) - benchmark.avgEngagementRate) / benchmark.avgEngagementRate * 100).toFixed(0) }}% above
                </span>
              </template>
              <template v-else-if="getUserRate(benchmark.platform) < benchmark.avgEngagementRate">
                <span class="indicator-down">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="13" height="13">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  {{ ((benchmark.avgEngagementRate - getUserRate(benchmark.platform)) / benchmark.avgEngagementRate * 100).toFixed(0) }}% below
                </span>
              </template>
              <template v-else>
                <span class="indicator-equal">At industry average</span>
              </template>
            </div>
          </div>
        </div>
        <p v-if="sources.length" class="benchmarks-source">
          Source: {{ sources.join(' · ') }}
        </p>
      </template>
      <div v-else class="no-data">
        <p>No benchmark data available</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.benchmarks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 12px;
}

.benchmark-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.benchmark-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.benchmark-platform {
  font-size: 13px;
  font-weight: 600;
}

.benchmark-type {
  font-size: 10px;
  padding: 1px 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-sm);
  color: var(--muted);
  text-transform: capitalize;
}

.benchmark-comparison {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.benchmark-bar-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.benchmark-bar-label {
  font-size: 10px;
  color: var(--muted);
  width: 52px;
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
  font-size: 11px;
  font-weight: 500;
  width: 46px;
  text-align: right;
  flex-shrink: 0;
}

.benchmark-indicator {
  font-size: 11px;
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

.benchmarks-source {
  margin-top: 14px;
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
