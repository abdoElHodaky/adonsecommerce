import router from '@adonisjs/core/services/router';
import { middleware } from '../kernel.js';
const ProductController = () => import('#controllers/product_controller');
router
    .group(() => {
    router.get('/', [ProductController, 'index']);
    router.get('/:slug', [ProductController, 'show']);
    router.post('/:id/reviews', [ProductController, 'storeReview'])
        .use(middleware.auth({ guards: ['web'] }));
})
    .prefix('/store/products');
//# sourceMappingURL=product.js.map