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
  newItems.splice(dropIndex, 0, removed)

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
  padding: 16px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  margin-top: 16px;
}

.carousel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.carousel-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.page-count {
  font-size: 12px;
  color: var(--muted);
  background: rgba(79, 70, 229, 0.2);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.carousel-hint {
  font-size: 12px;
  color: var(--muted);
  margin: 0 0 12px 0;
}

.carousel-items {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0;
  margin-bottom: 16px;
}

.carousel-item {
  position: relative;
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: grab;
  border: 2px solid transparent;
  transition: all 0.15s ease;
  background: rgba(15, 23, 42, 0.6);
}

.carousel-item:hover {
  border-color: var(--accent);
}

.carousel-item.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.carousel-item.drag-over {
  border-color: var(--accent);
  transform: scale(1.05);
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
  width: 20px;
  height: 20px;
  background: var(--accent);
  color: white;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  z-index: 1;
}

.drag-handle {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
}

.carousel-item:hover .drag-handle {
  opacity: 1;
}

.drag-handle svg {
  width: 14px;
  height: 14px;
  color: white;
}

.generate-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.generate-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.generate-btn svg {
  width: 18px;
  height: 18px;
}

.generate-btn .spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.warning-text {
  font-size: 12px;
  color: #fbbf24;
  text-align: center;
  margin: 8px 0 0 0;
}
</style>
