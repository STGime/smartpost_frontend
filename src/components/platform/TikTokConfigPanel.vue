<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import type { TikTokConfiguration, TikTokCreatorInfo, TikTokPrivacyLevel, MediaListItem, SocialAccount } from '@/types'
import { socialAccountsService } from '@/services/socialAccounts'
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
  'validation-change': [valid: boolean, errors: string[]]
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

// Creator info state
const creatorInfo = ref<TikTokCreatorInfo | null>(null)
const creatorInfoLoading = ref(false)
const creatorInfoError = ref<string | null>(null)

// Determine if this is a photo post (no duet/stitch available)
const isPhotoPost = computed(() => {
  if (!props.selectedMedia || props.selectedMedia.length === 0) return false
  return props.selectedMedia.every(m => m.type === 'image')
})

// Privacy level options with labels
const privacyLevelLabels: Record<TikTokPrivacyLevel, string> = {
  'PUBLIC_TO_EVERYONE': 'Everyone',
  'MUTUAL_FOLLOW_FRIENDS': 'Friends',
  'FOLLOWER_OF_CREATOR': 'Followers',
  'SELF_ONLY': 'Only me'
}

// Check if "Only me" should be disabled (when content disclosure is ON AND branded content is checked)
const isOnlyMeDisabled = computed(() => {
  return config.value.contentDisclosureEnabled === true && config.value.brandContentToggle === true
})

// Check if "Branded Content" should be disabled (when visibility is "Only me")
const isBrandedContentDisabled = computed(() => {
  return config.value.privacyLevel === 'SELF_ONLY'
})

// Calculate total video duration from selected media
const totalVideoDuration = computed(() => {
  if (!props.selectedMedia || props.selectedMedia.length === 0) return 0
  return props.selectedMedia.reduce((sum, media) => {
    if (media.type === 'video' && media.duration) {
      return sum + media.duration
    }
    return sum
  }, 0)
})

// Check if video duration exceeds TikTok's maximum
const videoDurationExceeded = computed(() => {
  if (!creatorInfo.value?.maxVideoPostDurationSec) return false
  if (totalVideoDuration.value === 0) return false
  return totalVideoDuration.value > creatorInfo.value.maxVideoPostDurationSec
})

// Check if content disclosure is enabled but no option selected
const contentDisclosureIncomplete = computed(() => {
  return config.value.contentDisclosureEnabled === true &&
    config.value.brandOrganicToggle !== true &&
    config.value.brandContentToggle !== true
})

// Validation errors list (shown in the top banner)
const validationErrors = computed(() => {
  const errors: string[] = []

  // Check canPost status
  if (creatorInfo.value && creatorInfo.value.canPost === false) {
    errors.push(creatorInfo.value.cannotPostReason || 'You have reached your posting limit for today')
  }

  // Check video duration
  if (videoDurationExceeded.value && creatorInfo.value?.maxVideoPostDurationSec) {
    const maxMinutes = Math.floor(creatorInfo.value.maxVideoPostDurationSec / 60)
    const currentMinutes = Math.floor(totalVideoDuration.value / 60)
    const currentSeconds = Math.round(totalVideoDuration.value % 60)
    errors.push(`Video duration (${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}) exceeds TikTok's maximum of ${maxMinutes} minutes`)
  }

  // Note: contentDisclosureIncomplete is NOT shown here - it's shown inline in the disclosure section

  return errors
})

// All validation errors including content disclosure (for blocking publish)
const allValidationErrors = computed(() => {
  const errors = [...validationErrors.value]

  if (contentDisclosureIncomplete.value) {
    errors.push('You need to indicate if your content promotes yourself, a third party, or both.')
  }

  return errors
})

// Is the TikTok configuration valid for publishing?
const isValid = computed(() => allValidationErrors.value.length === 0)

// Emit validation state whenever it changes (includes all errors for button disabling)
watch([isValid, allValidationErrors], ([valid, errors]) => {
  emit('validation-change', valid, errors)
}, { immediate: true })

// Fetch creator info when account changes
async function fetchCreatorInfo() {
  if (!props.account?.id) return

  creatorInfoLoading.value = true
  creatorInfoError.value = null

  try {
    creatorInfo.value = await socialAccountsService.getTikTokCreatorInfo(props.account.id)
  } catch (error) {
    creatorInfoError.value = error instanceof Error ? error.message : 'Failed to load creator info'
    console.error('Failed to fetch TikTok creator info:', error)
  } finally {
    creatorInfoLoading.value = false
  }
}

