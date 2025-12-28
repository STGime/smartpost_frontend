<script setup lang="ts">
import { computed, ref } from 'vue'
import type { YouTubeConfiguration } from '@/types'

const props = defineProps<{
  modelValue: YouTubeConfiguration
}>()

const emit = defineEmits<{
  'update:modelValue': [value: YouTubeConfiguration]
}>()

const config = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const updateField = <K extends keyof YouTubeConfiguration>(
  field: K,
  value: YouTubeConfiguration[K]
) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

// Tag input
const tagInput = ref('')

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !(config.value.tags || []).includes(tag)) {
    updateField('tags', [...(config.value.tags || []), tag])
    tagInput.value = ''
  }
}

const removeTag = (index: number) => {
  const newTags = [...(config.value.tags || [])]
  newTags.splice(index, 1)
  updateField('tags', newTags)
}

const handleTagKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag()
  }
}

// YouTube categories (common ones)
const categories = [
  { id: '1', name: 'Film & Animation' },
  { id: '2', name: 'Autos & Vehicles' },
  { id: '10', name: 'Music' },
  { id: '15', name: 'Pets & Animals' },
  { id: '17', name: 'Sports' },
  { id: '19', name: 'Travel & Events' },
  { id: '20', name: 'Gaming' },
  { id: '22', name: 'People & Blogs' },
  { id: '23', name: 'Comedy' },
  { id: '24', name: 'Entertainment' },
  { id: '25', name: 'News & Politics' },
  { id: '26', name: 'Howto & Style' },
  { id: '27', name: 'Education' },
  { id: '28', name: 'Science & Technology' },
  { id: '29', name: 'Nonprofits & Activism' },
]
</script>

<template>
  <div class="config-panel">
    <div class="config-header">
      <div class="platform-badge youtube">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        YouTube
      </div>
    </div>

    <div class="config-body">
      <!-- Video Type -->
      <div class="config-field">
        <label class="field-label">Video Type</label>
        <div class="toggle-group">
          <button
            type="button"
            :class="['toggle-btn', { active: !config.isShort }]"
            @click="updateField('isShort', false)"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Video
          </button>
          <button
            type="button"
            :class="['toggle-btn', { active: config.isShort }]"
            @click="updateField('isShort', true)"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Short
          </button>
        </div>
        <span class="field-hint">
          <span v-if="!config.isShort">Standard video (horizontal, any length)</span>
          <span v-else>Shorts are vertical videos up to 60 seconds</span>
        </span>
      </div>

      <!-- Video Title -->
      <div class="config-field">
        <label class="field-label">Video Title</label>
        <input
          type="text"
          class="form-input"
          placeholder="Enter your video title..."
          :value="config.title"
          @input="updateField('title', ($event.target as HTMLInputElement).value)"
          maxlength="100"
        />
        <span class="field-hint">{{ (config.title || '').length }}/100 characters</span>
      </div>

      <!-- Description -->
      <div class="config-field">
        <label class="field-label">
          Description
          <span class="optional">(optional)</span>
        </label>
        <textarea
          class="form-input form-textarea"
          placeholder="Override the main caption for YouTube description..."
          :value="config.description || config.caption"
          @input="updateField('description', ($event.target as HTMLTextAreaElement).value)"
          rows="4"
          maxlength="5000"
        ></textarea>
        <span class="field-hint">{{ (config.description || config.caption || '').length }}/5000 characters</span>
      </div>

      <!-- Tags -->
      <div class="config-field">
        <label class="field-label">
          Tags
          <span class="optional">(optional)</span>
        </label>
        <div class="tags-input-container">
          <div class="tags-list" v-if="(config.tags || []).length > 0">
            <span
              v-for="(tag, index) in config.tags"
              :key="index"
              class="tag"
            >
              {{ tag }}
              <button type="button" class="tag-remove" @click="removeTag(index)">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
          <input
            type="text"
            class="form-input"
            placeholder="Add tags (press Enter or comma)"
            v-model="tagInput"
            @keydown="handleTagKeydown"
            @blur="addTag"
          />
        </div>
        <span class="field-hint">Tags help viewers find your video</span>
      </div>

      <!-- Privacy Status -->
      <div class="config-field">
        <label class="field-label">Privacy</label>
        <div class="radio-group">
          <label class="radio-option" :class="{ active: config.privacyStatus === 'public' || !config.privacyStatus }">
            <input
              type="radio"
              name="youtube-privacy"
              value="public"
              :checked="config.privacyStatus === 'public' || !config.privacyStatus"
              @change="updateField('privacyStatus', 'public')"
            />
            <span class="radio-label">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Public
            </span>
          </label>
          <label class="radio-option" :class="{ active: config.privacyStatus === 'unlisted' }">
            <input
              type="radio"
              name="youtube-privacy"
              value="unlisted"
              :checked="config.privacyStatus === 'unlisted'"
              @change="updateField('privacyStatus', 'unlisted')"
            />
            <span class="radio-label">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              Unlisted
            </span>
          </label>
          <label class="radio-option" :class="{ active: config.privacyStatus === 'private' }">
            <input
              type="radio"
              name="youtube-privacy"
              value="private"
              :checked="config.privacyStatus === 'private'"
              @change="updateField('privacyStatus', 'private')"
            />
            <span class="radio-label">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Private
            </span>
          </label>
        </div>
      </div>

      <!-- Category -->
      <div class="config-field">
        <label class="field-label">
          Category
          <span class="optional">(optional)</span>
        </label>
        <select
          class="form-input form-select"
          :value="config.categoryId"
          @change="updateField('categoryId', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Select a category...</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <!-- Audience -->
      <div class="config-field">
        <label class="field-label">Audience</label>
        <div class="checkbox-row">
          <input
            type="checkbox"
            id="youtube-kids"
            :checked="config.madeForKids"
            @change="updateField('madeForKids', ($event.target as HTMLInputElement).checked)"
          />
          <label for="youtube-kids" class="checkbox-label">
            <span class="checkbox-box"></span>
            <span class="checkbox-text">
              <strong>Made for Kids</strong>
              <span class="checkbox-hint">Content is directed at children (COPPA)</span>
            </span>
          </label>
        </div>
      </div>

      <!-- Notify Subscribers -->
      <div class="config-field">
        <div class="checkbox-row">
          <input
            type="checkbox"
            id="youtube-notify"
            :checked="config.notifySubscribers !== false"
            @change="updateField('notifySubscribers', ($event.target as HTMLInputElement).checked)"
          />
          <label for="youtube-notify" class="checkbox-label">
            <span class="checkbox-box"></span>
            <span class="checkbox-text">
              <strong>Notify Subscribers</strong>
              <span class="checkbox-hint">Send notification to your subscribers</span>
            </span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.config-panel {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.config-header {
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid var(--border);
}

.platform-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.platform-badge svg {
  width: 18px;
  height: 18px;
}

.platform-badge.youtube {
  color: #FF0000;
}

.config-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.field-label .optional {
  font-weight: 400;
  color: var(--muted);
}

.field-hint {
  font-size: 11px;
  color: var(--muted);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 10px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 36px;
}

/* Toggle Group */
.toggle-group {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--border);
  font-size: 12px;
  color: var(--text);
  cursor: pointer;
  transition: all 0.15s;
}

