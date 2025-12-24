<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores'

const authStore = useAuthStore()
const email = ref('')
const submitted = ref(false)

const handleSubmit = async () => {
  try {
    await authStore.forgotPassword(email.value)
    submitted.value = true
  } catch {
    // Error handled in store
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900">Reset your password</h1>
        <p class="mt-2 text-gray-600">We'll send you a link to reset your password</p>
      </div>

      <div v-if="submitted" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
        Check your email for a password reset link.
      </div>

      <form v-else @submit.prevent="handleSubmit" class="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-sm">
        <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {{ authStore.error }}
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ authStore.isLoading ? 'Sending...' : 'Send reset link' }}
        </button>

        <p class="text-center text-sm text-gray-600">
          <RouterLink to="/login" class="text-purple-600 hover:text-purple-500 font-medium">
            Back to sign in
          </RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>