onMounted(() => {
  if (props.account?.id) {
    fetchCreatorInfo()
  }
})

watch(() => props.account?.id, (newId) => {
  if (newId) {
    fetchCreatorInfo()
  }
})

// Handle privacy level change - clear branded content if "Only me" is selected
watch(() => config.value.privacyLevel, (privacyLevel) => {
  if (privacyLevel === 'SELF_ONLY' && config.value.brandContentToggle === true) {
    updateField('brandContentToggle', false)
  }
})

// Handle branded content change - clear "Only me" if branded content is selected
watch(() => config.value.brandContentToggle, (isBranded) => {
  if (isBranded && config.value.contentDisclosureEnabled && config.value.privacyLevel === 'SELF_ONLY') {
    updateField('privacyLevel', undefined)
  }
})

// Content disclosure label based on selections (TikTok UX Requirement)
const contentDisclosureLabel = computed(() => {
  const hasBrandedContent = config.value.brandContentToggle === true
  const hasYourBrand = config.value.brandOrganicToggle === true

  // If branded content is selected (alone or with your brand), show "Paid partnership"
  if (hasBrandedContent) {
    return "Your photo/video will be labeled as 'Paid partnership'"
  }

  // If only your brand is selected, show "Promotional content"
  if (hasYourBrand) {
    return "Your photo/video will be labeled as 'Promotional content'"
  }

  return null
})
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
      <!-- Creator Account Info (TikTok UX Requirement) -->
      <div class="creator-info-section" v-if="account">
        <div v-if="creatorInfoLoading" class="creator-info loading">
          <div class="loading-spinner"></div>
          <span>Loading account info...</span>
        </div>
        <div v-else-if="creatorInfoError" class="creator-info error">
          <span class="error-icon">!</span>
          <span>{{ creatorInfoError }}</span>
          <button type="button" class="retry-btn" @click="fetchCreatorInfo">Retry</button>
        </div>
        <div v-else class="creator-info">
          <img
            v-if="creatorInfo?.creatorAvatarUrl"
            :src="creatorInfo.creatorAvatarUrl"
            :alt="creatorInfo.creatorNickname"
            class="creator-avatar"
          />
          <div v-else class="creator-avatar placeholder">
            {{ (account?.displayName || account?.username || 'T').charAt(0).toUpperCase() }}
          </div>
          <div class="creator-details">
            <span class="creator-name">{{ creatorInfo?.creatorNickname || account?.displayName || account?.username }}</span>
            <span class="creator-username">@{{ creatorInfo?.creatorUsername || account?.username }}</span>
          </div>
        </div>
      </div>

      <!-- Validation Error Banner (TikTok UX Requirement) -->
      <div v-if="validationErrors.length > 0" class="validation-errors">
        <div class="validation-error" v-for="(error, index) in validationErrors" :key="index">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{{ error }}</span>
        </div>
      </div>

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

      <!-- Privacy Level (TikTok UX Requirement: dropdown with no default) -->
      <div class="config-field" v-if="!config.draft">
        <label class="field-label">
          Who can view this video
          <span class="required">*</span>
        </label>
        <select
          class="form-select"
          :value="config.privacyLevel || ''"
          @change="updateField('privacyLevel', ($event.target as HTMLSelectElement).value as TikTokPrivacyLevel || undefined)"
        >
          <option value="" disabled>Select visibility...</option>
          <option
            v-for="level in (creatorInfo?.privacyLevelOptions || ['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'SELF_ONLY'] as TikTokPrivacyLevel[])"
            :key="level"
            :value="level"
            :disabled="level === 'SELF_ONLY' && isOnlyMeDisabled"
          >
            {{ privacyLevelLabels[level as TikTokPrivacyLevel] }}
            <template v-if="level === 'SELF_ONLY' && isOnlyMeDisabled"> (unavailable for branded content)</template>
          </option>
        </select>
        <span v-if="isOnlyMeDisabled" class="field-warning">
          Branded content visibility cannot be set to private.
        </span>
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

      <!-- Interaction Settings (TikTok UX Requirement: "Allow" checkboxes, unchecked by default) -->
      <div class="config-field" v-if="!config.draft">
        <label class="field-label">Interaction Settings</label>
        <div class="checkbox-group">
          <!-- Allow Comments -->
          <div :class="['checkbox-row', { disabled: creatorInfo?.commentDisabled }]">
            <input
              type="checkbox"
              id="tiktok-allow-comments"
              :checked="config.allowComment"
              :disabled="creatorInfo?.commentDisabled"
              @change="updateField('allowComment', ($event.target as HTMLInputElement).checked)"
            />
            <label for="tiktok-allow-comments" class="checkbox-label">
              <span class="checkbox-box"></span>
              <span class="checkbox-text">
                Allow Comments
                <span v-if="creatorInfo?.commentDisabled" class="checkbox-hint disabled-hint">
                  Disabled in your TikTok settings
                </span>
              </span>
            </label>
          </div>

          <!-- Allow Duet (hidden for photo posts per TikTok guidelines) -->
          <div v-if="!isPhotoPost" :class="['checkbox-row', { disabled: creatorInfo?.duetDisabled }]">
            <input
              type="checkbox"
              id="tiktok-allow-duet"
              :checked="config.allowDuet"
              :disabled="creatorInfo?.duetDisabled"
              @change="updateField('allowDuet', ($event.target as HTMLInputElement).checked)"
            />
            <label for="tiktok-allow-duet" class="checkbox-label">
              <span class="checkbox-box"></span>
              <span class="checkbox-text">
                Allow Duet
                <span v-if="creatorInfo?.duetDisabled" class="checkbox-hint disabled-hint">
                  Disabled in your TikTok settings
                </span>
              </span>
            </label>
          </div>

          <!-- Allow Stitch (hidden for photo posts per TikTok guidelines) -->
          <div v-if="!isPhotoPost" :class="['checkbox-row', { disabled: creatorInfo?.stitchDisabled }]">
            <input
              type="checkbox"
              id="tiktok-allow-stitch"
              :checked="config.allowStitch"
              :disabled="creatorInfo?.stitchDisabled"
              @change="updateField('allowStitch', ($event.target as HTMLInputElement).checked)"
            />
            <label for="tiktok-allow-stitch" class="checkbox-label">
              <span class="checkbox-box"></span>
              <span class="checkbox-text">
                Allow Stitch
                <span v-if="creatorInfo?.stitchDisabled" class="checkbox-hint disabled-hint">
                  Disabled in your TikTok settings
                </span>
              </span>
            </label>
          </div>
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

      <!-- Content Disclosure Toggle (TikTok UX Requirement: wrapper toggle, off by default) -->
      <div class="config-field">
        <div class="disclosure-toggle">
          <label class="field-label">Content Disclosure</label>
          <label class="switch">
            <input
              type="checkbox"
              :checked="config.contentDisclosureEnabled"
              @change="updateField('contentDisclosureEnabled', ($event.target as HTMLInputElement).checked)"
            />
            <span class="slider"></span>
          </label>
        </div>

        <!-- Brand Content Options (shown when disclosure is enabled) -->
        <div v-if="config.contentDisclosureEnabled" class="disclosure-options">
          <div class="checkbox-group">
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
                  <span class="checkbox-hint">You are promoting yourself or your own business. This content will be classified as Brand Organic.</span>
                </span>
              </label>
            </div>
            <div :class="['checkbox-row', { disabled: isBrandedContentDisabled }]">
              <input
                type="checkbox"
                id="tiktok-brand-content"
                :checked="config.brandContentToggle"
                :disabled="isBrandedContentDisabled"
                @change="updateField('brandContentToggle', ($event.target as HTMLInputElement).checked)"
              />
              <label for="tiktok-brand-content" class="checkbox-label">
                <span class="checkbox-box"></span>
                <span class="checkbox-text">
                  <strong>Branded Content</strong>
                  <span class="checkbox-hint">You are promoting another brand or a third party. This content will be classified as Branded Content.</span>
                  <span v-if="isBrandedContentDisabled" class="checkbox-hint disabled-hint">
                    Visibility for branded content can't be private. Change visibility to enable this option.
                  </span>
                </span>
              </label>
            </div>
          </div>

          <!-- Content Disclosure Warning (when no option selected) -->
          <div v-if="contentDisclosureIncomplete" class="content-disclosure-warning" title="You need to indicate if your content promotes yourself, a third party, or both.">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>You need to indicate if your content promotes yourself, a third party, or both.</span>
          </div>

          <!-- Content Disclosure Label (TikTok UX Requirement) -->
          <div v-if="contentDisclosureLabel" class="content-disclosure-label">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ contentDisclosureLabel }}</span>
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

      <!-- User Consent Declaration (TikTok UX Requirement) -->
      <div class="consent-declaration">
        <p v-if="config.brandContentToggle">
          By posting, you agree to TikTok's
          <a :href="creatorInfo?.policyUrls?.brandedContentPolicy || 'https://www.tiktok.com/legal/bc-policy'" target="_blank" rel="noopener">Branded Content Policy</a>,
          <a :href="creatorInfo?.policyUrls?.musicUsageConfirmation || 'https://www.tiktok.com/legal/music-usage-confirmation'" target="_blank" rel="noopener">Music Usage Confirmation</a>,
          <a :href="creatorInfo?.policyUrls?.communityGuidelines || 'https://www.tiktok.com/community-guidelines'" target="_blank" rel="noopener">Community Guidelines</a>,
          and
          <a :href="creatorInfo?.policyUrls?.termsOfService || 'https://www.tiktok.com/legal/terms-of-service'" target="_blank" rel="noopener">Terms of Service</a>.
        </p>
        <p v-else>
          By posting, you agree to TikTok's
          <a :href="creatorInfo?.policyUrls?.musicUsageConfirmation || 'https://www.tiktok.com/legal/music-usage-confirmation'" target="_blank" rel="noopener">Music Usage Confirmation</a>,
          <a :href="creatorInfo?.policyUrls?.communityGuidelines || 'https://www.tiktok.com/community-guidelines'" target="_blank" rel="noopener">Community Guidelines</a>,
          and
          <a :href="creatorInfo?.policyUrls?.termsOfService || 'https://www.tiktok.com/legal/terms-of-service'" target="_blank" rel="noopener">Terms of Service</a>.
        </p>
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

