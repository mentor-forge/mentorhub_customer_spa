import type { 
  Subscription,
  SubscriptionInput,
  SubscriptionUpdate,

  Dashboard,
  DashboardInput,
  DashboardUpdate,

  Card,
  CardInput,
  CardUpdate,

  Event,
  EventInput,

  Profile,

  Customer,

  Journey,

  Rating,

  Note,

  ConfigResponse,
  Error,
  InfiniteScrollParams,
  InfiniteScrollResponse
} from './types'
import { redirectToIdpLogin } from '@mentor-forge/mentorhub_spa_utils'

const API_BASE = '/api'

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Error
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('access_token')
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let errorData: Error | null = null
    try {
      errorData = await response.json()
    } catch {
      // Ignore JSON parse errors
    }
    
    // Handle 401 Unauthorized - clear invalid token and redirect to IdP login
    if (response.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('token_expires_at')
      redirectToIdpLogin()
    }
    
    throw new ApiError(
      errorData?.error || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData || undefined
    )
  }

  // Handle empty responses
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T
  }

  return response.json()
}

export const api = {
  // Config
  async getConfig(): Promise<ConfigResponse> {
    return request<ConfigResponse>('/config')
  },

  // Control endpoints
  // 🎯 API methods use InfiniteScrollParams and InfiniteScrollResponse types
  // Shapes used by spa_utils useInfiniteScroll

  async getSubscriptions(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Subscription>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Subscription>>(`/subscription${query ? `?${query}` : ''}`)
  },

  async getSubscription(subscriptionId: string): Promise<Subscription> {
    return request<Subscription>(`/subscription/${subscriptionId}`)
  },

  async createSubscription(data: SubscriptionInput): Promise<{ _id: string }> {
    return request<{ _id: string }>('/subscription', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateSubscription(subscriptionId: string, data: SubscriptionUpdate): Promise<Subscription> {
    return request<Subscription>(`/subscription/${subscriptionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },


  async getDashboards(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Dashboard>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Dashboard>>(`/dashboard${query ? `?${query}` : ''}`)
  },

  async getDashboard(dashboardId: string): Promise<Dashboard> {
    return request<Dashboard>(`/dashboard/${dashboardId}`)
  },

  async createDashboard(data: DashboardInput): Promise<{ _id: string }> {
    return request<{ _id: string }>('/dashboard', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateDashboard(dashboardId: string, data: DashboardUpdate): Promise<Dashboard> {
    return request<Dashboard>(`/dashboard/${dashboardId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },


  async getCards(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Card>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Card>>(`/card${query ? `?${query}` : ''}`)
  },

  async getCard(cardId: string): Promise<Card> {
    return request<Card>(`/card/${cardId}`)
  },

  async createCard(data: CardInput): Promise<{ _id: string }> {
    return request<{ _id: string }>('/card', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateCard(cardId: string, data: CardUpdate): Promise<Card> {
    return request<Card>(`/card/${cardId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },



  // Create endpoints

  async getEvents(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Event>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Event>>(`/event${query ? `?${query}` : ''}`)
  },

  async getEvent(eventId: string): Promise<Event> {
    return request<Event>(`/event/${eventId}`)
  },

  async createEvent(data: EventInput): Promise<{ _id: string }> {
    return request<{ _id: string }>('/event', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },



  // Consume endpoints

  async getProfiles(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Profile>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Profile>>(`/profile${query ? `?${query}` : ''}`)
  },

  async getProfile(profileId: string): Promise<Profile> {
    return request<Profile>(`/profile/${profileId}`)
  },


  async getCustomers(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Customer>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Customer>>(`/customer${query ? `?${query}` : ''}`)
  },

  async getCustomer(customerId: string): Promise<Customer> {
    return request<Customer>(`/customer/${customerId}`)
  },


  async getJourneys(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Journey>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Journey>>(`/journey${query ? `?${query}` : ''}`)
  },

  async getJourney(journeyId: string): Promise<Journey> {
    return request<Journey>(`/journey/${journeyId}`)
  },


  async getRatings(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Rating>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Rating>>(`/rating${query ? `?${query}` : ''}`)
  },

  async getRating(ratingId: string): Promise<Rating> {
    return request<Rating>(`/rating/${ratingId}`)
  },


  async getNotes(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Note>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Note>>(`/note${query ? `?${query}` : ''}`)
  },

  async getNote(noteId: string): Promise<Note> {
    return request<Note>(`/note/${noteId}`)
  },


}

export { ApiError }
