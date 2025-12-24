<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostsStore } from '@/stores'

const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()

const postId = route.params.id as string

onMounted(() => {
  postsStore.fetchPostById(postId)
})

const handleDelete = async () => {
  if (confirm('Are you sure you want to delete this post?')) {
    await postsStore.deletePost(postId)
    router.push('/app/posts')
  }
}

const handlePublish = async () => {
  await postsStore.publishPost(postId)
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Post Details</h1>
      <RouterLink to="/app/posts" class="text-purple-600 hover:text-purple-500">
        Back to posts
      </RouterLink>
    </div>

    <div v-if="postsStore.isLoading" class="text-center py-12">
      <div class="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
    </div>

    <div v-else-if="postsStore.currentPost" class="space-y-6">
      <!-- Status -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <span
            :class="[
              'px-3 py-1 rounded-full text-sm',
              postsStore.currentPost.status === 'posted' ? 'bg-green-100 text-green-700' :
              postsStore.currentPost.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
              postsStore.currentPost.status === 'draft' ? 'bg-gray-100 text-gray-700' :
              'bg-red-100 text-red-700'
            ]"
          >
            {{ postsStore.currentPost.status }}
          </span>
          <p class="text-sm text-gray-500">
            Created {{ new Date(postsStore.currentPost.created_at).toLocaleString() }}
          </p>
        </div>
      </div>

      <!-- Caption -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-sm font-medium text-gray-700 mb-2">Caption</h2>
        <p class="text-gray-900">{{ postsStore.currentPost.caption || 'No caption' }}</p>
      </div>

      <!-- Media -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-sm font-medium text-gray-700 mb-4">Media</h2>
        <div class="grid grid-cols-4 gap-4">
          <div
            v-for="media in postsStore.currentPost.media"
            :key="media.id"
            class="aspect-square rounded-lg overflow-hidden bg-gray-100"
          >
            <img
              :src="media.thumbnail_url || media.original_url"
              class="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <!-- Accounts -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-sm font-medium text-gray-700 mb-4">Target Accounts</h2>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="account in postsStore.currentPost.social_accounts"
            :key="account.id"
            class="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg"
          >
            <span class="capitalize text-sm">{{ account.platform }}</span>
            <span class="text-gray-500 text-sm">@{{ account.username }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-4">
        <button
          v-if="postsStore.currentPost.status === 'draft'"
          @click="handlePublish"
          class="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700"
        >
          Publish Now
        </button>
        <button
          v-if="['draft', 'failed'].includes(postsStore.currentPost.status)"
          @click="handleDelete"
          class="px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>
