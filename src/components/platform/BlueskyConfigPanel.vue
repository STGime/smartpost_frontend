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

.platform-badge.bluesky svg {
  color: #0085FF;
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

/* Toggle switch */
.toggle-switch {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle-switch input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.switch-track {
  position: relative;
  display: block;
  width: 34px;
  height: 20px;
  flex-shrink: 0;
  background: var(--ink-3);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}

.switch-track::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  background: var(--fg-2);
  border-radius: 50%;
  transition: transform 0.15s, background-color 0.15s;
}

.toggle-switch input:checked + .switch-label .switch-track {
  background: var(--signal);
  border-color: var(--signal);
}

.toggle-switch input:checked + .switch-label .switch-track::after {
  transform: translateX(14px);
  background: var(--ink-0);
}

.toggle-switch input:focus-visible + .switch-label .switch-track {
  outline: 2px solid var(--signal);
  outline-offset: 2px;
}

.switch-text {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.toggle-switch input:checked + .switch-label .switch-text {
  color: var(--signal);
}

.field-badge {
  margin-left: auto;
  padding: 2px 6px;
  background: var(--signal-soft);
  border: 1px solid var(--signal);
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--signal);
}

.field-hint.warning {
  color: var(--error);
}

/* Thread preview */
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
  min-width: 0;
  padding: 8px 10px;
  background: var(--ink-0);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  font-size: 12px;
}

.thread-part.over-limit {
  border-color: var(--error);
}

.part-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  background: var(--signal-soft);
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--signal);
}

.part-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--fg-2);
}

.part-count {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
}

.part-count.warning {
  color: var(--error);
}

/* Alt text inputs */
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border: 1px solid var(--line-strong);
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
}

.alt-text-row .form-input {
  flex: 1;
  min-width: 0;
}

/* Language and content-label chips */
.language-chips,
.label-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.lang-chip,
.label-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: var(--ink-0);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--fg-2);
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s, color 0.15s;
}

.lang-chip:hover:not(:disabled),
.label-chip:hover {
  background: var(--ink-2);
  color: var(--text);
}

.lang-chip.active {
  background: var(--signal-soft);
  border-color: var(--signal);
  color: var(--text);
}

.lang-chip:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.label-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: var(--ink-3);
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
}

/* Sensitive-content labels read as red, spoiler as amber */
.label-chip.active {
  background: var(--error-soft);
  border-color: var(--error);
  color: var(--text);
}

.label-chip.active .label-icon {
  background: var(--error);
  color: var(--ink-0);
}

.label-chip.spoiler.active {
  background: var(--signal-soft);
  border-color: var(--signal);
}

.label-chip.spoiler.active .label-icon {
  background: var(--signal);
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
