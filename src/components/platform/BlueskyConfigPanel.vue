<script setup lang="ts">
import { computed } from 'vue'
import type { BlueskyConfiguration, MediaListItem, SocialAccount } from '@/types'
import BlueskyPostPreview from './previews/BlueskyPostPreview.vue'

const props = defineProps<{
  modelValue: BlueskyConfiguration
  selectedMedia?: MediaListItem[]
  caption?: string
  hashtags?: string[]
  account?: SocialAccount
}>()

const emit = defineEmits<{
  'update:modelValue': [value: BlueskyConfiguration]
}>()

const config = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const updateField = <K extends keyof BlueskyConfiguration>(
  field: K,
  value: BlueskyConfiguration[K]
) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

// Calculate thread parts preview
const threadParts = computed(() => {
  if (!config.value.threadMode) return []
  const separator = config.value.threadSeparator || '\n\n'
  const text = config.value.caption || ''
  if (!text) return []
  return text.split(separator).filter(part => part.trim())
})

type ContentLabel = 'nsfw' | 'nudity' | 'suggestive' | 'gore' | 'spoiler'

const toggleLabel = (label: ContentLabel) => {
  const currentLabels = config.value.labels || []
  const index = currentLabels.indexOf(label)
  if (index === -1) {
    updateField('labels', [...currentLabels, label])
  } else {
    updateField('labels', currentLabels.filter(l => l !== label))
  }
}

const charLimit = 300

const contentLabels = [
  { value: 'nsfw' as const, label: 'NSFW', icon: '18+' },
  { value: 'nudity' as const, label: 'Nudity', icon: 'N' },
  { value: 'suggestive' as const, label: 'Suggestive', icon: 'S' },
  { value: 'gore' as const, label: 'Gore', icon: 'G' },
  { value: 'spoiler' as const, label: 'Spoiler', icon: '!' },
]

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
]

const toggleLanguage = (code: string) => {
  const currentLangs = config.value.languages || []
  const index = currentLangs.indexOf(code)
  if (index === -1) {
    if (currentLangs.length < 3) {
      updateField('languages', [...currentLangs, code])
    }
  } else {
    updateField('languages', currentLangs.filter(l => l !== code))
  }
}
</script>

<template>
  <div class="config-panel">
    <div class="config-header">
      <div class="platform-badge bluesky">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 01-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/>
        </svg>
        Bluesky
      </div>
    </div>

    <div class="config-body">
      <!-- Thread Mode -->
      <div class="config-field">
        <label class="field-label">
          <span>Thread Mode</span>
          <span class="field-badge" v-if="threadParts.length > 1">{{ threadParts.length }} posts</span>
        </label>
        <div class="toggle-switch">
          <input
            type="checkbox"
            id="bsky-thread-mode"
            :checked="config.threadMode"
            @change="updateField('threadMode', ($event.target as HTMLInputElement).checked)"
          />
          <label for="bsky-thread-mode" class="switch-label">
            <span class="switch-track"></span>
            <span class="switch-text">{{ config.threadMode ? 'Enabled' : 'Disabled' }}</span>
          </label>
        </div>
        <span class="field-hint">Split long captions into multiple posts</span>
      </div>

      <!-- Thread Separator -->
      <div v-if="config.threadMode" class="config-field">
        <label class="field-label">Thread Separator</label>
        <input
          type="text"
          class="form-input"
          placeholder="\\n\\n (double newline)"
          :value="config.threadSeparator"
          @input="updateField('threadSeparator', ($event.target as HTMLInputElement).value)"
        />
        <span class="field-hint">Characters/text used to split into separate posts</span>
      </div>

      <!-- Thread Preview -->
      <div v-if="config.threadMode && threadParts.length > 0" class="thread-preview">
        <label class="field-label">Thread Preview</label>
        <div class="thread-parts">
          <div
            v-for="(part, index) in threadParts"
            :key="index"
            :class="['thread-part', { 'over-limit': part.length > charLimit }]"
          >
            <span class="part-number">{{ index + 1 }}</span>
            <span class="part-text">{{ part.substring(0, 80) }}{{ part.length > 80 ? '...' : '' }}</span>
            <span :class="['part-count', { warning: part.length > charLimit }]">
              {{ part.length }}/{{ charLimit }}
            </span>
          </div>
        </div>
      </div>

      <!-- Languages -->
      <div class="config-field">
        <label class="field-label">
          Languages
          <span class="optional">(up to 3)</span>
        </label>
        <div class="language-chips">
          <button
            v-for="lang in languages"
            :key="lang.code"
            type="button"
            :class="['lang-chip', { active: (config.languages || []).includes(lang.code) }]"
            @click="toggleLanguage(lang.code)"
            :disabled="!(config.languages || []).includes(lang.code) && (config.languages || []).length >= 3"
          >
            {{ lang.name }}
          </button>
        </div>
        <span class="field-hint">Tag post language for better reach</span>
      </div>

      <!-- Content Labels (Warnings) -->
      <div class="config-field">
        <label class="field-label">
          Content Warnings
          <span class="optional">(if applicable)</span>
        </label>
        <div class="label-chips">
          <button
            v-for="label in contentLabels"
            :key="label.value"
            type="button"
            :class="['label-chip', label.value, { active: (config.labels || []).includes(label.value) }]"
            @click="toggleLabel(label.value)"
          >
            <span class="label-icon">{{ label.icon }}</span>
            {{ label.label }}
          </button>
        </div>
        <span class="field-hint">Add content warnings for sensitive material</span>
      </div>

      <!-- Embed URL -->
      <div class="config-field">
        <label class="field-label">
          Embed Link
          <span class="optional">(optional)</span>
        </label>
        <input
          type="url"
          class="form-input"
          placeholder="https://example.com"
          :value="config.embedUrl"
          @input="updateField('embedUrl', ($event.target as HTMLInputElement).value)"
        />
        <span class="field-hint">URL to show as link card preview</span>
      </div>

      <!-- Alt Text for Images -->
      <div class="config-field">
        <label class="field-label">
          Image Alt Text
          <span class="optional">(accessibility)</span>
        </label>
        <div class="alt-text-inputs">
          <div v-for="i in 4" :key="i" class="alt-text-row">
            <span class="alt-index">{{ i }}</span>
            <input
              type="text"
              class="form-input"
              :placeholder="`Alt text for image ${i}...`"
              :value="config.altText?.[i - 1] || ''"
              @input="
                updateField('altText', [
                  ...(config.altText || []).slice(0, i - 1),
                  ($event.target as HTMLInputElement).value,
                  ...(config.altText || []).slice(i)
                ])
              "
              maxlength="2000"
            />
          </div>
        </div>
        <span class="field-hint">Describe images for screen readers (max 2000 chars each)</span>
      </div>

      <!-- Custom Caption -->
      <div class="config-field">
        <label class="field-label">
          Custom Caption
          <span class="optional">(optional)</span>
        </label>
        <textarea
          class="form-input form-textarea"
          placeholder="Override the main caption for Bluesky..."
          :value="config.caption"
          @input="updateField('caption', ($event.target as HTMLTextAreaElement).value)"
          rows="3"
          maxlength="300"
        ></textarea>
        <span :class="['field-hint', { warning: (config.caption || '').length > charLimit }]">
          {{ (config.caption || '').length }}/{{ charLimit }} characters
        </span>
      </div>

      <!-- Preview -->
      <div class="preview-section">
        <div class="preview-label">Preview</div>
        <BlueskyPostPreview
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

