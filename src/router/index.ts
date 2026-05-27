import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { isSignupEnabled } from '@/config/featureFlags'

const routes: RouteRecordRaw[] = [
  // Public routes
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('@/views/legal/TermsView.vue'),
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('@/views/legal/PrivacyView.vue'),
  },
  {
    path: '/impressum',
    name: 'impressum',
    component: () => import('@/views/legal/ImpressumView.vue'),
  },
  // SEO landing pages
  {
    path: '/social-media-scheduler',
    name: 'social-media-scheduler',
    component: () => import('@/views/seo/SocialMediaSchedulerView.vue'),
  },
  {
    path: '/instagram-scheduler',
    name: 'instagram-scheduler',
    component: () => import('@/views/seo/InstagramSchedulerView.vue'),
  },
  {
    path: '/tiktok-scheduler',
    name: 'tiktok-scheduler',
    component: () => import('@/views/seo/TikTokSchedulerView.vue'),
  },
  {
    path: '/auto-post-social-media',
    name: 'auto-post-social-media',
    component: () => import('@/views/seo/AutoPostView.vue'),
  },
  {
    path: '/social-media-tools',
    name: 'social-media-tools',
    component: () => import('@/views/seo/SocialMediaToolsView.vue'),
  },
  {
    path: '/cli-social-media-posting',
    name: 'cli-social-media-posting',
    component: () => import('@/views/seo/CliPostingView.vue'),
  },
  {
    path: '/bluesky-scheduler',
    name: 'bluesky-scheduler',
    component: () => import('@/views/seo/BlueskySchedulerView.vue'),
  },
  {
    path: '/threads-scheduler',
    name: 'threads-scheduler',
    component: () => import('@/views/seo/ThreadsSchedulerView.vue'),
  },

  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('@/views/auth/SignupView.vue'),
    meta: { guest: true },
    beforeEnter: () => {
      if (!isSignupEnabled()) {
        return { name: 'home' }
      }
      return true
    },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/auth/ForgotPasswordView.vue'),
    meta: { guest: true },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('@/views/auth/ResetPasswordView.vue'),
    meta: { guest: true },
  },

  // Protected routes (app)
  {
    path: '/app',
    component: () => import('@/views/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
      },
      {
        path: 'posts',
        name: 'posts',
        component: () => import('@/views/posts/PostsView.vue'),
      },
      {
        path: 'posts/new',
        name: 'new-post',
        component: () => import('@/views/posts/CreatePostView.vue'),
      },
      {
        path: 'posts/:id',
        name: 'post-detail',
        component: () => import('@/views/posts/PostDetailView.vue'),
        props: true,
      },
      {
        path: 'posts/:id/edit',
        name: 'edit-post',
        component: () => import('@/views/posts/CreatePostView.vue'),
        props: true,
      },
      {
        path: 'calendar',
        name: 'calendar',
        component: () => import('@/views/calendar/CalendarView.vue'),
      },
      {
        path: 'media',
        name: 'media',
        component: () => import('@/views/media/MediaView.vue'),
      },
      {
        path: 'accounts',
        name: 'accounts',
        component: () => import('@/views/accounts/AccountsView.vue'),
      },
      {
        path: 'accounts/connect',
        name: 'connect-account',
        component: () => import('@/views/accounts/ConnectAccountView.vue'),
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/settings/SettingsView.vue'),
      },
      {
        path: 'settings/webhooks',
        name: 'webhooks',
        component: () => import('@/views/settings/WebhooksView.vue'),
      },
      {
        path: 'billing',
        name: 'billing',
        component: () => import('@/views/billing/BillingView.vue'),
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: () => import('@/views/analytics/AnalyticsView.vue'),
      },
    ],
  },

  // OAuth callbacks
  {
    path: '/oauth/callback',
    name: 'oauth-callback',
    component: () => import('@/views/auth/OAuthCallbackView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/auth/google/callback',
    name: 'google-callback',
    component: () => import('@/views/auth/GoogleCallbackView.vue'),
  },

  // Onboarding (requires auth but separate from main app)
  {
    path: '/app/onboarding',
    name: 'onboarding',
    component: () => import('@/views/onboarding/OnboardingView.vue'),
    meta: { requiresAuth: true, isOnboarding: true },
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

// Cache for onboarding status to avoid repeated API calls
let onboardingStatus: { checked: boolean; completed: boolean } = { checked: false, completed: false }

// Navigation guard for authentication and onboarding
router.beforeEach(async (to, _from, next) => {
  const accessToken = localStorage.getItem('access_token')
  const isAuthenticated = !!accessToken

  // Reset onboarding cache on logout
  if (!isAuthenticated) {
    onboardingStatus = { checked: false, completed: false }
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // For guest routes (login/signup), only redirect if user is truly authenticated
  // Don't redirect based on stale tokens - validate first
  if (to.meta.guest && isAuthenticated) {
    // Validate the token before redirecting
    try {
      const { userService } = await import('@/services')
      await userService.getProfile()
      // Token is valid - redirect to dashboard
      next({ name: 'dashboard' })
      return
    } catch {
      // Token is invalid - clear it and let user access the auth page
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      onboardingStatus = { checked: false, completed: false }
      // Continue to the guest page
    }
  }

  // Check onboarding status for authenticated users going to protected routes
  if (isAuthenticated && to.meta.requiresAuth && !to.meta.isOnboarding) {
    // Only check once per session
    if (!onboardingStatus.checked) {
      try {
        const { userService } = await import('@/services')
        const profile = await userService.getProfile()
        onboardingStatus = { checked: true, completed: profile.onboarding_completed }
      } catch {
        // If we can't fetch profile, assume onboarding is complete to avoid blocking
        onboardingStatus = { checked: true, completed: true }
      }
    }

    // Redirect to onboarding if not completed
    if (!onboardingStatus.completed) {
      next({ name: 'onboarding' })
      return
    }
  }

  // If user completed onboarding and tries to access onboarding page, redirect to dashboard
  if (to.meta.isOnboarding && onboardingStatus.checked && onboardingStatus.completed) {
    next({ name: 'dashboard' })
    return
  }

  next()
})

// Export function to reset onboarding status (call after completing onboarding)
export const resetOnboardingStatus = () => {
  onboardingStatus = { checked: true, completed: true }
}

export default router
