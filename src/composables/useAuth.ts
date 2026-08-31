/**
 * Core auth state lives in spa_utils. This module re-exports that contract and adds
 * Customer-journey claim readers used by CustomerEditPage / ProfilePage.
 *
 * `getStoredClaim` / `getStoredCustomerId` / `getStoredProfileId` are local until a second
 * journey SPA needs them — then harvest into spa_utils (spa_utils already decodes JWT for
 * PageFrame customer_name display, but does not yet expose generic claim helpers).
 */
export {
  useAuth,
  syncAuthFromStorage,
  getStoredRoles,
  hasStoredRole,
} from '@mentor-forge/mentorhub_spa_utils'

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
