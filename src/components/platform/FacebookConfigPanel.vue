<script setup lang="ts">
import { computed } from 'vue'
import type { FacebookConfiguration } from '@/types'

const props = defineProps<{
  modelValue: FacebookConfiguration
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FacebookConfiguration]
}>()

const config = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const updateField = <K extends keyof FacebookConfiguration>(
  field: K,
  value: FacebookConfiguration[K]
) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
</script>

<template>
  <div class="config-panel">
    <div class="config-header">
      <div class="platform-badge facebook">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Facebook
      </div>
    </div>

    <div class="config-body">
      <!-- Placement -->
      <div class="config-field">
        <label class="field-label">Post Placement</label>
        <div class="radio-group">
          <label class="radio-option" :class="{ active: config.placement === 'feed' || !config.placement }">
            <input
              type="radio"
              name="facebook-placement"
              value="feed"
              :checked="config.placement === 'feed' || !config.placement"
              @change="updateField('placement', 'feed')"
            />
            <span class="radio-label">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Feed
            </span>
          </label>
          <label class="radio-option" :class="{ active: config.placement === 'reels' }">
            <input
              type="radio"
              name="facebook-placement"
              value="reels"
              :checked="config.placement === 'reels'"
              @change="updateField('placement', 'reels')"
            />
            <span class="radio-label">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Reels
            </span>
          </label>
          <label class="radio-option" :class="{ active: config.placement === 'story' }">
            <input
              type="radio"
              name="facebook-placement"
              value="story"
              :checked="config.placement === 'story'"
              @change="updateField('placement', 'story')"
            />
            <span class="radio-label">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Story
            </span>
          </label>
        </div>
        <span class="field-hint">
          <span v-if="config.placement === 'feed' || !config.placement">Standard post in News Feed</span>
          <span v-else-if="config.placement === 'reels'">Short-form video (9:16) in Reels tab</span>
          <span v-else-if="config.placement === 'story'">Disappears after 24 hours</span>
        </span>
      </div>

      <!-- Custom Caption -->
      <div class="config-field">
        <label class="field-label">
          Custom Caption
          <span class="optional">(optional)</span>
        </label>
        <textarea
          class="form-input form-textarea"
          placeholder="Override the main caption for Facebook..."
          :value="config.caption"
          @input="updateField('caption', ($event.target as HTMLTextAreaElement).value)"
          rows="3"
          maxlength="63206"
        ></textarea>
        <span class="field-hint">{{ (config.caption || '').length }} characters</span>
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

.platform-badge.facebook {
  color: #1877F2;
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
  background: rgba(24, 119, 242, 0.15);
  border-color: #1877F2;
  color: #1877F2;
}
</style>
