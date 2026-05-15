import { createRouter, createWebHistory } from 'vue-router'
import { useAuth, hasStoredRole } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/subscriptions'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { requiresAuth: false }
    },
    
    // Control domain: Subscription
    {
      path: '/subscriptions',
      name: 'Subscriptions',
      component: () => import('@/pages/SubscriptionsListPage.vue'),
      meta: { requiresAuth: true }
    },
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
      path: '/dashboards',
      name: 'Dashboards',
      component: () => import('@/pages/DashboardsListPage.vue'),
      meta: { requiresAuth: true }
    },
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
    
    
    // Create domain: Event
    {
      path: '/events',
      name: 'Events',
      component: () => import('@/pages/EventsListPage.vue'),
      meta: { requiresAuth: true }
    },
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
    
    
    // Consume domain: Profile
    {
      path: '/profiles',
      name: 'Profiles',
      component: () => import('@/pages/ProfilesListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profiles/:id',
      name: 'ProfileView',
      component: () => import('@/pages/ProfileViewPage.vue'),
      meta: { requiresAuth: true }
    },
    
    // Consume domain: Customer
    {
      path: '/customers',
      name: 'Customers',
      component: () => import('@/pages/CustomersListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/customers/:id',
      name: 'CustomerView',
      component: () => import('@/pages/CustomerViewPage.vue'),
      meta: { requiresAuth: true }
    },
    
    // Admin route
    {
      path: '/admin',
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
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  // Check role-based authorization
  const requiredRole = to.meta.requiresRole as string | undefined
  if (requiredRole && !hasStoredRole(requiredRole)) {
    // Redirect to default page if user doesn't have required role
    next({ name: 'Subscriptions' })
    return
  }
  
  next()
})

router.afterEach((to) => {
  document.title = to.path === '/login' ? 'Mentor Hub Login' : 'Customer'
})

export default router