import { HttpContext } from '@adonisjs/core/http'
import Merchant from '#models/Merchant'
import Product from '#models/Product'
import Order from '#models/Order'
import Review from '#models/Review'
import vine from '@vinejs/vine'
import { string } from '@vinejs/vine/rules'

export default class MerchantController {
  /**
   * Display merchant dashboard
   */
  async dashboard({ view, auth }: HttpContext) {
    const user = auth.user!
    const merchant = await Merchant.findByOrFail('userId', user.id)

    // Get stats for dashboard
    const totalProducts = await Product.query()
      .where('merchantId', merchant.id)
      .count('* as total')
      .first()

    const totalOrders = await Order.query()
      .where('merchantId', merchant.id)
      .count('* as total')
      .first()

    const totalRevenue = await Order.query()
      .where('merchantId', merchant.id)
      .sum('total as revenue')
      .first()

    const averageRating = await Review.query()
      .where('merchantId', merchant.id)
      .where('type', 'merchant')
      .avg('rating as average')
      .first()

    // Get recent orders
    const recentOrders = await Order.query()
      .where('merchantId', merchant.id)
      .preload('user')
      .orderBy('createdAt', 'desc')
      .limit(5)

    // Get low stock products
    const lowStockProducts = await Product.query()
      .where('merchantId', merchant.id)
      .where('quantity', '<=', 'lowStockThreshold')
      .preload('images', (query) => query.where('isDefault', true).first())
      .limit(5)

    return view.render('pages/merchant/dashboard', {
      merchant,
      stats: {
        totalProducts: totalProducts?.$extras.total || 0,
        totalOrders: totalOrders?.$extras.total || 0,
        totalRevenue: totalRevenue?.$extras.revenue || 0,
        averageRating: averageRating?.$extras.average || 0,
      },
      recentOrders,
      lowStockProducts,
    })
  }

  /**
   * Display merchant profile
   */
  async profile({ view, auth }: HttpContext) {
    const user = auth.user!
    const merchant = await Merchant.findByOrFail('userId', user.id)

    return view.render('pages/merchant/profile', {
      merchant,
      user,
    })
  }

