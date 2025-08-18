import { Edge } from 'edge.js'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readdirSync, existsSync } from 'node:fs'

/**
 * Test script for rendering Edge.js templates
 * 
 * This script tests the rendering of Edge.js templates to ensure they work correctly.
 * It can test a specific template or all templates in a directory.
 * 
 * Usage:
 *   node test-view.js [template-path]
 * 
 * Examples:
 *   node test-view.js                           # Tests all templates
 *   node test-view.js pages/home                # Tests a specific template
 *   node test-view.js partials                  # Tests all templates in a directory
 */

// Setup Edge.js
const __dirname = dirname(fileURLToPath(import.meta.url))
const viewsPath = join(__dirname, 'resources', 'views')
const edge = new Edge()

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
 * Test a specific template
 * @param {string} templatePath - Path to the template to test
 */
async function testTemplate(templatePath) {
  try {
    console.log(`Testing template: ${templatePath}`)
    const html = await edge.render(templatePath, mockData)
    console.log('✅ Template rendered successfully')
    
    // Optional: Write the output to a file for inspection
    // writeFileSync(join(__dirname, 'test-output', `${templatePath.replace(/\//g, '-')}.html`), html)
    
    return true
  } catch (error) {
    console.error(`❌ Error rendering template ${templatePath}:`, error)
    return false
  }
}

/**
 * Test all templates in a directory
 * @param {string} dirPath - Path to the directory containing templates
 */
async function testDirectory(dirPath) {
  const fullPath = join(viewsPath, dirPath)
  
  if (!existsSync(fullPath)) {
    console.error(`Directory not found: ${dirPath}`)
    return false
  }
  
  const files = readdirSync(fullPath, { withFileTypes: true })
  let success = true
  
  for (const file of files) {
    if (file.isDirectory()) {
      // Recursively test subdirectories
      const subDirSuccess = await testDirectory(join(dirPath, file.name))
      success = success && subDirSuccess
    } else if (file.name.endsWith('.edge')) {
      // Test each Edge template
      const templatePath = join(dirPath, file.name)
      const templateSuccess = await testTemplate(templatePath)
      success = success && templateSuccess
    }
  }
  
  return success
}

/**
 * Main function
 */
async function main() {
  const templatePath = process.argv[2]
  let success = false
  
  if (templatePath) {
    // Test a specific template or directory
    if (templatePath.endsWith('.edge')) {
      success = await testTemplate(templatePath)
    } else {
      success = await testDirectory(templatePath)
    }
  } else {
    // Test all templates
    success = await testDirectory('')
  }
  
  if (success) {
    console.log('\n✅ All templates rendered successfully')
    process.exit(0)
  } else {
    console.error('\n❌ Some templates failed to render')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('Unhandled error:', error)
  process.exit(1)
})

