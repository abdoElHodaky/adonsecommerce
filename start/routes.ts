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
import './routes/auth.ts'
import './routes/admin.ts'
import './routes/merchant.ts'
import './routes/customer.ts'
import './routes/store.ts'
import './routes/cart.ts'
import './routes/category.ts'
import './routes/product.ts'
import './routes/home.ts'
import './routes/payment.ts'
import './routes/notification.ts'

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
// Import routes from root routes.ts file
import '../routes'
