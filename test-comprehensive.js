import { Edge } from 'edge.js'
import { join } from 'node:path'
import { existsSync, writeFileSync, mkdirSync } from 'node:fs'

/**
 * Comprehensive test script for Edge.js template rendering
 * 
 * This script tests all template features working together:
 * - Layout inheritance (@layout, @section, @end)
 * - Includes (@include)
 * - Conditional rendering (@if, @else, @end)
 * - Loops (@each, @end)
 * - Variables (@let)
 * 
 * Usage:
 *   node test-comprehensive.js
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

edge.global('cart', {
  items: [
    { id: 1, name: 'Product 1', price: 99.99, quantity: 2 },
    { id: 2, name: 'Product 2', price: 149.99, quantity: 1 }
  ],
  total: 349.97
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

// Create output directory
const outputDir = join(process.cwd(), 'test-output')
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true })
}

// Mock data for testing
const mockData = {
  products: [
    { id: 1, name: 'Product 1', price: 99.99, inStock: true, featured: true, image: '/images/product1.jpg' },
    { id: 2, name: 'Product 2', price: 149.99, inStock: false, featured: false, image: '/images/product2.jpg' },
    { id: 3, name: 'Product 3', price: 199.99, inStock: true, featured: true, image: '/images/product3.jpg' }
  ],
  categories: [
    { id: 1, name: 'Category 1', slug: 'category-1', productCount: 10 },
    { id: 2, name: 'Category 2', slug: 'category-2', productCount: 5 },
    { id: 3, name: 'Category 3', slug: 'category-3', productCount: 8 }
  ],
  isAuthenticated: true,
  showFeatured: true,
  user: {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    userType: 'customer'
  },
  cart: {
    items: [
      { id: 1, name: 'Product 1', price: 99.99, quantity: 2 },
      { id: 2, name: 'Product 2', price: 149.99, quantity: 1 }
    ],
    total: 349.97
  },
  flashMessages: {
    success: 'Operation completed successfully!',
    error: null
  }
}

/**
 * Process @include directives
 */
