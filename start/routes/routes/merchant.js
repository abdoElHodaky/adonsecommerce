"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("@adonisjs/core/services/router");
const kernel_js_1 = require("../kernel.js");
// Merchant routes
const MerchantController = () => Promise.resolve().then(() => require('#controllers/merchant_controller'));
const OrderController = () => Promise.resolve().then(() => require('#controllers/order_controller'));
const ProductController = () => Promise.resolve().then(() => require('#controllers/product_controller'));
router_1.default
    .group(() => {
    // Dashboard
    router_1.default.get('/dashboard', [MerchantController, 'dashboard']);
    // Profile management
    router_1.default.get('/profile', [MerchantController, 'profile']);
    router_1.default.post('/profile', [MerchantController, 'updateProfile']);
    // Orders management
    router_1.default.group(() => {
        router_1.default.get('/', [OrderController, 'merchantOrders']);
        router_1.default.get('/:id', [OrderController, 'merchantOrderShow']);
        router_1.default.put('/:id/status', [OrderController, 'updateStatus']);
    }).prefix('/orders');
    // Products management
    router_1.default.group(() => {
        router_1.default.get('/', [ProductController, 'index']);
        router_1.default.get('/create', [ProductController, 'create']);
        router_1.default.post('/', [ProductController, 'store']);
        router_1.default.get('/:id/edit', [ProductController, 'edit']);
        router_1.default.put('/:id', [ProductController, 'update']);
        router_1.default.delete('/:id', [ProductController, 'destroy']);
    }).prefix('/products');
    // Reviews
    router_1.default.get('/reviews', [MerchantController, 'reviews']);
    // Settings
    router_1.default.get('/settings', [MerchantController, 'settings']);
    router_1.default.post('/settings', [MerchantController, 'updateSettings']);
})
    .prefix('/merchant')
    .use(kernel_js_1.middleware.auth({ guards: ['web'] }))
    .use(kernel_js_1.middleware.role(['merchant']));
// Public merchant store routes
router_1.default.get('/store/merchants', [MerchantController, 'index']);
router_1.default.get('/store/merchants/:slug', [MerchantController, 'store']);
