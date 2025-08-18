import app from '@adonisjs/core/services/app'

const viewConfig = {
  template: 'edge',
  cache: false,
  viewsPath: [
    app.makePath('resources/views')
   // app.makePath('views')
  ]
}

export default viewConfig
