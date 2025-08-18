"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("@adonisjs/core/services/router");
const kernel_js_1 = require("../kernel.js");
// Customer routes
const CustomerController = () => Promise.resolve().then(() => require('#controllers/customer_controller'));
const OrderController = () => Promise.resolve().then(() => require('#controllers/order_controller'));
router_1.default
    .group(() => {
    // Dashboard
    router_1.default.get('/dashboard', [CustomerController, 'dashboard']);
    // Profile management
    router_1.default.get('/profile', [CustomerController, 'profile']);
    router_1.default.post('/profile', [CustomerController, 'updateProfile']);
    router_1.default.get('/change-password', [CustomerController, 'showChangePassword']);
    router_1.default.post('/change-password', [CustomerController, 'updatePassword']);
    // Orders
    router_1.default.group(() => {
        router_1.default.get('/', [OrderController, 'index']);
        router_1.default.get('/:id', [OrderController, 'show']);
        router_1.default.post('/:id/cancel', [OrderController, 'cancel']);
    }).prefix('/orders');
    // Reviews
    router_1.default.group(() => {
        router_1.default.get('/', [CustomerController, 'reviews']);
        router_1.default.get('/product/:productId/add', [CustomerController, 'showAddProductReview']);
        router_1.default.get('/merchant/:merchantId/add', [CustomerController, 'showAddMerchantReview']);
        router_1.default.post('/', [CustomerController, 'storeReview']);
        router_1.default.delete('/:id', [CustomerController, 'deleteReview']);
    }).prefix('/reviews');
    // Wishlist
    router_1.default.get('/wishlist', [CustomerController, 'wishlist']);
    // Addresses
    router_1.default.get('/addresses', [CustomerController, 'addresses']);
})
    .prefix('/customer')
    .use(kernel_js_1.middleware.auth({ guards: ['web'] }))
    .use(kernel_js_1.middleware.role(['customer']));
