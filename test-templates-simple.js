/**
 * Simple Template Test Script
 * 
 * This script tests the rendering of specific Edge.js templates
 * without requiring the full AdonisJS environment.
 */

import { Edge } from 'edge.js'
import { join } from 'node:path'
import { existsSync, writeFileSync, mkdirSync } from 'node:fs'

// Setup Edge.js
const edge = new Edge()

// Debug current directory
console.log('Current directory:', process.cwd())

// Mount the views directory
const viewsPath = join(process.cwd(), 'resources', 'views')
console.log('Views path:', viewsPath)
console.log('Views path exists:', existsSync(viewsPath))

edge.mount(viewsPath)

// Register globals for testing
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

edge.global('flashMessages', {
  has: (key) => false,
  get: (key) => ''
})

edge.global('cart', {
  items: []
})

// Add helper functions
edge.global('formatCurrency', (amount) => `$${amount.toFixed(2)}`)
edge.global('formatDate', (date) => new Date(date).toLocaleDateString())
edge.global('calculateDiscount', (original, sale) => Math.round((1 - sale / original) * 100))
edge.global('truncate', (text, length = 100) => text.length > length ? text.substring(0, length) + '...' : text)
edge.global('currentYear', () => new Date().getFullYear())

// Mock data for testing
const mockData = {
  title: 'Test Page',
  product: {
    id: 1,
    name: 'Test Product',
    slug: 'test-product',
    price: 99.99,
    compareAtPrice: 129.99,
    images: [],
    merchant: { storeName: 'Test Store', slug: 'test-store' }
  }
}

// Templates to test
const templates = [
  {
    name: 'Flash Messages Partial',
    path: 'partials/flash-messages',
    data: {}
  },
  {
    name: 'Header Partial',
    path: 'partials/header',
    data: {}
  },
  {
    name: 'Footer Partial',
    path: 'partials/footer',
    data: {}
  },
  {
    name: 'Helpers',
    path: 'helpers/index',
    data: {}
  },
  {
    name:"About",
    path:"about/index",
    data:{}
  }
]

// Create output directory
const outputDir = './test-output'
if (!existsSync(outputDir)) {
  mkdirSync(outputDir)
}

// Test each template
async function runTests() {
  console.log('🧪 Testing Edge.js Templates\n')
  
  let passed = 0
  let failed = 0
  
  for (const template of templates) {
    try {
      console.log(`Testing ${template.name}...`)
      const html = await edge.render(template.path, { ...mockData, ...template.data })
      
      // Write output to file
      const outputFile = join(outputDir, `${template.path.replace(/\//g, '-')}.html`)
      writeFileSync(outputFile, html)
      
      console.log(`✅ ${template.name} rendered successfully`)
      console.log(`   Output saved to ${outputFile}`)
      passed++
    } catch (error) {
      console.error(`❌ ${template.name} failed:`, error.message || error)
      failed++
    }
    console.log('')
  }
  
  console.log(`\nResults: ${passed} passed, ${failed} failed`)
  
  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch(error => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
