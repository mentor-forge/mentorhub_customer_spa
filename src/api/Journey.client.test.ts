import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api } from './client'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Client - Journey Endpoints', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
    localStorage.setItem('access_token', 'test-token')
  })

  it('should get all journeys', async () => {
    const mockJourneys = [
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-journey',
        description: 'Test description',
        status: 'active'
      }
    ]

    const mockResponse = {
      items: mockJourneys,
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

    const result = await api.getJourneys()

    expect(result).toEqual(mockResponse)
  })

  it('should get journeys with name query', async () => {
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

    await api.getJourneys({ name: 'test' })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/journey?name=test',
      expect.any(Object)
    )
  })

  it('should get a single journey', async () => {
    const mockJourney = {
      _id: '507f1f77bcf86cd799439011',
      name: 'test-journey'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockJourney
    })

    const result = await api.getJourney('507f1f77bcf86cd799439011')

    expect(result).toEqual(mockJourney)
  })
})