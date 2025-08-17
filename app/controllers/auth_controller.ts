import { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  /**
   * Display login page
   */
  async showLogin({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }

  /**
   * Handle login request
   */
  async login({ request, response, auth }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    
    try {
      await auth.use('web').attempt(email, password)
      return response.redirect().toRoute('/')
    } catch (error) {
      return response.redirect().back().withErrors({ auth: 'Invalid credentials' })
    }
  }

  /**
   * Display registration page
   */
  async showRegister({ view }: HttpContext) {
    return view.render('pages/auth/register')
  }

  /**
   * Handle registration request
   */
  async register({ request, response }: HttpContext) {
    // Registration logic will be implemented later
    return response.redirect().toRoute('/')
  }

  /**
   * Handle logout request
   */
  async logout({ response, auth }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('/')
  }
}

