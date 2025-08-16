import { HttpContext } from '@adonisjs/core/http'
import Category from '#models/Category'
import Product from '#models/Product'
import BaseController from './base_controller.js'

export default class CategoryController extends BaseController {
  /**
   * Display all categories
   */
  async index({ view }: HttpContext) {
    return this.tryOrError(
      { view },
      async () => {
        // Get parent categories
        const parentCategories = await Category.query()
          .whereNull('parentId')
          .where('isActive', true)
          .orderBy('sortOrder', 'asc')
          .preload('children', (query) => {
            query.where('isActive', true).orderBy('sortOrder', 'asc')
          })

        return view.render('pages/store/categories', {
          parentCategories,
        })
      },
      'Failed to load categories'
    )
  }

  /**
   * Display products in a category
   */
  async show({ view, params, request }: HttpContext) {
    return this.tryOrError(
      { view, params, request },
      async () => {
        const page = request.input('page', 1)
        const limit = 12
        const sortBy = request.input('sort', 'newest')

        // Get category
        const category = await Category.query()
          .where('slug', params.slug)
          .where('isActive', true)
          .firstOrFail()

        // Get subcategories
        const subcategories = await Category.query()
          .where('parentId', category.id)
          .where('isActive', true)
          .orderBy('sortOrder', 'asc')

        // Get category IDs (including subcategories)
        const categoryIds = [category.id, ...subcategories.map(c => c.id)]

        // Build query for products
        const productsQuery = Product.query()
          .whereHas('categories', (builder) => {
            builder.whereIn('categories.id', categoryIds)
          })
          .where('isPublished', true)
          .preload('merchant')
          .preload('images', (query) => query.where('isDefault', true).first())

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

        return view.render('pages/store/category', {
          category,
          subcategories,
          products,
          sortBy,
        })
      },
      'Failed to load category products'
    )
  }
}

