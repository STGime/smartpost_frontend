<script setup lang="ts">
import { ref } from 'vue'
import { useAnalyticsStore } from '@/stores'

const analyticsStore = useAnalyticsStore()

const isExportingCsv = ref(false)
const isExportingPdf = ref(false)

const handleExportCsv = async () => {
  isExportingCsv.value = true
  try {
    await analyticsStore.downloadCsv()
  } catch {
    // Error handled in store
  } finally {
    isExportingCsv.value = false
  }
}

const handleExportPdf = async () => {
  isExportingPdf.value = true
  try {
    await analyticsStore.downloadPdf()
  } catch {
    // Error handled in store
  } finally {
    isExportingPdf.value = false
  }
}
</script>

<template>
  <div class="export-buttons">
    <button
      class="btn-export"
      :disabled="isExportingCsv"
      @click="handleExportCsv"
    >
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span v-if="isExportingCsv">Exporting...</span>
      <span v-else>CSV</span>
    </button>
    <button
      class="btn-export"
      :disabled="isExportingPdf"
      @click="handleExportPdf"
    >
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      <span v-if="isExportingPdf">Exporting...</span>
      <span v-else>PDF</span>
    </button>
  </div>
</template>

<style scoped>
.export-buttons {
  display: flex;
  gap: 6px;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  cursor: pointer;
  transition: all 0.15s;
}

.btn-export:hover:not(:disabled) {
  background: rgba(15, 23, 42, 0.8);
  border-color: var(--accent);
}

.btn-export:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-export svg {
  width: 14px;
  height: 14px;
}
</style>
