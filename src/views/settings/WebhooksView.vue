<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { webhooksService } from '@/services'
import ConfirmModal from '@/components/ConfirmModal.vue'
import type { WebhookEndpoint, WebhookDelivery } from '@/types'

// State
const endpoints = ref<Omit<WebhookEndpoint, 'secret'>[]>([])
const availableEvents = ref<string[]>([])
const allEvents = ref<string[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Create form
const showCreateForm = ref(false)
const createUrl = ref('')
const createDescription = ref('')
const selectedEvents = ref<string[]>([])
const isCreating = ref(false)
const createdSecret = ref<string | null>(null)
const copiedSecret = ref(false)

// Detail view
const selectedEndpoint = ref<WebhookEndpoint | null>(null)
const deliveries = ref<WebhookDelivery[]>([])
const deliveriesTotal = ref(0)
const isLoadingDeliveries = ref(false)
const expandedDelivery = ref<string | null>(null)

// Edit
const editingEndpoint = ref<string | null>(null)
const editUrl = ref('')
const editDescription = ref('')
const editEvents = ref<string[]>([])
const isSaving = ref(false)

// Delete
const showDeleteModal = ref(false)
const endpointToDelete = ref<Omit<WebhookEndpoint, 'secret'> | null>(null)
const isDeleting = ref(false)

// Test
const isTesting = ref<string | null>(null)
const testResult = ref<string | null>(null)

// Retry
const isRetrying = ref<string | null>(null)

const eventDescriptions: Record<string, string> = {
  'post.scheduled': 'Post scheduled for publishing',
  'post.processing': 'Publishing in progress',
  'post.published': 'Fully published to all platforms',
  'post.partially_published': 'Some platforms failed',
  'post.failed': 'All platforms failed',
  'post.result.success': 'Single platform succeeded',
  'post.result.failed': 'Single platform failed',
}

async function fetchEndpoints() {
  isLoading.value = true
  error.value = null
  try {
    const data = await webhooksService.listEndpoints()
    endpoints.value = data.endpoints
    availableEvents.value = data.available_events
    allEvents.value = data.all_events
  } catch {
    error.value = 'Failed to load webhook endpoints'
  } finally {
    isLoading.value = false
  }
}

async function handleCreate() {
  if (!createUrl.value.trim() || selectedEvents.value.length === 0) return
  isCreating.value = true
  error.value = null
  try {
    const endpoint = await webhooksService.createEndpoint({
      url: createUrl.value.trim(),
      description: createDescription.value.trim() || undefined,
      events: selectedEvents.value,
    })
    createdSecret.value = endpoint.secret || null
    showCreateForm.value = false
    createUrl.value = ''
    createDescription.value = ''
    selectedEvents.value = []
    await fetchEndpoints()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create endpoint'
    error.value = (e as { response?: { data?: { error?: string } } })?.response?.data?.error || msg
  } finally {
    isCreating.value = false
  }
}

async function copySecret() {
  if (!createdSecret.value) return
  await navigator.clipboard.writeText(createdSecret.value)
  copiedSecret.value = true
  setTimeout(() => copiedSecret.value = false, 2000)
}

function dismissSecret() {
  createdSecret.value = null
  copiedSecret.value = false
}

async function viewEndpoint(endpoint: Omit<WebhookEndpoint, 'secret'>) {
  selectedEndpoint.value = endpoint as WebhookEndpoint
  isLoadingDeliveries.value = true
  try {
    const data = await webhooksService.listDeliveries(endpoint.id, { limit: 20 })
    deliveries.value = data.items
    deliveriesTotal.value = data.total
  } catch {
    deliveries.value = []
  } finally {
    isLoadingDeliveries.value = false
  }
}

function closeDetail() {
  selectedEndpoint.value = null
  deliveries.value = []
  expandedDelivery.value = null
}

function startEdit(endpoint: Omit<WebhookEndpoint, 'secret'>) {
  editingEndpoint.value = endpoint.id
  editUrl.value = endpoint.url
  editDescription.value = endpoint.description || ''
  editEvents.value = [...endpoint.events]
}

function cancelEdit() {
  editingEndpoint.value = null
}

async function saveEdit(endpointId: string) {
  isSaving.value = true
  error.value = null
  try {
    await webhooksService.updateEndpoint(endpointId, {
      url: editUrl.value.trim(),
      description: editDescription.value.trim() || undefined,
      events: editEvents.value,
    })
    editingEndpoint.value = null
    await fetchEndpoints()
    if (selectedEndpoint.value?.id === endpointId) {
      await viewEndpoint(endpoints.value.find(e => e.id === endpointId)!)
    }
  } catch (e: unknown) {
    error.value = (e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update'
  } finally {
    isSaving.value = false
  }
}

async function toggleActive(endpoint: Omit<WebhookEndpoint, 'secret'>) {
  try {
    await webhooksService.updateEndpoint(endpoint.id, { is_active: !endpoint.is_active })
    await fetchEndpoints()
  } catch {
    error.value = 'Failed to update endpoint'
  }
}

function confirmDelete(endpoint: Omit<WebhookEndpoint, 'secret'>) {
  endpointToDelete.value = endpoint
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!endpointToDelete.value) return
  isDeleting.value = true
  try {
    await webhooksService.deleteEndpoint(endpointToDelete.value.id)
    showDeleteModal.value = false
    endpointToDelete.value = null
    if (selectedEndpoint.value?.id === endpointToDelete.value?.id) {
      closeDetail()
    }
    await fetchEndpoints()
  } catch {
    error.value = 'Failed to delete endpoint'
  } finally {
    isDeleting.value = false
  }
}

async function handleTest(endpointId: string) {
  isTesting.value = endpointId
  testResult.value = null
  try {
    await webhooksService.testEndpoint(endpointId)
    testResult.value = 'Ping sent! Check delivery history.'
    setTimeout(() => testResult.value = null, 3000)
    // Refresh deliveries if viewing this endpoint
    if (selectedEndpoint.value?.id === endpointId) {
      const data = await webhooksService.listDeliveries(endpointId, { limit: 20 })
      deliveries.value = data.items
      deliveriesTotal.value = data.total
    }
  } catch {
    testResult.value = 'Failed to send test ping'
    setTimeout(() => testResult.value = null, 3000)
  } finally {
    isTesting.value = null
  }
}

async function handleRetry(endpointId: string, deliveryId: string) {
  isRetrying.value = deliveryId
  try {
    await webhooksService.retryDelivery(endpointId, deliveryId)
    // Refresh deliveries
    const data = await webhooksService.listDeliveries(endpointId, { limit: 20 })
    deliveries.value = data.items
    deliveriesTotal.value = data.total
  } catch {
    error.value = 'Failed to retry delivery'
  } finally {
    isRetrying.value = null
  }
}

function toggleEvent(event: string) {
  const arr = showCreateForm.value ? selectedEvents : editEvents
  const idx = arr.value.indexOf(event)
  if (idx >= 0) {
    arr.value.splice(idx, 1)
  } else {
    arr.value.push(event)
  }
}

function isEventSelected(event: string): boolean {
  const arr = showCreateForm.value ? selectedEvents : editEvents
  return arr.value.includes(event)
}

function isEventAvailable(event: string): boolean {
  return availableEvents.value.includes(event)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function statusClass(status: string): string {
  switch (status) {
    case 'success': return 'badge-success'
    case 'failed': return 'badge-error'
    case 'retrying': return 'badge-warning'
    case 'pending': return 'badge-muted'
    default: return 'badge-muted'
  }
}

function truncateUrl(url: string, maxLen = 50): string {
  if (url.length <= maxLen) return url
  return url.substring(0, maxLen) + '...'
}

onMounted(fetchEndpoints)
</script>

<template>
  <div class="webhooks-page">
    <div class="page-header">
      <div class="page-header-top">
        <RouterLink to="/app/settings" class="back-link">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Settings
        </RouterLink>
      </div>
      <h1>Webhooks</h1>
      <p>Receive HTTP notifications when your posts are published, fail, or change status.</p>
    </div>

    <div v-if="error" class="alert-error">
      {{ error }}
      <button type="button" @click="error = null" class="alert-dismiss">&times;</button>
    </div>

    <div v-if="testResult" class="alert-success">
      {{ testResult }}
    </div>

    <!-- Secret reveal after creation -->
    <div v-if="createdSecret" class="card secret-reveal">
      <p class="secret-warning">Copy this signing secret now — you won't be able to see it again.</p>
      <div class="secret-box">
        <code class="secret-value">{{ createdSecret }}</code>
        <button type="button" @click="copySecret" class="btn-secondary btn-sm">
          {{ copiedSecret ? 'Copied!' : 'Copy' }}
        </button>
      </div>
      <p class="secret-hint">Use this secret to verify webhook signatures via HMAC-SHA256.</p>
      <button type="button" @click="dismissSecret" class="btn-primary btn-sm">Done</button>
    </div>

    <!-- Detail View -->
    <div v-if="selectedEndpoint && !editingEndpoint" class="card detail-view">
      <div class="detail-header">
        <div>
          <h2>{{ selectedEndpoint.description || 'Webhook Endpoint' }}</h2>
          <p class="detail-url">{{ selectedEndpoint.url }}</p>
        </div>
        <div class="detail-actions">
          <button type="button" @click="handleTest(selectedEndpoint!.id)" :disabled="isTesting === selectedEndpoint!.id" class="btn-secondary btn-sm">
            {{ isTesting === selectedEndpoint!.id ? 'Sending...' : 'Test' }}
          </button>
          <button type="button" @click="startEdit(selectedEndpoint!)" class="btn-secondary btn-sm">Edit</button>
          <button type="button" @click="closeDetail" class="btn-secondary btn-sm">Close</button>
        </div>
      </div>

      <div class="detail-meta">
        <span class="badge" :class="selectedEndpoint.is_active ? 'badge-success' : 'badge-muted'">
          {{ selectedEndpoint.is_active ? 'Active' : 'Inactive' }}
        </span>
        <span class="detail-events">{{ selectedEndpoint.events.length }} event{{ selectedEndpoint.events.length === 1 ? '' : 's' }}</span>
        <span class="detail-created">Created {{ formatDate(selectedEndpoint.created_at) }}</span>
      </div>

      <div class="detail-event-list">
        <span v-for="ev in selectedEndpoint.events" :key="ev" class="chip">{{ ev }}</span>
      </div>

      <!-- Delivery History -->
      <div class="deliveries-section">
        <h3>Recent Deliveries</h3>
        <div v-if="isLoadingDeliveries" class="deliveries-empty">Loading...</div>
        <div v-else-if="deliveries.length === 0" class="deliveries-empty">No deliveries yet</div>
        <div v-else class="deliveries-list">
          <div v-for="d in deliveries" :key="d.id" class="delivery-row" @click="expandedDelivery = expandedDelivery === d.id ? null : d.id">
            <div class="delivery-summary">
              <span class="badge" :class="statusClass(d.status)">{{ d.status }}</span>
              <span class="delivery-event">{{ d.event }}</span>
              <span v-if="d.response_status" class="delivery-code">{{ d.response_status }}</span>
              <span v-if="d.response_time_ms" class="delivery-time">{{ d.response_time_ms }}ms</span>
              <span class="delivery-date">{{ formatRelativeTime(d.created_at) }}</span>
              <button
                v-if="d.status === 'failed'"
                type="button"
                @click.stop="handleRetry(selectedEndpoint!.id, d.id)"
                :disabled="isRetrying === d.id"
                class="btn-secondary btn-xs"
              >
                {{ isRetrying === d.id ? 'Retrying...' : 'Retry' }}
              </button>
            </div>
            <div v-if="expandedDelivery === d.id" class="delivery-detail">
              <div v-if="d.error_message" class="delivery-error">{{ d.error_message }}</div>
              <div class="delivery-payload">
                <strong>Payload:</strong>
                <pre>{{ JSON.stringify(d.payload, null, 2) }}</pre>
              </div>
              <div v-if="d.response_body" class="delivery-response">
                <strong>Response:</strong>
                <pre>{{ d.response_body }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Form -->
    <div v-if="editingEndpoint" class="card edit-form">
      <h2>Edit Endpoint</h2>
      <div class="form-group">
        <label class="form-label">URL</label>
        <input v-model="editUrl" type="url" class="form-input" placeholder="https://example.com/webhook" />
      </div>
      <div class="form-group">
        <label class="form-label">Description (optional)</label>
        <input v-model="editDescription" type="text" class="form-input" placeholder="My webhook" maxlength="200" />
      </div>
      <div class="form-group">
        <label class="form-label">Events</label>
        <div class="event-grid">
          <label v-for="ev in allEvents" :key="ev" class="event-checkbox" :class="{ disabled: !isEventAvailable(ev) }">
            <input
              type="checkbox"
              :checked="editEvents.includes(ev)"
              :disabled="!isEventAvailable(ev)"
              @change="toggleEvent(ev)"
            />
            <div>
              <span class="event-name">{{ ev }}</span>
              <span class="event-desc">{{ eventDescriptions[ev] || '' }}</span>
            </div>
            <span v-if="!isEventAvailable(ev)" class="upgrade-badge">Upgrade</span>
          </label>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" @click="saveEdit(editingEndpoint)" :disabled="isSaving || !editUrl.trim() || editEvents.length === 0" class="btn-primary btn-sm">
          {{ isSaving ? 'Saving...' : 'Save' }}
        </button>
        <button type="button" @click="cancelEdit" :disabled="isSaving" class="btn-secondary btn-sm">Cancel</button>
      </div>
    </div>

    <!-- Endpoints List -->
    <div v-if="!selectedEndpoint && !editingEndpoint">
      <div v-if="isLoading" class="loading-state">Loading webhooks...</div>
      <div v-else>
        <!-- Create Form -->
        <div v-if="showCreateForm" class="card create-form">
          <h2>New Webhook Endpoint</h2>
          <div class="form-group">
            <label class="form-label">URL</label>
            <input v-model="createUrl" type="url" class="form-input" placeholder="https://example.com/webhook" />
          </div>
          <div class="form-group">
            <label class="form-label">Description (optional)</label>
            <input v-model="createDescription" type="text" class="form-input" placeholder="My webhook" maxlength="200" />
          </div>
          <div class="form-group">
            <label class="form-label">Events</label>
            <div class="event-grid">
              <label v-for="ev in allEvents" :key="ev" class="event-checkbox" :class="{ disabled: !isEventAvailable(ev) }">
                <input
                  type="checkbox"
                  :checked="selectedEvents.includes(ev)"
                  :disabled="!isEventAvailable(ev)"
                  @change="toggleEvent(ev)"
                />
                <div>
                  <span class="event-name">{{ ev }}</span>
                  <span class="event-desc">{{ eventDescriptions[ev] || '' }}</span>
                </div>
                <span v-if="!isEventAvailable(ev)" class="upgrade-badge">Upgrade</span>
              </label>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" @click="handleCreate" :disabled="isCreating || !createUrl.trim() || selectedEvents.length === 0" class="btn-primary btn-sm">
              {{ isCreating ? 'Creating...' : 'Create Endpoint' }}
            </button>
            <button type="button" @click="showCreateForm = false" :disabled="isCreating" class="btn-secondary btn-sm">Cancel</button>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="endpoints.length === 0 && !showCreateForm" class="card empty-state">
          <div class="empty-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="40" height="40">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <p>No webhook endpoints configured yet.</p>
          <p class="empty-hint">Webhooks let you receive real-time HTTP notifications when your posts are published, fail, or change status.</p>
          <button type="button" @click="showCreateForm = true" class="btn-primary">Create Webhook Endpoint</button>
        </div>

        <!-- Endpoint list -->
        <div v-if="endpoints.length > 0" class="endpoints-list">
          <div v-for="ep in endpoints" :key="ep.id" class="card endpoint-card">
            <div class="endpoint-row">
              <div class="endpoint-info" @click="viewEndpoint(ep)">
                <div class="endpoint-url">{{ truncateUrl(ep.url) }}</div>
                <div class="endpoint-meta">
                  <span class="badge badge-sm" :class="ep.is_active ? 'badge-success' : 'badge-muted'">
                    {{ ep.is_active ? 'Active' : 'Inactive' }}
                  </span>
                  <span>{{ ep.events.length }} event{{ ep.events.length === 1 ? '' : 's' }}</span>
                  <span v-if="ep.description" class="endpoint-desc">{{ ep.description }}</span>
                </div>
              </div>
              <div class="endpoint-actions">
                <button type="button" @click="toggleActive(ep)" class="btn-secondary btn-xs">
                  {{ ep.is_active ? 'Disable' : 'Enable' }}
                </button>
                <button type="button" @click="handleTest(ep.id)" :disabled="isTesting === ep.id" class="btn-secondary btn-xs">
                  {{ isTesting === ep.id ? '...' : 'Test' }}
                </button>
                <button type="button" @click="confirmDelete(ep)" class="btn-secondary btn-xs btn-danger-text">Delete</button>
              </div>
            </div>
          </div>

          <button v-if="!showCreateForm" type="button" @click="showCreateForm = true" class="btn-secondary">
            Add Endpoint
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <ConfirmModal
      :show="showDeleteModal"
      title="Delete Webhook Endpoint"
      :message="`Delete this endpoint and all its delivery history? This cannot be undone.`"
      confirm-text="Delete"
      variant="danger"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false; endpointToDelete = null"
    />
  </div>
</template>

<style scoped>
.webhooks-page {
  max-width: 720px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header-top {
  margin-bottom: 12px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--muted);
  text-decoration: none;
  transition: color 0.15s;
}

.back-link:hover {
  color: var(--text);
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

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 13px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-dismiss {
  background: none;
  border: none;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
}

.alert-success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #86efac;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 13px;
  margin-bottom: 16px;
}

/* Secret reveal */
.secret-reveal {
  padding: 16px;
  margin-bottom: 16px;
  border-color: rgba(251, 191, 36, 0.3);
}

.secret-warning {
  font-size: 13px;
  font-weight: 600;
  color: #fbbf24;
  margin-bottom: 10px;
}

.secret-box {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.secret-value {
  flex: 1;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  word-break: break-all;
  color: var(--text);
}

.secret-hint {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 10px;
}

/* Empty state */
.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  color: var(--muted);
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 4px;
}

.empty-hint {
  font-size: 13px;
  margin-bottom: 16px !important;
}

.loading-state {
  font-size: 14px;
  color: var(--muted);
  padding: 20px 0;
}

/* Create/Edit forms */
.create-form,
.edit-form {
  padding: 20px;
  margin-bottom: 16px;
}

.create-form h2,
.edit-form h2 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 14px;
}

.form-label {
  display: block;
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent);
}

.event-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.event-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color 0.15s;
}

