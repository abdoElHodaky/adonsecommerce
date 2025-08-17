import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'

/**
 * Auth middleware to verify if user is authenticated
 */
export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Check if user is logged in
     */
    if (await ctx.auth.use('web').check()) {
      return next()
    }

    /**
     * Redirect to login page
     */
    return ctx.response.redirect().toRoute('/auth/login')
  }
}

/**
 * Admin middleware to verify if user is an admin
 */
export class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Check if user is logged in
     */
    if (!(await ctx.auth.use('web').check())) {
      return ctx.response.redirect().toRoute('/auth/login')
    }

    /**
     * Check if user is an admin
     */
    const user = ctx.auth.use('web').user
    if (user && user.role === 'admin') {
      return next()
    }

    /**
     * Redirect to home page
     */
    return ctx.response.redirect().toRoute('/')
  }
}

/**
 * Merchant middleware to verify if user is a merchant
 */
export class MerchantMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Check if user is logged in
     */
    if (!(await ctx.auth.use('web').check())) {
      return ctx.response.redirect().toRoute('/auth/login')
    }

    /**
     * Check if user is a merchant
     */
    const user = ctx.auth.use('web').user
    if (user && user.role === 'merchant') {
      return next()
    }

    /**
     * Redirect to home page
     */
    return ctx.response.redirect().toRoute('/')
  }
}

/**
 * Customer middleware to verify if user is a customer
 */
export class CustomerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Check if user is logged in
     */
    if (!(await ctx.auth.use('web').check())) {
      return ctx.response.redirect().toRoute('/auth/login')
    }

    /**
     * Check if user is a customer
     */
    const user = ctx.auth.use('web').user
    if (user && user.role === 'customer') {
      return next()
    }

    /**
     * Redirect to home page
     */
    return ctx.response.redirect().toRoute('/')
  }
}

