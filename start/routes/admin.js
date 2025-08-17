import router from '@adonisjs/core/services/router';
import { middleware } from '../kernel.js';
const AdminController = () => import('#controllers/admin_controller');
router
    .group(() => {
    router.get('/dashboard', [AdminController, 'dashboard']);
    router.group(() => {
        router.get('/', [AdminController, 'users']);
        router.get('/create', [AdminController, 'createUser']);
        router.post('/', [AdminController, 'storeUser']);
        router.get('/:id/edit', [AdminController, 'editUser']);
        router.put('/:id', [AdminController, 'updateUser']);
        router.delete('/:id', [AdminController, 'deleteUser']);
    }).prefix('/users');
    router.group(() => {
        router.get('/', [AdminController, 'merchants']);
        router.get('/:id', [AdminController, 'showMerchant']);
        router.put('/:id/status', [AdminController, 'updateMerchantStatus']);
    }).prefix('/merchants');
    router.group(() => {
        router.get('/', [AdminController, 'categories']);
        router.get('/create', [AdminController, 'createCategory']);
        router.post('/', [AdminController, 'storeCategory']);
        router.get('/:id/edit', [AdminController, 'editCategory']);
        router.put('/:id', [AdminController, 'updateCategory']);
        router.delete('/:id', [AdminController, 'deleteCategory']);
    }).prefix('/categories');
    router.group(() => {
        router.get('/', [AdminController, 'orders']);
        router.get('/:id', [AdminController, 'showOrder']);
        router.put('/:id/status', [AdminController, 'updateOrderStatus']);
    }).prefix('/orders');
    router.get('/settings', [AdminController, 'settings']);
    router.post('/settings', [AdminController, 'updateSettings']);
})
    .prefix('/admin')
    .use(middleware.auth({ guards: ['web'] }))
    .use(middleware.role(['admin']));
//# sourceMappingURL=admin.js.map