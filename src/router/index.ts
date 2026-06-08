import { createRouter, createWebHistory } from 'vue-router'
import { useAuth, hasStoredRole } from '@/composables/useAuth'
import { redirectToIdpLogin } from '@mentor-forge/mentorhub_spa_utils'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/subscriptions'
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
    
    // Control domain: Card
    {
      path: '/cards',
      name: 'Cards',
      component: () => import('@/pages/CardsListPage.vue'),
      meta: { requiresAuth: true }
    },
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
    
    // Consume domain: Journey
    {
      path: '/journeys',
      name: 'Journeys',
      component: () => import('@/pages/JourneysListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/journeys/:id',
      name: 'JourneyView',
      component: () => import('@/pages/JourneyViewPage.vue'),
      meta: { requiresAuth: true }
    },
    
    // Consume domain: Rating
    {
      path: '/ratings',
      name: 'Ratings',
      component: () => import('@/pages/RatingsListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/ratings/:id',
      name: 'RatingView',
      component: () => import('@/pages/RatingViewPage.vue'),
      meta: { requiresAuth: true }
    },
    
    // Consume domain: Note
    {
      path: '/notes',
      name: 'Notes',
      component: () => import('@/pages/NotesListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/notes/:id',
      name: 'NoteView',
      component: () => import('@/pages/NoteViewPage.vue'),
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
    redirectToIdpLogin(window.location.origin + to.fullPath)
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

router.afterEach(() => {
  document.title = 'Customer'
})

export default router