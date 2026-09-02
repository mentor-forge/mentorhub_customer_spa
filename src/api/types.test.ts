import { describe, it, expect } from 'vitest'
import type {
  Error,
  Breadcrumb,
  Event,
  EventInput,
  Customer,
  Profile,
  ProfileUpdate,
  ConfigResponse
} from './types'


describe('API Types', () => {
  describe('Error', () => {
    it('should match Error interface', () => {
      const error: Error = {
        error: 'Test error message'
      }
      
      expect(error.error).toBe('Test error message')
    })
  })

  describe('Breadcrumb', () => {
    it('should match Breadcrumb interface', () => {
      const breadcrumb: Breadcrumb = {
        from_ip: '192.168.1.1',
        by_user: 'user-123',
        at_time: '2024-01-01T00:00:00Z',
        correlation_id: 'corr-abc123'
      }
      
      expect(breadcrumb.from_ip).toBe('192.168.1.1')
      expect(breadcrumb.by_user).toBe('user-123')
      expect(breadcrumb.at_time).toBe('2024-01-01T00:00:00Z')
      expect(breadcrumb.correlation_id).toBe('corr-abc123')
    })
  })

  describe('Event', () => {
    it('should match Event interface', () => {
      const event: Event = {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-event',
        description: 'Test description',
        status: 'active',
        created: {
          from_ip: '192.168.1.1',
          by_user: 'user-123',
          at_time: '2024-01-01T00:00:00Z',
          correlation_id: 'corr-123'
        }
      }
      
      expect(event._id).toBe('507f1f77bcf86cd799439011')
      expect(event.name).toBe('test-event')
      expect(event.status).toBe('active')
    })
  })

  describe('EventInput', () => {
    it('should match EventInput interface', () => {
      const input: EventInput = {
        name: 'test-event',
        description: 'Test description',
        status: 'active'
      }
      
      expect(input.name).toBe('test-event')
      expect(input.description).toBe('Test description')
      expect(input.status).toBe('active')
    })
  })

  describe('Customer', () => {
    it('should match Customer interface', () => {
      const customer: Customer = {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-customer',
        description: 'Test description',
        status: 'active'
      }
      
      expect(customer._id).toBe('507f1f77bcf86cd799439011')
      expect(customer.name).toBe('test-customer')
      expect(customer.status).toBe('active')
    })
  })

  describe('Profile', () => {
    it('should match Profile interface', () => {
      const profile: Profile = {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-profile',
        description: 'Test description',
        status: 'active'
      }
      
      expect(profile._id).toBe('507f1f77bcf86cd799439011')
      expect(profile.name).toBe('test-profile')
      expect(profile.status).toBe('active')
    })
  })

  describe('ProfileUpdate', () => {
    it('should match ProfileUpdate interface', () => {
      const update: ProfileUpdate = {
        name: 'updated-profile',
        description: 'Updated description'
      }
      
      expect(update.name).toBe('updated-profile')
      expect(update.description).toBe('Updated description')
    })
  })

  describe('ConfigResponse', () => {
    it('should match ConfigResponse interface', () => {
      const config: ConfigResponse = {
        config_items: [],
        versions: [],
        enumerators: [],
        token: {
          claims: {
            sub: 'user-123',
            roles: ['admin']
          }
        }
      }
      
      expect(config.config_items).toEqual([])
      expect(config.versions).toEqual([])
      expect(config.enumerators).toEqual([])
      expect(config.token?.claims).toEqual({
        sub: 'user-123',
        roles: ['admin']
      })
    })

    it('should allow optional token field', () => {
      const config: ConfigResponse = {
        config_items: [],
        versions: [],
        enumerators: []
      }
      
      expect(config.token).toBeUndefined()
    })
  })
})
