import { HttpContext } from '@adonisjs/core/http'
import User, { UserType } from '#models/User'
import Merchant, { MerchantStatus } from '#models/Merchant'
import vine from '@vinejs/vine'
import hash from '@adonisjs/core/services/hash'
import { string } from '@vinejs/vine/rules'

export default class AuthController {
  /**
   * Show login form
   */
  async showLogin({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }

  /**
   * Handle login form submission
   */
  async login({ request, response, auth, session }: HttpContext) {
    // Validate input
    const loginSchema = vine.object({
      email: vine.string().email(),
      password: vine.string(),
      remember: vine.boolean().optional(),
    })

    const payload = await vine.validate({
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
  }

  /**
   * Show registration form
   */
  async showRegister({ view }: HttpContext) {
    return view.render('pages/auth/register')
  }

  /**
   * Handle registration form submission
   */
  async register({ request, response, auth, session }: HttpContext) {
    // Validate input
    const registerSchema = vine.object({
      first_name: vine.string().trim().minLength(2).maxLength(50),
      last_name: vine.string().trim().minLength(2).maxLength(50),
      email: vine.string().email().unique(async (db, value) => {
        const user = await User.findBy('email', value)
        return !user
      }),
      password: vine.string().minLength(8).maxLength(32).confirmed(),
      user_type: vine.string().in([UserType.CUSTOMER, UserType.MERCHANT]),
      terms: vine.boolean().equals(true),
    })

    try {
      const payload = await vine.validate({
        schema: registerSchema,
        data: request.all(),
      })

      // Create user
      const user = new User()
      user.firstName = payload.first_name
      user.lastName = payload.last_name
      user.email = payload.email
      user.password = payload.password
      user.userType = payload.user_type as UserType
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
    } catch (error) {
      // Validation failed
      session.flash('errors', error.messages || { error: 'Registration failed' })
      return response.redirect().back()
    }
  }

  /**
   * Log the user out
   */
  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/')
  }

  /**
   * Show forgot password form
   */
  async showForgotPassword({ view }: HttpContext) {
    return view.render('pages/auth/forgot-password')
  }

  /**
   * Handle forgot password form submission
   */
  async forgotPassword({ request, response, session }: HttpContext) {
    // Validate input
    const schema = vine.object({
      email: vine.string().email(),
    })

    const payload = await vine.validate({
      schema,
      data: request.all(),
    })

    try {
      // Find user by email
      const user = await User.findBy('email', payload.email)
      
      if (user) {
        // In a real application, you would send a password reset email here
        // For now, we'll just show a success message
      }

      // Always show success to prevent email enumeration
      session.flash('success', 'If your email is registered, you will receive password reset instructions')
      return response.redirect('/auth/login')
    } catch (error) {
      session.flash('error', 'Something went wrong')
      return response.redirect().back()
    }
  }

  /**
   * Show reset password form
   */
  async showResetPassword({ view, params }: HttpContext) {
    // In a real application, you would validate the token here
    return view.render('pages/auth/reset-password', { token: params.token })
  }

  /**
   * Handle reset password form submission
   */
  async resetPassword({ request, response, session }: HttpContext) {
    // Validate input
    const schema = vine.object({
      token: vine.string(),
      email: vine.string().email(),
      password: vine.string().minLength(8).maxLength(32).confirmed(),
    })

    const payload = await vine.validate({
      schema,
      data: request.all(),
    })

    try {
      // In a real application, you would validate the token and update the password
      // For now, we'll just show a success message
      session.flash('success', 'Your password has been reset successfully')
      return response.redirect('/auth/login')
    } catch (error) {
      session.flash('error', 'Invalid or expired token')
      return response.redirect().back()
    }
  }
}

