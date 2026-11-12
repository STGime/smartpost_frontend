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
          <div class="logo-text">posta</div>
        </RouterLink>
        <div class="header-actions">
          <nav class="nav">
            <RouterLink to="/agents" class="nav-link">Agents</RouterLink>
            <RouterLink to="/workflows" class="nav-link">Workflows</RouterLink>
            <RouterLink to="/developers" class="nav-link">Developers</RouterLink>
            <RouterLink to="/blog" class="nav-link">Blog</RouterLink>
          </nav>
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
        <div>&copy; {{ currentYear }} Posta. Operated by Eurobase OÜ (Estonia). All rights reserved.</div>
        <div class="footer-links">
          <RouterLink to="/blog">Blog</RouterLink>
          <a href="mailto:hello@getposta.app">Contact</a>
          <RouterLink to="/terms">Terms of Service</RouterLink>
          <RouterLink to="/privacy">Privacy Policy</RouterLink>
          <RouterLink to="/legal-notice">Legal Notice</RouterLink>
        </div>
        <div class="footer-section">
          <div class="footer-heading">Product</div>
          <div class="footer-links">
            <RouterLink to="/social-media-scheduler">Social Media Scheduler</RouterLink>
            <RouterLink to="/agentic-social-media-scheduler">Agentic Scheduler</RouterLink>
            <RouterLink to="/compare">Compare</RouterLink>
          </div>
        </div>
        <div class="footer-section">
          <div class="footer-heading">Developer resources</div>
          <div class="footer-links">
            <RouterLink to="/agents">For AI agents</RouterLink>
            <RouterLink to="/cli-social-media-posting">Claude Code skill</RouterLink>
            <RouterLink to="/workflows">n8n workflows</RouterLink>
            <RouterLink to="/developers">REST API docs</RouterLink>
            <a href="https://github.com/STGime/posta-mcp" target="_blank" rel="noopener">MCP server (GitHub)</a>
            <a href="https://github.com/STGime/posta-skill" target="_blank" rel="noopener">Claude Code skill (GitHub)</a>
          </div>
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
  background: var(--ink-0);
}

.header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 14px max(24px, calc((100% - 1040px) / 2 + 24px));
  flex-wrap: wrap;
  background: var(--ink-0);
  border-bottom: 1px solid var(--line);
}

.wrapper {
  flex: 1;
  width: 100%;
}

.wrapper > main {
  max-width: 1040px;
  margin: 0 auto;
  padding: 48px 24px 72px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-text {
  font-weight: 600;
  font-size: 17px;
  letter-spacing: -0.01em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.nav {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: 8px;
}

.nav-link {
  color: var(--fg-2);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  transition: color 0.15s, background-color 0.15s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--text);
  background: var(--ink-1);
}

.btn-login {
  border: 1px solid var(--line-strong);
  background: transparent;
  color: var(--text);
  padding: 7px 14px;
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s;
  text-decoration: none;
}

.btn-login:hover {
  border-color: var(--fg-3);
}

.btn-header {
  padding: 7px 14px;
}

.footer {
  border-top: 1px solid var(--line);
  margin-top: auto;
}

.footer-inner {
  max-width: 1040px;
  margin: 0 auto;
  padding: 32px 24px 40px;
  font-size: 13px;
  color: var(--fg-3);
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: 24px 32px;
}

.footer-inner > div:first-child {
  grid-column: 1 / -1;
  order: 10;
  padding-top: 20px;
  border-top: 1px solid var(--line);
  font-family: var(--font-mono);
  font-size: 12px;
}

.footer-inner > .footer-links {
  grid-column: 1 / -1;
  order: 11;
}

.footer-links {
  display: flex;
  gap: 8px 16px;
  flex-wrap: wrap;
}

.footer-section .footer-links {
  flex-direction: column;
}

.footer-links a {
  color: var(--fg-2);
  transition: color 0.15s;
}

.footer-links a:hover {
  color: var(--text);
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-heading {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--fg-3);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

@media (max-width: 760px) {
  .header {
    padding: 12px 16px;
  }
  .wrapper > main {
    padding: 32px 16px 56px;
  }
  .footer-inner {
    grid-template-columns: 1fr 1fr;
    padding-inline: 16px;
  }
}

@media (max-width: 560px) {
  .nav {
    order: 3;
    width: 100%;
    margin-right: 0;
    overflow-x: auto;
  }
  .nav-link {
    font-size: 13px;
    padding: 6px 8px;
  }
  .header-actions {
    gap: 8px;
  }
  .footer-inner {
    grid-template-columns: 1fr;
  }
}
</style>
