<script setup lang="ts">
import { computed } from 'vue'
import type { InstagramConfiguration, MediaListItem, SocialAccount } from '@/types'
import InstagramPostPreview from './previews/InstagramPostPreview.vue'

const props = defineProps<{
  modelValue: InstagramConfiguration
  selectedMedia?: MediaListItem[]
  caption?: string
  hashtags?: string[]
  account?: SocialAccount
}>()

const emit = defineEmits<{
  'update:modelValue': [value: InstagramConfiguration]
}>()

const config = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Instagram Stories are only supported for Business accounts via the API
// Creator accounts (MEDIA_CREATOR) and Personal accounts don't support Stories
const supportsStories = computed(() => {
  const accountType = props.account?.metadata?.accountType
  // If no account type info (legacy accounts), allow Stories (will fail at API level if not supported)
  // Only explicitly hide if we know it's a Creator account
  return !accountType || accountType === 'BUSINESS'
})

const updateField = <K extends keyof InstagramConfiguration>(
  field: K,
  value: InstagramConfiguration[K]
) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
</script>

<template>
  <div class="config-panel">
    <div class="config-header">
      <div class="platform-badge instagram">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
        Instagram
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
              name="instagram-placement"
              value="feed"
              :checked="config.placement === 'feed' || !config.placement"
              @change="updateField('placement', 'feed')"
            />
            <span class="radio-label">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Feed
            </span>
          </label>
          <label class="radio-option" :class="{ active: config.placement === 'reels' }">
            <input
              type="radio"
              name="instagram-placement"
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
          <label v-if="supportsStories" class="radio-option" :class="{ active: config.placement === 'story' }">
            <input
              type="radio"
              name="instagram-placement"
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
          <span v-if="config.placement === 'feed' || !config.placement">Images & videos appear in the main feed grid</span>
          <span v-else-if="config.placement === 'reels'">Vertical video format (9:16) for maximum reach</span>
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
          placeholder="Override the main caption for Instagram..."
          :value="config.caption"
          @input="updateField('caption', ($event.target as HTMLTextAreaElement).value)"
          rows="3"
          maxlength="2200"
        ></textarea>
        <span class="field-hint">{{ (config.caption || '').length }}/2200 characters</span>
      </div>

      <!-- Preview Section -->
      <div class="preview-section">
        <div class="preview-label">Preview</div>
        <InstagramPostPreview
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

.platform-badge.instagram svg {
  color: #E4405F;
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
