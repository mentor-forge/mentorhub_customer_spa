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

  it('should get all notes', async () => {
    const mockNotes = [
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-note',
        description: 'Test description',
        status: 'active'
      }
    ]

    const mockResponse = {
      items: mockNotes,
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

    const result = await api.getNotes()

    expect(result).toEqual(mockResponse)
  })

  it('should get notes with name query', async () => {
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

    await api.getNotes({ name: 'test' })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/note?name=test',
      expect.any(Object)
    )
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