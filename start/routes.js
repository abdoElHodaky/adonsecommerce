import router from '@adonisjs/core/services/router';
import './routes/auth.js';
import './routes/admin.js';
import './routes/merchant.js';
import './routes/customer.js';
import './routes/store.js';
import './routes/cart.js';
import './routes/category.js';
import './routes/product.js';
import './routes/home.js';
import './routes/payment.js';
import './routes/notification.js';
router.get('/errors/404', async ({ view }) => {
    return view.render('errors/404');
});
router.get('/errors/500', async ({ view }) => {
    return view.render('errors/500');
});
router.get('/errors/403', async ({ view }) => {
    return view.render('errors/403');
});
router.get('/errors/validation', async ({ view }) => {
    return view.render('errors/validation');
});
router.get('/errors/maintenance', async ({ view }) => {
    return view.render('errors/maintenance');
});
router.get("/", async (ctx) => {
    return ctx.view.render('welcomer');
});
//# sourceMappingURL=routes.js.map