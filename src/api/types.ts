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
  display_name: string
  description?: string
  status?: string
}

export interface ProfileUpdate {
  display_name?: string
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
