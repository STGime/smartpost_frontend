<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTagsStore } from '@/stores'

const props = withDefaults(defineProps<{
  modelValue: string[]
  saveToLibrary?: boolean
}>(), {
  saveToLibrary: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'update:saveToLibrary': [value: boolean]
}>()

const tagsStore = useTagsStore()

const tagInput = ref('')
const showLibrary = ref(false)
const librarySearch = ref('')

// Use prop for saveToLibrary, emit changes
const localSaveToLibrary = computed({
  get: () => props.saveToLibrary,
  set: (value: boolean) => emit('update:saveToLibrary', value)
})

// Fetch tags on mount
onMounted(() => {
  tagsStore.fetchTags()
})

// Filter library tags based on search
const filteredLibraryTags = computed(() => {
  if (!librarySearch.value) {
    return tagsStore.tags.filter(t => !props.modelValue.includes(t.tag))
  }
  const search = librarySearch.value.toLowerCase()
  return tagsStore.tags
    .filter(t => t.tag.toLowerCase().includes(search) && !props.modelValue.includes(t.tag))
})

// Add a single tag (does NOT save to library - that happens when post is saved)
const addTag = (tag: string) => {
  const normalized = tag.toLowerCase().trim().replace(/^#/, '')
  if (normalized && !props.modelValue.includes(normalized)) {
    emit('update:modelValue', [...props.modelValue, normalized])
  }
  tagInput.value = ''
}

// Remove a tag
const removeTag = (index: number) => {
  const newTags = [...props.modelValue]
  newTags.splice(index, 1)
  emit('update:modelValue', newTags)
}

// Handle keyboard input
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    if (tagInput.value.trim()) {
      addTag(tagInput.value)
    }
  }
}

// Add tag from library
const addFromLibrary = (tag: string) => {
  addTag(tag)
  showLibrary.value = false
  librarySearch.value = ''
}

// Delete tag from library
const deleteFromLibrary = async (tagId: string, event: Event) => {
  event.stopPropagation()
  try {
    await tagsStore.deleteTag(tagId)
  } catch {
    // Error handled in store
  }
}

// Close library dropdown when clicking outside
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.library-dropdown') && !target.closest('.library-toggle')) {
    showLibrary.value = false
  }
}

// Add click outside listener
watch(showLibrary, (show) => {
  if (show) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>

<template>
  <div class="hashtag-input">
    <!-- Selected Tags -->
    <div class="tags-container">
      <div class="tags-list" v-if="modelValue.length > 0">
        <span
          v-for="(tag, index) in modelValue"
          :key="tag"
          class="tag"
        >
          #{{ tag }}
          <button type="button" class="tag-remove" @click="removeTag(index)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      </div>

      <!-- Tag Input -->
      <div class="input-row">
        <div class="input-wrapper">
          <span class="hash-prefix">#</span>
          <input
            type="text"
            class="tag-input"
            placeholder="Add hashtag..."
            v-model="tagInput"
            @keydown="handleKeydown"
            @blur="tagInput.trim() && addTag(tagInput)"
          />
        </div>

        <!-- Library Toggle -->
        <button
          type="button"
          class="library-toggle"
          :class="{ active: showLibrary }"
          @click="showLibrary = !showLibrary"
          title="Browse saved tags"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <span class="library-toggle-label">Library</span>
          <span v-if="tagsStore.tags.length > 0" class="library-count">{{ tagsStore.tags.length }}</span>
        </button>
      </div>
    </div>

    <!-- Library Dropdown -->
    <div v-if="showLibrary" class="library-dropdown">
      <div class="library-header">
        <input
          type="text"
          class="library-search"
          placeholder="Search saved tags..."
          v-model="librarySearch"
        />
      </div>
      <div class="library-content">
        <div v-if="tagsStore.isLoading" class="library-loading">
          Loading...
        </div>
        <div v-else-if="tagsStore.error" class="library-error">
          {{ tagsStore.error }}
        </div>
        <div v-else-if="filteredLibraryTags.length === 0" class="library-empty">
          {{ librarySearch ? 'No matching tags' : 'No saved tags yet. Tags you add will appear here.' }}
        </div>
        <div v-else class="library-tags">
          <div
            v-for="tag in filteredLibraryTags.slice(0, 20)"
            :key="tag.id"
            class="library-tag"
            @click="addFromLibrary(tag.tag)"
          >
            <span class="library-tag-name">#{{ tag.tag }}</span>
            <span class="library-tag-count">{{ tag.usage_count }}x</span>
            <button
              type="button"
              class="library-tag-delete"
              @click="deleteFromLibrary(tag.id, $event)"
              title="Delete from library"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Save to Library Toggle -->
    <div class="save-toggle">
      <label class="checkbox-inline">
        <input type="checkbox" v-model="localSaveToLibrary" />
        <span>Save new tags to library</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.hashtag-input {
  position: relative;
}

.tags-container {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--accent-soft);
  border: 1px solid rgba(79, 70, 229, 0.3);
  border-radius: var(--radius-full);
  font-size: 13px;
  color: #c7d2fe;
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  background: transparent;
  border: none;
  color: currentColor;
  opacity: 0.6;
  cursor: pointer;
  transition: opacity 0.15s;
}

.tag-remove:hover {
  opacity: 1;
}

.tag-remove svg {
  width: 12px;
  height: 12px;
}

.input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.hash-prefix {
  padding: 8px 0 8px 12px;
  color: var(--muted);
  font-size: 14px;
}

.tag-input {
  flex: 1;
  padding: 8px 12px 8px 4px;
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 14px;
  outline: none;
}

.tag-input::placeholder {
  color: var(--muted);
}

.library-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.library-toggle:hover,
.library-toggle.active {
  background: var(--accent-soft);
  border-color: rgba(79, 70, 229, 0.3);
  color: #c7d2fe;
}

.library-toggle svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.library-toggle-label {
  font-size: 13px;
  font-weight: 500;
}

.library-count {
  padding: 2px 6px;
  background: rgba(79, 70, 229, 0.3);
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 500;
}

/* Library Dropdown */
.library-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 100;
  overflow: hidden;
}

.library-header {
  padding: 10px;
  border-bottom: 1px solid var(--border);
}

.library-search {
  width: 100%;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 13px;
  outline: none;
}

.library-search:focus {
  border-color: var(--accent);
}

.library-content {
  max-height: 200px;
  overflow-y: auto;
}

.library-loading,
.library-empty,
.library-error {
  padding: 24px;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
}

.library-error {
  color: #fca5a5;
}

.library-tags {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.library-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}

.library-tag:hover {
  background: rgba(79, 70, 229, 0.1);
}

.library-tag-name {
  flex: 1;
  font-size: 13px;
  color: var(--text);
}

.library-tag-count {
  font-size: 11px;
  color: var(--muted);
}

.library-tag-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--muted);
  cursor: pointer;
  opacity: 0;
  transition: all 0.15s;
}

.library-tag:hover .library-tag-delete {
  opacity: 1;
}

.library-tag-delete:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.library-tag-delete svg {
  width: 14px;
  height: 14px;
}

/* Save Toggle */
.save-toggle {
  margin-top: 8px;
}

.checkbox-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--muted);
  cursor: pointer;
}

.checkbox-inline input {
  accent-color: var(--accent);
}
</style>
