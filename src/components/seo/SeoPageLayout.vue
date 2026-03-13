<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores'
import LoginModal from '@/components/LoginModal.vue'
import WaitingListModal from '@/components/WaitingListModal.vue'
import { isSignupEnabled } from '@/config/featureFlags'
import type { WaitingListSource } from '@/services'

const props = defineProps<{
  waitingListSource: WaitingListSource
}>()

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentYear = new Date().getFullYear()
const showLoginModal = ref(false)
const signupEnabled = isSignupEnabled()
const showWaitingListModal = ref(false)
const waitingListSource = ref<WaitingListSource>(props.waitingListSource)

const openWaitingList = (source: WaitingListSource) => {
  waitingListSource.value = source
  showWaitingListModal.value = true
}
</script>

<template>
  <div class="page">
    <div class="wrapper">
      <header class="header">
        <RouterLink to="/" class="logo">
          <div class="logo-mark">
            <div class="logo-inner">P</div>
          </div>
          <div>
            <div class="logo-text">Posta</div>
            <div class="logo-tagline">Create once. Post everywhere.</div>
          </div>
        </RouterLink>
        <div class="header-actions">
          <template v-if="!isAuthenticated">
            <button class="btn-login" @click="showLoginModal = true">Log in</button>
            <RouterLink v-if="signupEnabled" to="/signup" class="btn-primary btn-header">
              Sign up free
            </RouterLink>
            <button v-else class="btn-primary btn-header" @click="openWaitingList(waitingListSource)">
              Join waiting list
            </button>
          </template>
          <RouterLink v-else to="/app" class="btn-primary btn-header">
            Dashboard
          </RouterLink>
        </div>
      </header>

      <main>
        <slot />
      </main>
    </div>

    <footer class="footer">
      <div class="footer-inner">
        <div>&copy; {{ currentYear }} Posta. All rights reserved.</div>
        <div class="footer-links">
          <a href="mailto:hello@getposta.app">Contact</a>
          <RouterLink to="/terms">Terms of Service</RouterLink>
          <RouterLink to="/privacy">Privacy Policy</RouterLink>
          <RouterLink to="/impressum">Impressum</RouterLink>
        </div>
        <div class="footer-section">
          <div class="footer-heading">Alternatives</div>
          <div class="footer-links">
            <a href="https://buffer.com" target="_blank" rel="noopener">Buffer</a>
            <a href="https://hootsuite.com" target="_blank" rel="noopener">Hootsuite</a>
            <a href="https://later.com" target="_blank" rel="noopener">Later</a>
            <a href="https://sproutsocial.com" target="_blank" rel="noopener">Sprout Social</a>
          </div>
        </div>
      </div>
    </footer>

    <LoginModal :show="showLoginModal" @close="showLoginModal = false" />
    <WaitingListModal
      :show="showWaitingListModal"
      :source="waitingListSource"
      @close="showWaitingListModal = false"
    />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at top, #111827 0, #020617 45%, #000 100%);
}

.wrapper {
  max-width: 1040px;
  margin: 0 auto;
  padding: 32px 20px 60px;
  flex: 1;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-mark {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: conic-gradient(from 210deg, #4f46e5, #22c55e, #06b6d4, #4f46e5);
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(79, 70, 229, 0.6);
}

.logo-inner {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: #020617;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #e5e7eb;
}

.logo-text {
  font-weight: 600;
  letter-spacing: 0.02em;
  font-size: 18px;
}

.logo-tagline {
  font-size: 11px;
  color: var(--muted);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}


.btn-login {
  border: 1px solid rgba(148, 163, 184, 0.6);
  background: rgba(15, 23, 42, 0.7);
  color: var(--text);
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  text-decoration: none;
}

.btn-login:hover {
  border-color: rgba(148, 163, 184, 0.9);
  background: rgba(15, 23, 42, 0.9);
}

.btn-header {
  padding: 8px 16px;
  font-size: 13px;
}

.btn-primary {
  border: none;
  cursor: pointer;
  padding: 11px 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  background: radial-gradient(circle at top left, #6366f1, #4f46e5);
  color: #e5e7eb;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.8);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.footer {
  border-top: 1px solid rgba(31, 41, 55, 0.9);
  margin-top: auto;
}

.footer-inner {
  max-width: 1040px;
  margin: 0 auto;
  padding: 16px 20px 24px;
  font-size: 11px;
  color: var(--muted);
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.footer-links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.footer-links a {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  color: var(--muted);
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.footer-heading {
  font-size: 11px;
  font-weight: 600;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

@media (max-width: 720px) {
  .wrapper {
    padding-inline: 16px;
  }
}
</style>
