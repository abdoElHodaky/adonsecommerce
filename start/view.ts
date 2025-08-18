import edge from 'edge.js'

// Add global variables
edge.global('appUrl', (path: string) => {
  return `${process.env.APP_URL || ''}${path}`
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
