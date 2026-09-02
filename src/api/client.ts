import type { 
  Event,
  EventInput,

  Profile,
  ProfileUpdate,

  Customer,

  ConfigResponse,
  Error
} from './types'
import { redirectToIdpLogin } from '@mentor-forge/mentorhub_spa_utils'

const API_BASE = `${import.meta.env.BASE_URL}api`

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

  // Event Domain
  async getEvent(eventId: string): Promise<Event> {
    return request<Event>(`/event/${eventId}`)
  },

  async createEvent(data: EventInput): Promise<{ _id: string }> {
    return request<{ _id: string }>('/event', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Profile Domain
  async getProfile(profileId: string): Promise<Profile> {
    return request<Profile>(`/profile/${profileId}`)
  },

  async updateProfile(profileId: string, data: ProfileUpdate): Promise<Profile> {
    return request<Profile>(`/profile/${profileId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  // Customer Domain
  async getCustomer(customerId: string): Promise<Customer> {
    return request<Customer>(`/customer/${customerId}`)
  },
}

export { ApiError }