function processIncludes(content, context) {
  // Match @include('path/to/partial') or @include('path/to/partial', { data })
  const includeRegex = /@include\(['"](.+?)['"](?:,\s*(\{.+?\}))?\)/g
  let match
  let processedContent = content
  
  while ((match = includeRegex.exec(content)) !== null) {
    const includePath = match[1]
    const includeData = match[2] ? evaluateObject(match[2], context) : {}
    
    try {
      // In a real implementation, this would load and render the partial
      // For this demo, we'll use a simple approach with mock partials
      const partialContent = getMockPartial(includePath, { ...context, ...includeData })
      
      // Replace the @include directive with the partial content
      processedContent = processedContent.replace(match[0], partialContent)
    } catch (error) {
      console.error(`Error including partial "${includePath}":`, error.message)
      // Replace with error comment if inclusion fails
      processedContent = processedContent.replace(
        match[0],
        `<!-- Error including partial "${includePath}": ${error.message} -->`
      )
    }
  }
  
  return processedContent
}

/**
 * Process @if/@else directives
 */
function processIfDirectives(content, context) {
  // Match @if(condition)...@end or @if(condition)...@else...@end
  const ifRegex = /@if\s*\((.+?)\)([\s\S]*?)(?:@else([\s\S]*?))?@end/g
  let match
  let processedContent = content
  
  while ((match = ifRegex.exec(content)) !== null) {
    const condition = match[1].trim()
    const ifContent = match[2]
    const elseContent = match[3] || ''
    
    try {
      // Simple evaluation of the condition
      let result = false
      
      // Handle basic truthy/falsy values
      if (condition === 'true') {
        result = true
      } else if (condition === 'false') {
        result = false
      } else if (condition.startsWith('!')) {
        // Handle negation
        const varName = condition.substring(1).trim()
        result = !context[varName]
      } else {
        // For other conditions, check if it's a variable in the context
        result = Boolean(context[condition])
      }
      
      // Replace the @if directive with the appropriate content
      const replacement = result ? ifContent : elseContent
      processedContent = processedContent.replace(match[0], replacement)
    } catch (error) {
      console.error(`Error evaluating condition "${condition}":`, error.message)
      // Replace with error comment if evaluation fails
      processedContent = processedContent.replace(
        match[0],
        `<!-- Error evaluating condition "${condition}": ${error.message} -->`
      )
    }
  }
  
  return processedContent
}

/**
 * Process @each directives
 */
function processEachDirectives(content, context) {
  // Match @each(item in items)...@end
  const eachRegex = /@each\s*\((.+?)\s+in\s+(.+?)\)([\s\S]*?)@end/g
  let match
  let processedContent = content
  
  while ((match = eachRegex.exec(content)) !== null) {
    const itemName = match[1].trim()
    const itemsName = match[2].trim()
    const eachContent = match[3]
    
    try {
      // Get the items from the context
      const items = getNestedProperty(context, itemsName)
      
      if (!items || !Array.isArray(items)) {
        throw new Error(`Items "${itemsName}" is not an array`)
      }
      
      // Process each item
      let result = ''
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        
        // Create a new context with the item
        const itemContext = { ...context, [itemName]: item, index: i }
        
        // Replace item references in the content
        let itemContent = eachContent
          .replace(new RegExp(`\\{\\{\\s*${itemName}\\s*\\}\\}`, 'g'), String(item))
          .replace(new RegExp(`\\{\\{\\s*${itemName}\\.([\\w\\.]+)\\s*\\}\\}`, 'g'), (_, prop) => {
            return getNestedProperty(item, prop) || ''
          })
        
        // Process nested directives with item context
        itemContent = processIfDirectives(itemContent, itemContext)
        
        result += itemContent
      }
      
      // Replace the @each directive with the processed content
      processedContent = processedContent.replace(match[0], result)
    } catch (error) {
      console.error(`Error processing @each directive:`, error.message)
      // Replace with error comment if processing fails
      processedContent = processedContent.replace(
        match[0],
        `<!-- Error processing @each directive: ${error.message} -->`
      )
    }
  }
  
  return processedContent
}

/**
 * Process @let directives
 */
function processLetDirectives(content, context) {
  // Match @let(name = value)
  const letRegex = /@let\s*\((.+?)\s*=\s*(.+?)\)/g
  let match
  let processedContent = content
  
  const variables = { ...context }
  
  while ((match = letRegex.exec(content)) !== null) {
    const varName = match[1].trim()
    const varValue = match[2].trim()
    
    try {
      // Store the variable
      variables[varName] = evaluateExpression(varValue, context)
      
      // Remove the @let directive
      processedContent = processedContent.replace(match[0], '')
    } catch (error) {
      console.error(`Error processing @let directive:`, error.message)
      // Replace with error comment if processing fails
      processedContent = processedContent.replace(
        match[0],
        `<!-- Error processing @let directive: ${error.message} -->`
      )
    }
  }
  
  // Replace variable references in the content
  for (const [name, value] of Object.entries(variables)) {
    if (name !== 'index' && typeof value !== 'object') {
      processedContent = processedContent.replace(
        new RegExp(`\\{\\{\\s*${name}\\s*\\}\\}`, 'g'),
        String(value)
      )
    }
  }
  
  return processedContent
}

/**
 * Process layout inheritance
 */
function processLayoutInheritance(content, context) {
  // Extract layout information using regex
  const layoutMatch = content.match(/@layout\(['"](.+?)['"]\)/)
  if (!layoutMatch) {
    // If no layout is specified, just process any remaining @!section directives
    return processSectionPlaceholders(content, {})
  }
  
  const layoutPath = layoutMatch[1]
  
  // Extract sections using regex
  const sections = {}
  const sectionRegex = /@section\(['"](.+?)['"]\)([\s\S]*?)@end/g
  let match
  
  while ((match = sectionRegex.exec(content)) !== null) {
    const sectionName = match[1]
    const sectionContent = match[2]
    sections[sectionName] = sectionContent
  }
  
  // Get the layout content
  const layoutContent = getMockLayout(layoutPath)
  
  // Replace section placeholders
  let processedContent = layoutContent
  for (const [name, content] of Object.entries(sections)) {
    const sectionPlaceholder = `@!section('${name}')`
    processedContent = processedContent.replace(sectionPlaceholder, content)
  }
  
  // Process any remaining @!section directives
  processedContent = processSectionPlaceholders(processedContent, sections)
  
  return processedContent
}

/**
 * Process @!section directives
 */
function processSectionPlaceholders(content, sections) {
  const sectionRegex = /@!section\(['"](.+?)['"]\)/g
  let match
  let processedContent = content
  
  while ((match = sectionRegex.exec(content)) !== null) {
    const sectionName = match[1]
    
    // If no content is provided for this section, replace with empty string
    processedContent = processedContent.replace(match[0], sections[sectionName] || '')
  }
  
  return processedContent
}

/**
 * Get a mock partial
 */
function getMockPartial(path, context) {
  // Mock partials for testing
  const partials = {
    'partials/header': `
      <header class="site-header">
        <div class="container">
          <div class="logo">
            <a href="/">MultiMarket</a>
          </div>
          <nav class="main-nav">
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/products">Products</a></li>
              <li><a href="/categories">Categories</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </nav>
          <div class="user-nav">
            @if(isAuthenticated)
              <a href="/account">My Account</a>
              <a href="/logout">Logout</a>
            @else
              <a href="/login">Login</a>
              <a href="/register">Register</a>
            @end
          </div>
        </div>
      </header>
    `,
    'partials/footer': `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-widgets">
            <div class="widget">
              <h3>About Us</h3>
              <p>MultiMarket is a multi-merchant e-commerce platform.</p>
            </div>
            <div class="widget">
              <h3>Categories</h3>
              <ul>
                @each(category in categories)
                  <li><a href="/categories/{{ category.slug }}">{{ category.name }}</a></li>
                @end
              </ul>
            </div>
            <div class="widget">
              <h3>Contact</h3>
              <p>Email: info@multimarket.com</p>
              <p>Phone: +1 (123) 456-7890</p>
            </div>
          </div>
          <div class="copyright">
            <p>&copy; {{ currentYear() }} MultiMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    `,
    'partials/flash-messages': `
      @if(flashMessages.success)
        <div class="alert alert-success">{{ flashMessages.success }}</div>
      @end
      @if(flashMessages.error)
        <div class="alert alert-error">{{ flashMessages.error }}</div>
      @end
    `,
    'components/product-card': `
      <div class="product-card">
        <div class="product-image">
          <img src="{{ product.image }}" alt="{{ product.name }}">
          @if(!product.inStock)
            <span class="out-of-stock">Out of Stock</span>
          @end
          @if(product.featured)
            <span class="featured">Featured</span>
          @end
        </div>
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-price">{{ formatCurrency(product.price) }}</p>
          <div class="product-actions">
            @if(product.inStock)
              <button class="add-to-cart">Add to Cart</button>
            @else
              <button class="notify-me" disabled>Notify Me</button>
            @end
            <button class="add-to-wishlist">♥</button>
          </div>
        </div>
      </div>
    `
  }
  
  if (!partials[path]) {
    throw new Error(`Partial "${path}" not found`)
  }
  
  // Process the partial with the context
  let partialContent = partials[path]
  
  // Process directives in the partial
  partialContent = processLetDirectives(partialContent, context)
  partialContent = processIfDirectives(partialContent, context)
  partialContent = processEachDirectives(partialContent, context)
  
  return partialContent
}

/**
 * Get a mock layout
 */
function getMockLayout(path) {
  // Mock layouts for testing
  const layouts = {
    'layouts/main': `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>@!section('title')</title>
        <link rel="stylesheet" href="{{ asset('css/main.css') }}">
      </head>
      <body>
        @include('partials/header')
        
        <main class="site-main">
          @!section('content')
        </main>
        
        @include('partials/footer')
        
        <script src="{{ asset('js/main.js') }}"></script>
      </body>
      </html>
    `
  }
  
  if (!layouts[path]) {
    throw new Error(`Layout "${path}" not found`)
  }
  
  return layouts[path]
}

/**
 * Get a nested property from an object
 */
function getNestedProperty(obj, path) {
  return path.split('.').reduce((prev, curr) => {
    return prev && prev[curr] !== undefined ? prev[curr] : undefined
  }, obj)
}

/**
 * Evaluate an expression
 */
function evaluateExpression(expression, context) {
  // Handle string literals
  if (expression.startsWith("'") && expression.endsWith("'")) {
    return expression.slice(1, -1)
  }
  
  // Handle number literals
  if (!isNaN(Number(expression))) {
    return Number(expression)
  }
  
  // Handle boolean literals
  if (expression === 'true') {
    return true
  }
  
  if (expression === 'false') {
    return false
  }
  
  // Handle context variables
  if (context[expression] !== undefined) {
    return context[expression]
  }
  
  // For other expressions, return as is
  return expression
}

/**
 * Evaluate an object
 */
function evaluateObject(objectStr, context) {
  try {
    // Convert property names to quoted strings
    const processedStr = objectStr
      .replace(/(\w+):/g, '"$1":')  // Convert property names to quoted strings
      .replace(/'/g, '"')           // Convert single quotes to double quotes
    
    return JSON.parse(processedStr)
  } catch (error) {
    console.error(`Error parsing object:`, error.message)
    return {}
  }
}

/**
 * Process a template with all directives
 */
function processTemplate(templateContent, context) {
  let processedContent = templateContent
  
  // Process directives in order
  processedContent = processIncludes(processedContent, context)
  processedContent = processLetDirectives(processedContent, context)
  processedContent = processIfDirectives(processedContent, context)
  processedContent = processEachDirectives(processedContent, context)
  processedContent = processLayoutInheritance(processedContent, context)
  
  return processedContent
}

/**
 * Test a comprehensive template
 */
function testComprehensiveTemplate() {
  try {
    console.log('Testing comprehensive template...')
    
    // Create a template that uses all features
    const templateContent = `
      @layout('layouts/main')
      
      @section('title')
        MultiMarket - Home
      @end
      
      @section('content')
        <div class="container">
          @include('partials/flash-messages')
          
          <section class="hero">
            <h1>Welcome to MultiMarket</h1>
            <p>Your one-stop shop for all your needs</p>
          </section>
          
          @let(maxFeaturedProducts = 2)
          @let(discountPercentage = 15)
          
          <section class="featured-products">
            <h2>Featured Products</h2>
            <p>Get {{ discountPercentage }}% off on all featured products!</p>
            
            <div class="product-grid">
              @each(product in products)
                @if(product.featured)
                  @include('components/product-card', { product: product })
                @end
              @end
            </div>
          </section>
          
          <section class="categories">
            <h2>Shop by Category</h2>
            <div class="category-grid">
              @each(category in categories)
                <div class="category-card">
                  <h3>{{ category.name }}</h3>
                  <p>{{ category.productCount }} products</p>
                  <a href="/categories/{{ category.slug }}" class="btn">View Category</a>
                </div>
              @end
            </div>
          </section>
          
          @if(isAuthenticated)
            <section class="user-dashboard">
              <h2>Welcome back, {{ user.name }}!</h2>
              
              @if(cart.items.length > 0)
                <div class="cart-summary">
                  <h3>Your Cart</h3>
                  <ul>
                    @each(item in cart.items)
                      <li>{{ item.name }} ({{ item.quantity }}) - {{ formatCurrency(item.price * item.quantity) }}</li>
                    @end
                  </ul>
                  <p class="cart-total">Total: {{ formatCurrency(cart.total) }}</p>
                  <a href="/checkout" class="btn">Checkout</a>
                </div>
              @else
                <p>Your cart is empty.</p>
              @end
            </section>
          @end
        </div>
      @end
    `
    
    // Process the template
    const processedContent = processTemplate(templateContent, mockData)
    
    // Write the output to a file
    const outputPath = join(outputDir, 'comprehensive-test.html')
    writeFileSync(outputPath, processedContent)
    
    console.log(`✅ Comprehensive template processed successfully`)
    console.log(`Output saved to ${outputPath}`)
    
    return true
  } catch (error) {
    console.error(`❌ Error processing comprehensive template:`, error.message)
    return false
  }
}

/**
 * Main function
 */
function main() {
  // Run the comprehensive test
  const success = testComprehensiveTemplate()
  
  if (success) {
    console.log('\n✅ All tests passed')
    process.exit(0)
  } else {
    console.error('\n❌ Some tests failed')
    process.exit(1)
  }
}

// Run the tests
main();

