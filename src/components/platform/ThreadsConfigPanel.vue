<script setup lang="ts">
import { computed } from 'vue'
import type { ThreadsConfiguration, MediaListItem, SocialAccount } from '@/types'
import ThreadsPostPreview from './previews/ThreadsPostPreview.vue'

const props = defineProps<{
  modelValue: ThreadsConfiguration
  selectedMedia?: MediaListItem[]
  caption?: string
  hashtags?: string[]
  account?: SocialAccount
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ThreadsConfiguration]
}>()

const config = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const updateField = <K extends keyof ThreadsConfiguration>(
  field: K,
  value: ThreadsConfiguration[K]
) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
</script>

<template>
  <div class="config-panel">
    <div class="config-header">
      <div class="platform-badge threads">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.33-3.022.88-.73 2.108-1.152 3.457-1.187 1.357-.035 2.618.323 3.456 1.036l.008.144c.016.32.03.646.044.972.67-.247 1.243-.6 1.685-1.044 1.075-1.077 1.181-2.578.283-4.012C16.96 5.197 14.862 4.074 12 4.074c-4.676 0-7.926 3.381-7.926 8.251 0 4.87 3.25 8.251 7.926 8.251.784 0 1.517-.064 2.198-.194l.545 1.922c-.858.183-1.77.276-2.738.29-.065.001-.13.001-.194.001l-.007.001H12.186v.004zm2.063-7.196l.01-.04a12.168 12.168 0 01-.02-.396c-1.083-.086-2.197.153-2.923.805-.513.462-.745 1.04-.717 1.712.041.958.756 1.906 2.296 1.823 1.197-.064 2.058-.46 2.56-1.18.4-.573.627-1.33.713-2.255-.592-.28-1.238-.452-1.919-.469z"/>
        </svg>
        Threads
      </div>
    </div>

    <div class="config-body">
      <!-- Location/Placement -->
      <div class="config-field">
        <label class="field-label">Post Location</label>
        <div class="radio-group">
          <label class="radio-option" :class="{ active: config.location === 'timeline' || !config.location }">
            <input
              type="radio"
              name="threads-location"
              value="timeline"
              :checked="config.location === 'timeline' || !config.location"
              @change="updateField('location', 'timeline')"
            />
            <span class="radio-label">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Timeline
            </span>
          </label>
          <label class="radio-option" :class="{ active: config.location === 'reels' }">
            <input
              type="radio"
              name="threads-location"
              value="reels"
              :checked="config.location === 'reels'"
              @change="updateField('location', 'reels')"
            />
            <span class="radio-label">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Reels
            </span>
          </label>
        </div>
        <span class="field-hint">
          <span v-if="config.location === 'timeline' || !config.location">Standard post in your followers' feeds</span>
          <span v-else-if="config.location === 'reels'">Short-form video (9:16 vertical format)</span>
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
          placeholder="Override the main caption for Threads..."
          :value="config.caption"
          @input="updateField('caption', ($event.target as HTMLTextAreaElement).value)"
          rows="3"
          maxlength="500"
        ></textarea>
        <span class="field-hint">{{ (config.caption || '').length }}/500 characters</span>
      </div>

      <!-- Preview -->
      <div class="preview-section">
        <div class="preview-label">Preview</div>
        <ThreadsPostPreview
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

.platform-badge.threads {
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
  min-width: 120px;
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
