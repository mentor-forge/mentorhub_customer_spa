// Type definitions based on OpenAPI spec

export interface Error {
  error: string
}

export interface Breadcrumb {
  from_ip: string
  by_user: string
  at_time: string
  correlation_id: string
}


// Subscription Domain
export interface Subscription {
  _id: string
  name: string
  description?: string
  status?: 'active' | 'archived'
  created: Breadcrumb
  saved: Breadcrumb
}

export interface SubscriptionInput {
  name: string
  description?: string
  status?: 'active' | 'archived'
}

export interface SubscriptionUpdate {
  name?: string
  description?: string
  status?: 'active' | 'archived'
}

// Dashboard Domain
export interface Dashboard {
  _id: string
  name: string
  description?: string
  status?: 'active' | 'archived'
  created: Breadcrumb
  saved: Breadcrumb
}

export interface DashboardInput {
  name: string
  description?: string
  status?: 'active' | 'archived'
}

export interface DashboardUpdate {
  name?: string
  description?: string
  status?: 'active' | 'archived'
}


// Event Domain
export interface Event {
  _id: string
  name: string
  description?: string
  status?: string
  created: Breadcrumb
}

export interface EventInput {
  name: string
  description?: string
  status?: string
}


// Profile Domain
export interface Profile {
  _id: string
  name: string
  description?: string
  status?: string
}

// Customer Domain
export interface Customer {
  _id: string
  name: string
  description?: string
  status?: string
}


// Configuration
export interface ConfigResponse {
  config_items: unknown[]
  versions: unknown[]
  enumerators: unknown[]
  token?: {
    claims?: Record<string, unknown>
  }
}

// Infinite Scroll
export interface InfiniteScrollParams {
  name?: string
  after_id?: string
  limit?: number
  sort_by?: string
  order?: 'asc' | 'desc'
}

export interface InfiniteScrollResponse<T> {
  items: T[]
  limit: number
  has_more: boolean
  next_cursor: string | null
}
