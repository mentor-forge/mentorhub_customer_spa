import { createRouter, createWebHistory } from 'vue-router'
import { useAuth, hasStoredRole } from '@/composables/useAuth'
import {
  buildJourneyUrl,
  JOURNEY_APP_PATHS,
  redirectToIdpLogin,
} from '@mentor-forge/mentorhub_spa_utils'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Home / Customer
    {
      path: '/',
      name: 'CustomerEdit',
      component: () => import('@/pages/CustomerEditPage.vue'),
      meta: { requiresAuth: true }
    },
    
    // Profile
    {
      path: '/profile/',
      name: 'Profile',
      component: () => import('@/pages/ProfilePage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile/:id',
      name: 'ProfileDetail',
      component: () => import('@/pages/ProfilePage.vue'),
      meta: { requiresAuth: true }
    },

    // Admin / Config route
    {
      path: '/config',
      name: 'Admin',
      component: () => import('@/pages/AdminPage.vue'),
      meta: { requiresAuth: true, requiresRole: 'admin' }
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const { isAuthenticated } = useAuth()
  
  // Check authentication
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    const base = import.meta.env.BASE_URL
    const routePath = to.fullPath === '/' ? '' : to.fullPath.replace(/^\//, '')
    redirectToIdpLogin(`${window.location.origin}${base}${routePath}`)
    next(false)
    return
  }
  
  // Check role-based authorization
  const requiredRole = to.meta.requiresRole as string | undefined
  if (requiredRole && !hasStoredRole(requiredRole)) {
    // Leave SPA for Discovery journey home if user lacks required role
    window.location.replace(buildJourneyUrl(JOURNEY_APP_PATHS.home.journey, JOURNEY_APP_PATHS.home.path))
    next(false)
    return
  }
  
  next()
})

router.afterEach(() => {
  document.title = 'Customer'
})

export default router
