import { HttpContext } from '@adonisjs/core/http'
import User, { UserType } from '#models/User'
import Merchant, { MerchantStatus } from '#models/Merchant'
import Product from '#models/Product'
import Order from '#models/Order'
import Category from '#models/Category'
import  validator  from '#start/validator'
import BaseController from './base_controller.js'

export default class AdminController extends BaseController {
  /**
   * Display admin dashboard
   */
  async dashboard({ view, auth }: HttpContext) {
    return this.tryOrError(
      { view, auth },
      async () => {
        if (!auth.user || auth.user.userType !== UserType.ADMIN) {
          return this.forbidden({ view, auth }, 'Only administrators can access this page')
        }

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
      },
      'Failed to load admin dashboard'
    )
  }

  /**
   * Display users list
   */
  async users({ view, request, auth }: HttpContext) {
    return this.tryOrError(
      { view, request, auth },
      async () => {
        if (!auth.user || auth.user.userType !== UserType.ADMIN) {
          return this.forbidden({ view, request, auth }, 'Only administrators can access this page')
        }

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
      },
      'Failed to load users list'
    )
  }

  /**
   * Show form to create a new user
   */
  async createUser({ view, auth }: HttpContext) {
    return this.tryOrError(
      { view, auth },
      async () => {
        if (!auth.user || auth.user.userType !== UserType.ADMIN) {
          return this.forbidden({ view, auth }, 'Only administrators can access this page')
        }

        return view.render('pages/admin/users/create')
      },
      'Failed to load user creation form'
    )
  }

