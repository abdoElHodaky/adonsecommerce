import { HttpContext } from '@adonisjs/core/http'
import User, { UserType } from '#models/User'
import Merchant, { MerchantStatus } from '#models/Merchant'
import { schema, validator } from '@adonisjs/core/validator'
import hash from '@adonisjs/core/services/hash'
import BaseController from './base_controller.js'

export default class AuthController extends BaseController {
  /**
   * Show login form
   */
  async showLogin({ view }: HttpContext) {
    return this.tryOrError(
      { view },
      async () => {
        return view.render('pages/auth/login')
      },
      'Failed to load login page'
    )
  }

  /**
   * Handle login form submission
   */
  async login({ request, response, auth, session }: HttpContext) {
    return this.tryOrError(
      { request, response, auth, session },
      async () => {
        // Validate input
        const loginSchema = schema.create({
          email: schema.string([
            validator.email()
          ]),
          password: schema.string(),
          remember: schema.boolean.optional(),
        })

        const payload = await validator.validate({
          schema: loginSchema,
          data: request.all(),
        })

        try {
          // Attempt to authenticate the user
          await auth.use('web').attempt(payload.email, payload.password, {
            remember: !!payload.remember,
          })

          // Redirect based on user type
          const user = auth.user!
          if (user.userType === UserType.ADMIN) {
            return response.redirect('/admin/dashboard')
          } else if (user.userType === UserType.MERCHANT) {
            return response.redirect('/merchant/dashboard')
          } else {
            return response.redirect('/customer/dashboard')
          }
        } catch (error) {
          // Authentication failed
          session.flash('error', 'Invalid credentials')
          return response.redirect().back()
        }
      },
      'Login failed'
    )
  }

  /**
   * Show registration form
   */
  async showRegister({ view }: HttpContext) {
    return this.tryOrError(
      { view },
      async () => {
        return view.render('pages/auth/register')
      },
      'Failed to load registration page'
    )
  }

  /**
   * Handle registration form submission
   */
  async register({ request, response, auth, session }: HttpContext) {
    return this.tryOrError(
      { request, response, auth, session },
      async () => {
        // Validate input
        const registerSchema = schema.create({
          first_name: schema.string([
            validator.trim(),
            validator.minLength(2),
            validator.maxLength(50)
          ]),
          last_name: schema.string([
            validator.trim(),
            validator.minLength(2),
            validator.maxLength(50)
          ]),
          email: schema.string([
            validator.email(),
            validator.unique({ table: 'users', column: 'email' })
          ]),
          password: schema.string([
            validator.minLength(8),
            validator.maxLength(32),
            validator.confirmed('password_confirmation')
          ]),
          password_confirmation: schema.string(),
          user_type: schema.enum(Object.values(UserType)),
          terms: schema.boolean([
            validator.required()
          ]),
        })

        const payload = await validator.validate({
          schema: registerSchema,
          data: request.all(),
        })

        // Create user
        const user = new User()
        user.firstName = payload.first_name
        user.lastName = payload.last_name
        user.email = payload.email
        user.password = payload.password
        user.userType = payload.user_type
        user.isActive = true
        await user.save()

        // If registering as a merchant, create merchant profile
        if (payload.user_type === UserType.MERCHANT) {
          const merchant = new Merchant()
          merchant.userId = user.id
          merchant.storeName = `${payload.first_name}'s Store`
          merchant.slug = `${payload.first_name.toLowerCase()}-store-${user.id}`
          merchant.contactEmail = payload.email
          merchant.status = MerchantStatus.PENDING
          merchant.commissionRate = 10 // Default commission rate
          merchant.isVerified = false
          merchant.isActive = false
          await merchant.save()
        }

        // Log the user in
        await auth.use('web').login(user)

        // Redirect based on user type
        if (user.userType === UserType.MERCHANT) {
          return response.redirect('/merchant/dashboard')
        } else {
          return response.redirect('/customer/dashboard')
        }
      },
      'Registration failed'
    )
  }

  /**
   * Log the user out
   */
  async logout({ auth, response }: HttpContext) {
    return this.tryOrError(
      { auth, response },
      async () => {
        await auth.use('web').logout()
        return response.redirect('/')
      },
      'Logout failed'
    )
  }

  /**
   * Show forgot password form
   */
  async showForgotPassword({ view }: HttpContext) {
    return this.tryOrError(
      { view },
      async () => {
        return view.render('pages/auth/forgot-password')
      },
      'Failed to load forgot password page'
    )
  }

  /**
   * Handle forgot password form submission
   */
  async forgotPassword({ request, response, session }: HttpContext) {
    return this.tryOrError(
      { request, response, session },
      async () => {
        // Validate input
        const forgotPasswordSchema = schema.create({
          email: schema.string([
            validator.email()
          ]),
        })

        const payload = await validator.validate({
          schema: forgotPasswordSchema,
          data: request.all(),
        })

        // Find user by email
        const user = await User.findBy('email', payload.email)
        
        if (user) {
          // In a real application, you would send a password reset email here
          // For now, we'll just show a success message
        }

        // Always show success to prevent email enumeration
        session.flash('success', 'If your email is registered, you will receive password reset instructions')
        return response.redirect('/auth/login')
      },
      'Failed to process forgot password request'
    )
  }

  /**
   * Show reset password form
   */
  async showResetPassword({ view, params }: HttpContext) {
    return this.tryOrError(
      { view, params },
      async () => {
        // In a real application, you would validate the token here
        return view.render('pages/auth/reset-password', { token: params.token })
      },
      'Failed to load reset password page'
    )
  }

  /**
   * Handle reset password form submission
   */
  async resetPassword({ request, response, session }: HttpContext) {
    return this.tryOrError(
      { request, response, session },
      async () => {
        // Validate input
        const resetPasswordSchema = schema.create({
          token: schema.string(),
          email: schema.string([
            validator.email()
          ]),
          password: schema.string([
            validator.minLength(8),
            validator.maxLength(32),
            validator.confirmed('password_confirmation')
          ]),
          password_confirmation: schema.string(),
        })

        const payload = await validator.validate({
          schema: resetPasswordSchema,
          data: request.all(),
        })

        // In a real application, you would validate the token and update the password
        // For now, we'll just show a success message
        session.flash('success', 'Your password has been reset successfully')
        return response.redirect('/auth/login')
      },
      'Failed to reset password'
    )
  }
}

