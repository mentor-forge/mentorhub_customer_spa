import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api } from './client'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Client - Rating Endpoints', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
    localStorage.setItem('access_token', 'test-token')
  })

  it('should get a single rating', async () => {
    const mockRating = {
      _id: '507f1f77bcf86cd799439011',
      name: 'test-rating'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockRating
    })

    const result = await api.getRating('507f1f77bcf86cd799439011')

    expect(result).toEqual(mockRating)
  })
})