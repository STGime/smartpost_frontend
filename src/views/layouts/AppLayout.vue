<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore, useUserStore } from '@/stores'
import LoginModal from '@/components/LoginModal.vue'
import ExpiredPlanModal from '@/components/ExpiredPlanModal.vue'
import FeedbackModal from '@/components/FeedbackModal.vue'

const route = useRoute()
const authStore = useAuthStore()
const userStore = useUserStore()

// Check if nav item is active (exact match for /app, prefix match for others)
const isNavActive = computed(() => (itemPath: string) => {
  if (itemPath === '/app') {
    return route.path === '/app'
  }
  return route.path.startsWith(itemPath)
})
const isSidebarOpen = ref(false)
const showFeedbackModal = ref(false)
const trialBannerDismissed = ref(false)
const currentYear = new Date().getFullYear()

const trialDaysRemaining = computed(() => userStore.plan?.plan?.days_remaining ?? null)

const showTrialBanner = computed(() => {
  if (trialBannerDismissed.value) return false
  if (userStore.plan?.plan?.type !== 'trial') return false
  return trialDaysRemaining.value !== null && trialDaysRemaining.value <= 3
})

const expiredModalDismissed = ref(false)
const showExpiredPlanModal = computed(() => {
  if (expiredModalDismissed.value) return false
  const planData = userStore.plan?.plan
  if (!planData) return false
  return planData.is_active === false
})

const navigation = [
  { name: 'Dashboard', to: '/app', icon: 'dashboard' },
  { name: 'Posts', to: '/app/posts', icon: 'posts' },
  { name: 'Calendar', to: '/app/calendar', icon: 'calendar' },
  { name: 'Media', to: '/app/media', icon: 'media' },
  { name: 'Analytics', to: '/app/analytics', icon: 'analytics' },
  { name: 'Accounts', to: '/app/accounts', icon: 'accounts' },
  { name: 'Billing', to: '/app/billing', icon: 'billing' },
  { name: 'Settings', to: '/app/settings', icon: 'settings' },
]

onMounted(() => {
  userStore.fetchProfile()
  userStore.fetchPlan()
})
</script>

<template>
  <div class="app-layout">
    <!-- Mobile sidebar backdrop -->
    <div
      v-if="isSidebarOpen"
      @click="isSidebarOpen = false"
      class="sidebar-backdrop"
    ></div>

    <!-- Sidebar -->
    <aside :class="['sidebar', { 'sidebar-open': isSidebarOpen }]">
      <div class="sidebar-inner">
        <!-- Logo -->
        <div class="sidebar-logo">
          <RouterLink to="/app" class="logo-link">
            <div class="logo-mark">
              <div class="logo-inner">P</div>
            </div>
            <span class="logo-text">posta</span>
          </RouterLink>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          <RouterLink
            v-for="item in navigation"
            :key="item.name"
            :to="item.to"
            :class="['nav-item', { 'nav-item-active': isNavActive(item.to) }]"
            @click="isSidebarOpen = false"
          >
            <span class="nav-icon">
              <svg v-if="item.icon === 'dashboard'" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <svg v-else-if="item.icon === 'posts'" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <svg v-else-if="item.icon === 'calendar'" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                <line x1="16" y1="2" x2="16" y2="6" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                <line x1="8" y1="2" x2="8" y2="6" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                <line x1="3" y1="10" x2="21" y2="10" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
              </svg>
              <svg v-else-if="item.icon === 'media'" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <svg v-else-if="item.icon === 'analytics'" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <svg v-else-if="item.icon === 'accounts'" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <svg v-else-if="item.icon === 'billing'" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <svg v-else-if="item.icon === 'settings'" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            {{ item.name }}
          </RouterLink>
        </nav>

        <!-- User section -->
        <div class="sidebar-user">
          <div class="user-info">
            <div class="user-avatar">
              {{ userStore.profile?.display_name?.[0] || userStore.profile?.email?.[0] || '?' }}
            </div>
            <div class="user-details">
              <p class="user-name">
                {{ userStore.profile?.display_name || userStore.profile?.email || 'User' }}
              </p>
              <p class="user-plan">
                {{ userStore.plan?.plan?.type === 'trial' ? 'Free trial' : (userStore.plan?.plan?.type || 'Free') + ' plan' }}
              </p>
              <p v-if="userStore.plan?.plan?.type === 'trial' && userStore.plan?.plan?.days_remaining != null" class="trial-days">
                {{ userStore.plan.plan.days_remaining }} day{{ userStore.plan.plan.days_remaining === 1 ? '' : 's' }} left
              </p>
            </div>
          </div>
          <button @click="authStore.logout()" class="logout-btn">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="main-wrapper">
      <!-- Top bar -->
      <header class="topbar">
        <button @click="isSidebarOpen = !isSidebarOpen" class="menu-btn">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div class="topbar-spacer"></div>
        <RouterLink to="/app/posts/new" class="btn-primary">
          Create Post
        </RouterLink>
      </header>

      <!-- Trial expiry banner -->
      <div v-if="showTrialBanner" class="trial-banner">
        <span>Your free trial ends in {{ trialDaysRemaining }} day{{ trialDaysRemaining === 1 ? '' : 's' }}. <RouterLink to="/app/billing" class="trial-banner-link">Upgrade now</RouterLink> to keep your accounts connected.</span>
        <button @click="trialBannerDismissed = true" class="trial-banner-close" aria-label="Dismiss">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Page content -->
      <main class="main-content">
        <RouterView />
      </main>

      <!-- Footer -->
      <footer class="app-footer">
        <div class="footer-inner">
          <div>&copy; {{ currentYear }} Posta. Operated by Eurobase OÜ (Estonia).</div>
          <div class="footer-links">
            <a href="mailto:hello@getposta.app">Contact</a>
            <RouterLink to="/terms">Terms of Service</RouterLink>
            <RouterLink to="/privacy">Privacy Policy</RouterLink>
            <RouterLink to="/legal-notice">Legal Notice</RouterLink>
          </div>
        </div>
      </footer>
    </div>

    <LoginModal
      :show="authStore.showReauthModal"
      :is-reauth="true"
      @close="authStore.closeReauthModal()"
    />

    <ExpiredPlanModal :show="showExpiredPlanModal" @choose-plan="expiredModalDismissed = true" />

    <!-- Feedback FAB -->
    <button class="feedback-fab" @click="showFeedbackModal = true" aria-label="Send feedback" title="Send feedback">
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </button>

    <FeedbackModal
      :show="showFeedbackModal"
      @close="showFeedbackModal = false"
    />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  background: var(--ink-0);
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.6);
}

