import edge from 'edge.js'
import env from '#start/env'
import { join } from 'node:path'
import app from '@adonisjs/core/services/app'

/**
 * Configure Edge.js for template processing
 */

// Mount views directory
const viewsPath = app.makePath('resources/views')
console.log('Mounting views path in preload:', viewsPath)
edge.mount(viewsPath)

// Configure Edge options
edge.configure({
  cache: env.get('NODE_ENV') === 'production',
})

// Add global variables
edge.global('appUrl', (path: string) => {
  return `${env.get('APP_URL', 'http://localhost:3333')}${path}`
})

// Add helper functions
edge.global('formatCurrency', (amount: number) => `$${amount.toFixed(2)}`)
edge.global('formatDate', (date: string | Date) => new Date(date).toLocaleDateString())
edge.global('calculateDiscount', (original: number, sale: number) => Math.round((1 - sale / original) * 100))
edge.global('truncate', (text: string, length = 100) => text.length > length ? text.substring(0, length) + '...' : text)
edge.global('currentYear', () => new Date().getFullYear())

// Add route helper
edge.global('route', (name: string, params = {}) => {
  // Simple implementation - in a real app, this would use a router
  return `/${name.replace('.', '/')}`
})

// Add CSRF helpers
edge.global('csrfField', () => '<input type="hidden" name="_csrf" value="test-csrf-token">')
edge.global('csrfMeta', () => '<meta name="csrf-token" content="test-csrf-token">')

// Add multi-merchant helpers
edge.global('isMerchant', (user: any) => user && user.userType === 'merchant')
edge.global('isAdmin', (user: any) => user && user.userType === 'admin')
edge.global('isCustomer', (user: any) => user && user.userType === 'customer')

// Add merchant-specific helpers
edge.global('merchantDashboardUrl', (merchantId: number) => `/merchant/${merchantId}/dashboard`)
edge.global('merchantProductsUrl', (merchantId: number) => `/merchant/${merchantId}/products`)
edge.global('merchantOrdersUrl', (merchantId: number) => `/merchant/${merchantId}/orders`)

console.log('Edge.js configured successfully in preload file')
