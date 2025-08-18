import { Edge } from 'edge.js'
import { join } from 'node:path'
import { existsSync, writeFileSync, mkdirSync } from 'node:fs'

/**
 * Simple test script for Edge.js templates
 * 
 * This script tests the rendering of Edge.js templates with layout inheritance.
 * 
 * Usage:
 *   node test-templates-simple.js
 */

// Setup Edge.js
const edge = new Edge()
const viewsPath = join(process.cwd(), 'resources', 'views')

console.log('Views path:', viewsPath)
console.log('Views path exists:', existsSync(viewsPath))

// Mount the views directory
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
edge.global('include', async (name, data = {}) => {
  try {
    return await edge.render(name, { ...testData, ...data })
  } catch (error) {
    console.error(`Error including ${name}:`, error.message)
    return `<!-- Error including ${name}: ${error.message} -->`
  }
})

// Test data
const testData = {
  title: 'Test Page',
  content: 'This is test content'
}

// Create output directory
const outputDir = join(process.cwd(), 'test-output')
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true })
}

// Test partials
async function testPartials() {
  console.log('\nTesting partials...')
  
  try {
    // Test header partial
    const header = await edge.render('partials/header', testData)
    writeFileSync(join(outputDir, 'partials-header.html'), header)
    console.log('✅ Header partial rendered successfully')
    
    // Test footer partial
    const footer = await edge.render('partials/footer', testData)
    writeFileSync(join(outputDir, 'partials-footer.html'), footer)
    console.log('✅ Footer partial rendered successfully')
    
    // Test flash messages partial
    const flashMessages = await edge.render('partials/flash-messages', testData)
    writeFileSync(join(outputDir, 'partials-flash-messages.html'), flashMessages)
    console.log('✅ Flash messages partial rendered successfully')
  } catch (error) {
    console.error('❌ Error rendering partials:', error.message)
  }
}

// Process a template with layout inheritance
async function processTemplate(templatePath, data = {}) {
  try {
    console.log(`\nProcessing template: ${templatePath}`)
    
    // Render the template
    const content = await edge.render(templatePath, { ...testData, ...data })
    
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
    
    // Create layout data
    const layoutData = {
      ...testData,
      ...data
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

// Test a page with layout
async function testPageWithLayout(pagePath, outputFilename, data = {}) {
  try {
    const html = await processTemplate(pagePath, data)
    writeFileSync(join(outputDir, outputFilename), html)
    console.log(`✅ ${pagePath} rendered successfully`)
    return true
  } catch (error) {
    console.error(`❌ Error rendering ${pagePath}:`, error.message)
    return false
  }
}

// Main function
async function main() {
  // Test partials
  await testPartials()
  
  // Test pages with layout
  let success = true
  
  // Test about page
  success = await testPageWithLayout('pages/about/index', 'about-page.html') && success
  
  // Test home page
  success = await testPageWithLayout('pages/home', 'home-page.html') && success
  
  if (success) {
    console.log('\n✅ All templates rendered successfully')
  } else {
    console.error('\n❌ Some templates failed to render')
  }
}

// Run the tests
main().catch(error => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