@media (min-width: 1024px) {
  .sidebar-backdrop {
    display: none;
  }
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 30;
  width: 232px;
  background: var(--ink-1);
  border-right: 1px solid var(--line);
  transform: translateX(-100%);
  transition: transform 0.18s ease;
}

.sidebar-open {
  transform: translateX(0);
}

@media (min-width: 1024px) {
  .sidebar {
    transform: translateX(0);
  }
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-logo {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--line);
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
  text-decoration: none;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow-y: auto;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--fg-2);
  text-decoration: none;
}

.nav-item:hover {
  background: var(--ink-2);
  color: var(--text);
}

.nav-item-active {
  background: var(--ink-2);
  color: var(--text);
}

.nav-item-active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: var(--signal);
}

.nav-item-active .nav-icon {
  color: var(--signal);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: var(--fg-3);
}

.nav-item:hover .nav-icon {
  color: var(--fg-2);
}

.icon {
  width: 18px;
  height: 18px;
}

/* User section */
.sidebar-user {
  padding: 14px 12px;
  border-top: 1px solid var(--line);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background: var(--ink-3);
  border: 1px solid var(--line-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  text-transform: uppercase;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-plan {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
  text-transform: lowercase;
}

.trial-days {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--signal);
  margin-top: 1px;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--fg-2);
  background: none;
  border: 1px solid transparent;
  cursor: pointer;
}

.logout-btn:hover {
  border-color: var(--line);
  color: var(--text);
}

.logout-btn .icon {
  width: 16px;
  height: 16px;
}

/* Main wrapper */
.main-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

@media (min-width: 1024px) {
  .main-wrapper {
    margin-left: 232px;
  }
}

/* Topbar */
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 56px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--ink-0);
  border-bottom: 1px solid var(--line);
}

@media (min-width: 1024px) {
  .topbar {
    padding: 0 28px;
  }
}

.topbar .btn-primary {
  padding: 7px 14px;
  font-size: 13px;
}

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: none;
  border: 1px solid var(--line);
  color: var(--fg-2);
  cursor: pointer;
}

.menu-btn:hover {
  border-color: var(--line-strong);
  color: var(--text);
}

@media (min-width: 1024px) {
  .menu-btn {
    display: none;
  }
}

.topbar-spacer {
  flex: 1;
}

/* Trial banner */
.trial-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 9px 16px;
  background: var(--signal-soft);
  border-bottom: 1px solid var(--line);
  font-size: 13px;
  color: var(--text);
}

.trial-banner-link {
  color: var(--signal);
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.trial-banner-close {
  background: none;
  border: none;
  color: var(--fg-2);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
}

.trial-banner-close:hover {
  color: var(--text);
}

/* Main content */
.main-content {
  flex: 1;
  padding: 24px 16px;
}

@media (min-width: 1024px) {
  .main-content {
    padding: 32px 28px;
  }
}

/* Footer */
.app-footer {
  border-top: 1px solid var(--line);
  margin-top: auto;
}

.footer-inner {
  padding: 14px 16px 18px;
  font-size: 12px;
  color: var(--fg-3);
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

@media (min-width: 1024px) {
  .footer-inner {
    padding: 14px 76px 18px 28px;
  }
}

.footer-links {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.footer-links a {
  color: var(--fg-3);
  text-decoration: none;
}

.footer-links a:hover {
  color: var(--text);
}

/* Feedback button */
.feedback-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 15;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--ink-2);
  border: 1px solid var(--line-strong);
  color: var(--fg-2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.feedback-fab:hover {
  border-color: var(--signal);
  color: var(--text);
}

@media (max-width: 640px) {
  .feedback-fab {
    bottom: 14px;
    right: 14px;
  }
}
</style>
