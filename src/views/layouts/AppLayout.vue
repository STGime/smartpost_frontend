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
const currentYear = new Date().getFullYear()

const showExpiredPlanModal = computed(() => {
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
            <span class="logo-text">Posta</span>
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
                {{ userStore.plan?.plan?.type === 'trial' ? 'Starter' : (userStore.plan?.plan?.type || 'Free') }} plan
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

      <!-- Page content -->
      <main class="main-content">
        <RouterView />
      </main>

      <!-- Footer -->
      <footer class="app-footer">
        <div class="footer-inner">
          <div>&copy; {{ currentYear }} Posta. All rights reserved.</div>
          <div class="footer-links">
            <a href="mailto:hello@getposta.app">Contact</a>
            <RouterLink to="/terms">Terms of Service</RouterLink>
            <RouterLink to="/privacy">Privacy Policy</RouterLink>
            <RouterLink to="/impressum">Impressum</RouterLink>
          </div>
        </div>
      </footer>
    </div>

    <LoginModal
      :show="authStore.showReauthModal"
      :is-reauth="true"
      @close="authStore.closeReauthModal()"
    />

    <ExpiredPlanModal :show="showExpiredPlanModal" />

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
}

/* Sidebar backdrop for mobile */
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 20;
  backdrop-filter: blur(4px);
}

@media (min-width: 1024px) {
  .sidebar-backdrop {
    display: none;
  }
}

/* Sidebar */
.sidebar {
  position: fixed;
  inset-y: 0;
  left: 0;
  z-index: 30;
  width: 240px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(5, 8, 22, 1));
  border-right: 1px solid var(--border);
  transform: translateX(-100%);
  transition: transform 0.2s ease;
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

/* Logo */
.sidebar-logo {
  padding: 20px 16px;
  border-bottom: 1px solid var(--border);
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--muted);
  transition: all 0.15s ease;
}

.nav-item:hover {
  background: rgba(148, 163, 184, 0.08);
  color: var(--text);
}

.nav-item-active {
  background: var(--accent-soft);
  color: var(--text);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.icon {
  width: 20px;
  height: 20px;
}

/* User section */
.sidebar-user {
  padding: 16px;
  border-top: 1px solid var(--border);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--accent), var(--cyan));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-plan {
  font-size: 11px;
  color: var(--muted);
  text-transform: capitalize;
}

.trial-days {
  font-size: 10px;
  color: #fbbf24;
  margin-top: 1px;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.logout-btn:hover {
  background: var(--error-soft);
  color: #fca5a5;
}

.logout-btn .icon {
  width: 18px;
  height: 18px;
}

/* Main wrapper */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

@media (min-width: 1024px) {
  .main-wrapper {
    margin-left: 240px;
  }
}

/* Topbar */
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 60px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(5, 8, 22, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}

@media (min-width: 1024px) {
  .topbar {
    padding: 0 24px;
  }
}

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.menu-btn:hover {
  background: rgba(148, 163, 184, 0.1);
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

/* Main content */
.main-content {
  flex: 1;
  padding: 24px 16px;
}

@media (min-width: 1024px) {
  .main-content {
    padding: 32px 24px;
  }
}

/* Footer */
.app-footer {
  border-top: 1px solid var(--border);
  margin-top: auto;
  background: rgba(5, 8, 22, 0.6);
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px 24px;
  font-size: 11px;
  color: var(--muted);
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

@media (min-width: 1024px) {
  .footer-inner {
    padding: 16px 24px 24px;
  }
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

.footer-links a:hover {
  color: var(--text);
}

/* Feedback FAB */
.feedback-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 15;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid var(--border);
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.feedback-fab:hover {
  border-color: var(--accent);
  color: var(--text);
  background: rgba(79, 70, 229, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

@media (max-width: 640px) {
  .feedback-fab {
    bottom: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
  }
}
</style>
