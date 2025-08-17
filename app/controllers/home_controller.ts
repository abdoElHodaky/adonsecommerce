import { HttpContext } from '@adonisjs/core/http'
import { contactFormValidator } from '#validators/contact_form_validator'

export default class HomeController {
  /**
   * Display the home page
   */
  async index({ view }: HttpContext) {
    return view.render('pages/home')
  }

  /**
   * Handle contact form submission
   */
  async contact({ request, response, session }: HttpContext) {
    try {
      // Validate the request data using the contact form validator
      const payload = await request.validateUsing(contactFormValidator)
      
      // Process the validated data (e.g., send email, save to database)
      // This is just a placeholder for actual implementation
      console.log('Contact form submitted:', payload)
      
      // Flash success message and redirect
      session.flash('success', 'Your message has been sent successfully!')
      return response.redirect().back()
    } catch (error) {
      // The error will be automatically handled by AdonisJS
      // and flashed to the session if it's a ValidationError
      
      // Just in case we want to handle other types of errors
      if (error.name !== 'ValidationError') {
        session.flash('error', 'An unexpected error occurred. Please try again.')
        console.error('Contact form error:', error)
      }
      
      return response.redirect().back()
    }
  }

  /**
   * Display the about page
   */
  async about({ view }: HttpContext) {
    return view.render('pages/about')
  }

  /**
   * Display the contact page
   */
  async showContact({ view }: HttpContext) {
    return view.render('pages/contact')
  }
}
