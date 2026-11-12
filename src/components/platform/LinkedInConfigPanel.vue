<script setup lang="ts">
import { computed, ref } from 'vue'
import CarouselOrderPanel from '@/components/CarouselOrderPanel.vue'
import LinkedInPostPreview from './previews/LinkedInPostPreview.vue'
import { useMediaStore } from '@/stores'
import type { LinkedInConfiguration, MediaListItem, SocialAccount } from '@/types'

const props = defineProps<{
  modelValue: LinkedInConfiguration
  selectedMedia?: MediaListItem[]
  caption?: string
  hashtags?: string[]
  account?: SocialAccount
}>()

const emit = defineEmits<{
  'update:modelValue': [value: LinkedInConfiguration]
}>()

const mediaStore = useMediaStore()
const isGeneratingPDF = ref(false)
const carouselOrder = ref<string[]>([])
const generatedPDF = ref<{ name: string; pageCount: number } | null>(null)

const config = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const updateField = <K extends keyof LinkedInConfiguration>(
  field: K,
  value: LinkedInConfiguration[K]
) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

// Get only image items for carousel
const imageItems = computed(() => {
  if (!props.selectedMedia) return []
  return props.selectedMedia.filter(m => m.type === 'image')
})

// Handle order update from carousel panel
const handleOrderUpdate = (orderedIds: string[]) => {
  carouselOrder.value = orderedIds
}

// Generate carousel PDF
const handleGenerateCarousel = async () => {
  const mediaIds = carouselOrder.value.length > 0
    ? carouselOrder.value
    : imageItems.value.map(m => m.id)

  if (mediaIds.length < 2) return

  isGeneratingPDF.value = true
  generatedPDF.value = null
  try {
    const result = await mediaStore.generateCarouselPDF(
      mediaIds,
      config.value.documentTitle || 'LinkedIn Carousel'
    )
    generatedPDF.value = {
      name: config.value.documentTitle || 'LinkedIn Carousel',
      pageCount: result.page_count
    }
    // Store the PDF ID in LinkedIn config - this will be used for LinkedIn posting
    // instead of the selected images
    updateField('carouselMediaId', result.media_id)
  } catch {
    // Error handled in store
  } finally {
    isGeneratingPDF.value = false
  }
}
</script>

<template>
  <div class="config-panel">
    <div class="config-header">
      <div class="platform-badge linkedin">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        LinkedIn
      </div>
    </div>

    <div class="config-body">
      <!-- Post Type -->
      <div class="config-field">
        <label class="field-label">Post Type</label>
        <div class="radio-group">
          <label class="radio-option" :class="{ active: config.postType === 'post' || !config.postType }">
            <input
              type="radio"
              name="linkedin-post-type"
              value="post"
              :checked="config.postType === 'post' || !config.postType"
              @change="updateField('postType', 'post')"
            />
            <span class="radio-label">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Post
            </span>
          </label>
          <label class="radio-option" :class="{ active: config.postType === 'document' }">
            <input
              type="radio"
              name="linkedin-post-type"
              value="document"
              :checked="config.postType === 'document'"
              @change="updateField('postType', 'document')"
            />
            <span class="radio-label">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Carousel (PDF)
            </span>
          </label>
          <label class="radio-option" :class="{ active: config.postType === 'article' }">
            <input
              type="radio"
              name="linkedin-post-type"
              value="article"
              :checked="config.postType === 'article'"
              @change="updateField('postType', 'article')"
            />
            <span class="radio-label">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Article
            </span>
          </label>
        </div>
      </div>

      <!-- Document Title (for carousel) -->
      <div v-if="config.postType === 'document'" class="config-field">
        <label class="field-label">Carousel Title</label>
        <input
          type="text"
          class="form-input"
          placeholder="Enter a title for your carousel..."
          :value="config.documentTitle"
          @input="updateField('documentTitle', ($event.target as HTMLInputElement).value)"
          maxlength="150"
        />
        <span class="field-hint">Displayed above the carousel (max 150 chars)</span>
      </div>

      <!-- Carousel Order Panel (for document type with images) -->
      <CarouselOrderPanel
        v-if="config.postType === 'document' && imageItems.length > 0"
        :media-items="imageItems"
        :is-generating="isGeneratingPDF"
        @update:order="handleOrderUpdate"
        @generate="handleGenerateCarousel"
      />

      <!-- PDF Generated Success -->
      <div v-if="generatedPDF && config.postType === 'document'" class="pdf-success">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="pdf-success-text">
          <strong>Carousel PDF created!</strong>
          <span>"{{ generatedPDF.name }}" ({{ generatedPDF.pageCount }} pages) added to media library</span>
        </div>
      </div>

      <!-- Article URL (for article share) -->
      <div v-if="config.postType === 'article'" class="config-field">
        <label class="field-label">Article URL</label>
        <input
          type="url"
          class="form-input"
          placeholder="https://example.com/article"
          :value="config.articleUrl"
          @input="updateField('articleUrl', ($event.target as HTMLInputElement).value)"
        />
        <span class="field-hint">Link to share as an article</span>
      </div>

      <!-- Visibility -->
      <div class="config-field">
        <label class="field-label">Visibility</label>
        <div class="toggle-group">
          <button
            type="button"
            :class="['toggle-btn', { active: config.visibility === 'PUBLIC' || !config.visibility }]"
            @click="updateField('visibility', 'PUBLIC')"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Public
          </button>
          <button
            type="button"
            :class="['toggle-btn', { active: config.visibility === 'CONNECTIONS' }]"
            @click="updateField('visibility', 'CONNECTIONS')"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Connections Only
          </button>
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
          placeholder="Override the main caption for LinkedIn..."
          :value="config.caption"
          @input="updateField('caption', ($event.target as HTMLTextAreaElement).value)"
          rows="3"
          maxlength="3000"
        ></textarea>
        <span class="field-hint">{{ (config.caption || '').length }}/3000 characters</span>
      </div>

      <!-- Preview Section -->
      <div class="preview-section">
        <div class="preview-label">Preview</div>
        <LinkedInPostPreview
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

.platform-badge.linkedin svg {
  color: #0A66C2;
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

/* Toggle group */
.toggle-group {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  flex: 1 1 0;
  min-width: 0;
}

.radio-label, .toggle-btn {
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

.radio-label svg, .toggle-btn svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.radio-option:hover .radio-label, .toggle-btn:hover {
  background: var(--ink-2);
  color: var(--text);
}

.radio-option.active .radio-label, .toggle-btn.active {
  background: var(--signal-soft);
  border-color: var(--signal);
  color: var(--text);
}

.radio-option.active .radio-label svg, .toggle-btn.active svg {
  color: var(--signal);
}

.radio-option input:focus-visible + .radio-label {
  outline: 2px solid var(--signal);
  outline-offset: 2px;
}

/* PDF success message */
.pdf-success {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: var(--success-soft);
  border: 1px solid rgba(95, 191, 138, 0.45);
  border-radius: var(--radius-sm);
}

.pdf-success svg {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  flex-shrink: 0;
  color: var(--success);
}

.pdf-success-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.pdf-success-text strong {
  font-size: 13px;
  font-weight: 500;
  color: var(--success);
}

.pdf-success-text span {
  font-size: 12px;
  color: var(--fg-2);
  overflow-wrap: anywhere;
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
