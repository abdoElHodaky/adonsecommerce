import { HttpContext } from '@adonisjs/core/http'
import User from '#models/User'
import Order from '#models/Order'
import Review from '#models/Review'
import vine from '@vinejs/vine'
import hash from '@adonisjs/core/services/hash'
import { string } from '@vinejs/vine/rules'

export default class CustomerController {
  /**
   * Display customer dashboard
   */
  async dashboard({ view, auth }: HttpContext) {
    const user = auth.user!

    // Get recent orders
    const recentOrders = await Order.query()
      .where('userId', user.id)
      .preload('merchant')
      .orderBy('createdAt', 'desc')
      .limit(5)

    // Get order stats
    const totalOrders = await Order.query()
      .where('userId', user.id)
      .count('* as total')
      .first()

    const pendingOrders = await Order.query()
      .where('userId', user.id)
      .where('status', 'pending')
      .count('* as total')
      .first()

    const deliveredOrders = await Order.query()
      .where('userId', user.id)
      .where('status', 'delivered')
      .count('* as total')
      .first()

    return view.render('pages/customer/dashboard', {
      user,
      recentOrders,
      stats: {
        totalOrders: totalOrders?.$extras.total || 0,
        pendingOrders: pendingOrders?.$extras.total || 0,
        deliveredOrders: deliveredOrders?.$extras.total || 0,
      },
    })
  }

  /**
   * Display customer profile
   */
  async profile({ view, auth }: HttpContext) {
    const user = auth.user!

    return view.render('pages/customer/profile', {
      user,
    })
  }

  /**
   * Update customer profile
   */
  async updateProfile({ request, response, auth, session }: HttpContext) {
    const user = auth.user!

    // Validate input
    const profileSchema = vine.object({
      first_name: vine.string().trim().minLength(2).maxLength(50),
      last_name: vine.string().trim().minLength(2).maxLength(50),
      email: vine.string().email().unique(async (db, value) => {
        const existingUser = await User.query()
          .where('email', value)
          .where('id', '!=', user.id)
          .first()
        return !existingUser
      }),
      phone: vine.string().optional(),
    })

    try {
      const payload = await vine.validate({
        schema: profileSchema,
        data: request.all(),
      })

      // Update user profile
      user.firstName = payload.first_name
      user.lastName = payload.last_name
      user.email = payload.email
      user.phone = payload.phone || null

      await user.save()

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
    } catch (error) {
      session.flash('errors', error.messages || { error: 'Failed to update profile' })
      return response.redirect().back()
    }
  }

  /**
   * Show change password form
   */
  async showChangePassword({ view }: HttpContext) {
    return view.render('pages/customer/change-password')
  }

  /**
   * Update password
   */
  async updatePassword({ request, response, auth, session }: HttpContext) {
    const user = auth.user!

    // Validate input
    const passwordSchema = vine.object({
      current_password: vine.string(),
      password: vine.string().minLength(8).maxLength(32).confirmed(),
    })

    try {
      const payload = await vine.validate({
        schema: passwordSchema,
        data: request.all(),
      })

      // Verify current password
      const isValid = await hash.verify(user.password, payload.current_password)
      if (!isValid) {
        session.flash('error', 'Current password is incorrect')
        return response.redirect().back()
      }

      // Update password
      user.password = payload.password
      await user.save()

      session.flash('success', 'Password updated successfully')
      return response.redirect('/customer/profile')
    } catch (error) {
      session.flash('errors', error.messages || { error: 'Failed to update password' })
      return response.redirect().back()
    }
  }

