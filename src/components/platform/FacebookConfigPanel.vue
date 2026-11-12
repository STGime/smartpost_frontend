<script setup lang="ts">
import { computed } from 'vue'
import type { FacebookConfiguration, MediaListItem, SocialAccount } from '@/types'
import FacebookPostPreview from './previews/FacebookPostPreview.vue'

const props = defineProps<{
  modelValue: FacebookConfiguration
  selectedMedia?: MediaListItem[]
  caption?: string
  hashtags?: string[]
  account?: SocialAccount
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

      <!-- Preview -->
      <div class="preview-section">
        <div class="preview-label">Preview</div>
        <FacebookPostPreview
          :caption="caption || ''"
          :hashtags="hashtags || []"
          :media-items="selectedMedia || []"
          :config="modelValue"
          :account="account"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Shared config-panel look (kept identical across all platform panels) */
.config-panel {
  background: var(--ink-1);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.config-header {
  padding: 10px 16px;
  border-bottom: 1px solid var(--line);
}

.platform-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.platform-badge svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.platform-badge.facebook svg {
  color: #1877F2;
}

.config-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.config-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.field-label {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.field-label .optional {
  font-weight: 400;
  color: var(--fg-3);
}

.field-hint {
  font-size: 12px;
  line-height: 1.45;
  color: var(--fg-3);
}

.form-textarea {
  resize: vertical;
  min-height: 72px;
}

/* Radio group */
.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.radio-option {
  position: relative;
  flex: 1 1 0;
  min-width: 90px;
}

.radio-option input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radio-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 12px;
  background: var(--ink-0);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--fg-2);
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s, color 0.15s;
}

.radio-label svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.radio-option:hover .radio-label {
  background: var(--ink-2);
  color: var(--text);
}

.radio-option.active .radio-label {
  background: var(--signal-soft);
  border-color: var(--signal);
  color: var(--text);
}

.radio-option.active .radio-label svg {
  color: var(--signal);
}

.radio-option input:focus-visible + .radio-label {
  outline: 2px solid var(--signal);
  outline-offset: 2px;
}

/* Preview */
.preview-section {
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.preview-label {
  margin-bottom: 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-3);
}
</style>
