<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSocialAccountsStore } from '@/stores'

const route = useRoute()
const router = useRouter()
const socialAccountsStore = useSocialAccountsStore()

const isLoading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  const code = route.query.code as string
  const state = route.query.state as string

  if (!code || !state) {
    error.value = 'Invalid OAuth callback'
    isLoading.value = false
    return
  }

  try {
    await socialAccountsStore.completeOAuth(code, state)
    router.push({ name: 'accounts' })
  } catch {
    error.value = socialAccountsStore.error || 'Failed to connect account'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div v-if="isLoading" class="space-y-4">
        <div class="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-gray-600">Connecting your account...</p>
      </div>
      <div v-else-if="error" class="space-y-4">
        <p class="text-red-600">{{ error }}</p>
        <RouterLink to="/app/accounts" class="text-purple-600 hover:text-purple-500">
          Back to accounts
        </RouterLink>
      </div>
    </div>
  </div>
</template>
