import { HttpContext } from '@adonisjs/core/http'
import { Exception } from '@adonisjs/core/exceptions'
import errorHandler from '#services/error_handler'

/**
 * Base controller with common functionality
 */
export default class BaseController {
  /**
   * Handle a not found error
   */
  protected notFound(ctx: HttpContext, message: string = 'Resource not found') {
    return errorHandler.handleNotFound(ctx, message)
  }

  /**
   * Handle an unauthorized error
   */
  protected unauthorized(ctx: HttpContext, message: string = 'Unauthorized access') {
    return errorHandler.handleUnauthorized(ctx, message)
  }

  /**
   * Handle a forbidden error
   */
  protected forbidden(ctx: HttpContext, message: string = 'Access denied') {
    return errorHandler.handleForbidden(ctx, message)
  }

  /**
   * Handle a server error
   */
  protected serverError(ctx: HttpContext, error: Error) {
    return errorHandler.handleServerError(ctx, error)
  }

  /**
   * Handle a validation error
   */
  protected validationError(ctx: HttpContext, errors: Record<string, string[]>) {
    // Create a custom validation error
    const error = new Exception('Validation failed', 422)
    error.messages = errors
    
    throw error
  }

  /**
   * Handle a maintenance mode error
   */
  protected maintenanceMode(ctx: HttpContext, downtime: string = '30 minutes') {
    return errorHandler.handleMaintenance(ctx, downtime)
  }

  /**
   * Try to execute a function and handle any errors
   */
  protected async tryOrError<T>(
    ctx: HttpContext,
    fn: () => Promise<T>,
    errorMessage: string = 'An error occurred'
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      console.error('Controller error:', error)
      
      if (error instanceof Exception) {
        throw error // Let the global handler deal with it
      }
      
      return this.serverError(ctx, new Error(errorMessage))
    }
  }
}

