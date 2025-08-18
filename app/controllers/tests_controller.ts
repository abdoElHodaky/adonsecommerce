import type { HttpContext } from '@adonisjs/core/http'

export default class TestsController {
  public async testView({ view, response }: HttpContext) {
    try {
      // Check if view exists in context
      if (view) {
        return view.render('pages/about')
      } else {
        return response.json({
          error: 'View not found in context',
          context: Object.keys({ view, response })
        })
      }
    } catch (error) {
      return response.status(500).json({
        error: 'Error rendering view',
        message: error.message,
        stack: error.stack
      })
    }
  }
}
