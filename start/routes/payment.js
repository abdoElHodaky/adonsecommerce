import router from '@adonisjs/core/services/router';
import { middleware } from './kernel.js';
const PaymentController = () => import('#controllers/payment_controller');
router
    .group(() => {
    router.post('/process', [PaymentController, 'processPayment']);
    router.get('/paypal/return', [PaymentController, 'handlePayPalReturn']);
    router.get('/paypal/cancel', [PaymentController, 'handlePayPalCancel']);
    router
        .post('/refund', [PaymentController, 'processRefund'])
        .use(middleware.auth({ guards: ['web'] }))
        .use(middleware.role(['admin', 'merchant']));
})
    .prefix('/payment')
    .use(middleware.auth({ guards: ['web'] }));
//# sourceMappingURL=payment.js.map