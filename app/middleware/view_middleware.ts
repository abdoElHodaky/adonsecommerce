import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'
import { inject } from '@adonisjs/core'
import { Edge } from 'edge.js'

/**
 * Middleware to bind the view service to the HttpContext
 */
export default class ViewMiddleware {
  @inject()
  constructor(protected view: Edge) {}

  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Bind the view service to the context
     */
    ctx['view'] = this.view

    /**
     * Call the next middleware
     */
    await next()
  }
}
