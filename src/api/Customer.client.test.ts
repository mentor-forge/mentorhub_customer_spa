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

  it('should get all customers', async () => {
    const mockCustomers = [
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-customer',
        description: 'Test description',
        status: 'active'
      }
    ]

    const mockResponse = {
      items: mockCustomers,
      limit: 20,
      has_more: false,
      next_cursor: null
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockResponse
    })

    const result = await api.getCustomers()

    expect(result).toEqual(mockResponse)
  })

  it('should get customers with name query', async () => {
    const mockResponse = {
      items: [],
      limit: 20,
      has_more: false,
      next_cursor: null
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockResponse
    })

    await api.getCustomers({ name: 'test' })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/customer?name=test',
      expect.any(Object)
    )
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