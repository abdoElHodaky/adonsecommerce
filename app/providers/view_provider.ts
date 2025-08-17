import { ApplicationService } from '@adonisjs/core/types'
import { Edge } from 'edge.js'
import viewConfig from '#config/view'

export default class ViewProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register the view service
   */
  register() {
    // Register the Edge instance
    this.app.container.singleton('view', () => {
      const edge = new Edge({ cache: viewConfig.cache })
      
      // Register both view paths
      for (const viewPath of viewConfig.viewsPath) {
        edge.mount(viewPath)
      }
      
      return edge
    })
  }

  /**
   * The boot method is called after all providers have been registered
   */
  async boot() {
    // Register global helpers
    const view = this.app.container.resolve('view') as Edge
    
    // Add global variables
    view.global('appUrl', (path: string) => {
      return `${process.env.APP_URL || ''}${path}`
    })
    
    // Add current year helper
    view.global('currentYear', () => new Date().getFullYear())
  }
}

