import router from '@adonisjs/core/services/router';
const AuthController = () => import('#controllers/auth_controller');
router
    .group(() => {
    router.get('/login', [AuthController, 'showLogin']);
    router.post('/login', [AuthController, 'login']);
    router.get('/register', [AuthController, 'showRegister']);
    router.post('/register', [AuthController, 'register']);
    router.post('/logout', [AuthController, 'logout']);
    router.get('/forgot-password', [AuthController, 'showForgotPassword']);
    router.post('/forgot-password', [AuthController, 'forgotPassword']);
    router.get('/reset-password/:token', [AuthController, 'showResetPassword']);
    router.post('/reset-password', [AuthController, 'resetPassword']);
})
    .prefix('/auth');
//# sourceMappingURL=auth.js.map