.event-checkbox:hover:not(.disabled) {
  border-color: var(--accent);
}

.event-checkbox.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.event-checkbox input[type="checkbox"] {
  flex-shrink: 0;
}

.event-checkbox div {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.event-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  font-family: monospace;
}

.event-desc {
  font-size: 12px;
  color: var(--muted);
}

.upgrade-badge {
  font-size: 10px;
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
  padding: 2px 6px;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

/* Endpoints list */
.endpoints-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.endpoint-card {
  padding: 14px 16px;
}

.endpoint-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.endpoint-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.endpoint-url {
  font-size: 14px;
  font-weight: 500;
  font-family: monospace;
  color: var(--text);
  margin-bottom: 4px;
  word-break: break-all;
}

.endpoint-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--muted);
}

.endpoint-desc {
  color: var(--muted);
}

.endpoint-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

/* Detail view */
.detail-view {
  padding: 20px;
  margin-bottom: 16px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.detail-header h2 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.detail-url {
  font-size: 13px;
  font-family: monospace;
  color: var(--muted);
  word-break: break-all;
}

.detail-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 12px;
}

.detail-event-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 20px;
}

.chip {
  font-size: 11px;
  font-family: monospace;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border);
  padding: 3px 8px;
  border-radius: 9999px;
  color: var(--text);
}

