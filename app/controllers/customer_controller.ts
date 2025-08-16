import { HttpContext } from '@adonisjs/core/http'
import User from '#models/User'
import Order from '#models/Order'
import Review from '#models/Review'
import Product from '#models/Product'
import Merchant from '#models/Merchant'
import { schema, validator } from '@adonisjs/core/validator'
import hash from '@adonisjs/core/services/hash'
import BaseController from './base_controller.js'

export default class CustomerController extends BaseController {
  /**
   * Display customer dashboard
   */
  async dashboard({ view, auth }: HttpContext) {
    return this.tryOrError(
      { view, auth },
      async () => {
        if (!auth.user) {
          return this.unauthorized({ view, auth })
        }

        // Get recent orders
        const recentOrders = await Order.query()
          .where('userId', auth.user.id)
          .preload('merchant')
          .orderBy('createdAt', 'desc')
          .limit(5)

        // Get order stats
        const totalOrders = await Order.query()
          .where('userId', auth.user.id)
          .count('* as total')
          .first()

        const pendingOrders = await Order.query()
          .where('userId', auth.user.id)
          .where('status', 'pending')
          .count('* as total')
          .first()

        const deliveredOrders = await Order.query()
          .where('userId', auth.user.id)
          .where('status', 'delivered')
          .count('* as total')
          .first()

        return view.render('pages/customer/dashboard', {
          user: auth.user,
          recentOrders,
          stats: {
            totalOrders: totalOrders?.$extras.total || 0,
            pendingOrders: pendingOrders?.$extras.total || 0,
            deliveredOrders: deliveredOrders?.$extras.total || 0,
          },
        })
      },
      'Failed to load customer dashboard'
    )
  }

  /**
   * Display customer profile
   */
  async profile({ view, auth }: HttpContext) {
    return this.tryOrError(
      { view, auth },
      async () => {
        if (!auth.user) {
          return this.unauthorized({ view, auth })
        }

        return view.render('pages/customer/profile', {
          user: auth.user,
        })
      },
      'Failed to load customer profile'
    )
  }

