<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { MediaListItem } from '@/types'

const props = defineProps<{
  mediaItems: MediaListItem[]
  isGenerating: boolean
}>()

const emit = defineEmits<{
  'update:order': [orderedIds: string[]]
  'generate': []
}>()

// Filter to only images
const sourceImages = computed(() => props.mediaItems.filter(item => item.type === 'image'))

// Local mutable copy for drag reordering
const localItems = ref<MediaListItem[]>([])

// Initialize and watch for prop changes
watch(sourceImages, (newItems) => {
  localItems.value = [...newItems]
}, { immediate: true, deep: true })

// Drag state
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const onDragStart = (e: DragEvent, index: number) => {
  draggedIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }
}

const onDragOver = (e: DragEvent, index: number) => {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
  dragOverIndex.value = index
}

const onDragLeave = () => {
  dragOverIndex.value = null
}

const onDrop = (e: DragEvent, dropIndex: number) => {
  e.preventDefault()

  if (draggedIndex.value === null || draggedIndex.value === dropIndex) {
    draggedIndex.value = null
    dragOverIndex.value = null
    return
  }

  // Reorder local items
  const newItems = [...localItems.value]
  const [removed] = newItems.splice(draggedIndex.value, 1)
  if (removed) {
    newItems.splice(dropIndex, 0, removed)
  }

  // Update local state
  localItems.value = newItems

  // Emit new order
  emit('update:order', newItems.map(item => item.id))

  draggedIndex.value = null
  dragOverIndex.value = null
}

const onDragEnd = () => {
  draggedIndex.value = null
  dragOverIndex.value = null
}

const handleGenerate = () => {
  emit('generate')
}
</script>

<template>
  <div class="carousel-order-panel">
    <div class="carousel-header">
      <h4>Carousel Page Order</h4>
      <span class="page-count">{{ localItems.length }} pages</span>
    </div>

    <p class="carousel-hint">Drag images to reorder carousel pages</p>

    <div class="carousel-items">
      <div
        v-for="(item, index) in localItems"
        :key="item.id"
        class="carousel-item"
        :class="{
          'dragging': draggedIndex === index,
          'drag-over': dragOverIndex === index && draggedIndex !== index
        }"
        draggable="true"
        @dragstart="onDragStart($event, index)"
        @dragover="onDragOver($event, index)"
        @dragleave="onDragLeave"
        @drop="onDrop($event, index)"
        @dragend="onDragEnd"
      >
        <span class="page-number">{{ index + 1 }}</span>
        <img :src="item.thumbnail_url || '/placeholder.png'" :alt="item.name" />
        <div class="drag-handle">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
          </svg>
        </div>
      </div>
    </div>

    <button
      type="button"
      class="generate-btn"
      @click="handleGenerate"
      :disabled="isGenerating || localItems.length < 2"
    >
      <svg v-if="isGenerating" class="spinner" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="32" stroke-linecap="round" />
      </svg>
      <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {{ isGenerating ? 'Generating PDF...' : 'Generate Carousel PDF' }}
    </button>

    <p v-if="localItems.length < 2" class="warning-text">
      Select at least 2 images to create a carousel
    </p>
  </div>
</template>

<style scoped>
.carousel-order-panel {
  padding: 14px;
  background: var(--ink-0);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  margin-top: 12px;
}

.carousel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.carousel-header h4 {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fg-2);
}

.page-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--signal);
  border: 1px solid rgba(242, 169, 59, 0.5);
  padding: 1px 6px;
  border-radius: 2px;
}

.carousel-hint {
  font-size: 12px;
  color: var(--fg-3);
  margin: 0 0 10px 0;
}

.carousel-items {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 0 6px;
  margin-bottom: 12px;
}

.carousel-item {
  position: relative;
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: grab;
  border: 1px solid var(--line);
  transition: border-color 0.15s, opacity 0.15s;
  background: var(--ink-2);
}

.carousel-item:hover {
  border-color: var(--line-strong);
}

.carousel-item.dragging {
  opacity: 0.4;
  cursor: grabbing;
}

.carousel-item.drag-over {
  border-color: var(--signal);
  outline: 1px solid var(--signal);
  outline-offset: -1px;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-number {
  position: absolute;
  top: 4px;
  left: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: rgba(0, 0, 0, 0.75);
  color: var(--signal);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  z-index: 1;
}

.drag-handle {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
}

.carousel-item:hover .drag-handle {
  opacity: 1;
}

@media (hover: none) {
  .drag-handle {
    opacity: 1;
  }
}

.drag-handle svg {
  width: 14px;
  height: 14px;
  color: var(--text);
}

.generate-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 14px;
  background: var(--text);
  color: var(--ink-0);
  border: 1px solid var(--text);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}

.generate-btn:hover:not(:disabled) {
  background: #ffffff;
  border-color: #ffffff;
}

.generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.generate-btn svg {
  width: 16px;
  height: 16px;
}

/* The svg reuses the global .spinner class; strip its ring styles */
.generate-btn .spinner {
  border: none;
  border-radius: 0;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.warning-text {
  font-size: 12px;
  color: var(--signal);
  text-align: center;
  margin: 8px 0 0 0;
}
</style>