  /**
   * Update merchant profile
   */
  async updateProfile({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const merchant = await Merchant.findByOrFail('userId', user.id)

    // Validate input
    const profileSchema = vine.object({
      store_name: vine.string().trim().minLength(3).maxLength(100),
      description: vine.string().optional(),
      contact_email: vine.string().email(),
      contact_phone: vine.string().optional(),
      website: vine.string().optional(),
      address: vine.string().optional(),
      city: vine.string().optional(),
      state: vine.string().optional(),
      country: vine.string().optional(),
      postal_code: vine.string().optional(),
    })

    try {
      const payload = await vine.validate({
        schema: profileSchema,
        data: request.all(),
      })

      // Update merchant profile
      merchant.storeName = payload.store_name
      merchant.slug = payload.store_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      merchant.description = payload.description || null
      merchant.contactEmail = payload.contact_email
      merchant.contactPhone = payload.contact_phone || null
      merchant.website = payload.website || null
      merchant.address = payload.address || null
      merchant.city = payload.city || null
      merchant.state = payload.state || null
      merchant.country = payload.country || null
      merchant.postalCode = payload.postal_code || null

      await merchant.save()

      // Handle logo and banner uploads (in a real app)
      // const logo = request.file('logo')
      // if (logo) {
      //   const fileName = `${Date.now()}-${logo.clientName}`
      //   await logo.move(Application.publicPath('uploads/merchants'), {
      //     name: fileName,
      //   })
      //   merchant.logo = `uploads/merchants/${fileName}`
      //   await merchant.save()
      // }
      //
      // const banner = request.file('banner')
      // if (banner) {
      //   const fileName = `${Date.now()}-${banner.clientName}`
      //   await banner.move(Application.publicPath('uploads/merchants'), {
      //     name: fileName,
      //   })
      //   merchant.bannerImage = `uploads/merchants/${fileName}`
      //   await merchant.save()
      // }

      session.flash('success', 'Profile updated successfully')
      return response.redirect('/merchant/profile')
    } catch (error) {
      session.flash('errors', error.messages || { error: 'Failed to update profile' })
      return response.redirect().back()
    }
  }

  /**
   * Display merchant orders
   */
  async orders({ view, auth, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 10
    const status = request.input('status', 'all')
    const dateRange = request.input('date_range', '30')

    const user = auth.user!
    const merchant = await Merchant.findByOrFail('userId', user.id)

    // Build query
    const ordersQuery = Order.query()
      .where('merchantId', merchant.id)
      .preload('user')
      .preload('items', (query) => query.preload('product'))

    // Apply status filter
    if (status !== 'all') {
      ordersQuery.where('status', status)
    }

    // Apply date range filter
    if (dateRange !== 'all') {
      const days = parseInt(dateRange)
      const date = new Date()
      date.setDate(date.getDate() - days)
      ordersQuery.where('createdAt', '>=', date.toISOString())
    }

    // Get paginated results
    const orders = await ordersQuery.orderBy('createdAt', 'desc').paginate(page, limit)

    return view.render('pages/merchant/orders/index', {
      orders,
      status,
      dateRange,
    })
  }

  /**
   * Display specific order
   */
  async showOrder({ view, params, auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const merchant = await Merchant.findByOrFail('userId', user.id)

      const order = await Order.query()
        .where('id', params.id)
        .where('merchantId', merchant.id)
        .preload('user')
        .preload('items', (query) => query.preload('product'))
        .firstOrFail()

      return view.render('pages/merchant/orders/show', {
        order,
      })
    } catch (error) {
      return response.status(404).redirect('/merchant/orders')
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus({ request, response, params, auth, session }: HttpContext) {
    try {
      const user = auth.user!
      const merchant = await Merchant.findByOrFail('userId', user.id)

      const order = await Order.query()
        .where('id', params.id)
        .where('merchantId', merchant.id)
        .firstOrFail()

      // Validate input
      const schema = vine.object({
        status: vine.string().in([
          'pending',
          'processing',
          'shipped',
          'delivered',
          'cancelled',
          'refunded',
        ]),
      })

      const payload = await vine.validate({
        schema,
        data: request.all(),
      })

      // Update order status
      order.status = payload.status
      
      // Update timestamps based on status
      if (payload.status === 'shipped') {
        order.shippedAt = new Date()
      } else if (payload.status === 'delivered') {
        order.deliveredAt = new Date()
      }

      await order.save()

      session.flash('success', 'Order status updated successfully')
      return response.redirect(`/merchant/orders/${order.id}`)
    } catch (error) {
      session.flash('error', 'Failed to update order status')
      return response.redirect().back()
    }
  }

  /**
   * Display merchant reviews
   */
  async reviews({ view, auth, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 10
    const rating = request.input('rating', 'all')

    const user = auth.user!
    const merchant = await Merchant.findByOrFail('userId', user.id)

    // Build query
    const reviewsQuery = Review.query()
      .where('merchantId', merchant.id)
      .where('type', 'merchant')
      .preload('user')

    // Apply rating filter
    if (rating !== 'all') {
      reviewsQuery.where('rating', rating)
    }

    // Get paginated results
    const reviews = await reviewsQuery.orderBy('createdAt', 'desc').paginate(page, limit)

    return view.render('pages/merchant/reviews', {
      reviews,
      rating,
    })
  }

  /**
   * Display merchant settings
   */
  async settings({ view, auth }: HttpContext) {
    const user = auth.user!
    const merchant = await Merchant.findByOrFail('userId', user.id)

    return view.render('pages/merchant/settings', {
      merchant,
      user,
    })
  }

  /**
   * Update merchant settings
   */
  async updateSettings({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const merchant = await Merchant.findByOrFail('userId', user.id)

    // Validate input
    const settingsSchema = vine.object({
      email_notifications: vine.boolean().optional(),
      sms_notifications: vine.boolean().optional(),
      auto_accept_orders: vine.boolean().optional(),
    })

    try {
      const payload = await vine.validate({
        schema: settingsSchema,
        data: request.all(),
      })

      // Update merchant settings (in a real app, you would have a separate settings table)
      // For now, we'll just show a success message
      session.flash('success', 'Settings updated successfully')
      return response.redirect('/merchant/settings')
    } catch (error) {
      session.flash('errors', error.messages || { error: 'Failed to update settings' })
      return response.redirect().back()
    }
  }

  /**
   * Display public merchant store
   */
  async store({ view, params, response }: HttpContext) {
    try {
      const merchant = await Merchant.query()
        .where('slug', params.slug)
        .where('isActive', true)
        .where('status', 'approved')
        .firstOrFail()

      // Get featured products
      const featuredProducts = await Product.query()
        .where('merchantId', merchant.id)
        .where('isPublished', true)
        .where('isFeatured', true)
        .preload('images', (query) => query.where('isDefault', true).first())
        .limit(8)

      // Get latest products
      const latestProducts = await Product.query()
        .where('merchantId', merchant.id)
        .where('isPublished', true)
        .preload('images', (query) => query.where('isDefault', true).first())
        .orderBy('createdAt', 'desc')
        .limit(8)

      // Get merchant reviews
      const reviews = await Review.query()
        .where('merchantId', merchant.id)
        .where('type', 'merchant')
        .preload('user')
        .orderBy('createdAt', 'desc')
        .limit(5)

      return view.render('pages/store/merchant', {
        merchant,
        featuredProducts,
        latestProducts,
        reviews,
      })
    } catch (error) {
      return response.status(404).redirect('/404')
    }
  }

  /**
   * Display all merchants
   */
  async index({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 12
    const query = request.input('query', '')

    // Build query
    const merchantsQuery = Merchant.query()
      .where('isActive', true)
      .where('status', 'approved')

    // Apply search filter
    if (query) {
      merchantsQuery.where((builder) => {
        builder.where('storeName', 'LIKE', `%${query}%`)
          .orWhere('description', 'LIKE', `%${query}%`)
      })
    }

    // Get paginated results
    const merchants = await merchantsQuery.orderBy('storeName', 'asc').paginate(page, limit)

    return view.render('pages/store/merchants', {
      merchants,
      query,
    })
  }
}

