<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { useAuthStore } from '@/stores'

useHead({
  titleTemplate: '%s | Posta',
})

const authStore = useAuthStore()
const router = useRouter()

onMounted(() => {
  // Only fetch current user if not on an auth page (login/signup)
  // This prevents race conditions with stale tokens
  const authPages = ['/login', '/signup', '/forgot-password', '/reset-password']
  if (!authPages.some(page => router.currentRoute.value.path.startsWith(page))) {
    authStore.fetchCurrentUser()
  }
})
</script>

<template>
  <RouterView />
</template>
