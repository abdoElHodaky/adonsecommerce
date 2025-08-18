"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("@adonisjs/core/services/router");
// Cart routes
const CartController = () => Promise.resolve().then(() => require('#controllers/cart_controller'));
router_1.default
    .group(() => {
    // View cart
    router_1.default.get('/', [CartController, 'index']);
    // Add item to cart
    router_1.default.post('/add', [CartController, 'addToCart']);
    // Update cart item
    router_1.default.put('/items/:id', [CartController, 'updateCartItem']);
    // Remove item from cart
    router_1.default.delete('/items/:id', [CartController, 'removeCartItem']);
    // Clear cart
    router_1.default.post('/clear', [CartController, 'clearCart']);
    // Apply coupon
    router_1.default.post('/apply-coupon', [CartController, 'applyCoupon']);
})
    .prefix('/store/cart');
