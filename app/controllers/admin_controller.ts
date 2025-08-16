import { HttpContext } from '@adonisjs/core/http'
import User, { UserType } from '#models/User'
import Merchant, { MerchantStatus } from '#models/Merchant'
import Product from '#models/Product'
import Order from '#models/Order'
import Category from '#models/Category'
import vine from '@vinejs/vine'
import { string } from '@vinejs/vine/rules'

export default class AdminController {
  /**
   * Display admin dashboard
   */
  async dashboard({ view }: HttpContext) {
    // Get stats for dashboard
    const totalUsers = await User.query().count('* as total').first()
    const totalMerchants = await Merchant.query().count('* as total').first()
    const totalProducts = await Product.query().count('* as total').first()
    const totalOrders = await Order.query().count('* as total').first()
    const totalRevenue = await Order.query().sum('total as revenue').first()

    // Get pending merchants
    const pendingMerchants = await Merchant.query()
      .where('status', MerchantStatus.PENDING)
      .preload('user')
      .limit(5)

    // Get recent orders
    const recentOrders = await Order.query()
      .preload('user')
      .preload('merchant')
      .orderBy('createdAt', 'desc')
      .limit(5)

    return view.render('pages/admin/dashboard', {
      stats: {
        totalUsers: totalUsers?.$extras.total || 0,
        totalMerchants: totalMerchants?.$extras.total || 0,
        totalProducts: totalProducts?.$extras.total || 0,
        totalOrders: totalOrders?.$extras.total || 0,
        totalRevenue: totalRevenue?.$extras.revenue || 0,
      },
      pendingMerchants,
      recentOrders,
    })
  }

