import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

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

  // OAuth callback
  {
    path: '/oauth/callback',
    name: 'oauth-callback',
    component: () => import('@/views/auth/OAuthCallbackView.vue'),
    meta: { requiresAuth: true },
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
})

// Navigation guard for authentication
router.beforeEach((to, _from, next) => {
  const isAuthenticated = !!localStorage.getItem('access_token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.guest && isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
