import { ApplicationService } from '@adonisjs/core/types'
import { Edge } from 'edge.js'
//import viewConfig from '#config/view'
import { join } from 'node:path'

export default class ViewProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register the view service
   */
  register() {
    // Create a new Edge instance
    const edge = new Edge()
    
    // Register both view paths
   // for (const viewPath of viewConfig.viewsPath) {
      const viewPath=join(process.cwd(),"resources","views")
      edge.mount(viewPath)
      console.log('Views path:', viewPath)
     //  console.log('Views path exists:', existsSync(viewsPath))
   
  //  }
    
    // Add global variables
   /* edge.global('appUrl', (path: string) => {
      return `${process.env.APP_URL || ''}${path}`
    })*/
    
    // Add current year helper
    edge.global('currentYear', () => new Date().getFullYear())

// Add helper functions
//edge.global('currentYear', () => new Date().getFullYear())
    // Register the Edge instance as a singleton
    this.app['container'].singleton('view', () => edge)
  }

  /**
   * The boot method is called after all providers have been registered
   */
  async boot() {
    // No need to resolve the view here since we've already configured it in register
  }
}