  /**
   * Display users list
   */
  async users({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 10
    const query = request.input('query', '')
    const userType = request.input('user_type', 'all')

    // Build query
    const usersQuery = User.query()

    // Apply search filter
    if (query) {
      usersQuery.where((builder) => {
        builder.where('firstName', 'LIKE', `%${query}%`)
          .orWhere('lastName', 'LIKE', `%${query}%`)
          .orWhere('email', 'LIKE', `%${query}%`)
      })
    }

    // Apply user type filter
    if (userType !== 'all') {
      usersQuery.where('userType', userType)
    }

    // Get paginated results
    const users = await usersQuery.orderBy('createdAt', 'desc').paginate(page, limit)

    return view.render('pages/admin/users/index', {
      users,
      query,
      userType,
    })
  }

  /**
   * Show form to create a new user
   */
  async createUser({ view }: HttpContext) {
    return view.render('pages/admin/users/create')
  }

  /**
   * Store a new user
   */
  async storeUser({ request, response, session }: HttpContext) {
    // Validate input
    const userSchema = vine.object({
      first_name: vine.string().trim().minLength(2).maxLength(50),
      last_name: vine.string().trim().minLength(2).maxLength(50),
      email: vine.string().email().unique(async (db, value) => {
        const user = await User.findBy('email', value)
        return !user
      }),
      password: vine.string().minLength(8).maxLength(32),
      user_type: vine.string().in([UserType.ADMIN, UserType.MERCHANT, UserType.CUSTOMER]),
      is_active: vine.boolean().optional(),
    })

    try {
      const payload = await vine.validate({
        schema: userSchema,
        data: request.all(),
      })

      // Create user
      const user = new User()
      user.firstName = payload.first_name
      user.lastName = payload.last_name
      user.email = payload.email
      user.password = payload.password
      user.userType = payload.user_type as UserType
      user.isActive = payload.is_active || true

      await user.save()

      session.flash('success', 'User created successfully')
      return response.redirect('/admin/users')
    } catch (error) {
      session.flash('errors', error.messages || { error: 'Failed to create user' })
      return response.redirect().back()
    }
  }

  /**
   * Show form to edit a user
   */
  async editUser({ view, params, response }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)
      return view.render('pages/admin/users/edit', { user })
    } catch (error) {
      return response.status(404).redirect('/admin/users')
    }
  }

  /**
   * Update a user
   */
  async updateUser({ request, response, params, session }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)

      // Validate input
      const userSchema = vine.object({
        first_name: vine.string().trim().minLength(2).maxLength(50),
        last_name: vine.string().trim().minLength(2).maxLength(50),
        email: vine.string().email().unique(async (db, value) => {
          const existingUser = await User.query()
            .where('email', value)
            .where('id', '!=', user.id)
            .first()
          return !existingUser
        }),
        password: vine.string().minLength(8).maxLength(32).optional(),
        user_type: vine.string().in([UserType.ADMIN, UserType.MERCHANT, UserType.CUSTOMER]),
        is_active: vine.boolean().optional(),
      })

      const payload = await vine.validate({
        schema: userSchema,
        data: request.all(),
      })

      // Update user
      user.firstName = payload.first_name
      user.lastName = payload.last_name
      user.email = payload.email
      user.userType = payload.user_type as UserType
      user.isActive = payload.is_active || false

      if (payload.password) {
        user.password = payload.password
      }

      await user.save()

      session.flash('success', 'User updated successfully')
      return response.redirect('/admin/users')
    } catch (error) {
      session.flash('errors', error.messages || { error: 'Failed to update user' })
      return response.redirect().back()
    }
  }

  /**
   * Delete a user
   */
  async deleteUser({ response, params, session }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)
      await user.delete()

      session.flash('success', 'User deleted successfully')
      return response.redirect('/admin/users')
    } catch (error) {
      session.flash('error', 'Failed to delete user')
      return response.redirect().back()
    }
  }

  /**
   * Display merchants list
   */
  async merchants({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 10
    const query = request.input('query', '')
    const status = request.input('status', 'all')

    // Build query
    const merchantsQuery = Merchant.query().preload('user')

    // Apply search filter
    if (query) {
      merchantsQuery.where((builder) => {
        builder.where('storeName', 'LIKE', `%${query}%`)
          .orWhere('contactEmail', 'LIKE', `%${query}%`)
      })
    }

    // Apply status filter
    if (status !== 'all') {
      merchantsQuery.where('status', status)
    }

    // Get paginated results
    const merchants = await merchantsQuery.orderBy('createdAt', 'desc').paginate(page, limit)

    return view.render('pages/admin/merchants/index', {
      merchants,
      query,
      status,
    })
  }

  /**
   * Show merchant details
   */
  async showMerchant({ view, params, response }: HttpContext) {
    try {
      const merchant = await Merchant.query()
        .where('id', params.id)
        .preload('user')
        .firstOrFail()

      // Get merchant stats
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

      return view.render('pages/admin/merchants/show', {
        merchant,
        stats: {
          totalProducts: totalProducts?.$extras.total || 0,
          totalOrders: totalOrders?.$extras.total || 0,
          totalRevenue: totalRevenue?.$extras.revenue || 0,
        },
      })
    } catch (error) {
      return response.status(404).redirect('/admin/merchants')
    }
  }

  /**
   * Update merchant status
   */
  async updateMerchantStatus({ request, response, params, session }: HttpContext) {
    try {
      const merchant = await Merchant.findOrFail(params.id)

      // Validate input
      const schema = vine.object({
        status: vine.string().in([
          MerchantStatus.PENDING,
          MerchantStatus.APPROVED,
          MerchantStatus.REJECTED,
          MerchantStatus.SUSPENDED,
        ]),
      })

      const payload = await vine.validate({
        schema,
        data: request.all(),
      })

      // Update merchant status
      merchant.status = payload.status
      
      // Update active status based on merchant status
      if (payload.status === MerchantStatus.APPROVED) {
        merchant.isActive = true
      } else if (payload.status === MerchantStatus.REJECTED || payload.status === MerchantStatus.SUSPENDED) {
        merchant.isActive = false
      }

      await merchant.save()

      session.flash('success', 'Merchant status updated successfully')
      return response.redirect(`/admin/merchants/${merchant.id}`)
    } catch (error) {
      session.flash('error', 'Failed to update merchant status')
      return response.redirect().back()
    }
  }

  /**
   * Display categories list
   */
  async categories({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 10
    const query = request.input('query', '')

    // Build query
    const categoriesQuery = Category.query()

    // Apply search filter
    if (query) {
      categoriesQuery.where((builder) => {
        builder.where('name', 'LIKE', `%${query}%`)
          .orWhere('description', 'LIKE', `%${query}%`)
      })
    }

    // Get paginated results
    const categories = await categoriesQuery.orderBy('sortOrder', 'asc').paginate(page, limit)

    return view.render('pages/admin/categories/index', {
      categories,
      query,
    })
  }

  /**
   * Show form to create a new category
   */
  async createCategory({ view }: HttpContext) {
    // Get parent categories for dropdown
    const parentCategories = await Category.query()
      .whereNull('parentId')
      .orderBy('name', 'asc')

    return view.render('pages/admin/categories/create', {
      parentCategories,
    })
  }

  /**
   * Store a new category
   */
  async storeCategory({ request, response, session }: HttpContext) {
    // Validate input
    const categorySchema = vine.object({
      name: vine.string().trim().minLength(2).maxLength(50),
      description: vine.string().optional(),
      parent_id: vine.number().optional(),
      sort_order: vine.number().default(0),
      is_active: vine.boolean().optional(),
    })

    try {
      const payload = await vine.validate({
        schema: categorySchema,
        data: request.all(),
      })

      // Create category
      const category = new Category()
      category.name = payload.name
      category.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      category.description = payload.description || null
      category.parentId = payload.parent_id || null
      category.sortOrder = payload.sort_order
      category.isActive = payload.is_active || true

      await category.save()

      // Handle image upload (in a real app)
      // const image = request.file('image')
      // if (image) {
      //   const fileName = `${Date.now()}-${image.clientName}`
      //   await image.move(Application.publicPath('uploads/categories'), {
      //     name: fileName,
      //   })
      //   category.image = `uploads/categories/${fileName}`
      //   await category.save()
      // }

      session.flash('success', 'Category created successfully')
      return response.redirect('/admin/categories')
    } catch (error) {
      session.flash('errors', error.messages || { error: 'Failed to create category' })
      return response.redirect().back()
    }
  }

  /**
   * Show form to edit a category
   */
  async editCategory({ view, params, response }: HttpContext) {
    try {
      const category = await Category.findOrFail(params.id)

      // Get parent categories for dropdown
      const parentCategories = await Category.query()
        .whereNull('parentId')
        .where('id', '!=', category.id)
        .orderBy('name', 'asc')

      return view.render('pages/admin/categories/edit', {
        category,
        parentCategories,
      })
    } catch (error) {
      return response.status(404).redirect('/admin/categories')
    }
  }

  /**
   * Update a category
   */
  async updateCategory({ request, response, params, session }: HttpContext) {
    try {
      const category = await Category.findOrFail(params.id)

      // Validate input
      const categorySchema = vine.object({
        name: vine.string().trim().minLength(2).maxLength(50),
        description: vine.string().optional(),
        parent_id: vine.number().optional(),
        sort_order: vine.number(),
        is_active: vine.boolean().optional(),
      })

      const payload = await vine.validate({
        schema: categorySchema,
        data: request.all(),
      })

      // Update category
      category.name = payload.name
      category.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      category.description = payload.description || null
      category.parentId = payload.parent_id || null
      category.sortOrder = payload.sort_order
      category.isActive = payload.is_active || false

      await category.save()

      // Handle image upload (in a real app)
      // const image = request.file('image')
      // if (image) {
      //   const fileName = `${Date.now()}-${image.clientName}`
      //   await image.move(Application.publicPath('uploads/categories'), {
      //     name: fileName,
      //   })
      //   category.image = `uploads/categories/${fileName}`
      //   await category.save()
      // }

      session.flash('success', 'Category updated successfully')
      return response.redirect('/admin/categories')
    } catch (error) {
      session.flash('errors', error.messages || { error: 'Failed to update category' })
      return response.redirect().back()
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory({ response, params, session }: HttpContext) {
    try {
      const category = await Category.findOrFail(params.id)

      // Check if category has children
      const hasChildren = await Category.query()
        .where('parentId', category.id)
        .first()

      if (hasChildren) {
        session.flash('error', 'Cannot delete category with subcategories')
        return response.redirect().back()
      }

      // Check if category has products
      const hasProducts = await category.related('products').query().first()
      if (hasProducts) {
        session.flash('error', 'Cannot delete category with products')
        return response.redirect().back()
      }

      await category.delete()

      session.flash('success', 'Category deleted successfully')
      return response.redirect('/admin/categories')
    } catch (error) {
      session.flash('error', 'Failed to delete category')
      return response.redirect().back()
    }
  }

  /**
   * Display orders list
   */
  async orders({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 10
    const query = request.input('query', '')
    const status = request.input('status', 'all')

    // Build query
    const ordersQuery = Order.query()
      .preload('user')
      .preload('merchant')

    // Apply search filter
    if (query) {
      ordersQuery.where((builder) => {
        builder.where('orderNumber', 'LIKE', `%${query}%`)
      })
    }

    // Apply status filter
    if (status !== 'all') {
      ordersQuery.where('status', status)
    }

    // Get paginated results
    const orders = await ordersQuery.orderBy('createdAt', 'desc').paginate(page, limit)

    return view.render('pages/admin/orders/index', {
      orders,
      query,
      status,
    })
  }

  /**
   * Show order details
   */
  async showOrder({ view, params, response }: HttpContext) {
    try {
      const order = await Order.query()
        .where('id', params.id)
        .preload('user')
        .preload('merchant')
        .preload('items', (query) => query.preload('product'))
        .firstOrFail()

      return view.render('pages/admin/orders/show', {
        order,
      })
    } catch (error) {
      return response.status(404).redirect('/admin/orders')
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus({ request, response, params, session }: HttpContext) {
    try {
      const order = await Order.findOrFail(params.id)

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
      return response.redirect(`/admin/orders/${order.id}`)
    } catch (error) {
      session.flash('error', 'Failed to update order status')
      return response.redirect().back()
    }
  }

  /**
   * Display settings page
   */
  async settings({ view }: HttpContext) {
    return view.render('pages/admin/settings')
  }

  /**
   * Update settings
   */
  async updateSettings({ request, response, session }: HttpContext) {
    // Validate input
    const settingsSchema = vine.object({
      site_name: vine.string().trim(),
      site_description: vine.string().optional(),
      contact_email: vine.string().email(),
      contact_phone: vine.string().optional(),
      currency: vine.string().length(3),
      tax_rate: vine.number().min(0).max(100),
      shipping_fee: vine.number().min(0),
      free_shipping_threshold: vine.number().min(0),
    })

    try {
      const payload = await vine.validate({
        schema: settingsSchema,
        data: request.all(),
      })

      // In a real app, you would update settings in the database
      // For now, we'll just show a success message
      session.flash('success', 'Settings updated successfully')
      return response.redirect('/admin/settings')
    } catch (error) {
      session.flash('errors', error.messages || { error: 'Failed to update settings' })
      return response.redirect().back()
    }
  }
}

