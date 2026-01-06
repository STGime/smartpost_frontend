<script setup lang="ts">
import { computed } from 'vue'
import type { TikTokConfiguration, MediaListItem, SocialAccount } from '@/types'
import TikTokPostPreview from './previews/TikTokPostPreview.vue'

const props = defineProps<{
  modelValue: TikTokConfiguration
  selectedMedia?: MediaListItem[]
  caption?: string
  hashtags?: string[]
  account?: SocialAccount
}>()

const emit = defineEmits<{
  'update:modelValue': [value: TikTokConfiguration]
}>()

const config = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const updateField = <K extends keyof TikTokConfiguration>(
  field: K,
  value: TikTokConfiguration[K]
) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
</script>

<template>
  <div class="config-panel">
    <div class="config-header">
      <div class="platform-badge tiktok">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
        TikTok
      </div>
    </div>

    <div class="config-body">
      <!-- Video Title -->
      <div class="config-field">
        <label class="field-label">
          Video Title
          <span class="optional">(optional)</span>
        </label>
        <input
          type="text"
          class="form-input"
          placeholder="Enter a title for your video..."
          :value="config.title"
          @input="updateField('title', ($event.target as HTMLInputElement).value)"
          maxlength="150"
        />
        <span class="field-hint">Displayed in search results</span>
      </div>

      <!-- Save as Draft -->
      <div class="config-field">
        <label class="field-label">Publishing Mode</label>
        <div class="toggle-group">
          <button
            type="button"
            :class="['toggle-btn', { active: !config.draft }]"
            @click="updateField('draft', false)"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Publish
          </button>
          <button
            type="button"
            :class="['toggle-btn', { active: config.draft }]"
            @click="updateField('draft', true)"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Save as Draft
          </button>
        </div>
      </div>

      <!-- AI Generated Content Disclosure -->
      <div class="config-field">
        <div class="checkbox-row">
          <input
            type="checkbox"
            id="tiktok-aigc"
            :checked="config.isAigc"
            @change="updateField('isAigc', ($event.target as HTMLInputElement).checked)"
          />
          <label for="tiktok-aigc" class="checkbox-label">
            <span class="checkbox-box"></span>
            <span class="checkbox-text">
              <strong>AI-Generated Content</strong>
              <span class="checkbox-hint">Disclose if content was created with AI</span>
            </span>
          </label>
        </div>
      </div>

      <!-- Engagement Settings -->
      <div class="config-field">
        <label class="field-label">Engagement Settings</label>
        <div class="checkbox-group">
          <div class="checkbox-row">
            <input
              type="checkbox"
              id="tiktok-comments"
              :checked="config.disableComment"
              @change="updateField('disableComment', ($event.target as HTMLInputElement).checked)"
            />
            <label for="tiktok-comments" class="checkbox-label">
              <span class="checkbox-box"></span>
              <span class="checkbox-text">Disable Comments</span>
            </label>
          </div>
          <div class="checkbox-row">
            <input
              type="checkbox"
              id="tiktok-duet"
              :checked="config.disableDuet"
              @change="updateField('disableDuet', ($event.target as HTMLInputElement).checked)"
            />
            <label for="tiktok-duet" class="checkbox-label">
              <span class="checkbox-box"></span>
              <span class="checkbox-text">Disable Duet</span>
            </label>
          </div>
          <div class="checkbox-row">
            <input
              type="checkbox"
              id="tiktok-stitch"
              :checked="config.disableStitch"
              @change="updateField('disableStitch', ($event.target as HTMLInputElement).checked)"
            />
            <label for="tiktok-stitch" class="checkbox-label">
              <span class="checkbox-box"></span>
              <span class="checkbox-text">Disable Stitch</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Brand Content -->
      <div class="config-field">
        <label class="field-label">Brand Content</label>
        <div class="checkbox-group">
          <div class="checkbox-row">
            <input
              type="checkbox"
              id="tiktok-brand-content"
              :checked="config.brandContentToggle"
              @change="updateField('brandContentToggle', ($event.target as HTMLInputElement).checked)"
            />
            <label for="tiktok-brand-content" class="checkbox-label">
              <span class="checkbox-box"></span>
              <span class="checkbox-text">
                <strong>Paid Partnership</strong>
                <span class="checkbox-hint">This is a paid promotion</span>
              </span>
            </label>
          </div>
          <div class="checkbox-row">
            <input
              type="checkbox"
              id="tiktok-brand-organic"
              :checked="config.brandOrganicToggle"
              @change="updateField('brandOrganicToggle', ($event.target as HTMLInputElement).checked)"
            />
            <label for="tiktok-brand-organic" class="checkbox-label">
              <span class="checkbox-box"></span>
              <span class="checkbox-text">
                <strong>Your Brand</strong>
                <span class="checkbox-hint">Promoting your own brand/business</span>
              </span>
            </label>
          </div>
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
          placeholder="Override the main caption for TikTok..."
          :value="config.caption"
          @input="updateField('caption', ($event.target as HTMLTextAreaElement).value)"
          rows="3"
          maxlength="2200"
        ></textarea>
        <span class="field-hint">{{ (config.caption || '').length }}/2200 characters</span>
      </div>

      <!-- Preview -->
      <div class="preview-section">
        <div class="preview-label">Preview</div>
        <TikTokPostPreview
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

.platform-badge.tiktok {
  color: #ff0050;
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

/* Checkbox styles */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

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
  background: var(--accent);
  border-radius: 2px;
  opacity: 0;
  transform: scale(0);
  transition: all 0.15s;
}

.checkbox-row input:checked + .checkbox-label .checkbox-box {
  border-color: var(--accent);
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

/* Preview */
.preview-section {
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.preview-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 12px;
}
</style>
