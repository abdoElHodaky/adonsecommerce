"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("@adonisjs/core/services/router");
const kernel_js_1 = require("./kernel.js");
// Payment routes
const PaymentController = () => Promise.resolve().then(() => require('#controllers/payment_controller'));
router_1.default
    .group(() => {
    // Process payment
    router_1.default.post('/process', [PaymentController, 'processPayment']);
    // PayPal return and cancel routes
    router_1.default.get('/paypal/return', [PaymentController, 'handlePayPalReturn']);
    router_1.default.get('/paypal/cancel', [PaymentController, 'handlePayPalCancel']);
    // Process refund (admin and merchant only)
    router_1.default
        .post('/refund', [PaymentController, 'processRefund'])
        .use(kernel_js_1.middleware.auth({ guards: ['web'] }))
        .use(kernel_js_1.middleware.role(['admin', 'merchant']));
})
    .prefix('/payment')
    .use(kernel_js_1.middleware.auth({ guards: ['web'] }));
