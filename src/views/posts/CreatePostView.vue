<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore, useMediaStore, useSocialAccountsStore } from '@/stores'
import PlatformIcon from '@/components/PlatformIcon.vue'

const router = useRouter()
const postsStore = usePostsStore()
const mediaStore = useMediaStore()
const socialAccountsStore = useSocialAccountsStore()

const caption = ref('')
const selectedMediaIds = ref<string[]>([])
const selectedAccountIds = ref<string[]>([])

// Use all accounts, not just active ones (the store might filter incorrectly)
const availableAccounts = computed(() => {
  // First try activeAccounts, if empty fall back to all accounts
  const active = socialAccountsStore.activeAccounts
  return active.length > 0 ? active : socialAccountsStore.accounts
})

onMounted(() => {
  mediaStore.fetchMedia({ status: 'completed' })
  socialAccountsStore.fetchAccounts()
})

const handleSubmit = async () => {
  try {
    const post = await postsStore.createPost({
      caption: caption.value,
      mediaIds: selectedMediaIds.value,
      socialAccountIds: selectedAccountIds.value,
      isDraft: true,
    })
    router.push(`/app/posts/${post.id}`)
  } catch {
    // Error handled in store
  }
}

const toggleMedia = (id: string) => {
  const index = selectedMediaIds.value.indexOf(id)
  if (index === -1) {
    selectedMediaIds.value.push(id)
  } else {
    selectedMediaIds.value.splice(index, 1)
  }
}

const toggleAccount = (id: string) => {
  const index = selectedAccountIds.value.indexOf(id)
  if (index === -1) {
    selectedAccountIds.value.push(id)
  } else {
    selectedAccountIds.value.splice(index, 1)
  }
}
</script>

<template>
  <div class="create-post-page">
    <div class="page-header">
      <h1>Create Post</h1>
      <p>Compose and schedule your social media content</p>
    </div>

    <form @submit.prevent="handleSubmit" class="create-form">
      <!-- Caption -->
      <div class="form-section card">
        <div class="section-label">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Caption
        </div>
        <textarea
          v-model="caption"
          rows="4"
          class="form-input form-textarea"
          placeholder="What do you want to say?"
        ></textarea>
        <p class="char-count">{{ caption.length }} characters</p>
      </div>

      <!-- Media selection -->
      <div class="form-section card">
        <div class="section-label">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Select Media
          <span v-if="selectedMediaIds.length > 0" class="selection-count">{{ selectedMediaIds.length }} selected</span>
        </div>

        <div v-if="mediaStore.isLoading" class="loading-state-sm">
          <div class="spinner"></div>
        </div>

        <div v-else-if="mediaStore.items.length === 0" class="empty-inline">
          <p>No media uploaded yet.</p>
          <RouterLink to="/app/media" class="link-accent">Upload media</RouterLink>
        </div>

        <div v-else class="media-grid">
          <div
            v-for="media in mediaStore.items"
            :key="media.id"
            @click="toggleMedia(media.id)"
            :class="['media-item', { selected: selectedMediaIds.includes(media.id) }]"
          >
            <img :src="media.thumbnail_url || '/placeholder.png'" alt="" />
            <div class="media-overlay">
              <div class="check-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <span class="media-type-badge">{{ media.type }}</span>
          </div>
        </div>
      </div>

      <!-- Account selection -->
      <div class="form-section card">
        <div class="section-label">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Select Accounts
          <span v-if="selectedAccountIds.length > 0" class="selection-count">{{ selectedAccountIds.length }} selected</span>
        </div>

        <div v-if="socialAccountsStore.isLoading" class="loading-state-sm">
          <div class="spinner"></div>
        </div>

        <div v-else-if="availableAccounts.length === 0" class="empty-inline">
          <p>No accounts connected.</p>
          <RouterLink to="/app/accounts" class="link-accent">Connect accounts</RouterLink>
        </div>

        <div v-else class="accounts-grid">
          <div
            v-for="account in availableAccounts"
            :key="account.id"
            @click="toggleAccount(account.id)"
            :class="['account-item', { selected: selectedAccountIds.includes(account.id) }]"
          >
            <PlatformIcon :platform="account.platform" size="md" />
            <div class="account-info">
              <p class="account-username">{{ account.username }}</p>
              <p class="account-platform">{{ account.platform }}</p>
            </div>
            <div class="check-indicator">
              <svg v-if="selectedAccountIds.includes(account.id)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="form-actions">
        <RouterLink to="/app/posts" class="btn-secondary">
          Cancel
        </RouterLink>
        <button
          type="submit"
          :disabled="selectedMediaIds.length === 0 || selectedAccountIds.length === 0 || postsStore.isLoading"
          class="btn-primary"
        >
          <svg v-if="!postsStore.isLoading" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="btn-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ postsStore.isLoading ? 'Creating...' : 'Create Draft' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.create-post-page {
  max-width: 800px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 4px;
}

.page-header p {
  font-size: 14px;
  color: var(--muted);
}

/* Form */
.create-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-section {
  padding: 18px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 14px;
  color: var(--text);
}

.section-label svg {
  width: 18px;
  height: 18px;
  color: var(--muted);
}

.selection-count {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--accent-soft);
  color: #a5b4fc;
  font-size: 11px;
  font-weight: 500;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.char-count {
  margin-top: 8px;
  font-size: 11px;
  color: var(--muted);
  text-align: right;
}

/* Loading/Empty States */
.loading-state-sm {
  display: flex;
  justify-content: center;
  padding: 24px;
}

.empty-inline {
  text-align: center;
  padding: 24px;
  color: var(--muted);
  font-size: 13px;
}

.empty-inline .link-accent {
  display: block;
  margin-top: 6px;
  color: var(--accent-light);
}

.link-accent:hover {
  text-decoration: underline;
}

/* Media Grid */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}

@media (min-width: 600px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

.media-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.15s;
}

.media-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-item.selected {
  border-color: var(--accent);
}

.media-overlay {
  position: absolute;
  inset: 0;
  background: rgba(79, 70, 229, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.media-item.selected .media-overlay {
  background: rgba(79, 70, 229, 0.3);
}

.check-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.15s;
}

.media-item.selected .check-icon {
  opacity: 1;
  transform: scale(1);
}

.check-icon svg {
  width: 16px;
  height: 16px;
  color: white;
}

.media-type-badge {
  position: absolute;
  bottom: 6px;
  left: 6px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.6);
  font-size: 10px;
  text-transform: uppercase;
  color: white;
}

/* Accounts Grid */
.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

@media (max-width: 500px) {
  .accounts-grid {
    grid-template-columns: 1fr;
  }
}

.account-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  background: rgba(15, 23, 42, 0.6);
  border: 2px solid var(--border);
  cursor: pointer;
  transition: all 0.15s;
}

.account-item:hover {
  border-color: var(--border-hover);
  background: rgba(15, 23, 42, 0.8);
}

.account-item.selected {
  border-color: var(--accent);
  background: rgba(79, 70, 229, 0.1);
}

.account-info {
  flex: 1;
  min-width: 0;
}

.account-username {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-platform {
  font-size: 11px;
  color: var(--muted);
  text-transform: capitalize;
}

.check-indicator {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}

.account-item.selected .check-indicator {
  background: var(--accent);
  border-color: var(--accent);
}

.check-indicator svg {
  width: 12px;
  height: 12px;
  color: white;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 8px;
}

.btn-icon {
  width: 18px;
  height: 18px;
}
</style>
