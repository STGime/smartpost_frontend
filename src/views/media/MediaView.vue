<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMediaStore } from '@/stores'
import type { MediaListItem } from '@/types'

const mediaStore = useMediaStore()
const fileInput = ref<HTMLInputElement | null>(null)
const showDeleteModal = ref(false)
const mediaToDelete = ref<MediaListItem | null>(null)
const isDeleting = ref(false)
const showPreviewModal = ref(false)
const mediaToPreview = ref<MediaListItem | null>(null)
const isLoadingPreview = ref(false)

onMounted(() => {
  mediaStore.fetchMedia()
})

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files?.length) return

  for (const file of Array.from(files)) {
    try {
      await mediaStore.uploadMedia(file)
    } catch {
      // Error handled in store
    }
  }

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const openDeleteModal = (media: MediaListItem) => {
  mediaToDelete.value = media
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  mediaToDelete.value = null
}

const confirmDelete = async () => {
  if (!mediaToDelete.value) return

  isDeleting.value = true
  try {
    await mediaStore.deleteMedia(mediaToDelete.value.id)
    closeDeleteModal()
  } catch {
    // Error handled in store
  } finally {
    isDeleting.value = false
  }
}

const openPreviewModal = async (media: MediaListItem) => {
  mediaToPreview.value = media
  showPreviewModal.value = true

  // Fetch full media details for original_url
  isLoadingPreview.value = true
  try {
    await mediaStore.fetchMediaById(media.id)
  } catch {
    // Error handled in store
  } finally {
    isLoadingPreview.value = false
  }
}

const closePreviewModal = () => {
  showPreviewModal.value = false
  mediaToPreview.value = null
  mediaStore.currentMedia = null
}
</script>

<template>
  <div class="media-page">
    <div class="page-header">
      <div>
        <h1>Media Library</h1>
        <p>Upload and manage your images and videos</p>
      </div>
      <div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*,video/*"
          multiple
          class="hidden"
          @change="handleFileSelect"
        />
        <button
          @click="fileInput?.click()"
          :disabled="mediaStore.isUploading"
          class="btn-primary"
        >
          <svg v-if="!mediaStore.isUploading" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="btn-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {{ mediaStore.isUploading ? 'Uploading...' : 'Upload Media' }}
        </button>
      </div>
    </div>

    <!-- Upload progress -->
    <div v-if="mediaStore.isUploading" class="upload-progress card">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${mediaStore.uploadProgress}%` }"></div>
      </div>
      <span class="progress-text">{{ mediaStore.uploadProgress }}%</span>
    </div>

    <div v-if="mediaStore.error" class="alert-error">
      {{ mediaStore.error }}
    </div>

    <div v-if="mediaStore.isLoading && !mediaStore.items.length" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else-if="mediaStore.items.length === 0" class="empty-state card">
      <div class="empty-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p class="empty-title">No media uploaded yet</p>
      <p class="empty-sub">Upload images and videos to use in your posts</p>
      <button @click="fileInput?.click()" class="btn-primary">Upload your first media</button>
    </div>

    <div v-else class="media-grid">
      <div
        v-for="media in mediaStore.items"
        :key="media.id"
        class="media-item"
        @click="openPreviewModal(media)"
      >
        <img :src="media.thumbnail_url || '/placeholder.png'" alt="" />
        <!-- Delete button in top right -->
        <button @click.stop="openDeleteModal(media)" class="delete-btn" title="Delete">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div class="media-type">
          <svg v-if="media.type === 'video'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div v-if="media.processing_status === 'processing'" class="media-processing">
          <div class="spinner spinner-sm"></div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-backdrop" @click="closeDeleteModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Delete Media</h3>
            <button @click="closeDeleteModal" class="modal-close">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="delete-preview">
              <img :src="mediaToDelete?.thumbnail_url || '/placeholder.png'" alt="" />
            </div>
            <p class="delete-message">
              Are you sure you want to delete <strong>{{ mediaToDelete?.name }}</strong>?
            </p>
            <p class="delete-warning">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button @click="closeDeleteModal" class="btn-secondary" :disabled="isDeleting">
              Cancel
            </button>
            <button @click="confirmDelete" class="btn-danger" :disabled="isDeleting">
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Preview Modal -->
    <Teleport to="body">
      <div v-if="showPreviewModal" class="preview-backdrop" @click="closePreviewModal">
        <button @click="closePreviewModal" class="preview-close">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Loading state -->
        <div v-if="isLoadingPreview" class="preview-loading">
          <div class="spinner"></div>
        </div>

        <div v-else class="preview-container" @click.stop>
          <!-- Image preview -->
          <img
            v-if="mediaToPreview?.type === 'image'"
            :src="mediaStore.currentMedia?.original_url || mediaToPreview?.thumbnail_url || '/placeholder.png'"
            alt=""
            class="preview-image"
          />
          <!-- Video preview -->
          <video
            v-else-if="mediaToPreview?.type === 'video' && mediaStore.currentMedia?.original_url"
            :src="mediaStore.currentMedia.original_url"
            controls
            autoplay
            playsinline
            class="preview-video"
          >
            Your browser does not support the video tag.
          </video>
          <!-- Video loading placeholder -->
          <div v-else-if="mediaToPreview?.type === 'video'" class="preview-video-placeholder">
            <div class="spinner"></div>
          </div>
        </div>
        <div class="preview-info">
          <p class="preview-name">{{ mediaToPreview?.name }}</p>
          <p class="preview-meta">
            {{ mediaToPreview?.width }} × {{ mediaToPreview?.height }}
            <span v-if="mediaToPreview?.duration"> · {{ Math.round(mediaToPreview.duration) }}s</span>
          </p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.media-page {
  max-width: 1200px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
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

.btn-icon {
  width: 18px;
  height: 18px;
}

.hidden {
  display: none;
}

/* Upload Progress */
.upload-progress {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  margin-bottom: 20px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  border-radius: var(--radius-full);
  background: rgba(31, 41, 55, 0.9);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--cyan));
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 13px;
  color: var(--muted);
  min-width: 40px;
  text-align: right;
}

