<script setup lang="ts">
import { computed } from 'vue'
import type { PinterestConfiguration, MediaListItem, SocialAccount } from '@/types'
import PinterestPostPreview from './previews/PinterestPostPreview.vue'

const props = defineProps<{
  modelValue: PinterestConfiguration
  selectedMedia?: MediaListItem[]
  caption?: string
  hashtags?: string[]
  account?: SocialAccount
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PinterestConfiguration]
}>()

const config = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const updateField = <K extends keyof PinterestConfiguration>(
  field: K,
  value: PinterestConfiguration[K]
) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
</script>

<template>
  <div class="config-panel">
    <div class="config-header">
      <div class="platform-badge pinterest">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
        </svg>
        Pinterest
      </div>
    </div>

    <div class="config-body">
      <!-- Pin Title -->
      <div class="config-field">
        <label class="field-label">
          Pin Title
          <span class="optional">(optional)</span>
        </label>
        <input
          type="text"
          class="form-input"
          placeholder="Enter a title for your Pin..."
          :value="config.title"
          @input="updateField('title', ($event.target as HTMLInputElement).value)"
          maxlength="100"
        />
        <span class="field-hint">Displayed prominently on the Pin (max 100 chars)</span>
      </div>

      <!-- Destination Link -->
      <div class="config-field">
        <label class="field-label">
          Destination Link
          <span class="optional">(recommended)</span>
        </label>
        <input
          type="url"
          class="form-input"
          placeholder="https://yourwebsite.com/page"
          :value="config.link"
          @input="updateField('link', ($event.target as HTMLInputElement).value)"
        />
        <span class="field-hint">URL users are taken to when they click the Pin</span>
      </div>

      <!-- Alt Text -->
      <div class="config-field">
        <label class="field-label">
          Alt Text
          <span class="optional">(accessibility)</span>
        </label>
        <textarea
          class="form-input form-textarea-sm"
          placeholder="Describe the image for screen readers..."
          :value="config.alt_text"
          @input="updateField('alt_text', ($event.target as HTMLTextAreaElement).value)"
          rows="2"
          maxlength="500"
        ></textarea>
        <span class="field-hint">{{ (config.alt_text || '').length }}/500 characters</span>
      </div>

      <!-- Custom Caption/Description -->
      <div class="config-field">
        <label class="field-label">
          Pin Description
          <span class="optional">(optional)</span>
        </label>
        <textarea
          class="form-input form-textarea"
          placeholder="Override the main caption for Pinterest..."
          :value="config.caption"
          @input="updateField('caption', ($event.target as HTMLTextAreaElement).value)"
          rows="3"
          maxlength="500"
        ></textarea>
        <span class="field-hint">{{ (config.caption || '').length }}/500 characters</span>
      </div>

      <!-- Tip -->
      <div class="config-tip">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Board selection will be available after connecting your Pinterest account with board access.</span>
      </div>

      <!-- Preview -->
      <div class="preview-section">
        <div class="preview-label">Preview</div>
        <PinterestPostPreview
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

.platform-badge.pinterest {
  color: #BD081C;
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

.form-textarea-sm {
  resize: vertical;
  min-height: 50px;
}

.config-tip {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: rgba(189, 8, 28, 0.1);
  border-radius: var(--radius-md);
  font-size: 12px;
  color: var(--muted);
}

.config-tip svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #BD081C;
  margin-top: 1px;
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
