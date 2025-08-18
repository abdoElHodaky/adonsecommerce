import { HttpContext } from '@adonisjs/core/http'
import Product from '#models/Product'
import Category from '#models/Category'
import Merchant from '#models/Merchant'
//import { schema, validator } from '@adonisjs/core/validator'
import vine from '@vinejs/vine'
import BaseController from './base_controller.js'

export default class HomeController extends BaseController {
  /**
   * Display the home page
   */
  async index({ view }: HttpContext) {
    const View=view
    return this.tryOrError(
      { view },
      async () => {
        // Get featured products
        const featuredProducts = await Product.query()
          .where('isPublished', true)
          .where('isFeatured', true)
          .preload('merchant')
          .preload('images', (query) => query.where('isDefault', true).first())
          .limit(8)

        // Get featured merchants
        const featuredMerchants = await Merchant.query()
          .where('isActive', true)
          .where('status', 'approved')
          .where('isVerified', true)
          .limit(3)

        // Get popular categories
        const popularCategories = await Category.query()
          .where('isActive', true)
          .whereNull('parentId')
          .limit(6)

        return View.render('pages/home', {
          featuredProducts,
          featuredMerchants,
          popularCategories,
        })
      },
      'Failed to load home page'
    )
  }

  /**
   * Display the about page
   */
  async about({ view }: HttpContext) {
   const View=view
    return this.tryOrError(
      { view },
      async () => {
        return await View.render('pages/about')
      },
      'Failed to load about page'
    )
  }

  /**
   * Display the contact page
   */
  async contact({ view }: HttpContext) {
    return this.tryOrError(
      { view },
      async () => {
        return await view.render('pages/contact')
      },
      'Failed to load contact page'
    )
  }

  /**
   * Handle contact form submission
   */
  async submitContact({ request, response, session }: HttpContext) {
    const requestbody=request.all();
    return this.tryOrError(
      { request, response, session },
      async () => {
        // Validate input
        const contactSchema = vine.object({
          name: vine.string().trim().minLength(2).maxLength(50)
          ,
          email: vine.string().email()
          ,
          subject: vine.string().trim().minLength(2).maxLength(100)
          ,
          message: vine.string().trim().minLength(10)
          
        });

        const payload = await vine.validate({
           contactSchema,
           requestbody
        });

        // In a real app, you would send an email or save to database
        // For now, we'll just show a success message
        session.flash('success', 'Your message has been sent successfully')
        return response.redirect('/contact')
      },
      'Failed to send message'
    )
  }

  /**
   * Display the FAQ page
   */
  async faq({ view }: HttpContext) {
    return this.tryOrError(
      { view },
      async () => {
        return await view.render('pages/faq')
      },
      'Failed to load FAQ page'
    )
  }

  /**
   * Display the terms and conditions page
   */
  async terms({ view }: HttpContext) {
    return this.tryOrError(
      { view },
      async () => {
        return await view.render('pages/terms')
      },
      'Failed to load terms and conditions page'
    )
  }

  /**
   * Display the privacy policy page
   */
  async privacy({ view }: HttpContext) {
    return this.tryOrError(
      { view },
      async () => {
        return await view.render('pages/privacy')
      },
      'Failed to load privacy policy page'
    )
  }

  /**
   * Display the 404 page
   */
  async notFound({ view }: HttpContext) {
    return this.tryOrError(
      { view },
      async () => {
        return await view.render('pages/errors/404')
      },
      'Failed to load 404 page'
    )
  }
}

