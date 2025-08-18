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
    
    // Add request-specific globals
    this.addRequestGlobals(ctx)
    
    // Process the request
    await next()
    
    // Handle layout inheritance for rendered views
    if (ctx.response && ctx.response.getBody()) {
      const body = ctx.response.getBody()
      if (typeof body === 'string' && body.includes('@layout')) {
        const processedBody = await this.processLayoutInheritance(body)
        ctx.response.setBody(processedBody)
      }
    }
  }
  
  /**
   * Add request-specific globals to the view
   */
  private addRequestGlobals(ctx: HttpContext) {
    // Add auth information
    this.view.global('auth', {
      isAuthenticated: ctx.auth?.isAuthenticated || false,
      user: ctx.auth?.user || null
    })
    
    // Add flash messages
    this.view.global('flashMessages', {
      has: (key: string) => ctx.session?.flashMessages?.has(key) || false,
      get: (key: string) => ctx.session?.flashMessages?.get(key) || ''
    })
    
    // Add cart information
    this.view.global('cart', {
      items: ctx.session?.get('cart', []) || []
    })
    
    // Add CSRF token
    this.view.global('csrfToken', ctx.request.csrfToken || 'test-csrf-token')
    this.view.global('csrfField', () => {
      const token = ctx.request.csrfToken || 'test-csrf-token'
      return `<input type="hidden" name="_csrf" value="${token}">`
    })
    
    // Add request and route information
    this.view.global('request', ctx.request)
    this.view.global('route', (name: string, params = {}) => {
      // In a real app, this would use the router to generate URLs
      return `/${name.replace('.', '/')}`
    })
  }
  
  /**
   * Process layout inheritance in the rendered view
   */
  private async processLayoutInheritance(content: string): Promise<string> {
    // Extract layout information using regex
    const layoutMatch = content.match(/@layout\(['"](.+?)['"]\)/)
    if (!layoutMatch) {
      return content
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
    Object.keys(this.view.globals).forEach(key => {
      layoutEdge.global(key, this.view.globals[key])
    })
    
    // Render the layout
    let layoutContent = await layoutEdge.render(layoutPath, {})
    
    // Replace section placeholders
    for (const [name, content] of Object.entries(sections)) {
      const sectionPlaceholder = `@!section('${name}')`
      layoutContent = layoutContent.replace(sectionPlaceholder, content)
    }
    
    return layoutContent
  }
}