  /**
   * Update customer profile
   */
  async updateProfile({ request, response, auth, session }: HttpContext) {
    return this.tryOrError(
      { request, response, auth, session },
      async () => {
        if (!auth.user) {
          return this.unauthorized({ request, response, auth, session })
        }

        // Validate input
        const profileSchema = schema.create({
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
            validator.unique({ table: 'users', column: 'email', whereNot: { id: auth.user.id } })
          ]),
          phone: schema.string.optional(),
        })

        const payload = await validator.validate({
          schema: profileSchema,
          data: request.all(),
        })

        // Update user profile
        auth.user.firstName = payload.first_name
        auth.user.lastName = payload.last_name
        auth.user.email = payload.email
        auth.user.phone = payload.phone || null

        await auth.user.save()

        // Handle avatar upload (in a real app)
        // const avatar = request.file('avatar')
        // if (avatar) {
        //   const fileName = `${Date.now()}-${avatar.clientName}`
        //   await avatar.move(Application.publicPath('uploads/avatars'), {
        //     name: fileName,
        //   })
        //   user.avatar = `uploads/avatars/${fileName}`
        //   await user.save()
        // }

        session.flash('success', 'Profile updated successfully')
        return response.redirect('/customer/profile')
      },
      'Failed to update profile'
    )
  }

  /**
   * Show change password form
   */
  async showChangePassword({ view, auth }: HttpContext) {
    return this.tryOrError(
      { view, auth },
      async () => {
        if (!auth.user) {
          return this.unauthorized({ view, auth })
        }

        return view.render('pages/customer/change-password')
      },
      'Failed to load change password page'
    )
  }

  /**
   * Update password
   */
  async updatePassword({ request, response, auth, session }: HttpContext) {
    return this.tryOrError(
      { request, response, auth, session },
      async () => {
        if (!auth.user) {
          return this.unauthorized({ request, response, auth, session })
        }

        // Validate input
        const passwordSchema = schema.create({
          current_password: schema.string(),
          password: schema.string([
            validator.minLength(8),
            validator.maxLength(32),
            validator.confirmed('password_confirmation')
          ]),
          password_confirmation: schema.string(),
        })

        const payload = await validator.validate({
          schema: passwordSchema,
          data: request.all(),
        })

        // Verify current password
        const isValid = await hash.verify(auth.user.password, payload.current_password)
        if (!isValid) {
          session.flash('error', 'Current password is incorrect')
          return response.redirect().back()
        }

        // Update password
        auth.user.password = payload.password
        await auth.user.save()

        session.flash('success', 'Password updated successfully')
        return response.redirect('/customer/profile')
      },
      'Failed to update password'
    )
  }

  /**
   * Display customer reviews
   */
  async reviews({ view, auth, request }: HttpContext) {
    return this.tryOrError(
      { view, auth, request },
      async () => {
        if (!auth.user) {
          return this.unauthorized({ view, auth, request })
        }

        const page = request.input('page', 1)
        const limit = 10
        const type = request.input('type', 'all')

        // Build query
        const reviewsQuery = Review.query()
          .where('userId', auth.user.id)

        // Apply type filter
        if (type !== 'all') {
          reviewsQuery.where('type', type)
        }

        // Get paginated results
        const reviews = await reviewsQuery
          .preload('product')
          .preload('merchant')
          .orderBy('createdAt', 'desc')
          .paginate(page, limit)

        return view.render('pages/customer/reviews', {
          reviews,
          type,
        })
      },
      'Failed to load customer reviews'
    )
  }

  /**
   * Show form to add a product review
   */
  async showAddProductReview({ view, params, auth, session }: HttpContext) {
    return this.tryOrError(
      { view, params, auth, session },
      async () => {
        if (!auth.user) {
          return this.unauthorized({ view, params, auth, session })
        }

        // Check if user has purchased the product
        const order = await Order.query()
          .where('userId', auth.user.id)
          .whereHas('items', (query) => {
            query.where('productId', params.productId)
          })
          .where('status', 'delivered')
          .first()

        if (!order) {
          session.flash('error', 'You can only review products you have purchased')
          return this.forbidden({ view, params, auth, session }, 'You can only review products you have purchased')
        }

        // Check if user has already reviewed the product
        const existingReview = await Review.query()
          .where('userId', auth.user.id)
          .where('productId', params.productId)
          .where('type', 'product')
          .first()

        if (existingReview) {
          session.flash('error', 'You have already reviewed this product')
          return this.forbidden({ view, params, auth, session }, 'You have already reviewed this product')
        }

        // Get product
        const product = await Product.findOrFail(params.productId)

        return view.render('pages/customer/add-review', {
          product,
          type: 'product',
        })
      },
      'Failed to load product review form'
    )
  }

  /**
   * Show form to add a merchant review
   */
  async showAddMerchantReview({ view, params, auth, session }: HttpContext) {
    return this.tryOrError(
      { view, params, auth, session },
      async () => {
        if (!auth.user) {
          return this.unauthorized({ view, params, auth, session })
        }

        // Check if user has purchased from the merchant
        const order = await Order.query()
          .where('userId', auth.user.id)
          .where('merchantId', params.merchantId)
          .where('status', 'delivered')
          .first()

        if (!order) {
          session.flash('error', 'You can only review merchants you have purchased from')
          return this.forbidden({ view, params, auth, session }, 'You can only review merchants you have purchased from')
        }

        // Check if user has already reviewed the merchant
        const existingReview = await Review.query()
          .where('userId', auth.user.id)
          .where('merchantId', params.merchantId)
          .where('type', 'merchant')
          .first()

        if (existingReview) {
          session.flash('error', 'You have already reviewed this merchant')
          return this.forbidden({ view, params, auth, session }, 'You have already reviewed this merchant')
        }

        // Get merchant
        const merchant = await Merchant.findOrFail(params.merchantId)

        return view.render('pages/customer/add-review', {
          merchant,
          type: 'merchant',
        })
      },
      'Failed to load merchant review form'
    )
  }

  /**
   * Store a new review
   */
  async storeReview({ request, response, auth, session }: HttpContext) {
    return this.tryOrError(
      { request, response, auth, session },
      async () => {
        if (!auth.user) {
          return this.unauthorized({ request, response, auth, session })
        }

        // Validate input
        const reviewSchema = schema.create({
          type: schema.enum(['product', 'merchant']),
          product_id: schema.number.optional([
            validator.requiredWhen('type', '=', 'product')
          ]),
          merchant_id: schema.number.optional([
            validator.requiredWhen('type', '=', 'merchant')
          ]),
          rating: schema.number([
            validator.range(1, 5)
          ]),
          title: schema.string([
            validator.trim(),
            validator.minLength(3),
            validator.maxLength(100)
          ]),
          comment: schema.string([
            validator.trim(),
            validator.minLength(10)
          ]),
        })

        const payload = await validator.validate({
          schema: reviewSchema,
          data: request.all(),
        })

        // Create review
        const review = new Review()
        review.userId = auth.user.id
        review.type = payload.type
        review.productId = payload.product_id || null
        review.merchantId = payload.merchant_id || null
        review.rating = payload.rating
        review.title = payload.title
        review.comment = payload.comment

        await review.save()

        session.flash('success', 'Review submitted successfully')
        return response.redirect('/customer/reviews')
      },
      'Failed to submit review'
    )
  }

  /**
   * Delete a review
   */
  async deleteReview({ response, params, auth, session }: HttpContext) {
    return this.tryOrError(
      { response, params, auth, session },
      async () => {
        if (!auth.user) {
          return this.unauthorized({ response, params, auth, session })
        }

        // Get review
        const review = await Review.query()
          .where('id', params.id)
          .where('userId', auth.user.id)
          .firstOrFail()

        // Delete review
        await review.delete()

        session.flash('success', 'Review deleted successfully')
        return response.redirect('/customer/reviews')
      },
      'Failed to delete review'
    )
  }

  /**
   * Display customer wishlist
   */
  async wishlist({ view, auth }: HttpContext) {
    return this.tryOrError(
      { view, auth },
      async () => {
        if (!auth.user) {
          return this.unauthorized({ view, auth })
        }

        // In a real app, you would have a Wishlist model
        // For now, we'll just render the view
        return view.render('pages/customer/wishlist')
      },
      'Failed to load wishlist'
    )
  }

  /**
   * Display customer addresses
   */
  async addresses({ view, auth }: HttpContext) {
    return this.tryOrError(
      { view, auth },
      async () => {
        if (!auth.user) {
          return this.unauthorized({ view, auth })
        }

        // In a real app, you would have an Address model
        // For now, we'll just render the view
        return view.render('pages/customer/addresses')
      },
      'Failed to load addresses'
    )
  }
}

