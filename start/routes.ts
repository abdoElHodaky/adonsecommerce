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
import './routes/payment.js'
import './routes/notification.js'

// Home route
router.get('/', async ({ view }: HttpContext) => {
  // Fetch data for the home page
  const popularCategories = [] // Replace with actual data
  const featuredProducts = [] // Replace with actual data
  const featuredMerchants = [] // Replace with actual data

  return view.render('pages/home', {
    popularCategories,
    featuredProducts,
    featuredMerchants,
  })
})

// About page
router.get('/about', async ({ view }: HttpContext) => {
  return view.render('pages/about')
})

// Contact page
router.get('/contact', async ({ view }: HttpContext) => {
  return view.render('pages/contact')
})

// Terms and conditions
router.get('/terms', async ({ view }: HttpContext) => {
  return view.render('pages/terms')
})

// Privacy policy
router.get('/privacy', async ({ view }: HttpContext) => {
  return view.render('pages/privacy')
})

// FAQ page
router.get('/faq', async ({ view }: HttpContext) => {
  return view.render('pages/faq')
})

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

