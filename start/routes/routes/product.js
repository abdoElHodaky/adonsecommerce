"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("@adonisjs/core/services/router");
const kernel_js_1 = require("../kernel.js");
// Product routes
const ProductController = () => Promise.resolve().then(() => require('#controllers/product_controller'));
router_1.default
    .group(() => {
    // List all products
    router_1.default.get('/', [ProductController, 'index']);
    // Show product details
    router_1.default.get('/:slug', [ProductController, 'show']);
    // Add product review (requires authentication)
    router_1.default.post('/:id/reviews', [ProductController, 'storeReview'])
        .use(kernel_js_1.middleware.auth({ guards: ['web'] }));
})
    .prefix('/store/products');
