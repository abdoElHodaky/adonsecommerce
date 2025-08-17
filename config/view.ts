import { defineConfig } from '@adonisjs/core/services/view'
import app from '@adonisjs/core/services/app'
const viewConfig = defineConfig({
  template: 'edge',
  cache: false,
})
export default viewConfig
