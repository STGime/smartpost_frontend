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
  // Check if this is a server-side OAuth completion (success redirect)
  const success = route.query.success as string
  const platform = route.query.platform as string
  const errorParam = route.query.error as string

  if (success === 'true' && platform) {
    // OAuth was completed server-side, just refresh accounts and redirect
    try {
      await socialAccountsStore.fetchAccounts()
      // Keep the result details (e.g. how many Facebook Pages were added) for the banner
      const { connected, skipped, failed } = route.query
      router.push({
        name: 'accounts',
        query: {
          platform,
          success: 'true',
          ...(connected ? { connected } : {}),
          ...(skipped ? { skipped } : {}),
          ...(failed ? { failed } : {}),
        },
      })
    } catch {
      error.value = 'Failed to refresh accounts'
      isLoading.value = false
    }
    return
  }

  if (errorParam) {
    error.value = route.query.error_description as string || errorParam
    isLoading.value = false
    return
  }

  // Handle client-side OAuth completion (code + state)
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
  <div class="callback-page">
    <div class="callback-container">
      <div v-if="isLoading" class="callback-state">
        <div class="spinner"></div>
        <p>Connecting your account...</p>
      </div>
      <div v-else-if="error" class="callback-state">
        <p class="callback-error">{{ error }}</p>
        <RouterLink to="/app/accounts" class="callback-link">
          Back to accounts
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  background: var(--ink-0);
}

.callback-container {
  text-align: center;
  max-width: 400px;
}

.callback-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.callback-state p {
  color: var(--fg-2);
  font-size: 14px;
}

.callback-state .callback-error {
  color: var(--error);
}

.callback-link {
  color: var(--signal);
  font-size: 14px;
  font-weight: 500;
}

.callback-link:hover {
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
