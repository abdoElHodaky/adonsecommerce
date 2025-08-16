import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'

/**
 * Role middleware for restricting access based on user roles
 */
export default class RoleMiddleware {
  /**
   * Handle the incoming request
   */
  async handle(ctx: HttpContext, next: NextFn, allowedRoles: string[]) {
    // Check if the user is authenticated
    if (!ctx.auth.isAuthenticated) {
      return ctx.response.redirect().toRoute('auth.loginForm')
    }

    const user = ctx.auth.user
    if (!user) {
      return ctx.response.redirect().toRoute('auth.loginForm')
    }

    // Check if the user has one of the allowed roles
    if (!allowedRoles.includes(user.userType)) {
      return ctx.response.redirect().toRoute('errors/403')
    }

    // User has the required role, proceed to the next middleware/controller
    await next()
  }
}

