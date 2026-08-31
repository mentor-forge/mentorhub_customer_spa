import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api } from './client'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Client - Customer Endpoints', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
    localStorage.setItem('access_token', 'test-token')
  })

  it('should get a single customer', async () => {
    const mockCustomer = {
      _id: '507f1f77bcf86cd799439011',
      name: 'test-customer'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockCustomer
    })

    const result = await api.getCustomer('507f1f77bcf86cd799439011')

    expect(result).toEqual(mockCustomer)
  })
})