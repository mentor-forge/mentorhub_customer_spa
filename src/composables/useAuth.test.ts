import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('JWT claim readers (Customer-local; harvest candidate)', () => {
  function makeJwt(payload: Record<string, unknown>): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const body = btoa(JSON.stringify(payload))
    return `${header}.${body}.signature`
  }

  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  it('should return undefined when no access token stored', async () => {
    const { getStoredClaim, getStoredCustomerId, getStoredProfileId } = await import('./useAuth')
    expect(getStoredClaim('customer_id')).toBeUndefined()
    expect(getStoredCustomerId()).toBeUndefined()
    expect(getStoredProfileId()).toBeUndefined()
  })

  it('should return undefined when token is malformed', async () => {
    localStorage.setItem('access_token', 'invalid-token')
    const { getStoredClaim, getStoredCustomerId, getStoredProfileId } = await import('./useAuth')
    expect(getStoredClaim('customer_id')).toBeUndefined()
    expect(getStoredCustomerId()).toBeUndefined()
    expect(getStoredProfileId()).toBeUndefined()
  })

  it('should read standard customer_id and profile_id claims', async () => {
    const token = makeJwt({ customer_id: 'cust-123', profile_id: 'prof-456' })
    localStorage.setItem('access_token', token)
    const { getStoredClaim, getStoredCustomerId, getStoredProfileId } = await import('./useAuth')
    expect(getStoredClaim('customer_id')).toBe('cust-123')
    expect(getStoredCustomerId()).toBe('cust-123')
    expect(getStoredProfileId()).toBe('prof-456')
  })

  it('should read custom: prefixed claims as fallback', async () => {
    const token = makeJwt({
      'custom:customer_id': 'cust-custom-123',
      'custom:profile_id': 'prof-custom-456',
    })
    localStorage.setItem('access_token', token)
    const { getStoredClaim, getStoredCustomerId, getStoredProfileId } = await import('./useAuth')
    expect(getStoredClaim('customer_id')).toBe('cust-custom-123')
    expect(getStoredCustomerId()).toBe('cust-custom-123')
    expect(getStoredProfileId()).toBe('prof-custom-456')
  })

  it('should treat blank customer_id and profile_id as missing', async () => {
    const token = makeJwt({ customer_id: '   ', profile_id: '' })
    localStorage.setItem('access_token', token)
    const { getStoredCustomerId, getStoredProfileId } = await import('./useAuth')
    expect(getStoredCustomerId()).toBeUndefined()
    expect(getStoredProfileId()).toBeUndefined()
  })

  it('re-exports spa_utils auth helpers without a competing local auth store', async () => {
    const local = await import('./useAuth')
    const shared = await import('@mentor-forge/mentorhub_spa_utils')
    expect(local.useAuth).toBe(shared.useAuth)
    expect(local.syncAuthFromStorage).toBe(shared.syncAuthFromStorage)
    expect(local.getStoredRoles).toBe(shared.getStoredRoles)
    expect(local.hasStoredRole).toBe(shared.hasStoredRole)
  })
})
