import router from '@adonisjs/core/services/router'
import { middleware } from '../kernel.js'

// Customer routes
const CustomerController = () => import('#controllers/customer_controller')
const OrderController = () => import('#controllers/order_controller')

router
  .group(() => {
    // Dashboard
    router.get('/dashboard', [CustomerController, 'dashboard'])

    // Profile management
    router.get('/profile', [CustomerController, 'profile'])
    router.post('/profile', [CustomerController, 'updateProfile'])
    router.get('/change-password', [CustomerController, 'showChangePassword'])
    router.post('/change-password', [CustomerController, 'updatePassword'])

    // Orders
    router.group(() => {
      router.get('/', [OrderController, 'index'])
      router.get('/:id', [OrderController, 'show'])
      router.post('/:id/cancel', [OrderController, 'cancel'])
    }).prefix('/orders')

    // Reviews
    router.group(() => {
      router.get('/', [CustomerController, 'reviews'])
      router.get('/product/:productId/add', [CustomerController, 'showAddProductReview'])
      router.get('/merchant/:merchantId/add', [CustomerController, 'showAddMerchantReview'])
      router.post('/', [CustomerController, 'storeReview'])
      router.delete('/:id', [CustomerController, 'deleteReview'])
    }).prefix('/reviews')

    // Wishlist
    router.get('/wishlist', [CustomerController, 'wishlist'])

    // Addresses
    router.get('/addresses', [CustomerController, 'addresses'])
  })
  .prefix('/customer')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role(['customer']))