/* Loading State */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 64px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: var(--radius-full);
  background: var(--accent-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a5b4fc;
}

.empty-icon svg {
  width: 28px;
  height: 28px;
}

.empty-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.empty-sub {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 20px;
}

/* Media Grid */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

@media (min-width: 768px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}

.media-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s;
}

.media-item:hover {
  border-color: var(--border-hover);
  transform: scale(1.02);
}

.media-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: #fca5a5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.15s;
  z-index: 2;
}

.media-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.8);
  color: white;
}

.delete-btn svg {
  width: 14px;
  height: 14px;
}

.media-type {
  position: absolute;
  bottom: 8px;
  left: 8px;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.media-type svg {
  width: 14px;
  height: 14px;
}

.media-processing {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-sm {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

/* Delete Confirmation Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.modal-content {
  width: 100%;
  max-width: 400px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.modal-close:hover {
  background: rgba(148, 163, 184, 0.1);
  color: var(--text);
}

.modal-close svg {
  width: 18px;
  height: 18px;
}

.modal-body {
  padding: 20px;
}

.delete-preview {
  width: 100px;
  height: 100px;
  margin: 0 auto 16px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: rgba(15, 23, 42, 0.9);
}

.delete-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-message {
  font-size: 14px;
  text-align: center;
  margin-bottom: 8px;
}

.delete-message strong {
  color: var(--text);
}

.delete-warning {
  font-size: 12px;
  color: var(--muted);
  text-align: center;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}

.btn-danger {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  background: #dc2626;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Preview Modal */
.preview-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.preview-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  z-index: 10;
}

.preview-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.preview-close svg {
  width: 24px;
  height: 24px;
}

.preview-container {
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.preview-video {
  max-width: 100%;
  max-height: 80vh;
  border-radius: var(--radius-md);
  background: black;
}

.preview-info {
  margin-top: 16px;
  text-align: center;
}

.preview-name {
  font-size: 14px;
  color: white;
  margin-bottom: 4px;
}

.preview-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.preview-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.preview-video-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 300px;
  min-height: 200px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: var(--radius-md);
}
</style>
