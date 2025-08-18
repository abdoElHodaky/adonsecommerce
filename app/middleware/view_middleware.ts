import "reflect-metadata"
import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'
import { inject } from '@adonisjs/core'
import { Edge } from 'edge.js'
import viewConfig from '#config/view'

/**
 * Middleware to bind the view service to the HttpContext
 */
@inject()
export default class ViewMiddleware {
 private let View=new Edge()
  constructor(protected view: Edge) {}

  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Bind the view service to the context
     */
    Object.defineProperty(ctx, 'view', {
      value: this.view,
      writable: false,
      enumerable: true,
      configurable: true,
    })
     this.View=ctx["view"]
    // Add request-specific globals
    this.addRequestGlobals(ctx)
    
    // Process the request
    await next()
    
    // Handle layout inheritance for rendered views
    if (ctx.response && ctx.response.getBody()) {
      const body = ctx.response.getBody()
      if (typeof body === 'string' && body.includes('@layout')) {
        const processedBody = await this.processLayoutInheritance(body)
        ctx.response.send(processedBody)
      }
    }
  }
  
  /**
   * Add request-specific globals to the view
   */
  private addRequestGlobals(ctx: HttpContext) {
    // Add auth information
    this.View.global('auth', {
      isAuthenticated: ctx.auth?.isAuthenticated || false,
      user: ctx.auth?.user || null
    })
    
    // Add flash messages
    this.View.global('flashMessages', {
      has: (key: string) => ctx.session?.flashMessages?.has(key) || false,
      get: (key: string) => ctx.session?.flashMessages?.get(key) || ''
    })
    
    // Add cart information
    this.View.global('cart', {
      items: ctx.session?.get('cart', []) || []
    })
    
    // Add CSRF token
    this.View.global('csrfToken', ctx.request.csrfToken || 'test-csrf-token')
    this.View.global('csrfField', () => {
      const token = ctx.request.csrfToken || 'test-csrf-token'
      return `<input type="hidden" name="_csrf" value="${token}">`
    })
    
    // Add request and route information
    this.View.global('request', ctx.request)
    this.View.global('route', (name: string, params = {}) => {
      // In a real app, this would use the router to generate URLs
      return `/${name.replace('.', '/')}`
    })
  }
  
  /**
   * Process layout inheritance in the rendered view
   */
  private async processLayoutInheritance(content: string): Promise<string> {
    // First, process any @include directives
    content = await this.processIncludes(content)
    
    // Process control flow directives
    content = await this.processControlFlow(content)
    
    // Process @let directives
    content = await this.processLetDirectives(content)
    
    // Extract layout information using regex
    const layoutMatch = content.match(/@layout\(['"](.+?)['"]\)/)
    if (!layoutMatch) {
      // If no layout is specified, just process any remaining @!section directives
      return await this.processSectionPlaceholders(content)
    }
    
    const layoutPath = layoutMatch[1]
    
    // Extract sections using regex
    const sections: Record<string, string> = {}
    const sectionRegex = /@section\(['"](.+?)['"]\)([\s\S]*?)@end/g
    let match
    
    while ((match = sectionRegex.exec(content)) !== null) {
      const sectionName = match[1]
      const sectionContent = match[2]
      sections[sectionName] = sectionContent
    }
    
    // Create a new Edge instance for layout processing
    const layoutEdge = new Edge()
    
    // Mount the same view paths
    for (const viewPath of viewConfig.viewsPath) {
      layoutEdge.mount(viewPath)
    }
    
    // Copy globals from the main Edge instance
    Object.keys(this.View.globals).forEach(key => {
      layoutEdge.global(key, this.View.globals[key])
    })
    
    // Add section helper
    layoutEdge.global('section', (name: string) => {
      return sections[name] || ''
    })
    
    // Render the layout
    let layoutContent = await layoutEdge.render(layoutPath, {})
    
    // Replace section placeholders
    for (const [name, content] of Object.entries(sections)) {
      const sectionPlaceholder = `@!section('${name}')`
      layoutContent = layoutContent.replace(sectionPlaceholder, content)
    }
    
    // Process any remaining @!section directives
    layoutContent = await this.processSectionPlaceholders(layoutContent)
    
    return layoutContent
  }
  
  /**
   * Process @include directives in the template
   */
  private async processIncludes(content: string): Promise<string> {
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
        const includedContent = await this.View.render(includePath, includeData)
        
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
   * Process @!section directives in the template
   */
  private async processSectionPlaceholders(content: string): Promise<string> {
    const sectionRegex = /@!section\(['"](.+?)['"]\)/g
    let match
    let processedContent = content
    
    while ((match = sectionRegex.exec(content)) !== null) {
      const sectionName = match[1]
      
      // If no content is provided for this section, replace with empty string
      processedContent = processedContent.replace(match[0], '')
    }
    
    return processedContent
  }
  
  /**
   * Process control flow directives (@if, @else, @each)
   */
  private async processControlFlow(content: string): Promise<string> {
    let processedContent = content
    
    // Process @if/@else directives
    processedContent = await this.processIfDirectives(processedContent)
    
    // Process @each directives
    processedContent = await this.processEachDirectives(processedContent)
    
    return processedContent
  }
  
  /**
   * Process @if/@else directives
   */
  private async processIfDirectives(content: string): Promise<string> {
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
        // This is a simplified approach - in a real implementation, you'd use a proper evaluator
        // that can handle complex conditions and access to context variables
        let result = false
        
        // Handle basic truthy/falsy values
        if (condition === 'true') {
          result = true
        } else if (condition === 'false') {
          result = false
        } else if (condition.startsWith('!')) {
          // Handle negation
          result = !eval(condition.substring(1))
        } else {
          // For other conditions, try a simple evaluation
          // This is unsafe in a real app, but works for basic demos
          result = Boolean(eval(condition))
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
  private async processEachDirectives(content: string): Promise<string> {
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
        // In a real implementation, this would access the template context
        // For this demo, we'll use a simple approach with mock data
        const items = this.getMockItems(itemsName)
        
        if (!items || !Array.isArray(items)) {
          throw new Error(`Items "${itemsName}" is not an array`)
        }
        
        // Process each item
        let result = ''
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          
          // Replace item references in the content
          let itemContent = eachContent
            .replace(new RegExp(`{{\\s*${itemName}\\s*}}`, 'g'), String(item))
            .replace(new RegExp(`{{\\s*${itemName}\\.([\\w\\.]+)\\s*}}`, 'g'), (_, prop) => {
              return this.getNestedProperty(item, prop) || ''
            })
          
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
  private async processLetDirectives(content: string): Promise<string> {
    // Match @let(name = value)
    const letRegex = /@let\s*\((.+?)\s*=\s*(.+?)\)/g
    let match
    let processedContent = content
    
    const variables: Record<string, any> = {}
    
    while ((match = letRegex.exec(content)) !== null) {
      const varName = match[1].trim()
      const varValue = match[2].trim()
      
      try {
        // Store the variable
        variables[varName] = this.evaluateExpression(varValue)
        
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
      processedContent = processedContent.replace(
        new RegExp(`{{\\s*${name}\\s*}}`, 'g'),
        String(value)
      )
    }
    
    return processedContent
  }
  
  /**
   * Get mock items for @each directive
   */
  private getMockItems(itemsName: string): any[] {
    // Mock data for testing
    const mockData: Record<string, any[]> = {
      'products': [
        { id: 1, name: 'Product 1', price: 99.99 },
        { id: 2, name: 'Product 2', price: 149.99 },
        { id: 3, name: 'Product 3', price: 199.99 }
      ],
      'categories': [
        { id: 1, name: 'Category 1', slug: 'category-1' },
        { id: 2, name: 'Category 2', slug: 'category-2' }
      ],
      'users': [
        { id: 1, name: 'User 1', email: 'user1@example.com' },
        { id: 2, name: 'User 2', email: 'user2@example.com' }
      ]
    }
    
    return mockData[itemsName] || []
  }
  
  /**
   * Get a nested property from an object
   */
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : undefined
    }, obj)
  }
  
  /**
   * Evaluate an expression
   */
  private evaluateExpression(expression: string): any {
    // This is a simplified approach - in a real implementation, you'd use a proper evaluator
    // that can handle complex expressions and access to context variables
    
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
    
    // Handle arrays
    if (expression.startsWith('[') && expression.endsWith(']')) {
      try {
        return JSON.parse(expression)
      } catch (error) {
        console.error(`Error parsing array expression:`, error.message)
        return []
      }
    }
    
    // Handle objects
    if (expression.startsWith('{') && expression.endsWith('}')) {
      try {
        // Convert property names to quoted strings
        const objectStr = expression
          .replace(/(\w+):/g, '"$1":')  // Convert property names to quoted strings
          .replace(/'/g, '"')           // Convert single quotes to double quotes
        
        return JSON.parse(objectStr)
      } catch (error) {
        console.error(`Error parsing object expression:`, error.message)
        return {}
      }
    }
    
    // For other expressions, return as is
    return expression
  }
}
