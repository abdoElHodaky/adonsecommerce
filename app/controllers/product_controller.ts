import { HttpContext } from '@adonisjs/core/http'
import BaseController from './base_controller.js'
import Product from '#models/product'
import Category from '#models/category'
import { schema, validator } from '@adonisjs/core/validator'

export default class ProductController extends BaseController {
  /**
   * Display a listing of products
   */
  public async index({ view }: HttpContext) {
    return this.tryOrError(
      { view },
      async () => {
        const products = await Product.query()
          .preload('merchant')
          .preload('category')
          .preload('images')
          .orderBy('createdAt', 'desc')
          .paginate(1, 12)

        return view.render('store/products/index', { products })
      },
      'Failed to load products'
    )
  }

  /**
   * Display the product details
   */
  public async show({ params, view }: HttpContext) {
    return this.tryOrError(
      { params, view },
      async () => {
        const product = await Product.query()
          .where('id', params.id)
          .preload('merchant')
          .preload('category')
          .preload('images')
          .preload('reviews', (query) => {
            query.preload('user')
            query.orderBy('createdAt', 'desc')
          })
          .firstOrFail()

        // Get related products from the same category
        const relatedProducts = await Product.query()
          .where('categoryId', product.categoryId)
          .whereNot('id', product.id)
          .preload('merchant')
          .preload('images')
          .limit(4)

        return view.render('store/products/show', { product, relatedProducts })
      },
      'Failed to load product details'
    )
  }

  /**
   * Show the form for creating a new product
   */
  public async create({ view, auth }: HttpContext) {
    return this.tryOrError(
      { view, auth },
      async () => {
        // Check if the user is a merchant
        if (!auth.user || auth.user.userType !== 'merchant') {
          return this.forbidden({ view, auth }, 'Only merchants can create products')
        }

        const categories = await Category.all()
        return view.render('merchant/products/create', { categories })
      },
      'Failed to load product creation form'
    )
  }

  /**
   * Store a newly created product
   */
  public async store({ request, response, session, auth }: HttpContext) {
    return this.tryOrError(
      { request, response, session, auth },
      async () => {
        // Check if the user is a merchant
        if (!auth.user || auth.user.userType !== 'merchant') {
          return this.forbidden({ request, response, session, auth }, 'Only merchants can create products')
        }

        // Validate the request
        const productSchema = schema.create({
          name: schema.string(),
          description: schema.string(),
          price: schema.number(),
          stock: schema.number(),
          categoryId: schema.number(),
          // Add other fields as needed
        })

        const data = await validator.validate({
          schema: productSchema,
          data: request.only(['name', 'description', 'price', 'stock', 'categoryId']),
        })

        // Create the product
        const product = await Product.create({
          ...data,
          merchantId: auth.user.merchant.id,
        })

        // Handle image uploads if any
        const images = request.files('images')
        if (images && images.length > 0) {
          // Process and save images
          // This is a placeholder for actual image processing logic
        }

        session.flash('success', 'Product created successfully')
        return response.redirect().toRoute('merchant.products.show', { id: product.id })
      },
      'Failed to create product'
    )
  }

  /**
   * Show the form for editing a product
   */
  public async edit({ params, view, auth }: HttpContext) {
    return this.tryOrError(
      { params, view, auth },
      async () => {
        // Check if the user is a merchant
        if (!auth.user || auth.user.userType !== 'merchant') {
          return this.forbidden({ params, view, auth }, 'Only merchants can edit products')
        }

        const product = await Product.findOrFail(params.id)

        // Check if the product belongs to the merchant
        if (product.merchantId !== auth.user.merchant.id) {
          return this.forbidden({ params, view, auth }, 'You can only edit your own products')
        }

        const categories = await Category.all()
        return view.render('merchant/products/edit', { product, categories })
      },
      'Failed to load product edit form'
    )
  }

  /**
   * Update the specified product
   */
  public async update({ params, request, response, session, auth }: HttpContext) {
    return this.tryOrError(
      { params, request, response, session, auth },
      async () => {
        // Check if the user is a merchant
        if (!auth.user || auth.user.userType !== 'merchant') {
          return this.forbidden({ params, request, response, session, auth }, 'Only merchants can update products')
        }

        const product = await Product.findOrFail(params.id)

        // Check if the product belongs to the merchant
        if (product.merchantId !== auth.user.merchant.id) {
          return this.forbidden({ params, request, response, session, auth }, 'You can only update your own products')
        }

        // Validate the request
        const productSchema = schema.create({
          name: schema.string(),
          description: schema.string(),
          price: schema.number(),
          stock: schema.number(),
          categoryId: schema.number(),
          // Add other fields as needed
        })

        const data = await validator.validate({
          schema: productSchema,
          data: request.only(['name', 'description', 'price', 'stock', 'categoryId']),
        })

        // Update the product
        product.merge(data)
        await product.save()

        // Handle image uploads if any
        const images = request.files('images')
        if (images && images.length > 0) {
          // Process and save images
          // This is a placeholder for actual image processing logic
        }

        session.flash('success', 'Product updated successfully')
        return response.redirect().toRoute('merchant.products.show', { id: product.id })
      },
      'Failed to update product'
    )
  }

  /**
   * Delete the specified product
   */
  public async destroy({ params, response, session, auth }: HttpContext) {
    return this.tryOrError(
      { params, response, session, auth },
      async () => {
        // Check if the user is a merchant
        if (!auth.user || auth.user.userType !== 'merchant') {
          return this.forbidden({ params, response, session, auth }, 'Only merchants can delete products')
        }

        const product = await Product.findOrFail(params.id)

        // Check if the product belongs to the merchant
        if (product.merchantId !== auth.user.merchant.id) {
          return this.forbidden({ params, response, session, auth }, 'You can only delete your own products')
        }

        // Delete the product
        await product.delete()

        session.flash('success', 'Product deleted successfully')
        return response.redirect().toRoute('merchant.products.index')
      },
      'Failed to delete product'
    )
  }

  /**
   * Search for products
   */
  public async search({ request, view }: HttpContext) {
    return this.tryOrError(
      { request, view },
      async () => {
        const query = request.input('query', '')
        const categoryId = request.input('category')
        const minPrice = request.input('min_price')
        const maxPrice = request.input('max_price')
        const sortBy = request.input('sort_by', 'newest')

        // Build the query
        const productsQuery = Product.query()
          .preload('merchant')
          .preload('category')
          .preload('images')

        // Apply search filters
        if (query) {
          productsQuery.where('name', 'LIKE', `%${query}%`)
        }

        if (categoryId) {
          productsQuery.where('categoryId', categoryId)
        }

        if (minPrice) {
          productsQuery.where('price', '>=', minPrice)
        }

        if (maxPrice) {
          productsQuery.where('price', '<=', maxPrice)
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
            productsQuery.orderBy('soldCount', 'desc')
            break
          case 'newest':
          default:
            productsQuery.orderBy('createdAt', 'desc')
            break
        }

        // Get categories for the filter sidebar
        const categories = await Category.all()

        // Paginate the results
        const products = await productsQuery.paginate(
          request.input('page', 1),
          12
        )

        return view.render('store/products/search', {
          products,
          categories,
          query,
          categoryId,
          minPrice,
          maxPrice,
          sortBy,
        })
      },
      'Failed to search products'
    )
  }
}

