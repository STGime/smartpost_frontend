<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { PinterestConfiguration, MediaListItem, SocialAccount, PinterestBoard } from '@/types'
import { socialAccountsService } from '@/services/socialAccounts'
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
  'validation-change': [valid: boolean, errors: string[]]
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

const boards = ref<PinterestBoard[]>([])
const isLoadingBoards = ref(false)
const boardsError = ref<string | null>(null)
const touched = ref(false)

const isValid = computed(() => !!config.value.board_id)

const fetchBoards = async () => {
  if (!props.account?.id) return
  isLoadingBoards.value = true
  boardsError.value = null
  try {
    const response = await socialAccountsService.getPinterestBoards(props.account.id)
    boards.value = response.boards
  } catch (e: unknown) {
    const error = e as { response?: { data?: { error?: string } } }
    boardsError.value = error.response?.data?.error || 'Failed to load boards'
  } finally {
    isLoadingBoards.value = false
  }
}

onMounted(() => {
  if (props.account?.id) {
    fetchBoards()
  }
  emit('validation-change', isValid.value, isValid.value ? [] : ['Pinterest requires a board selection'])
})

watch(isValid, (valid) => {
  emit('validation-change', valid, valid ? [] : ['Pinterest requires a board selection'])
})

watch(() => props.account?.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    fetchBoards()
  }
})
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

      <!-- Pin Description -->
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

      <!-- Board Selection -->
      <div class="config-field">
        <label class="field-label">
          Board
          <span class="required">*</span>
        </label>
        <div v-if="!account" class="board-notice">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Connect a Pinterest account to select a board.</span>
        </div>
        <div v-else-if="isLoadingBoards" class="board-loading">
          <div class="spinner-small"></div>
          <span>Loading boards...</span>
        </div>
        <div v-else-if="boardsError" class="board-error">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ boardsError }}</span>
          <button type="button" @click="fetchBoards" class="retry-btn">Retry</button>
        </div>
        <template v-else>
          <select
            class="form-input form-select"
            :class="{ 'field-error': touched && !isValid }"
            :value="config.board_id || ''"
            @change="updateField('board_id', ($event.target as HTMLSelectElement).value || undefined); touched = true"
            @blur="touched = true"
          >
            <option value="">Select a board...</option>
            <option v-for="board in boards" :key="board.id" :value="board.id">
              {{ board.name }}
            </option>
          </select>
          <span v-if="touched && !isValid" class="field-error-text">Please select a board for your Pin</span>
          <span v-else class="field-hint">Required - Select the board where this Pin will be saved</span>
        </template>
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

.platform-badge.pinterest svg {
  color: #E60023;
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

.field-label .required {
  color: var(--error);
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

.form-textarea-sm {
  resize: vertical;
  min-height: 52px;
}

/* Select */
.form-select {
  width: 100%;
  padding: 10px 36px 10px 12px;
  background-color: var(--ink-0);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b717a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text);
  cursor: pointer;
  appearance: none;
  transition: border-color 0.15s;
}

.form-select:focus {
  outline: none;
  border-color: var(--signal);
}

.form-select option {
  background: var(--ink-1);
  color: var(--text);
}

.form-select option:disabled {
  color: var(--fg-3);
}

/* Board picker states */
.board-notice,
.board-loading,
.board-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--ink-0);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--fg-2);
}

.board-notice svg,
.board-error svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--signal);
}

.board-error {
  background: var(--error-soft);
  border-color: rgba(229, 103, 79, 0.45);
  color: #f2a594;
}

.board-error svg {
  color: var(--error);
}

.spinner-small {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  border: 2px solid var(--line-strong);
  border-top-color: var(--signal);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  margin-left: auto;
  padding: 4px 10px;
  background: var(--ink-1);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}

.retry-btn:hover {
  background: var(--ink-2);
  border-color: var(--fg-3);
}

.field-error {
  border-color: var(--error) !important;
}

.field-error-text {
  font-size: 12px;
  color: var(--error);
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
