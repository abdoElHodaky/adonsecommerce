"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("@adonisjs/core/services/router");
// Auth routes
const AuthController = () => Promise.resolve().then(() => require('#controllers/auth_controller'));
router_1.default
    .group(() => {
    // Login routes
    router_1.default.get('/login', [AuthController, 'showLogin']);
    router_1.default.post('/login', [AuthController, 'login']);
    // Registration routes
    router_1.default.get('/register', [AuthController, 'showRegister']);
    router_1.default.post('/register', [AuthController, 'register']);
    // Logout route
    router_1.default.post('/logout', [AuthController, 'logout']);
    // Password reset routes
    router_1.default.get('/forgot-password', [AuthController, 'showForgotPassword']);
    router_1.default.post('/forgot-password', [AuthController, 'forgotPassword']);
    router_1.default.get('/reset-password/:token', [AuthController, 'showResetPassword']);
    router_1.default.post('/reset-password', [AuthController, 'resetPassword']);
})
    .prefix('/auth');
