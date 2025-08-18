import { Edge } from 'edge.js'
import { join } from 'node:path'
import { existsSync, writeFileSync, mkdirSync } from 'node:fs'

/**
 * Test script for rendering full Edge.js pages with layout inheritance
 * 
 * This script tests the rendering of Edge.js templates with layout inheritance.
 * 
 * Usage:
 *   node test-full-page.js [template-path]
 * 
 * Examples:
 *   node test-full-page.js pages/about/index
 */

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

// Add missing AdonisJS globals
edge.global('route', (name, params) => `/${name.replace('.', '/')}`)
edge.global('asset', (path) => `/assets/${path}`)
edge.global('csrfField', () => '<input type="hidden" name="_csrf" value="test-csrf-token">')
edge.global('csrfMeta', () => '<meta name="csrf-token" content="test-csrf-token">')
edge.global('inspect', (value) => JSON.stringify(value, null, 2))
edge.global('component', (name, props) => `Component: ${name}`)
edge.global('include', (name, data) => {
  try {
    return edge.render(name, data)
  } catch (error) {
    console.error(`Error including ${name}:`, error.message)
    return `<!-- Error including ${name}: ${error.message} -->`
  }
})
edge.global('safe', (html) => html)

// Mock data for testing
const mockData = {
  title: 'Test Page',
  popularCategories: [
    { name: 'Electronics', slug: 'electronics', image: null },
    { name: 'Clothing', slug: 'clothing', image: null }
  ],
  featuredProducts: [
    {
      id: 1,
      name: 'Test Product',
      slug: 'test-product',
      price: 99.99,
      compareAtPrice: 129.99,
      images: [],
      merchant: { storeName: 'Test Store', slug: 'test-store' }
    }
  ],
  featuredMerchants: [
    {
      storeName: 'Test Store',
      slug: 'test-store',
      bannerImage: null,
      description: 'This is a test store description that should be long enough to test truncation.'
    }
  ]
}

/**
 * Process a template with layout inheritance
 * @param {string} templatePath - Path to the template to process
 */
async function processTemplate(templatePath) {
  try {
    console.log(`Processing template: ${templatePath}`)
    
    // Add template-specific mock data
    let templateData = { ...mockData }
    
    // Render the template
    const content = await edge.render(templatePath, templateData)
    
    // Extract layout information using regex
    const layoutMatch = content.match(/@layout\(['"](.+?)['"]\)/)
    if (!layoutMatch) {
      console.log('No layout directive found, returning content as-is')
      return content
    }
    
    const layoutPath = layoutMatch[1]
    console.log(`Found layout: ${layoutPath}`)
    
    // Extract sections using regex
    const sections = {}
    const sectionRegex = /@section\(['"](.+?)['"]\)([\s\S]*?)@end/g
    let match
    
    while ((match = sectionRegex.exec(content)) !== null) {
      const sectionName = match[1]
      const sectionContent = match[2]
      sections[sectionName] = sectionContent
      console.log(`Found section: ${sectionName}`)
    }
    
    // Create a custom Edge instance for the layout
    const layoutEdge = new Edge()
    layoutEdge.mount(viewsPath)
    
    // Register the same globals
    Object.keys(edge.globals).forEach(key => {
      layoutEdge.global(key, edge.globals[key])
    })
    
    // Register section helpers
    layoutEdge.global('section', (name) => {
      return sections[name] || ''
    })
    
    // Create layout data
    const layoutData = {
      ...templateData
    }
    
    // Render the layout with the sections
    let layoutContent = await layoutEdge.render(layoutPath, layoutData)
    
    // Replace section placeholders
    for (const [name, content] of Object.entries(sections)) {
      const sectionPlaceholder = `@!section('${name}')`
      layoutContent = layoutContent.replace(sectionPlaceholder, content)
    }
    
    return layoutContent
  } catch (error) {
    console.error(`Error processing template ${templatePath}:`, error.message || error)
    throw error
  }
}

/**
 * Main function
 */
async function main() {
  if (process.argv.length < 3) {
    console.error('Please provide a template path')
    process.exit(1)
  }
  
  const templatePath = process.argv[2]
  const normalizedPath = templatePath.replace(/^resources\/views\//, '').replace(/\.edge$/, '')
  
  try {
    console.log(`Testing full page rendering for: ${normalizedPath}`)
    const html = await processTemplate(normalizedPath)
    
    // Write the output to a file for inspection
    const outputDir = join(process.cwd(), 'test-output')
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true })
    }
    
    const outputPath = join(outputDir, `full-page-${normalizedPath.replace(/\//g, '-')}.html`)
    writeFileSync(outputPath, html)
    console.log(`Output saved to ${outputPath}`)
    
    console.log('✅ Page rendered successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error rendering page:', error.message || error)
    process.exit(1)
  }
}

main().catch(error => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
