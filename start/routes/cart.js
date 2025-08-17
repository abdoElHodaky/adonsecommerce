import router from '@adonisjs/core/services/router';
const CartController = () => import('#controllers/cart_controller');
router
    .group(() => {
    router.get('/', [CartController, 'index']);
    router.post('/add', [CartController, 'addToCart']);
    router.put('/items/:id', [CartController, 'updateCartItem']);
    router.delete('/items/:id', [CartController, 'removeCartItem']);
    router.post('/clear', [CartController, 'clearCart']);
    router.post('/apply-coupon', [CartController, 'applyCoupon']);
})
    .prefix('/store/cart');
//# sourceMappingURL=cart.js.map