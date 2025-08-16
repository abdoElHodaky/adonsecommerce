import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'
import { UserType } from '#models/User'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // Check if user is authenticated
    await ctx.auth.authenticate()
    return next()
  }
}

export class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // Check if user is authenticated
    await ctx.auth.authenticate()

    // Check if user is an admin
    const user = ctx.auth.user
    if (!user || user.userType !== UserType.ADMIN) {
      return ctx.response.forbidden({ error: 'Access denied. Admin privileges required.' })
    }

    return next()
  }
}

export class MerchantMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // Check if user is authenticated
    await ctx.auth.authenticate()

    // Check if user is a merchant
    const user = ctx.auth.user
    if (!user || user.userType !== UserType.MERCHANT) {
      return ctx.response.forbidden({ error: 'Access denied. Merchant privileges required.' })
    }

    return next()
  }
}

export class CustomerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // Check if user is authenticated
    await ctx.auth.authenticate()

    // Check if user is a customer
    const user = ctx.auth.user
    if (!user || user.userType !== UserType.CUSTOMER) {
      return ctx.response.forbidden({ error: 'Access denied. Customer privileges required.' })
    }

    return next()
  }
}

