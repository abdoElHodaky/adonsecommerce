"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("@adonisjs/core/services/router");
const kernel_js_1 = require("../kernel.js");
// Admin routes
const AdminController = () => Promise.resolve().then(() => require('#controllers/admin_controller'));
router_1.default
    .group(() => {
    // Dashboard
    router_1.default.get('/dashboard', [AdminController, 'dashboard']);
    // Users management
    router_1.default.group(() => {
        router_1.default.get('/', [AdminController, 'users']);
        router_1.default.get('/create', [AdminController, 'createUser']);
        router_1.default.post('/', [AdminController, 'storeUser']);
        router_1.default.get('/:id/edit', [AdminController, 'editUser']);
        router_1.default.put('/:id', [AdminController, 'updateUser']);
        router_1.default.delete('/:id', [AdminController, 'deleteUser']);
    }).prefix('/users');
    // Merchants management
    router_1.default.group(() => {
        router_1.default.get('/', [AdminController, 'merchants']);
        router_1.default.get('/:id', [AdminController, 'showMerchant']);
        router_1.default.put('/:id/status', [AdminController, 'updateMerchantStatus']);
    }).prefix('/merchants');
    // Categories management
    router_1.default.group(() => {
        router_1.default.get('/', [AdminController, 'categories']);
        router_1.default.get('/create', [AdminController, 'createCategory']);
        router_1.default.post('/', [AdminController, 'storeCategory']);
        router_1.default.get('/:id/edit', [AdminController, 'editCategory']);
        router_1.default.put('/:id', [AdminController, 'updateCategory']);
        router_1.default.delete('/:id', [AdminController, 'deleteCategory']);
    }).prefix('/categories');
    // Orders management
    router_1.default.group(() => {
        router_1.default.get('/', [AdminController, 'orders']);
        router_1.default.get('/:id', [AdminController, 'showOrder']);
        router_1.default.put('/:id/status', [AdminController, 'updateOrderStatus']);
    }).prefix('/orders');
    // Settings
    router_1.default.get('/settings', [AdminController, 'settings']);
    router_1.default.post('/settings', [AdminController, 'updateSettings']);
})
    .prefix('/admin')
    .use(kernel_js_1.middleware.auth({ guards: ['web'] }))
    .use(kernel_js_1.middleware.role(['admin']));
