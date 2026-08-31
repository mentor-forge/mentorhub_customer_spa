import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api } from './client'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Client - Profile Endpoints', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
    localStorage.setItem('access_token', 'test-token')
  })

  it('should update a profile', async () => {
    const mockProfile = {
      _id: '507f1f77bcf86cd799439011',
      name: 'updated-profile',
      description: 'Updated description'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockProfile
    })

    const result = await api.updateProfile('507f1f77bcf86cd799439011', { name: 'updated-profile' })

    expect(result).toEqual(mockProfile)
    expect(mockFetch).toHaveBeenCalledWith(
      '/customer/api/profile/507f1f77bcf86cd799439011',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ name: 'updated-profile' })
      })
    )
  })

  it('should get a single profile', async () => {
    const mockProfile = {
      _id: '507f1f77bcf86cd799439011',
      name: 'test-profile'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockProfile
    })

    const result = await api.getProfile('507f1f77bcf86cd799439011')

    expect(result).toEqual(mockProfile)
  })
})