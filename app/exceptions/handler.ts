import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors } from '@adonisjs/core'
import { ValidationError } from '@adonisjs/vine'
import logger from '@adonisjs/core/services/logger'
import errorHandler from '#services/error_handler'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are used to display a custom HTML pages for certain error
   * codes. You might want to enable them in production only.
   */
  protected statusPages = {
    '404': 'errors/404',
    '500..599': 'errors/500',
  }

  /**
   * Handle exception thrown during an HTTP request
   */
  async handle(error: unknown, ctx: HttpContext) {
    /**
     * Handle validation errors
     */
    if (error instanceof ValidationError) {
      return errorHandler.handleValidation(ctx, error)
    }

    /**
     * Handle 404 errors
     */
    if (error instanceof errors.E_ROUTE_NOT_FOUND || error instanceof errors.E_ROW_NOT_FOUND) {
      return errorHandler.handleNotFound(ctx)
    }

    /**
     * Handle unauthorized access errors
     */
    if (error instanceof errors.E_UNAUTHORIZED_ACCESS) {
      return errorHandler.handleUnauthorized(ctx)
    }

    /**
     * Handle forbidden access errors
     */
    if (error instanceof errors.E_FORBIDDEN_ACCESS) {
      return errorHandler.handleForbidden(ctx)
    }

    /**
     * Forward the error to the parent class
     */
    return super.handle(error, ctx)
  }

  /**
   * Report exception to the error tracking service
   */
  async report(error: unknown, ctx: HttpContext) {
    // Log all errors
    if (error instanceof Error) {
      logger.error(
        { 
          err: error, 
          url: ctx.request.url(), 
          method: ctx.request.method(),
          userId: ctx.auth.user?.id
        }, 
        error.message
      )
    }
  }
}

