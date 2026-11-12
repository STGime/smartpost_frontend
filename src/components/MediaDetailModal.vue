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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  background: var(--ink-1);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  max-width: 540px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--line);
}

.modal-header h3 {
  font-size: 15px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: 1px solid transparent;
  color: var(--fg-3);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  display: flex;
  transition: color 0.15s, border-color 0.15s;
}

.close-btn:hover {
  color: var(--text);
  border-color: var(--line-strong);
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

.modal-body {
  padding: 20px;
}

.preview {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ink-0);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 16px;
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
  color: var(--fg-3);
  font-size: 13px;
}

.preview-placeholder svg {
  width: 32px;
  height: 32px;
}

.details {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--line);
}

.row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  align-items: center;
  padding: 9px 0;
  border-bottom: 1px solid var(--line);
}

.row dt {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fg-3);
}

.row dd {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.row code {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text);
  background: var(--ink-2);
  border: 1px solid var(--line);
  padding: 3px 7px;
  border-radius: 2px;
  overflow-wrap: anywhere;
}

.row .value {
  font-size: 14px;
  color: var(--text);
}

.copy-btn {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--fg-2);
  border: 1px solid var(--line-strong);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.copy-btn:hover {
  color: var(--text);
  border-color: var(--fg-3);
}

.open-original {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--signal);
  text-decoration: none;
}

.open-original:hover {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.open-original svg {
  width: 14px;
  height: 14px;
}

@media (max-width: 420px) {
  .row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}
</style>