.toggle-btn svg {
  width: 16px;
  height: 16px;
}

.toggle-btn:hover {
  border-color: var(--border-hover);
}

.toggle-btn.active {
  background: rgba(255, 0, 0, 0.15);
  border-color: #FF0000;
  color: #FF0000;
}

/* Radio Group */
.radio-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.radio-option {
  flex: 1;
  min-width: 90px;
}

.radio-option input {
  display: none;
}

.radio-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--border);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.radio-label svg {
  width: 16px;
  height: 16px;
}

.radio-option:hover .radio-label {
  border-color: var(--border-hover);
}

.radio-option.active .radio-label {
  background: rgba(255, 0, 0, 0.15);
  border-color: #FF0000;
  color: #FF0000;
}

/* Tags */
.tags-input-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(255, 0, 0, 0.15);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: var(--radius-full);
  font-size: 12px;
  color: #FF0000;
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  padding: 0;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.15s;
}

.tag-remove:hover {
  opacity: 1;
}

.tag-remove svg {
  width: 12px;
  height: 12px;
}

/* Checkbox styles */
.checkbox-row {
  display: flex;
  align-items: flex-start;
}

.checkbox-row input[type="checkbox"] {
  display: none;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}

.checkbox-box {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 2px solid var(--border);
  background: rgba(15, 23, 42, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
  margin-top: 1px;
}

.checkbox-box::after {
  content: '';
  width: 10px;
  height: 10px;
  background: #FF0000;
  border-radius: 2px;
  opacity: 0;
  transform: scale(0);
  transition: all 0.15s;
}

.checkbox-row input:checked + .checkbox-label .checkbox-box {
  border-color: #FF0000;
}

.checkbox-row input:checked + .checkbox-label .checkbox-box::after {
  opacity: 1;
  transform: scale(1);
}

.checkbox-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
  color: var(--text);
}

.checkbox-text strong {
  font-weight: 500;
}

.checkbox-hint {
  font-size: 11px;
  color: var(--muted);
}
</style>
