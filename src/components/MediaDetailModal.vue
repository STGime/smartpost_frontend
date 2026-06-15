<script setup lang="ts">
import { ref } from 'vue'
import type { PostMedia } from '@/types'

defineProps<{
  show: boolean
  media: PostMedia | null
}>()

const emit = defineEmits<{
  close: []
}>()

const copied = ref<string | null>(null)

const copy = async (value: string, field: string) => {
  try {
    await navigator.clipboard.writeText(value)
    copied.value = field
    setTimeout(() => (copied.value = null), 1500)
  } catch {
    // clipboard unavailable — ignore
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show && media" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Media detail</h3>
          <button class="close-btn" aria-label="Close" @click="emit('close')">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Preview -->
          <div class="preview">
            <video
              v-if="media.type === 'video' && media.originalUrl"
              :src="media.originalUrl"
              controls
              :poster="media.thumbnailUrl || undefined"
            />
            <img
              v-else-if="media.thumbnailUrl || media.originalUrl"
              :src="media.originalUrl || media.thumbnailUrl"
              :alt="media.name"
            />
            <div v-else class="preview-placeholder">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>No preview available</span>
            </div>
          </div>

          <!-- Details -->
          <dl class="details">
            <div class="row">
              <dt>Media ID</dt>
              <dd>
                <code>{{ media.mediaId }}</code>
                <button class="copy-btn" @click="copy(media.mediaId, 'mediaId')">
                  {{ copied === 'mediaId' ? 'Copied!' : 'Copy' }}
                </button>
              </dd>
            </div>
            <div class="row">
              <dt>Attachment ID</dt>
              <dd>
                <code>{{ media.id }}</code>
                <button class="copy-btn" @click="copy(media.id, 'id')">
                  {{ copied === 'id' ? 'Copied!' : 'Copy' }}
                </button>
              </dd>
            </div>
            <div class="row">
              <dt>Name</dt>
              <dd><span class="value">{{ media.name || '—' }}</span></dd>
            </div>
            <div class="row">
              <dt>Type</dt>
              <dd><span class="value">{{ media.type }}</span></dd>
            </div>
            <div class="row">
              <dt>Position</dt>
              <dd><span class="value">{{ media.position }}</span></dd>
            </div>
            <div v-if="media.variants?.length" class="row">
              <dt>Variants</dt>
              <dd><span class="value">{{ media.variants.length }}</span></dd>
            </div>
          </dl>

          <a
            v-if="media.originalUrl"
            class="open-original"
            :href="media.originalUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open original in new tab
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  max-width: 540px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-md);
  display: flex;
}

.close-btn:hover {
  color: var(--text);
  background: rgba(100, 116, 139, 0.15);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 24px;
}

.preview {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 20px;
  min-height: 160px;
}

.preview img,
.preview video {
  max-width: 100%;
  max-height: 360px;
  display: block;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px;
  color: var(--muted);
}

.preview-placeholder svg {
  width: 40px;
  height: 40px;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}

.row dt {
  font-size: 13px;
  color: var(--muted);
  font-weight: 500;
}

.row dd {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.row code {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 12px;
  color: var(--text);
  background: rgba(15, 23, 42, 0.5);
  padding: 4px 8px;
  border-radius: var(--radius-sm, 6px);
  overflow-wrap: anywhere;
}

.row .value {
  font-size: 14px;
  color: var(--text);
}

.copy-btn {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: var(--radius-md);
  background: rgba(100, 116, 139, 0.15);
  color: var(--text);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.15s;
}

.copy-btn:hover {
  background: rgba(100, 116, 139, 0.25);
}

.open-original {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 20px;
  font-size: 14px;
  font-weight: 500;
  color: #60a5fa;
  text-decoration: none;
}

.open-original:hover {
  text-decoration: underline;
}

.open-original svg {
  width: 16px;
  height: 16px;
}
</style>
