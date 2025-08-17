import { defineConfig } from '@adonisjs/core/views'
import app from '@adonisjs/core/services/app'

const viewConfig = defineConfig({
  template: 'edge',
  cache: false,
  viewsPath: [
    app.makePath('resources/views'),
    app.makePath('views')
  ]
})

export default viewConfig
