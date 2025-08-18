import { ApplicationService } from '@adonisjs/core/types'
import { Edge } from 'edge.js'
import viewConfig from '#config/view'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

export default class ViewProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register the view service
   */
  register() {
    // Create a new Edge instance
    const edge = new Edge()
    
    // Register view paths from config
    for (const viewPath of viewConfig.viewsPath) {
      console.log('Mounting views path:', viewPath)
      console.log('Views path exists:', existsSync(viewPath))
      edge.mount(viewPath)
    }
    
    // Add global variables
    edge.global('appUrl', (path: string) => {
      return `${process.env.APP_URL || ''}${path}`
    })
    
    // Add current year helper
    edge.global('currentYear', () => new Date().getFullYear())

    // Add helper functions
    edge.global('formatCurrency', (amount: number) => `$${amount.toFixed(2)}`)
    edge.global('formatDate', (date: string | Date) => new Date(date).toLocaleDateString())
    edge.global('calculateDiscount', (original: number, sale: number) => Math.round((1 - sale / original) * 100))
    edge.global('truncate', (text: string, length = 100) => text.length > length ? text.substring(0, length) + '...' : text)
    
    // Add auth helper (mock for now)
    edge.global('auth', {
      isAuthenticated: true,
      user: {
        id: 1,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        userType: 'customer'
      }
    })
    
    // Add flash messages helper
    edge.global('flashMessages', {
      has: (key: string) => false,
      get: (key: string) => ''
    })
    
    // Register the Edge instance as a singleton
    this.app['container'].singleton('view', () => edge)
  }

  /**
   * The boot method is called after all providers have been registered
   */
  async boot() {
    // No need to resolve the view here since we've already configured it in register
  }
}