/* Creator Info Section */
.creator-info-section {
  margin-bottom: 8px;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-md);
}

.creator-info.loading,
.creator-info.error {
  justify-content: center;
  color: var(--muted);
  font-size: 13px;
}

.creator-info.error {
  color: #f87171;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: #f87171;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
}

.retry-btn {
  margin-left: 8px;
  padding: 4px 8px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 12px;
  cursor: pointer;
}

.retry-btn:hover {
  border-color: var(--accent);
}

.creator-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.creator-avatar.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff0050, #00f2ea);
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.creator-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.creator-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.creator-username {
  font-size: 12px;
  color: var(--muted);
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

.field-label .required {
  color: #f87171;
}

.field-hint {
  font-size: 11px;
  color: var(--muted);
}

.field-warning {
  font-size: 11px;
  color: #fbbf24;
}

/* Select dropdown */
.form-select {
  width: 100%;
  padding: 10px 12px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}

.form-select:focus {
  outline: none;
  border-color: var(--accent);
}

.form-select option {
  background: #1e293b;
  color: var(--text);
}

.form-select option:disabled {
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

.checkbox-row.disabled {
  opacity: 0.5;
}

.checkbox-row.disabled .checkbox-label {
  cursor: not-allowed;
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

.checkbox-row input:disabled + .checkbox-label .checkbox-box {
  background: rgba(15, 23, 42, 0.4);
  border-color: var(--border);
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

.checkbox-hint.disabled-hint {
  color: #fbbf24;
}

/* Content Disclosure Toggle */
.disclosure-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border);
  transition: 0.2s;
  border-radius: 22px;
}

.slider::before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}

.switch input:checked + .slider {
  background-color: var(--accent);
}

.switch input:checked + .slider::before {
  transform: translateX(18px);
}

.disclosure-options {
  margin-top: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: var(--radius-md);
  border-left: 2px solid var(--accent);
}

/* Content Disclosure Warning */
.content-disclosure-warning {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 14px;
  padding: 12px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: #fcd34d;
  line-height: 1.4;
  cursor: help;
}

.content-disclosure-warning svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #fbbf24;
}

/* Content Disclosure Label */
.content-disclosure-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 14px;
  padding: 12px;
  background: rgba(255, 0, 80, 0.1);
  border: 1px solid rgba(255, 0, 80, 0.3);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: #ff6b9d;
  line-height: 1.4;
}

.content-disclosure-label svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #ff0050;
}

/* Consent Declaration */
.consent-declaration {
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-md);
  font-size: 12px;
  color: var(--muted);
  line-height: 1.5;
}

.consent-declaration p {
  margin: 0;
}

.consent-declaration a {
  color: var(--accent);
  text-decoration: none;
}

.consent-declaration a:hover {
  text-decoration: underline;
}

/* Validation Errors */
.validation-errors {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.validation-error {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-md);
  color: #fca5a5;
  font-size: 13px;
  line-height: 1.4;
}

.validation-error svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #f87171;
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
