import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// Payment routes
const PaymentController = () => import('#controllers/payment_controller')

router
  .group(() => {
    // Process payment
    router.post('/process', [PaymentController, 'processPayment'])

    // PayPal return and cancel routes
    router.get('/paypal/return', [PaymentController, 'handlePayPalReturn'])
    router.get('/paypal/cancel', [PaymentController, 'handlePayPalCancel'])

    // Process refund (admin and merchant only)
    router
      .post('/refund', [PaymentController, 'processRefund'])
      .use(middleware.auth({ guards: ['web'] }))
      .use(middleware.role(['admin', 'merchant']))
  })
  .prefix('/payment')
  .use(middleware.auth({ guards: ['web'] }))

