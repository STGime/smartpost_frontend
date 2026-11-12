<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useCommentsStore } from '@/stores'
import PlatformIcon from '@/components/PlatformIcon.vue'
import type { CommentPlatform, Post, PostComment } from '@/types'

const props = defineProps<{
  post: Post
}>()

const commentsStore = useCommentsStore()

// Per-post platform filter — only enabled when the post is multi-platform
const platformFilter = ref<CommentPlatform | null>(null)
const unreadOnly = ref(false)

// Track which comment we're currently replying to + the draft text
const activeReplyId = ref<string | null>(null)
const replyDrafts = ref<Record<string, string>>({})
const replyError = ref<Record<string, string | null>>({})
const replySuccess = ref<Record<string, boolean>>({})

const postId = computed(() => props.post.id)
const state = computed(() => commentsStore.byPost[postId.value])

const items = computed<PostComment[]>(() => state.value?.items || [])
const total = computed(() => state.value?.total || 0)
const isLoading = computed(() => state.value?.loading ?? false)
const isLoadingMore = computed(() => state.value?.loadingMore ?? false)
const error = computed(() => state.value?.error)

// Per-platform polling status now comes directly from the API response
// (platformStatus on the comments list endpoint). The frontend no longer
// needs to guess from "no comments returned" — the backend tells us
// whether polling is enabled, why it was disabled, and when it last ran.
const platformStatus = computed(() => state.value?.platformStatus ?? [])

const linkedinStatus = computed(() =>
  platformStatus.value.find((p) => p.platform === 'linkedin') ?? null,
)
const tiktokStatus = computed(() =>
  platformStatus.value.find((p) => p.platform === 'tiktok') ?? null,
)

const linkedinUnsupported = computed(
  () => linkedinStatus.value !== null && !linkedinStatus.value.pollingEnabled,
)
const tiktokUnsupported = computed(
  () => tiktokStatus.value !== null && !tiktokStatus.value.pollingEnabled,
)

const platforms = computed(() => {
  const seen = new Set<CommentPlatform>()
  for (const acc of props.post.socialAccounts || []) {
    if (acc.platform === 'linkedin' || acc.platform === 'tiktok') {
      seen.add(acc.platform as CommentPlatform)
    }
  }
  return Array.from(seen)
})

const hasMultiplePlatforms = computed(() => platforms.value.length > 1)

const hasMore = computed(() => items.value.length < total.value)

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return d.toLocaleDateString()
}

function characterLimit(platform: CommentPlatform): number {
  return platform === 'tiktok' ? 150 : 1250
}

async function loadInitial() {
  await commentsStore.load(postId.value, {
    platform: platformFilter.value ?? undefined,
    unreadOnly: unreadOnly.value || undefined,
  })
  // Optimistically mark all visible unread comments as read
  if (items.value.some((c) => !c.isRead && !c.isOwnReply)) {
    await commentsStore.markRead(postId.value)
  }
}

async function handleLoadMore() {
  await commentsStore.loadMore(postId.value, {
    platform: platformFilter.value ?? undefined,
    unreadOnly: unreadOnly.value || undefined,
  })
}

function startReply(commentId: string) {
  activeReplyId.value = commentId
  if (!(commentId in replyDrafts.value)) {
    replyDrafts.value[commentId] = ''
  }
  replyError.value[commentId] = null
  replySuccess.value[commentId] = false
}

function cancelReply(commentId: string) {
  activeReplyId.value = null
  replyDrafts.value[commentId] = ''
  replyError.value[commentId] = null
}

async function submitReply(comment: PostComment) {
  const text = (replyDrafts.value[comment.id] || '').trim()
  if (!text) return
  replyError.value[comment.id] = null
  const result = await commentsStore.submitReply(postId.value, comment.id, text)
  if (result) {
    replyDrafts.value[comment.id] = ''
    activeReplyId.value = null
    replySuccess.value[comment.id] = true
    setTimeout(() => {
      replySuccess.value[comment.id] = false
    }, 3000)
  } else {
    replyError.value[comment.id] = state.value?.error || 'Failed to post reply'
  }
}