/* Deliveries */
.deliveries-section {
  border-top: 1px solid var(--border);
  padding-top: 16px;
}

.deliveries-section h3 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.deliveries-empty {
  font-size: 13px;
  color: var(--muted);
  padding: 12px 0;
}

.deliveries-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.delivery-row {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color 0.15s;
}

.delivery-row:hover {
  border-color: rgba(255, 255, 255, 0.15);
}

.delivery-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  font-size: 13px;
}

.delivery-event {
  font-family: monospace;
  font-size: 12px;
  color: var(--text);
}

.delivery-code {
  font-family: monospace;
  font-size: 12px;
  color: var(--muted);
}

.delivery-time {
  font-size: 11px;
  color: var(--muted);
}

.delivery-date {
  margin-left: auto;
  font-size: 11px;
  color: var(--muted);
}

.delivery-detail {
  padding: 10px 12px;
  border-top: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.15);
}

.delivery-error {
  font-size: 12px;
  color: #fca5a5;
  margin-bottom: 8px;
}

.delivery-payload,
.delivery-response {
  margin-bottom: 8px;
}

.delivery-payload strong,
.delivery-response strong {
  display: block;
  font-size: 11px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.delivery-payload pre,
.delivery-response pre {
  font-size: 11px;
  color: var(--text);
  background: rgba(0, 0, 0, 0.2);
  padding: 8px;
  border-radius: var(--radius-sm);
  overflow-x: auto;
  max-height: 200px;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Badges */
.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 9999px;
  font-weight: 500;
  text-transform: capitalize;
}

.badge-sm {
  font-size: 10px;
  padding: 1px 6px;
}

.badge-success {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.badge-error {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.badge-warning {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.badge-muted {
  background: rgba(156, 163, 175, 0.15);
  color: #9ca3af;
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 9999px;
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.btn-secondary:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 5px 12px;
  font-size: 12px;
}

.btn-xs {
  padding: 3px 8px;
  font-size: 11px;
}

.btn-danger-text {
  color: #ef4444;
}

.btn-danger-text:hover:not(:disabled) {
  border-color: rgba(239, 68, 68, 0.5);
}

@media (max-width: 640px) {
  .endpoint-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .endpoint-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 8px;
  }

  .detail-header {
    flex-direction: column;
  }

  .detail-actions {
    width: 100%;
  }

  .delivery-summary {
    flex-wrap: wrap;
  }
}
</style>
