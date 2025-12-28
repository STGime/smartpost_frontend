<script setup lang="ts">
import { computed } from 'vue'
import type { XConfiguration } from '@/types'

const props = defineProps<{
  modelValue: XConfiguration
  captionLength?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: XConfiguration]
}>()

const config = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const updateField = <K extends keyof XConfiguration>(
  field: K,
  value: XConfiguration[K]
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

const charLimit = 280
</script>

<template>
  <div class="config-panel">
    <div class="config-header">
      <div class="platform-badge x">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        X (Twitter)
      </div>
    </div>

    <div class="config-body">
      <!-- Thread Mode -->
      <div class="config-field">
        <label class="field-label">
          <span>Thread Mode</span>
          <span class="field-badge" v-if="threadParts.length > 1">{{ threadParts.length }} tweets</span>
        </label>
        <div class="toggle-switch">
          <input
            type="checkbox"
            id="x-thread-mode"
            :checked="config.threadMode"
            @change="updateField('threadMode', ($event.target as HTMLInputElement).checked)"
          />
          <label for="x-thread-mode" class="switch-label">
            <span class="switch-track"></span>
            <span class="switch-text">{{ config.threadMode ? 'Enabled' : 'Disabled' }}</span>
          </label>
        </div>
        <span class="field-hint">Split long captions into multiple tweets</span>
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
        <span class="field-hint">Characters/text used to split into separate tweets</span>
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
            <span class="part-text">{{ part.substring(0, 100) }}{{ part.length > 100 ? '...' : '' }}</span>
            <span :class="['part-count', { warning: part.length > charLimit }]">
              {{ part.length }}/{{ charLimit }}
            </span>
          </div>
        </div>
      </div>

      <!-- Reply Settings -->
      <div class="config-field">
        <label class="field-label">Who can reply?</label>
        <div class="radio-group">
          <label class="radio-option" :class="{ active: config.replySettings === 'everyone' || !config.replySettings }">
            <input
              type="radio"
              name="x-reply-settings"
              value="everyone"
              :checked="config.replySettings === 'everyone' || !config.replySettings"
              @change="updateField('replySettings', 'everyone')"
            />
            <span class="radio-label">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Everyone
            </span>
          </label>
          <label class="radio-option" :class="{ active: config.replySettings === 'following' }">
            <input
              type="radio"
              name="x-reply-settings"
              value="following"
              :checked="config.replySettings === 'following'"
              @change="updateField('replySettings', 'following')"
            />
            <span class="radio-label">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Following
            </span>
          </label>
          <label class="radio-option" :class="{ active: config.replySettings === 'mentionedUsers' }">
            <input
              type="radio"
              name="x-reply-settings"
              value="mentionedUsers"
              :checked="config.replySettings === 'mentionedUsers'"
              @change="updateField('replySettings', 'mentionedUsers')"
            />
            <span class="radio-label">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              Mentioned
            </span>
          </label>
        </div>
      </div>

      <!-- Quote Tweet -->
      <div class="config-field">
        <label class="field-label">
          Quote Tweet ID
          <span class="optional">(optional)</span>
        </label>
        <input
          type="text"
          class="form-input"
          placeholder="Enter tweet ID to quote..."
          :value="config.quoteTweetId"
          @input="updateField('quoteTweetId', ($event.target as HTMLInputElement).value)"
        />
        <span class="field-hint">Create a quote tweet by entering the original tweet's ID</span>
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
              maxlength="1000"
            />
          </div>
        </div>
        <span class="field-hint">Describe images for screen readers (max 1000 chars each)</span>
      </div>

      <!-- Custom Caption -->
      <div class="config-field">
        <label class="field-label">
          Custom Caption
          <span class="optional">(optional)</span>
        </label>
        <textarea
          class="form-input form-textarea"
          placeholder="Override the main caption for X..."
          :value="config.caption"
          @input="updateField('caption', ($event.target as HTMLTextAreaElement).value)"
          rows="3"
        ></textarea>
        <span :class="['field-hint', { warning: (config.caption || '').length > charLimit }]">
          {{ (config.caption || '').length }}/{{ charLimit }} characters
          <span v-if="(config.caption || '').length > charLimit"> (Premium: 25,000)</span>
        </span>
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

.platform-badge.x {
  color: var(--text);
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
  background: var(--accent-soft);
  border-color: var(--accent);
  color: #a5b4fc;
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
  background: var(--accent-soft);
  color: #a5b4fc;
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
</style>