function isReplying(commentId: string): boolean {
  return !!state.value?.replying?.[commentId]
}

watch([platformFilter, unreadOnly], async () => {
  await commentsStore.load(postId.value, {
    platform: platformFilter.value ?? undefined,
    unreadOnly: unreadOnly.value || undefined,
  })
})

onMounted(loadInitial)
</script>

<template>
  <div class="comments-tab">
    <div class="comments-header">
      <h3 class="comments-title">Comments <span class="muted">({{ total }})</span></h3>
      <div class="comments-filters">
        <button
          v-if="hasMultiplePlatforms"
          class="filter-chip"
          :class="{ active: platformFilter === null }"
          @click="platformFilter = null"
        >
          All
        </button>
        <button
          v-for="p in platforms"
          v-show="hasMultiplePlatforms"
          :key="p"
          class="filter-chip"
          :class="{ active: platformFilter === p }"
          @click="platformFilter = p"
        >
          <PlatformIcon :platform="p" size="xs" />
          <span class="capitalize">{{ p }}</span>
        </button>
        <label class="unread-toggle">
          <input v-model="unreadOnly" type="checkbox" />
          <span>Unread only</span>
        </label>
      </div>
    </div>

    <div v-if="linkedinUnsupported" class="banner banner-warning">
      <strong>LinkedIn comments aren't available yet.</strong>
      LinkedIn's read-comments API requires Marketing Developer Platform partner approval beyond the standard posting scope. Posta has applied; comments will start populating here automatically once approval lands. Replying still works once a comment is loaded.
    </div>

    <div v-if="tiktokUnsupported" class="banner banner-warning">
      <strong>TikTok comments aren't available yet.</strong>
      TikTok comment access requires the <code>comment.list</code> and <code>comment.list.manage</code> scopes, which are partner-gated. Once TikTok approves the scope expansion, reconnect your TikTok account here to start seeing replies.
    </div>

    <div v-if="isLoading && items.length === 0" class="state-empty">
      Loading comments…
    </div>

    <div v-else-if="error && items.length === 0" class="state-error">
      {{ error }}
      <button class="btn-secondary" @click="loadInitial">Retry</button>
    </div>

    <div v-else-if="items.length === 0" class="state-empty">
      No comments yet. Comments are checked every few minutes.
    </div>

    <ul v-else class="comment-list">
      <li
        v-for="comment in items"
        :key="comment.id"
        class="comment-card"
        :class="{ 'is-reply': !!comment.parentCommentId, 'is-own': comment.isOwnReply }"
      >
        <div class="comment-head">
          <div class="avatar" aria-hidden="true">
            <img v-if="comment.authorAvatarUrl" :src="comment.authorAvatarUrl" alt="" />
            <span v-else>{{ (comment.authorName || '?').slice(0, 1).toUpperCase() }}</span>
          </div>
          <div class="comment-meta">
            <div class="comment-author">
              <span class="author-name">{{ comment.authorName || 'Anonymous' }}</span>
              <span v-if="comment.isOwnReply" class="badge-own">You</span>
              <PlatformIcon :platform="comment.platform" size="xs" />
            </div>
            <div class="comment-sub">
              <span class="comment-date">{{ formatDate(comment.platformCreatedAt || comment.createdAt) }}</span>
              <span v-if="!comment.isRead && !comment.isOwnReply" class="dot-unread" title="Unread"></span>
            </div>
          </div>
        </div>

        <p class="comment-text">{{ comment.text }}</p>

        <div v-if="!comment.isOwnReply" class="comment-actions">
          <button
            v-if="activeReplyId !== comment.id"
            class="btn-ghost btn-xs"
            @click="startReply(comment.id)"
          >
            Reply
          </button>
        </div>

        <div v-if="activeReplyId === comment.id" class="reply-form">
          <textarea
            v-model="replyDrafts[comment.id]"
            rows="3"
            class="reply-textarea"
            :maxlength="characterLimit(comment.platform)"
            placeholder="Write a reply…"
          ></textarea>
          <div class="reply-form-foot">
            <span class="char-count">
              {{ (replyDrafts[comment.id] || '').length }} / {{ characterLimit(comment.platform) }}
            </span>
            <div class="reply-buttons">
              <button class="btn-secondary btn-xs" type="button" @click="cancelReply(comment.id)">
                Cancel
              </button>
              <button
                class="btn-primary btn-xs"
                :disabled="!((replyDrafts[comment.id] || '').trim()) || isReplying(comment.id)"
                @click="submitReply(comment)"
              >
                {{ isReplying(comment.id) ? 'Posting…' : 'Post reply' }}
              </button>
            </div>
          </div>
          <p v-if="replyError[comment.id]" class="reply-error">{{ replyError[comment.id] }}</p>
        </div>

        <p v-if="replySuccess[comment.id]" class="reply-success">Reply posted</p>
      </li>
    </ul>

    <div v-if="hasMore" class="load-more">
      <button class="btn-secondary" :disabled="isLoadingMore" @click="handleLoadMore">
        {{ isLoadingMore ? 'Loading…' : 'Load more comments' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.comments-tab {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.comments-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.muted {
  color: var(--fg-3);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 400;
  margin-left: 4px;
}

.comments-filters {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 9px;
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 11px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--fg-2);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background-color 0.15s;
}

.filter-chip:hover {
  border-color: var(--line-strong);
  color: var(--text);
}

.filter-chip.active {
  border-color: var(--signal);
  background: var(--signal-soft);
  color: var(--signal);
}

.capitalize {
  text-transform: lowercase;
}

.unread-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 4px;
  font-size: 12px;
  color: var(--fg-2);
  cursor: pointer;
}

.unread-toggle input {
  accent-color: var(--signal);
}

.banner {
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  line-height: 1.5;
}

.banner-warning {
  background: var(--ink-1);
  color: var(--fg-2);
  border: 1px solid var(--line);
  border-left: 2px solid var(--signal);
}

.banner-warning strong {
  color: var(--signal);
  font-weight: 600;
  margin-right: 6px;
}

.banner-warning code {
  font-size: 12px;
  background: var(--ink-2);
  border: 1px solid var(--line);
  padding: 0 5px;
  border-radius: 2px;
  color: var(--text);
}

.state-empty,
.state-error {
  padding: 28px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--fg-3);
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.state-error {
  color: var(--error);
}

/* Comments read as one hairline-divided list */
.comment-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  background: var(--ink-1);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
}

