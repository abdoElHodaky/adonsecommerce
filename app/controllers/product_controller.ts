import { HttpContext } from '@adonisjs/core/http'
import Product from '#models/Product'
import Category from '#models/Category'
import ProductVariant from '#models/ProductVariant'
import ProductImage from '#models/ProductImage'
import Merchant from '#models/Merchant'
import vine from '@vinejs/vine'
import { string } from '@vinejs/vine/rules'

export default class ProductController {
  /**
   * Display a listing of products
   */
  async index({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 12
    const query = request.input('query', '')
    const categoryId = request.input('category', '')
    const sortBy = request.input('sort', 'newest')

    // Build query
    const productsQuery = Product.query()
      .where('isPublished', true)
      .preload('merchant')
      .preload('images', (query) => query.where('isDefault', true).first())

    // Apply search filter
    if (query) {
      productsQuery.where((builder) => {
        builder.where('name', 'LIKE', `%${query}%`)
          .orWhere('description', 'LIKE', `%${query}%`)
      })
    }

    // Apply category filter
    if (categoryId) {
      productsQuery.whereHas('categories', (builder) => {
        builder.where('categories.id', categoryId)
      })
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_low':
        productsQuery.orderBy('price', 'asc')
        break
      case 'price_high':
        productsQuery.orderBy('price', 'desc')
        break
      case 'popular':
        // In a real app, you might sort by number of sales or views
        productsQuery.orderBy('id', 'desc')
        break
      case 'newest':
      default:
        productsQuery.orderBy('createdAt', 'desc')
        break
    }

    // Get paginated results
    const products = await productsQuery.paginate(page, limit)

    // Get categories for filter sidebar
    const categories = await Category.query().where('isActive', true).orderBy('name', 'asc')

    return view.render('pages/store/products', {
      products,
      categories,
      query,
      categoryId,
      sortBy,
    })
  }

  /**
   * Display the specified product
   */
  async show({ view, params, response }: HttpContext) {
    try {
      const product = await Product.query()
        .where('slug', params.slug)
        .where('isPublished', true)
        .preload('merchant')
        .preload('images')
        .preload('variants')
        .preload('categories')
        .preload('reviews', (query) => {
          query.orderBy('createdAt', 'desc').preload('user')
        })
        .firstOrFail()

      // Get related products
      const relatedProducts = await Product.query()
        .whereHas('categories', (builder) => {
          builder.whereIn('categories.id', product.categories.map(c => c.id))
        })
        .where('id', '!=', product.id)
        .where('isPublished', true)
        .preload('merchant')
        .preload('images', (query) => query.where('isDefault', true).first())
        .limit(4)

      return view.render('pages/store/product', {
        product,
        relatedProducts,
      })
    } catch (error) {
      return response.status(404).redirect('/404')
    }
  }

  /**
   * Display a listing of merchant's products
   */
  async merchantProducts({ view, auth, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 10
    const query = request.input('query', '')
    const status = request.input('status', 'all')

    // Get merchant
    const user = auth.user!
    const merchant = await Merchant.findByOrFail('userId', user.id)

    // Build query
    const productsQuery = Product.query()
      .where('merchantId', merchant.id)
      .preload('images', (query) => query.where('isDefault', true).first())
      .preload('categories')

    // Apply search filter
    if (query) {
      productsQuery.where((builder) => {
        builder.where('name', 'LIKE', `%${query}%`)
          .orWhere('sku', 'LIKE', `%${query}%`)
      })
    }

    // Apply status filter
    if (status !== 'all') {
      if (status === 'published') {
        productsQuery.where('isPublished', true)
      } else if (status === 'draft') {
        productsQuery.where('isPublished', false)
      } else if (status === 'featured') {
        productsQuery.where('isFeatured', true)
      } else if (status === 'low_stock') {
        productsQuery.where('quantity', '<=', 'lowStockThreshold')
      }
    }

    // Get paginated results
    const products = await productsQuery.orderBy('createdAt', 'desc').paginate(page, limit)

    return view.render('pages/merchant/products/index', {
      products,
      query,
      status,
    })
  }

  /**
   * Show the form for creating a new product
   */
  async create({ view, auth }: HttpContext) {
    // Get merchant
    const user = auth.user!
    const merchant = await Merchant.findByOrFail('userId', user.id)

    // Get categories for dropdown
    const categories = await Category.query().where('isActive', true).orderBy('name', 'asc')

    return view.render('pages/merchant/products/create', {
      merchant,
      categories,
    })
  }

  /**
   * Store a newly created product
   */
  async store({ request, response, auth, session }: HttpContext) {
    // Get merchant
    const user = auth.user!
    const merchant = await Merchant.findByOrFail('userId', user.id)

    // Validate input
    const productSchema = vine.object({
      name: vine.string().trim().minLength(3).maxLength(100),
      description: vine.string().optional(),
      short_description: vine.string().optional(),
      sku: vine.string().optional(),
      price: vine.number().positive(),
      compare_at_price: vine.number().positive().optional(),
      cost_price: vine.number().positive().optional(),
      quantity: vine.number().positive(),
      is_manage_stock: vine.boolean().optional(),
      low_stock_threshold: vine.number().positive().optional(),
      weight: vine.number().positive().optional(),
      weight_unit: vine.string().optional(),
      dimensions: vine.string().optional(),
      has_variants: vine.boolean().optional(),
      is_featured: vine.boolean().optional(),
      is_published: vine.boolean().optional(),
      category_ids: vine.array(vine.number()).optional(),
    })

    try {
      const payload = await vine.validate({
        schema: productSchema,
        data: request.all(),
      })

      // Create product
      const product = new Product()
      product.merchantId = merchant.id
      product.name = payload.name
      product.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      product.description = payload.description || null
      product.shortDescription = payload.short_description || null
      product.sku = payload.sku || null
      product.price = payload.price
      product.compareAtPrice = payload.compare_at_price || null
      product.costPrice = payload.cost_price || null
      product.quantity = payload.quantity
      product.isManageStock = payload.is_manage_stock || false
      product.lowStockThreshold = payload.low_stock_threshold || null
      product.weight = payload.weight || null
      product.weightUnit = payload.weight_unit || null
      product.dimensions = payload.dimensions || null
      product.hasVariants = payload.has_variants || false
      product.isFeatured = payload.is_featured || false
      product.isPublished = payload.is_published || false

      await product.save()

      // Attach categories
      if (payload.category_ids && payload.category_ids.length > 0) {
        await product.related('categories').attach(payload.category_ids)
      }

      // Handle image uploads (in a real app)
      // const images = request.files('images')
      // for (const image of images) {
      //   const fileName = `${Date.now()}-${image.clientName}`
      //   await image.move(Application.publicPath('uploads/products'), {
      //     name: fileName,
      //   })
      //
      //   const productImage = new ProductImage()
      //   productImage.productId = product.id
      //   productImage.path = `uploads/products/${fileName}`
      //   productImage.isDefault = productImage.id === 1 // First image is default
      //   await productImage.save()
      // }

      session.flash('success', 'Product created successfully')
      return response.redirect(`/merchant/products/${product.id}/edit`)
    } catch (error) {
      session.flash('errors', error.messages || { error: 'Failed to create product' })
      return response.redirect().back()
    }
  }

  /**
   * Show the form for editing the specified product
   */
  async edit({ view, params, auth, response }: HttpContext) {
    try {
      // Get merchant
      const user = auth.user!
      const merchant = await Merchant.findByOrFail('userId', user.id)

      // Get product
      const product = await Product.query()
        .where('id', params.id)
        .where('merchantId', merchant.id)
        .preload('images')
        .preload('variants')
        .preload('categories')
        .firstOrFail()

      // Get categories for dropdown
      const categories = await Category.query().where('isActive', true).orderBy('name', 'asc')

      return view.render('pages/merchant/products/edit', {
        product,
        merchant,
        categories,
      })
    } catch (error) {
      return response.status(404).redirect('/merchant/products')
    }
  }

  /**
   * Update the specified product
   */
  async update({ request, response, params, auth, session }: HttpContext) {
    try {
      // Get merchant
      const user = auth.user!
      const merchant = await Merchant.findByOrFail('userId', user.id)

      // Get product
      const product = await Product.query()
        .where('id', params.id)
        .where('merchantId', merchant.id)
        .firstOrFail()

      // Validate input
      const productSchema = vine.object({
        name: vine.string().trim().minLength(3).maxLength(100),
        description: vine.string().optional(),
        short_description: vine.string().optional(),
        sku: vine.string().optional(),
        price: vine.number().positive(),
        compare_at_price: vine.number().positive().optional(),
        cost_price: vine.number().positive().optional(),
        quantity: vine.number().positive(),
        is_manage_stock: vine.boolean().optional(),
        low_stock_threshold: vine.number().positive().optional(),
        weight: vine.number().positive().optional(),
        weight_unit: vine.string().optional(),
        dimensions: vine.string().optional(),
        has_variants: vine.boolean().optional(),
        is_featured: vine.boolean().optional(),
        is_published: vine.boolean().optional(),
        category_ids: vine.array(vine.number()).optional(),
      })

      const payload = await vine.validate({
        schema: productSchema,
        data: request.all(),
      })

      // Update product
      product.name = payload.name
      product.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      product.description = payload.description || null
      product.shortDescription = payload.short_description || null
      product.sku = payload.sku || null
      product.price = payload.price
      product.compareAtPrice = payload.compare_at_price || null
      product.costPrice = payload.cost_price || null
      product.quantity = payload.quantity
      product.isManageStock = payload.is_manage_stock || false
      product.lowStockThreshold = payload.low_stock_threshold || null
      product.weight = payload.weight || null
      product.weightUnit = payload.weight_unit || null
      product.dimensions = payload.dimensions || null
      product.hasVariants = payload.has_variants || false
      product.isFeatured = payload.is_featured || false
      product.isPublished = payload.is_published || false

      await product.save()

      // Update categories
      await product.related('categories').detach()
      if (payload.category_ids && payload.category_ids.length > 0) {
        await product.related('categories').attach(payload.category_ids)
      }

      // Handle image uploads (in a real app)
      // const images = request.files('images')
      // for (const image of images) {
      //   const fileName = `${Date.now()}-${image.clientName}`
      //   await image.move(Application.publicPath('uploads/products'), {
      //     name: fileName,
      //   })
      //
      //   const productImage = new ProductImage()
      //   productImage.productId = product.id
      //   productImage.path = `uploads/products/${fileName}`
      //   productImage.isDefault = !await ProductImage.query().where('productId', product.id).first()
      //   await productImage.save()
      // }

      session.flash('success', 'Product updated successfully')
      return response.redirect('/merchant/products')
    } catch (error) {
      session.flash('errors', error.messages || { error: 'Failed to update product' })
      return response.redirect().back()
    }
  }

  /**
   * Remove the specified product
   */
  async destroy({ response, params, auth, session }: HttpContext) {
    try {
      // Get merchant
      const user = auth.user!
      const merchant = await Merchant.findByOrFail('userId', user.id)

      // Get product
      const product = await Product.query()
        .where('id', params.id)
        .where('merchantId', merchant.id)
        .firstOrFail()

      // Delete product
      await product.delete()

      session.flash('success', 'Product deleted successfully')
      return response.redirect('/merchant/products')
    } catch (error) {
      session.flash('error', 'Failed to delete product')
      return response.redirect().back()
    }
  }
}

