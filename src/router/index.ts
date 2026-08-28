import { createRouter, createWebHistory } from 'vue-router'
import { useAuth, hasStoredRole } from '@/composables/useAuth'
import { redirectToIdpLogin } from '@mentor-forge/mentorhub_spa_utils'

const router = createRouter({
  history: createWebHistory(),
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

    // Control domain: Subscription
    {
      path: '/subscriptions/new',
      name: 'SubscriptionNew',
      component: () => import('@/pages/SubscriptionNewPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/subscriptions/:id',
      name: 'SubscriptionEdit',
      component: () => import('@/pages/SubscriptionEditPage.vue'),
      meta: { requiresAuth: true }
    },
    
    // Control domain: Dashboard
    {
      path: '/dashboards/new',
      name: 'DashboardNew',
      component: () => import('@/pages/DashboardNewPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboards/:id',
      name: 'DashboardEdit',
      component: () => import('@/pages/DashboardEditPage.vue'),
      meta: { requiresAuth: true }
    },
    
    // Control domain: Card
    {
      path: '/cards/new',
      name: 'CardNew',
      component: () => import('@/pages/CardNewPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/cards/:id',
      name: 'CardEdit',
      component: () => import('@/pages/CardEditPage.vue'),
      meta: { requiresAuth: true }
    },
    
    // Create domain: Event
    {
      path: '/events/new',
      name: 'EventNew',
      component: () => import('@/pages/EventNewPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/events/:id',
      name: 'EventView',
      component: () => import('@/pages/EventViewPage.vue'),
      meta: { requiresAuth: true }
    },
    
    // Consume domain: Journey
    {
      path: '/journeys/:id',
      name: 'JourneyView',
      component: () => import('@/pages/JourneyViewPage.vue'),
      meta: { requiresAuth: true }
    },
    
    // Consume domain: Rating
    {
      path: '/ratings/:id',
      name: 'RatingView',
      component: () => import('@/pages/RatingViewPage.vue'),
      meta: { requiresAuth: true }
    },
    
    // Consume domain: Note
    {
      path: '/notes/:id',
      name: 'NoteView',
      component: () => import('@/pages/NoteViewPage.vue'),
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
    redirectToIdpLogin(window.location.origin + to.fullPath)
    return
  }
  
  // Check role-based authorization
  const requiredRole = to.meta.requiresRole as string | undefined
  if (requiredRole && !hasStoredRole(requiredRole)) {
    // Redirect to default page if user doesn't have required role
    next({ name: 'CustomerEdit' })
    return
  }
  
  next()
})

router.afterEach(() => {
  document.title = 'Customer'
})

export default router