.comment-card {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-left: 2px solid transparent;
}

.comment-card + .comment-card {
  border-top: 1px solid var(--line);
}

.comment-card.is-reply {
  padding-left: 40px;
  background: var(--ink-0);
}

.comment-card.is-own {
  border-left-color: var(--signal);
}

.comment-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  background: var(--ink-3);
  border: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fg-2);
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: 13px;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-meta {
  flex: 1;
  min-width: 0;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.author-name {
  font-weight: 600;
  color: var(--text);
  font-size: 14px;
  overflow-wrap: anywhere;
}

.badge-own {
  border: 1px solid rgba(242, 169, 59, 0.5);
  color: var(--signal);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  padding: 0 5px;
  border-radius: 2px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.comment-sub {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
  margin-top: 1px;
}

.dot-unread {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--signal);
  display: inline-block;
}

.comment-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.btn-xs {
  padding: 5px 10px;
  font-size: 12px;
}

.reply-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 2px;
}

.reply-textarea {
  width: 100%;
  border: 1px solid var(--line-strong);
  background: var(--ink-0);
  color: var(--text);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  min-height: 64px;
  transition: border-color 0.15s;
}

.reply-textarea::placeholder {
  color: var(--fg-3);
}

.reply-textarea:focus {
  outline: none;
  border-color: var(--signal);
}

.reply-form-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.char-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
}

.reply-buttons {
  display: flex;
  gap: 8px;
}

.reply-error {
  font-size: 12px;
  color: var(--error);
}

.reply-success {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--success);
}

.load-more {
  display: flex;
  justify-content: center;
  padding: 4px 0;
}
</style>
