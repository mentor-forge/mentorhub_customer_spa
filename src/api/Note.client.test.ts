import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api } from './client'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Client - Note Endpoints', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
    localStorage.setItem('access_token', 'test-token')
  })

  it('should get a single note', async () => {
    const mockNote = {
      _id: '507f1f77bcf86cd799439011',
      name: 'test-note'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockNote
    })

    const result = await api.getNote('507f1f77bcf86cd799439011')

    expect(result).toEqual(mockNote)
  })
})