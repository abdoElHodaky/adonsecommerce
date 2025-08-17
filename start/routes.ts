/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { HttpContext } from '@adonisjs/core/http'

// Import route groups
import './routes/auth.js'
import './routes/admin.js'
import './routes/merchant.js'
import './routes/customer.js'
import './routes/store.js'
import './routes/cart.js'
import './routes/category.js'
import './routes/product.js'
import './routes/home.js'
import './routes/payment.js'
import './routes/notification.js'

// Error pages
router.get('/errors/404', async ({ view }: HttpContext) => {
  return view.render('errors/404')
})

router.get('/errors/500', async ({ view }: HttpContext) => {
  return view.render('errors/500')
})

router.get('/errors/403', async ({ view }: HttpContext) => {
  return view.render('errors/403')
})

router.get('/errors/validation', async ({ view }: HttpContext) => {
  return view.render('errors/validation')
})

router.get('/errors/maintenance', async ({ view }: HttpContext) => {
  return view.render('errors/maintenance')
})
router.get("/", async ctx =>{
 return  ctx.view.render('welcomer')
})
