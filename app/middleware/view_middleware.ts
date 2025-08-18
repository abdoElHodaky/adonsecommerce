import "reflect-metadata"
import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'
import { inject } from '@adonisjs/core'
import { Edge } from 'edge.js'

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
    
    // Add request-specific data to the view context
    this.view.share({
      request: ctx.request,
      session: ctx.session,
      route: ctx.route,
      auth: ctx.auth || {
        isAuthenticated: false,
        user: null
      },
      flashMessages: ctx.session?.flashMessages || {
        has: (key: string) => false,
        get: (key: string) => ''
      },
      // Add cart data if available
      cart: ctx.session?.get('cart') || {
        items: [],
        total: 0,
        count: 0
      }
    })
    
    // Log for debugging
    console.log('View middleware executed, context shared with Edge')
    
    /**
     * Call the next middleware
     */
    await next()
  }
}
