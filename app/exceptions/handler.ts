import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In production we want to render pre-defined error messages
   * and do not want to expose the actual error. However, in
   * development, we want to see the actual error.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are used to render a specific error page for a given
   * HTTP status code.
   */
  protected renderStatusPages = app.inProduction

  /**
   * Handle all exceptions
   */
  async handle(error: unknown, ctx: HttpContext) {
    /**
     * Handle VineJS validation errors
     */
    if (error instanceof errors.E_VALIDATION_ERROR) {
      // For API requests, return JSON response
      if (ctx.request.accepts(['html', 'json']) === 'json') {
        return ctx.response.status(422).json({
          errors: error.messages,
        })
      }

      // For web requests, flash errors and redirect back
      ctx.session.flashErrors({
        errors: error.messages,
      })

      // Also flash the old form data
      ctx.session.flashAll()

      return ctx.response.redirect().back()
    }

    /**
     * Forward the error to the parent class
     */
    return super.handle(error, ctx)
  }

  /**
   * Report the error to the logging service or
   * the error tracking service.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
