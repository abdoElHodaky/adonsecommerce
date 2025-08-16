import router from '@adonisjs/core/services/router'
import { middleware } from '../kernel.js'

// Merchant routes
const MerchantController = () => import('#controllers/merchant_controller')
const OrderController = () => import('#controllers/order_controller')
const ProductController = () => import('#controllers/product_controller')

router
  .group(() => {
    // Dashboard
    router.get('/dashboard', [MerchantController, 'dashboard'])

    // Profile management
    router.get('/profile', [MerchantController, 'profile'])
    router.post('/profile', [MerchantController, 'updateProfile'])

    // Orders management
    router.group(() => {
      router.get('/', [OrderController, 'merchantOrders'])
      router.get('/:id', [OrderController, 'merchantOrderShow'])
      router.put('/:id/status', [OrderController, 'updateStatus'])
    }).prefix('/orders')

    // Products management
    router.group(() => {
      router.get('/', [ProductController, 'index'])
      router.get('/create', [ProductController, 'create'])
      router.post('/', [ProductController, 'store'])
      router.get('/:id/edit', [ProductController, 'edit'])
      router.put('/:id', [ProductController, 'update'])
      router.delete('/:id', [ProductController, 'destroy'])
    }).prefix('/products')

    // Reviews
    router.get('/reviews', [MerchantController, 'reviews'])

    // Settings
    router.get('/settings', [MerchantController, 'settings'])
    router.post('/settings', [MerchantController, 'updateSettings'])
  })
  .prefix('/merchant')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role(['merchant']))

// Public merchant store routes
router.get('/store/merchants', [MerchantController, 'index'])
router.get('/store/merchants/:slug', [MerchantController, 'store'])

