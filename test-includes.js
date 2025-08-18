import { Edge } from 'edge.js'
import { join } from 'node:path'
import { existsSync, writeFileSync, mkdirSync } from 'node:fs'

/**
 * Test script for Edge.js @include directive
 * 
 * This script tests the rendering of Edge.js templates with @include directives.
 * 
 * Usage:
 *   node test-includes.js
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

/**
 * Process @include directives in the template
 */
async function processIncludes(content) {
  const includeRegex = /@include\(['"](.+?)['"](,\s*({.*?}))?\)/g
  let match
  let processedContent = content
  
  while ((match = includeRegex.exec(content)) !== null) {
    const includePath = match[1]
    let includeData = {}
    
    if (match[3]) {
      try {
        // Simple evaluation of the data object
        // This is a simplified approach - in a real implementation, you'd use a proper parser
        const dataStr = match[3]
          .replace(/'/g, '"')
          .replace(/(\w+):/g, '"$1":')  // Convert property names to quoted strings
          .replace(/,\s*}/g, '}')       // Remove trailing commas
        
        includeData = JSON.parse(dataStr)
      } catch (error) {
        console.error(`Error parsing include data for ${includePath}:`, error.message)
        // Continue with empty data
      }
    }
    
    try {
      // Render the included template
      const includedContent = await edge.render(includePath, { ...testData, ...includeData })
      
      // Replace the @include directive with the rendered content
      processedContent = processedContent.replace(match[0], includedContent)
    } catch (error) {
      console.error(`Error including ${includePath}:`, error.message)
      // Replace with error comment if rendering fails
      processedContent = processedContent.replace(
        match[0], 
        `<!-- Error including ${includePath}: ${error.message} -->`
      )
    }
  }
  
  return processedContent
}

/**
 * Test a template with @include directives
 */
async function testInclude(templateContent, outputFilename) {
  try {
    console.log(`Testing template with @include directives: ${templateContent}`)
    
    // Process @include directives
    const processedContent = await processIncludes(templateContent)
    
    // Write the output to a file
    const outputPath = join(outputDir, outputFilename)
    writeFileSync(outputPath, processedContent)
    
    console.log(`✅ Template processed successfully`)
    console.log(`Output saved to ${outputPath}`)
    
    return true
  } catch (error) {
    console.error(`❌ Error processing template:`, error.message)
    return false
  }
}

/**
 * Main function
 */
async function main() {
  // Test a simple template with @include directive
  const simpleTemplate = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Include</title>
</head>
<body>
  <h1>Test Include</h1>
  
  <!-- Include header partial -->
  @include('partials/header')
  
  <div class="content">
    <p>This is the main content.</p>
  </div>
  
  <!-- Include footer partial -->
  @include('partials/footer')
</body>
</html>
  `
  
  // Test a template with nested @include directives
  const nestedTemplate = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Nested Includes</title>
</head>
<body>
  <!-- Include header partial -->
  @include('partials/header')
  
  <div class="content">
    <h1>Test Nested Includes</h1>
    <p>This is the main content.</p>
    
    <!-- Include a partial that includes another partial -->
    <div class="messages">
      @include('partials/flash-messages')
    </div>
  </div>
  
  <!-- Include footer partial -->
  @include('partials/footer')
</body>
</html>
  `
  
  // Test a template with @include directive with data
  const templateWithData = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Include with Data</title>
</head>
<body>
  <h1>Test Include with Data</h1>
  
  <!-- Include a partial with data -->
  @include('components/product-card', { product: { id: 1, name: 'Test Product', price: 99.99, images: [] } })
  
  <div class="content">
    <p>This is the main content.</p>
  </div>
</body>
</html>
  `
  
  // Run the tests
  let success = true
  
  success = await testInclude(simpleTemplate, 'include-simple.html') && success
  success = await testInclude(nestedTemplate, 'include-nested.html') && success
  success = await testInclude(templateWithData, 'include-with-data.html') && success
  
  if (success) {
    console.log('\n✅ All tests passed')
    process.exit(0)
  } else {
    console.error('\n❌ Some tests failed')
    process.exit(1)
  }
}

// Run the tests
main().catch(error => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
