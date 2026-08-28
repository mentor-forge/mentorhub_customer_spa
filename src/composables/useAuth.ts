import { ref, computed } from 'vue'

const accessToken = ref<string | null>(null)
const tokenExpiresAt = ref<string | null>(null)
const roles = ref<string[]>([])

export function syncAuthFromStorage(): void {
  accessToken.value = localStorage.getItem('access_token')
  tokenExpiresAt.value = localStorage.getItem('token_expires_at')
  const storedRoles = localStorage.getItem('user_roles')
  roles.value = storedRoles ? JSON.parse(storedRoles) : []
}

syncAuthFromStorage()

export function useAuth() {
  syncAuthFromStorage()
  const isAuthenticated = computed(() => {
    if (!accessToken.value || !tokenExpiresAt.value) {
      return false
    }
    const expiresAt = new Date(tokenExpiresAt.value)
    return expiresAt > new Date()
  })

  function logout() {
    accessToken.value = null
    tokenExpiresAt.value = null
    roles.value = []
    localStorage.removeItem('access_token')
    localStorage.removeItem('token_expires_at')
    localStorage.removeItem('user_roles')
  }

  return {
    isAuthenticated,
    roles: computed(() => roles.value),
    logout,
  }
}

export function getStoredRoles(): string[] {
  const stored = localStorage.getItem('user_roles')
  return stored ? JSON.parse(stored) : []
}

export function hasStoredRole(role: string): boolean {
  return getStoredRoles().includes(role)
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length < 2 || !parts[1]) {
    return null
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json = atob(padded)
    const parsed = JSON.parse(json)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export function getStoredClaim(claimName: string): unknown {
  const token = localStorage.getItem('access_token')
  if (!token) return undefined
  const payload = decodeJwtPayload(token)
  if (!payload) return undefined
  return payload[claimName] ?? payload[`custom:${claimName}`]
}

export function getStoredCustomerId(): string | undefined {
  const claim = getStoredClaim('customer_id')
  return typeof claim === 'string' && claim.trim() ? claim.trim() : undefined
}

export function getStoredProfileId(): string | undefined {
  const claim = getStoredClaim('profile_id')
  return typeof claim === 'string' && claim.trim() ? claim.trim() : undefined
}