  /**
   * Display customer reviews
   */
  async reviews({ view, auth, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 10
    const type = request.input('type', 'all')

    const user = auth.user!

    // Build query
    const reviewsQuery = Review.query()
      .where('userId', user.id)

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
  }

  /**
   * Show form to add a product review
   */
  async showAddProductReview({ view, params, auth, response }: HttpContext) {
    try {
      const user = auth.user!

      // Check if user has purchased the product
      const order = await Order.query()
        .where('userId', user.id)
        .whereHas('items', (query) => {
          query.where('productId', params.productId)
        })
        .where('status', 'delivered')
        .first()

      if (!order) {
        session.flash('error', 'You can only review products you have purchased')
        return response.redirect().back()
      }

      // Check if user has already reviewed the product
      const existingReview = await Review.query()
        .where('userId', user.id)
        .where('productId', params.productId)
        .where('type', 'product')
        .first()

      if (existingReview) {
        session.flash('error', 'You have already reviewed this product')
        return response.redirect().back()
      }

      // Get product
      const product = await Product.findOrFail(params.productId)

      return view.render('pages/customer/add-review', {
        product,
        type: 'product',
      })
    } catch (error) {
      return response.status(404).redirect('/customer/orders')
    }
  }

  /**
   * Show form to add a merchant review
   */
  async showAddMerchantReview({ view, params, auth, response }: HttpContext) {
    try {
      const user = auth.user!

      // Check if user has purchased from the merchant
      const order = await Order.query()
        .where('userId', user.id)
        .where('merchantId', params.merchantId)
        .where('status', 'delivered')
        .first()

      if (!order) {
        session.flash('error', 'You can only review merchants you have purchased from')
        return response.redirect().back()
      }

      // Check if user has already reviewed the merchant
      const existingReview = await Review.query()
        .where('userId', user.id)
        .where('merchantId', params.merchantId)
        .where('type', 'merchant')
        .first()

      if (existingReview) {
        session.flash('error', 'You have already reviewed this merchant')
        return response.redirect().back()
      }

      // Get merchant
      const merchant = await Merchant.findOrFail(params.merchantId)

      return view.render('pages/customer/add-review', {
        merchant,
        type: 'merchant',
      })
    } catch (error) {
      return response.status(404).redirect('/customer/orders')
    }
  }

  /**
   * Store a new review
   */
  async storeReview({ request, response, auth, session }: HttpContext) {
    const user = auth.user!

    // Validate input
    const reviewSchema = vine.object({
      type: vine.string().in(['product', 'merchant']),
      product_id: vine.number().when('type', {
        is: 'product',
        then: vine.number().positive(),
        otherwise: vine.number().optional(),
      }),
      merchant_id: vine.number().when('type', {
        is: 'merchant',
        then: vine.number().positive(),
        otherwise: vine.number().optional(),
      }),
      rating: vine.number().min(1).max(5),
      title: vine.string().trim().minLength(3).maxLength(100),
      comment: vine.string().trim().minLength(10),
    })

    try {
      const payload = await vine.validate({
        schema: reviewSchema,
        data: request.all(),
      })

      // Create review
      const review = new Review()
      review.userId = user.id
      review.type = payload.type
      review.productId = payload.product_id || null
      review.merchantId = payload.merchant_id || null
      review.rating = payload.rating
      review.title = payload.title
      review.comment = payload.comment

      await review.save()

      session.flash('success', 'Review submitted successfully')
      return response.redirect('/customer/reviews')
    } catch (error) {
      session.flash('errors', error.messages || { error: 'Failed to submit review' })
      return response.redirect().back()
    }
  }

  /**
   * Delete a review
   */
  async deleteReview({ response, params, auth, session }: HttpContext) {
    try {
      const user = auth.user!

      // Get review
      const review = await Review.query()
        .where('id', params.id)
        .where('userId', user.id)
        .firstOrFail()

      // Delete review
      await review.delete()

      session.flash('success', 'Review deleted successfully')
      return response.redirect('/customer/reviews')
    } catch (error) {
      session.flash('error', 'Failed to delete review')
      return response.redirect().back()
    }
  }

  /**
   * Display customer wishlist
   */
  async wishlist({ view, auth }: HttpContext) {
    // In a real app, you would have a Wishlist model
    // For now, we'll just render the view
    return view.render('pages/customer/wishlist')
  }

  /**
   * Display customer addresses
   */
  async addresses({ view, auth }: HttpContext) {
    // In a real app, you would have an Address model
    // For now, we'll just render the view
    return view.render('pages/customer/addresses')
  }
}