  /**
   * Store a new user
   */
  async storeUser({ request, response, session, auth }: HttpContext) {
    return this.tryOrError(
      { request, response, session, auth },
      async () => {
        if (!auth.user || auth.user.userType !== UserType.ADMIN) {
          return this.forbidden({ request, response, session, auth }, 'Only administrators can perform this action')
        }

        // Validate input
        const userSchema = schema.create({
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
            validator.maxLength(32)
          ]),
          user_type: schema.enum(Object.values(UserType)),
          is_active: schema.boolean.optional(),
        })

        const payload = await validator.validate({
          schema: userSchema,
          data: request.all(),
        })

        // Create user
        const user = new User()
        user.firstName = payload.first_name
        user.lastName = payload.last_name
        user.email = payload.email
        user.password = payload.password
        user.userType = payload.user_type
        user.isActive = payload.is_active || true

        await user.save()

        session.flash('success', 'User created successfully')
        return response.redirect('/admin/users')
      },
      'Failed to create user'
    )
  }

  /**
   * Show form to edit a user
   */
  async editUser({ view, params, auth }: HttpContext) {
    return this.tryOrError(
      { view, params, auth },
      async () => {
        if (!auth.user || auth.user.userType !== UserType.ADMIN) {
          return this.forbidden({ view, params, auth }, 'Only administrators can access this page')
        }

        const user = await User.findOrFail(params.id)
        return view.render('pages/admin/users/edit', { user })
      },
      'Failed to load user edit form'
    )
  }

  /**
   * Update a user
   */
  async updateUser({ request, response, params, session, auth }: HttpContext) {
    return this.tryOrError(
      { request, response, params, session, auth },
      async () => {
        if (!auth.user || auth.user.userType !== UserType.ADMIN) {
          return this.forbidden({ request, response, params, session, auth }, 'Only administrators can perform this action')
        }

        const user = await User.findOrFail(params.id)

        // Validate input
        const userSchema = schema.create({
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
            validator.unique({ table: 'users', column: 'email', whereNot: { id: user.id } })
          ]),
          password: schema.string.optional([
            validator.minLength(8),
            validator.maxLength(32)
          ]),
          user_type: schema.enum(Object.values(UserType)),
          is_active: schema.boolean.optional(),
        })

        const payload = await validator.validate({
          schema: userSchema,
          data: request.all(),
        })

        // Update user
        user.firstName = payload.first_name
        user.lastName = payload.last_name
        user.email = payload.email
        user.userType = payload.user_type
        user.isActive = payload.is_active || false

        if (payload.password) {
          user.password = payload.password
        }

        await user.save()

        session.flash('success', 'User updated successfully')
        return response.redirect('/admin/users')
      },
      'Failed to update user'
    )
  }

  /**
   * Delete a user
   */
  async deleteUser({ response, params, session, auth }: HttpContext) {
    return this.tryOrError(
      { response, params, session, auth },
      async () => {
        if (!auth.user || auth.user.userType !== UserType.ADMIN) {
          return this.forbidden({ response, params, session, auth }, 'Only administrators can perform this action')
        }

        const user = await User.findOrFail(params.id)
        
        // Prevent deleting yourself
        if (user.id === auth.user.id) {
          session.flash('error', 'You cannot delete your own account')
          return response.redirect().back()
        }
        
        await user.delete()

        session.flash('success', 'User deleted successfully')
        return response.redirect('/admin/users')
      },
      'Failed to delete user'
    )
  }

  /**
   * Display merchants list
   */
  async merchants({ view, request, auth }: HttpContext) {
    return this.tryOrError(
      { view, request, auth },
      async () => {
        if (!auth.user || auth.user.userType !== UserType.ADMIN) {
          return this.forbidden({ view, request, auth }, 'Only administrators can access this page')
        }

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
      },
      'Failed to load merchants list'
    )
  }

  /**
   * Show merchant details
   */
  async showMerchant({ view, params, auth }: HttpContext) {
    return this.tryOrError(
      { view, params, auth },
      async () => {
        if (!auth.user || auth.user.userType !== UserType.ADMIN) {
          return this.forbidden({ view, params, auth }, 'Only administrators can access this page')
        }

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
      },
      'Failed to load merchant details'
    )
  }

  /**
   * Update merchant status
   */
  async updateMerchantStatus({ request, response, params, session, auth }: HttpContext) {
    return this.tryOrError(
      { request, response, params, session, auth },
      async () => {
        if (!auth.user || auth.user.userType !== UserType.ADMIN) {
          return this.forbidden({ request, response, params, session, auth }, 'Only administrators can perform this action')
        }

        const merchant = await Merchant.findOrFail(params.id)

        // Validate input
        const statusSchema = schema.create({
          status: schema.enum(Object.values(MerchantStatus)),
          is_verified: schema.boolean.optional(),
          is_active: schema.boolean.optional(),
          commission_rate: schema.number.optional([
            validator.range(0, 100)
          ]),
        })

        const payload = await validator.validate({
          schema: statusSchema,
          data: request.all(),
        })

        // Update merchant status
        merchant.status = payload.status
        
        if (payload.is_verified !== undefined) {
          merchant.isVerified = payload.is_verified
        }
        
        if (payload.is_active !== undefined) {
          merchant.isActive = payload.is_active
        }
        
        if (payload.commission_rate !== undefined) {
          merchant.commissionRate = payload.commission_rate
        }

        await merchant.save()

        session.flash('success', 'Merchant status updated successfully')
        return response.redirect(`/admin/merchants/${merchant.id}`)
      },
      'Failed to update merchant status'
    )
  }

  /**
   * Display categories list
   */
  async categories({ view, request, auth }: HttpContext) {
    return this.tryOrError(
      { view, request, auth },
      async () => {
        if (!auth.user || auth.user.userType !== UserType.ADMIN) {
          return this.forbidden({ view, request, auth }, 'Only administrators can access this page')
        }

        const page = request.input('page', 1)
        const limit = 10
        const query = request.input('query', '')

        // Build query
        const categoriesQuery = Category.query()
          .preload('parent')
          .preload('children', (query) => query.count('* as childrenCount'))

        // Apply search filter
        if (query) {
          categoriesQuery.where('name', 'LIKE', `%${query}%`)
        }

        // Get paginated results
        const categories = await categoriesQuery.orderBy('sortOrder', 'asc').paginate(page, limit)

        return view.render('pages/admin/categories/index', {
          categories,
          query,
        })
      },
      'Failed to load categories list'
    )
  }

  /**
   * Show form to create a new category
   */
  async createCategory({ view, auth }: HttpContext) {
    return this.tryOrError(
      { view, auth },
      async () => {
        if (!auth.user || auth.user.userType !== UserType.ADMIN) {
          return this.forbidden({ view, auth }, 'Only administrators can access this page')
        }

        // Get parent categories for dropdown
        const parentCategories = await Category.query()
          .whereNull('parentId')
          .orderBy('name', 'asc')

        return view.render('pages/admin/categories/create', {
          parentCategories,
        })
      },
      'Failed to load category creation form'
    )
  }

  /**
   * Store a new category
   */
  async storeCategory({ request, response, session, auth }: HttpContext) {
    return this.tryOrError(
      { request, response, session, auth },
      async () => {
        if (!auth.user || auth.user.userType !== UserType.ADMIN) {
          return this.forbidden({ request, response, session, auth }, 'Only administrators can perform this action')
        }

        // Validate input
        const categorySchema = schema.create({
          name: schema.string([
            validator.trim(),
            validator.minLength(2),
            validator.maxLength(50)
          ]),
          description: schema.string.optional(),
          parent_id: schema.number.optional(),
          sort_order: schema.number.optional(),
          is_active: schema.boolean.optional(),
        })

        const payload = await validator.validate({
          schema: categorySchema,
          data: request.all(),
        })

        // Create category
        const category = new Category()
        category.name = payload.name
        category.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        category.description = payload.description || null
        category.parentId = payload.parent_id || null
        category.sortOrder = payload.sort_order || 0
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
      },
      'Failed to create category'
    )
  }

  /**
   * Show form to edit a category
   */
  async editCategory({ view, params, auth }: HttpContext) {
    return this.tryOrError(
      { view, params, auth },
      async () => {
        if (!auth.user || auth.user.userType !== UserType.ADMIN) {
          return this.forbidden({ view, params, auth }, 'Only administrators can access this page')
        }

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
      },
      'Failed to load category edit form'
    )
  }

  /**
   * Update a category
   */
  async updateCategory({ request, response, params, session, auth }: HttpContext) {
    return this.tryOrError(
      { request, response, params, session, auth },
      async () => {
        if (!auth.user || auth.user.userType !== UserType.ADMIN) {
          return this.forbidden({ request, response, params, session, auth }, 'Only administrators can perform this action')
        }

        const category = await Category.findOrFail(params.id)

        // Validate input
        const categorySchema = schema.create({
          name: schema.string([
            validator.trim(),
            validator.minLength(2),
            validator.maxLength(50)
          ]),
          description: schema.string.optional(),
          parent_id: schema.number.optional(),
          sort_order: schema.number(),
          is_active: schema.boolean.optional(),
        })

        const payload = await validator.validate({
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
      },
      'Failed to update category'
    )
  }

  /**
   * Delete a category
   */
  async deleteCategory({ response, params, session, auth }: HttpContext) {
    return this.tryOrError(
      { response, params, session, auth },
      async () => {
        if (!auth.user || auth.user.userType !== UserType.ADMIN) {
          return this.forbidden({ response, params, session, auth }, 'Only administrators can perform this action')
        }

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
      },
      'Failed to delete category'
    )
  }

  /**
   * Display orders list
   */
  async orders({ view, request, auth }: HttpContext) {
    return this.tryOrError(
      { view, request, auth },
      async () => {
        if (!auth.user || auth.user.userType !== UserType.ADMIN) {
          return this.forbidden({ view, request, auth }, 'Only administrators can access this page')
        }

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
      },
      'Failed to load orders list'
    )
  }

  /**
   * Show order details
   */
  async showOrder({ view, params, auth }: HttpContext) {
    return this.tryOrError(
      { view, params, auth },
      async () => {
        if (!auth.user || auth.user.userType !== UserType.ADMIN) {
          return this.forbidden({ view, params, auth }, 'Only administrators can access this page')
        }

        const order = await Order.query()
          .where('id', params.id)
          .preload('user')
          .preload('merchant')
          .preload('items', (query) => query.preload('product'))
          .firstOrFail()

        return view.render('pages/admin/orders/show', {
          order,
        })
      },
      'Failed to load order details'
    )
  }

  /**
   * Update order status
   */
  async updateOrderStatus({ request, response, params, session, auth }: HttpContext) {
    return this.tryOrError(
      { request, response, params, session, auth },
      async () => {
        if (!auth.user || auth.user.userType !== UserType.ADMIN) {
          return this.forbidden({ request, response, params, session, auth }, 'Only administrators can perform this action')
        }

        const order = await Order.findOrFail(params.id)

        // Validate input
        const statusSchema = schema.create({
          status: schema.enum([
            'pending',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
            'refunded',
          ]),
        })

        const payload = await validator.validate({
          schema: statusSchema,
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
      },
      'Failed to update order status'
    )
  }

  /**
   * Display settings page
   */
  async settings({ view, auth }: HttpContext) {
    return this.tryOrError(
      { view, auth },
      async () => {
        if (!auth.user || auth.user.userType !== UserType.ADMIN) {
          return this.forbidden({ view, auth }, 'Only administrators can access this page')
        }

        return view.render('pages/admin/settings')
      },
      'Failed to load settings page'
    )
  }

  /**
   * Update settings
   */
  async updateSettings({ request, response, session, auth }: HttpContext) {
    return this.tryOrError(
      { request, response, session, auth },
      async () => {
        if (!auth.user || auth.user.userType !== UserType.ADMIN) {
          return this.forbidden({ request, response, session, auth }, 'Only administrators can perform this action')
        }

        // Validate input
        const settingsSchema = schema.create({
          site_name: schema.string([
            validator.trim()
          ]),
          site_description: schema.string.optional(),
          contact_email: schema.string([
            validator.email()
          ]),
          contact_phone: schema.string.optional(),
          currency: schema.string([
            validator.minLength(3),
            validator.maxLength(3)
          ]),
          tax_rate: schema.number([
            validator.range(0, 100)
          ]),
          shipping_fee: schema.number([
            validator.unsigned()
          ]),
          free_shipping_threshold: schema.number([
            validator.unsigned()
          ]),
        })

        await validator.validate({
          schema: settingsSchema,
          data: request.all(),
        })

        // In a real app, you would update settings in the database
        // For now, we'll just show a success message
        session.flash('success', 'Settings updated successfully')
        return response.redirect('/admin/settings')
      },
      'Failed to update settings'
    )
  }
}

