/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

// Public routes
router.on('/').render('pages/home')

// Auth routes
router.group(() => {
  router.get('/login', 'auth_controller.showLogin')
  router.post('/login', 'auth_controller.login')
  router.get('/register', 'auth_controller.showRegister')
  router.post('/register', 'auth_controller.register')
  router.get('/logout', 'auth_controller.logout')
  router.on('/forgot-password').render('pages/auth/forgot-password')
  router.on('/reset-password').render('pages/auth/reset-password')
}).prefix('/auth')

// Customer routes
router.group(() => {
  router.on('/dashboard').render('pages/customer/dashboard')
  router.on('/profile').render('pages/customer/profile')
  router.on('/orders').render('pages/customer/orders')
  router.on('/wishlist').render('pages/customer/wishlist')
}).prefix('/customer')

// Merchant routes
router.group(() => {
  router.on('/dashboard').render('pages/merchant/dashboard')
  router.on('/profile').render('pages/merchant/profile')
  router.on('/products').render('pages/merchant/products/index')
  router.on('/products/create').render('pages/merchant/products/create')
  router.on('/products/:id/edit').render('pages/merchant/products/edit')
  router.on('/orders').render('pages/merchant/orders/index')
  router.on('/orders/:id').render('pages/merchant/orders/view')
  router.on('/settings').render('pages/merchant/settings')
}).prefix('/merchant')

// Admin routes
router.group(() => {
  router.on('/dashboard').render('pages/admin/dashboard')
  router.on('/merchants').render('pages/admin/merchants/index')
  router.on('/merchants/:id').render('pages/admin/merchants/view')
  router.on('/categories').render('pages/admin/categories/index')
  router.on('/categories/create').render('pages/admin/categories/create')
  router.on('/categories/:id/edit').render('pages/admin/categories/edit')
  router.on('/products').render('pages/admin/products/index')
  router.on('/products/:id').render('pages/admin/products/view')
  router.on('/orders').render('pages/admin/orders/index')
  router.on('/orders/:id').render('pages/admin/orders/view')
  router.on('/users').render('pages/admin/users/index')
  router.on('/users/:id').render('pages/admin/users/view')
  router.on('/settings').render('pages/admin/settings')
}).prefix('/admin')

// Store routes
router.group(() => {
  router.on('/').render('pages/store/index')
  router.on('/search').render('pages/store/search')
  router.on('/category/:slug').render('pages/store/category')
  router.on('/merchant/:slug').render('pages/store/merchant')
  router.on('/product/:slug').render('pages/store/product')
  router.on('/cart').render('pages/store/cart')
  router.on('/checkout').render('pages/store/checkout')
}).prefix('/store')

// API routes
router.group(() => {
  // Auth API routes
  router.group(() => {
    router.post('/login', async () => {})
    router.post('/register', async () => {})
    router.post('/logout', async () => {})
  }).prefix('/auth')

  // Products API routes
  router.group(() => {
    router.get('/', async () => {})
    router.get('/:id', async () => {})
    router.post('/', async () => {})
    router.put('/:id', async () => {})
    router.delete('/:id', async () => {})
  }).prefix('/products')

  // Categories API routes
  router.group(() => {
    router.get('/', async () => {})
    router.get('/:id', async () => {})
    router.post('/', async () => {})
    router.put('/:id', async () => {})
    router.delete('/:id', async () => {})
  }).prefix('/categories')

  // Merchants API routes
  router.group(() => {
    router.get('/', async () => {})
    router.get('/:id', async () => {})
    router.post('/', async () => {})
    router.put('/:id', async () => {})
    router.delete('/:id', async () => {})
  }).prefix('/merchants')

  // Cart API routes
  router.group(() => {
    router.get('/', async () => {})
    router.post('/items', async () => {})
    router.put('/items/:id', async () => {})
    router.delete('/items/:id', async () => {})
    router.post('/checkout', async () => {})
  }).prefix('/cart')

  // Orders API routes
  router.group(() => {
    router.get('/', async () => {})
    router.get('/:id', async () => {})
    router.post('/', async () => {})
    router.put('/:id', async () => {})
  }).prefix('/orders')
}).prefix('/api')
