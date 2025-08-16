import { HttpContext } from '@adonisjs/core/http'
import { Exception } from '@adonisjs/core/exceptions'
import { ValidationError } from '@adonisjs/vine'
import logger from '@adonisjs/core/services/logger'

/**
 * Error types
 */
export enum ErrorType {
  NOT_FOUND = 'not_found',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  VALIDATION = 'validation',
  SERVER_ERROR = 'server_error',
}

/**
 * Error handler service
 */
export class ErrorHandler {
  /**
   * Handle a not found error
   */
  public handleNotFound(ctx: HttpContext, message: string = 'Resource not found') {
    logger.error({ message, url: ctx.request.url() }, 'Not Found Error')
    
    // For API requests, return a JSON response
    if (this.isApiRequest(ctx)) {
      return ctx.response.status(404).json({
        error: ErrorType.NOT_FOUND,
        message,
      })
    }
    
    // For web requests, render the 404 error page
    return ctx.view.render('errors/404', { message })
  }

  /**
   * Handle an unauthorized error
   */
  public handleUnauthorized(ctx: HttpContext, message: string = 'Unauthorized access') {
    logger.error({ message, url: ctx.request.url() }, 'Unauthorized Error')
    
    // For API requests, return a JSON response
    if (this.isApiRequest(ctx)) {
      return ctx.response.status(401).json({
        error: ErrorType.UNAUTHORIZED,
        message,
      })
    }
    
    // For web requests, redirect to login page with flash message
    ctx.session.flash('error', message)
    return ctx.response.redirect().toRoute('auth.loginForm')
  }

  /**
   * Handle a forbidden error
   */
  public handleForbidden(ctx: HttpContext, message: string = 'Access denied') {
    logger.error({ message, url: ctx.request.url() }, 'Forbidden Error')
    
    // For API requests, return a JSON response
    if (this.isApiRequest(ctx)) {
      return ctx.response.status(403).json({
        error: ErrorType.FORBIDDEN,
        message,
      })
    }
    
    // For web requests, render the 403 error page
    return ctx.view.render('errors/403', { message })
  }

  /**
   * Handle a validation error
   */
  public handleValidation(ctx: HttpContext, error: ValidationError) {
    const errors = error.messages
    
    logger.error({ errors, url: ctx.request.url() }, 'Validation Error')
    
    // For API requests, return a JSON response
    if (this.isApiRequest(ctx)) {
      return ctx.response.status(422).json({
        error: ErrorType.VALIDATION,
        message: 'Validation failed',
        errors,
      })
    }
    
    // For web requests, flash the errors and redirect back
    ctx.session.flash('errors', errors)
    
    // If the request has old input, flash it
    if (ctx.request.all()) {
      ctx.session.flashAll()
    }
    
    // If it's an AJAX request or the request wants JSON, render the validation error page
    if (ctx.request.accepts(['html', 'json']) === 'json' || ctx.request.header('X-Requested-With') === 'XMLHttpRequest') {
      return ctx.view.render('errors/validation', { errors })
    }
    
    // Otherwise, redirect back
    return ctx.response.redirect().back()
  }

  /**
   * Handle a server error
   */
  public handleServerError(ctx: HttpContext, error: Error) {
    logger.error({ error: error.message, stack: error.stack, url: ctx.request.url() }, 'Server Error')
    
    // For API requests, return a JSON response
    if (this.isApiRequest(ctx)) {
      return ctx.response.status(500).json({
        error: ErrorType.SERVER_ERROR,
        message: 'Internal server error',
      })
    }
    
    // For web requests, render the 500 error page
    return ctx.view.render('errors/500', { error: process.env.NODE_ENV === 'production' ? null : error })
  }

  /**
   * Handle a maintenance mode error
   */
  public handleMaintenance(ctx: HttpContext, downtime: string = '30 minutes') {
    logger.info({ url: ctx.request.url() }, 'Maintenance Mode Access')
    
    // For API requests, return a JSON response
    if (this.isApiRequest(ctx)) {
      return ctx.response.status(503).json({
        error: 'maintenance',
        message: 'The application is in maintenance mode',
        downtime,
      })
    }
    
    // For web requests, render the maintenance error page
    return ctx.view.render('errors/maintenance', { downtime })
  }

  /**
   * Handle a generic exception
   */
  public handleException(ctx: HttpContext, error: Exception) {
    // Log the error
    logger.error({ error: error.message, stack: error.stack, url: ctx.request.url() }, 'Exception')
    
    // Handle based on the status code
    switch (error.status) {
      case 401:
        return this.handleUnauthorized(ctx, error.message)
      case 403:
        return this.handleForbidden(ctx, error.message)
      case 404:
        return this.handleNotFound(ctx, error.message)
      case 422:
        if (error instanceof ValidationError) {
          return this.handleValidation(ctx, error)
        }
        // Fall through to default if not a ValidationError
      default:
        return this.handleServerError(ctx, error)
    }
  }

  /**
   * Check if the request is an API request
   */
  private isApiRequest(ctx: HttpContext): boolean {
    // Check if the request URL starts with /api
    if (ctx.request.url().startsWith('/api')) {
      return true
    }
    
    // Check if the request accepts JSON
    if (ctx.request.accepts(['html', 'json']) === 'json') {
      return true
    }
    
    // Check if it's an AJAX request
    if (ctx.request.header('X-Requested-With') === 'XMLHttpRequest') {
      return true
    }
    
    return false
  }
}

// Export a singleton instance
export default new ErrorHandler()

