import router from '@adonisjs/core/services/router'
import { middleware } from '../kernel.js'

// Auth routes
const AuthController = () => import('#controllers/auth_controller')

router
  .group(() => {
    // Login routes
    router.get('/login', [AuthController, 'showLogin'])
    router.post('/login', [AuthController, 'login'])

    // Registration routes
    router.get('/register', [AuthController, 'showRegister'])
    router.post('/register', [AuthController, 'register'])

    // Logout route
    router.post('/logout', [AuthController, 'logout'])
    
    // Password reset routes
    router.get('/forgot-password', [AuthController, 'showForgotPassword'])
    router.post('/forgot-password', [AuthController, 'forgotPassword'])
    router.get('/reset-password/:token', [AuthController, 'showResetPassword'])
    router.post('/reset-password', [AuthController, 'resetPassword'])
  })
  .prefix('/auth')

