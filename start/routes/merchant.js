import router from '@adonisjs/core/services/router';
import { middleware } from '../kernel.js';
const MerchantController = () => import('#controllers/merchant_controller');
const OrderController = () => import('#controllers/order_controller');
const ProductController = () => import('#controllers/product_controller');
router
    .group(() => {
    router.get('/dashboard', [MerchantController, 'dashboard']);
    router.get('/profile', [MerchantController, 'profile']);
    router.post('/profile', [MerchantController, 'updateProfile']);
    router.group(() => {
        router.get('/', [OrderController, 'merchantOrders']);
        router.get('/:id', [OrderController, 'merchantOrderShow']);
        router.put('/:id/status', [OrderController, 'updateStatus']);
    }).prefix('/orders');
    router.group(() => {
        router.get('/', [ProductController, 'index']);
        router.get('/create', [ProductController, 'create']);
        router.post('/', [ProductController, 'store']);
        router.get('/:id/edit', [ProductController, 'edit']);
        router.put('/:id', [ProductController, 'update']);
        router.delete('/:id', [ProductController, 'destroy']);
    }).prefix('/products');
    router.get('/reviews', [MerchantController, 'reviews']);
    router.get('/settings', [MerchantController, 'settings']);
    router.post('/settings', [MerchantController, 'updateSettings']);
})
    .prefix('/merchant')
    .use(middleware.auth({ guards: ['web'] }))
    .use(middleware.role(['merchant']));
router.get('/store/merchants', [MerchantController, 'index']);
router.get('/store/merchants/:slug', [MerchantController, 'store']);
//# sourceMappingURL=merchant.js.map