<script setup lang="ts">
import { computed } from 'vue'
import type { LinkedInConfiguration } from '@/types'

const props = defineProps<{
  modelValue: LinkedInConfiguration
}>()

const emit = defineEmits<{
  'update:modelValue': [value: LinkedInConfiguration]
}>()

const config = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const updateField = <K extends keyof LinkedInConfiguration>(
  field: K,
  value: LinkedInConfiguration[K]
) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
</script>

<template>
  <div class="config-panel">
    <div class="config-header">
      <div class="platform-badge linkedin">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        LinkedIn
      </div>
    </div>

    <div class="config-body">
      <!-- Post Type -->
      <div class="config-field">
        <label class="field-label">Post Type</label>
        <div class="radio-group">
          <label class="radio-option" :class="{ active: config.postType === 'post' || !config.postType }">
            <input
              type="radio"
              name="linkedin-post-type"
              value="post"
              :checked="config.postType === 'post' || !config.postType"
              @change="updateField('postType', 'post')"
            />
            <span class="radio-label">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Post
            </span>
          </label>
          <label class="radio-option" :class="{ active: config.postType === 'document' }">
            <input
              type="radio"
              name="linkedin-post-type"
              value="document"
              :checked="config.postType === 'document'"
              @change="updateField('postType', 'document')"
            />
            <span class="radio-label">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Carousel (PDF)
            </span>
          </label>
          <label class="radio-option" :class="{ active: config.postType === 'article' }">
            <input
              type="radio"
              name="linkedin-post-type"
              value="article"
              :checked="config.postType === 'article'"
              @change="updateField('postType', 'article')"
            />
            <span class="radio-label">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Article
            </span>
          </label>
        </div>
      </div>

      <!-- Document Title (for carousel) -->
      <div v-if="config.postType === 'document'" class="config-field">
        <label class="field-label">Carousel Title</label>
        <input
          type="text"
          class="form-input"
          placeholder="Enter a title for your carousel..."
          :value="config.documentTitle"
          @input="updateField('documentTitle', ($event.target as HTMLInputElement).value)"
          maxlength="150"
        />
        <span class="field-hint">Displayed above the carousel (max 150 chars)</span>
      </div>

      <!-- Article URL (for article share) -->
      <div v-if="config.postType === 'article'" class="config-field">
        <label class="field-label">Article URL</label>
        <input
          type="url"
          class="form-input"
          placeholder="https://example.com/article"
          :value="config.articleUrl"
          @input="updateField('articleUrl', ($event.target as HTMLInputElement).value)"
        />
        <span class="field-hint">Link to share as an article</span>
      </div>

      <!-- Visibility -->
      <div class="config-field">
        <label class="field-label">Visibility</label>
        <div class="toggle-group">
          <button
            type="button"
            :class="['toggle-btn', { active: config.visibility === 'PUBLIC' || !config.visibility }]"
            @click="updateField('visibility', 'PUBLIC')"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Public
          </button>
          <button
            type="button"
            :class="['toggle-btn', { active: config.visibility === 'CONNECTIONS' }]"
            @click="updateField('visibility', 'CONNECTIONS')"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Connections Only
          </button>
        </div>
      </div>

      <!-- Custom Caption -->
      <div class="config-field">
        <label class="field-label">
          Custom Caption
          <span class="optional">(optional)</span>
        </label>
        <textarea
          class="form-input form-textarea"
          placeholder="Override the main caption for LinkedIn..."
          :value="config.caption"
          @input="updateField('caption', ($event.target as HTMLTextAreaElement).value)"
          rows="3"
          maxlength="3000"
        ></textarea>
        <span class="field-hint">{{ (config.caption || '').length }}/3000 characters</span>
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

.platform-badge.linkedin {
  color: #0A66C2;
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
  min-height: 70px;
}

/* Radio Group */
.radio-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.radio-option {
  flex: 1;
  min-width: 100px;
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
  background: var(--accent-soft);
  border-color: var(--accent);
  color: #a5b4fc;
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
  background: var(--accent-soft);
  border-color: var(--accent);
  color: #a5b4fc;
}
</style>