.platform-badge.bluesky {
  color: #0085FF;
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
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.field-label .optional {
  font-weight: 400;
  color: var(--muted);
}

.field-badge {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--accent-soft);
  color: #a5b4fc;
  font-size: 11px;
  font-weight: 500;
}

.field-hint {
  font-size: 11px;
  color: var(--muted);
}

.field-hint.warning {
  color: #f97316;
}

.form-textarea {
  resize: vertical;
  min-height: 70px;
}

/* Toggle Switch */
.toggle-switch {
  display: flex;
  align-items: center;
}

.toggle-switch input {
  display: none;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.switch-track {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--border);
  position: relative;
  transition: all 0.2s;
}

.switch-track::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  transition: all 0.2s;
}

.toggle-switch input:checked + .switch-label .switch-track {
  background: var(--accent);
}

.toggle-switch input:checked + .switch-label .switch-track::after {
  left: 22px;
}

.switch-text {
  font-size: 13px;
  color: var(--muted);
}

/* Thread Preview */
.thread-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.thread-parts {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.thread-part {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 12px;
}

.thread-part.over-limit {
  border-color: #f97316;
}

.part-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 133, 255, 0.2);
  color: #0085FF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 11px;
  flex-shrink: 0;
}

.part-text {
  flex: 1;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.part-count {
  font-size: 11px;
  color: var(--muted);
  flex-shrink: 0;
}

.part-count.warning {
  color: #f97316;
}

/* Language Chips */
.language-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.lang-chip {
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--border);
  color: var(--muted);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.lang-chip:hover:not(:disabled) {
  border-color: var(--border-hover);
  color: var(--text);
}

.lang-chip.active {
  background: rgba(0, 133, 255, 0.2);
  border-color: #0085FF;
  color: #0085FF;
}

.lang-chip:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Content Label Chips */
.label-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.label-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--border);
  color: var(--muted);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.label-chip:hover {
  border-color: var(--border-hover);
}

.label-icon {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: rgba(148, 163, 184, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
}

.label-chip.active {
  border-color: #ef4444;
  color: #ef4444;
}

.label-chip.active .label-icon {
  background: rgba(239, 68, 68, 0.2);
}

.label-chip.spoiler.active {
  border-color: #f59e0b;
  color: #f59e0b;
}

.label-chip.spoiler.active .label-icon {
  background: rgba(245, 158, 11, 0.2);
}

/* Alt Text Inputs */
.alt-text-inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alt-text-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alt-index {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(148, 163, 184, 0.2);
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  flex-shrink: 0;
}

.alt-text-row .form-input {
  flex: 1;
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
