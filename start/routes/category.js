import router from '@adonisjs/core/services/router';
const CategoryController = () => import('#controllers/category_controller');
router
    .group(() => {
    router.get('/', [CategoryController, 'index']);
    router.get('/:slug', [CategoryController, 'show']);
})
    .prefix('/store/categories');
//# sourceMappingURL=category.js.map