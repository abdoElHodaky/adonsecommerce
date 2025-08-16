/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// Public routes
router.get('/', 'home_controller.index')
router.get('/about', 'home_controller.about')
router.get('/contact', 'home_controller.contact')
router.post('/contact', 'home_controller.submitContact')
router.get('/faq', 'home_controller.faq')
router.get('/terms', 'home_controller.terms')
router.get('/privacy', 'home_controller.privacy')
router.get('/404', 'home_controller.notFound')

// Authentication routes
router.group(() => {
  router.get('/login', 'auth_controller.showLogin')
  router.post('/login', 'auth_controller.login')
  router.get('/register', 'auth_controller.showRegister')
  router.post('/register', 'auth_controller.register')
  router.get('/logout', 'auth_controller.logout')
  router.get('/forgot-password', 'auth_controller.showForgotPassword')
  router.post('/forgot-password', 'auth_controller.forgotPassword')
  router.get('/reset-password/:token', 'auth_controller.showResetPassword')
  router.post('/reset-password', 'auth_controller.resetPassword')
}).prefix('/auth')

// Store routes
router.group(() => {
  router.get('/', 'product_controller.index')
  router.get('/product/:slug', 'product_controller.show')
  router.get('/categories', 'category_controller.index')
  router.get('/category/:slug', 'category_controller.show')
  router.get('/merchants', 'merchant_controller.index')
  router.get('/merchant/:slug', 'merchant_controller.store')
  
  // Cart routes
  router.get('/cart', 'cart_controller.index')
  router.post('/cart/add', 'cart_controller.addToCart')
  router.put('/cart/item/:id', 'cart_controller.updateCartItem')
  router.delete('/cart/item/:id', 'cart_controller.removeCartItem')
  router.post('/cart/clear', 'cart_controller.clearCart')
  router.post('/cart/coupon', 'cart_controller.applyCoupon')
  
  // Checkout routes (requires authentication)
  router.get('/checkout', 'order_controller.checkout').middleware('auth')
  router.post('/checkout', 'order_controller.processOrder').middleware('auth')
}).prefix('/store')

// Customer routes (requires authentication and customer role)
router.group(() => {
  router.get('/dashboard', 'customer_controller.dashboard')
  
  // Orders
  router.get('/orders', 'order_controller.index')
  router.get('/orders/:id', 'order_controller.show')
  router.post('/orders/:id/cancel', 'order_controller.cancelOrder')
  
  // Profile
  router.get('/profile', 'customer_controller.profile')
  router.post('/profile', 'customer_controller.updateProfile')
  router.get('/change-password', 'customer_controller.showChangePassword')
  router.post('/change-password', 'customer_controller.updatePassword')
  
  // Reviews
  router.get('/reviews', 'customer_controller.reviews')
  router.get('/reviews/product/:productId/add', 'customer_controller.showAddProductReview')
  router.get('/reviews/merchant/:merchantId/add', 'customer_controller.showAddMerchantReview')
  router.post('/reviews', 'customer_controller.storeReview')
  router.delete('/reviews/:id', 'customer_controller.deleteReview')
  
  // Wishlist
  router.get('/wishlist', 'customer_controller.wishlist')
  
  // Addresses
  router.get('/addresses', 'customer_controller.addresses')
}).prefix('/customer').middleware('customer')

// Merchant routes (requires authentication and merchant role)
router.group(() => {
  router.get('/dashboard', 'merchant_controller.dashboard')
  
  // Products
  router.get('/products', 'product_controller.merchantProducts')
  router.get('/products/create', 'product_controller.create')
  router.post('/products', 'product_controller.store')
  router.get('/products/:id/edit', 'product_controller.edit')
  router.put('/products/:id', 'product_controller.update')
  router.delete('/products/:id', 'product_controller.destroy')
  
  // Orders
  router.get('/orders', 'merchant_controller.orders')
  router.get('/orders/:id', 'merchant_controller.showOrder')
  router.put('/orders/:id/status', 'merchant_controller.updateOrderStatus')
  
  // Profile
  router.get('/profile', 'merchant_controller.profile')
  router.post('/profile', 'merchant_controller.updateProfile')
  
  // Reviews
  router.get('/reviews', 'merchant_controller.reviews')
  
  // Settings
  router.get('/settings', 'merchant_controller.settings')
  router.post('/settings', 'merchant_controller.updateSettings')
}).prefix('/merchant').middleware('merchant')

// Admin routes (requires authentication and admin role)
router.group(() => {
  router.get('/dashboard', 'admin_controller.dashboard')
  
  // Users
  router.get('/users', 'admin_controller.users')
  router.get('/users/create', 'admin_controller.createUser')
  router.post('/users', 'admin_controller.storeUser')
  router.get('/users/:id/edit', 'admin_controller.editUser')
  router.put('/users/:id', 'admin_controller.updateUser')
  router.delete('/users/:id', 'admin_controller.deleteUser')
  
  // Merchants
  router.get('/merchants', 'admin_controller.merchants')
  router.get('/merchants/:id', 'admin_controller.showMerchant')
  router.put('/merchants/:id/status', 'admin_controller.updateMerchantStatus')
  
  // Categories
  router.get('/categories', 'admin_controller.categories')
  router.get('/categories/create', 'admin_controller.createCategory')
  router.post('/categories', 'admin_controller.storeCategory')
  router.get('/categories/:id/edit', 'admin_controller.editCategory')
  router.put('/categories/:id', 'admin_controller.updateCategory')
  router.delete('/categories/:id', 'admin_controller.deleteCategory')
  
  // Orders
  router.get('/orders', 'admin_controller.orders')
  router.get('/orders/:id', 'admin_controller.showOrder')
  router.put('/orders/:id/status', 'admin_controller.updateOrderStatus')
  
  // Settings
  router.get('/settings', 'admin_controller.settings')
  router.post('/settings', 'admin_controller.updateSettings')
}).prefix('/admin').middleware('admin')

// API routes
router.group(() => {
  // Auth API
  router.post('/auth/login', 'auth_controller.login')
  router.post('/auth/register', 'auth_controller.register')
  router.post('/auth/logout', 'auth_controller.logout')
  router.post('/auth/forgot-password', 'auth_controller.forgotPassword')
  router.post('/auth/reset-password', 'auth_controller.resetPassword')
  
  // Products API
  router.get('/products', 'product_controller.index')
  router.get('/products/:id', 'product_controller.show')
  
  // Categories API
  router.get('/categories', 'category_controller.index')
  router.get('/categories/:id', 'category_controller.show')
  
  // Cart API
  router.get('/cart', 'cart_controller.index')
  router.post('/cart/add', 'cart_controller.addToCart')
  router.put('/cart/item/:id', 'cart_controller.updateCartItem')
  router.delete('/cart/item/:id', 'cart_controller.removeCartItem')
  router.post('/cart/clear', 'cart_controller.clearCart')
  router.post('/cart/coupon', 'cart_controller.applyCoupon')
  
  // Orders API (requires authentication)
  router.group(() => {
    router.get('/orders', 'order_controller.index')
    router.get('/orders/:id', 'order_controller.show')
    router.post('/orders', 'order_controller.processOrder')
    router.post('/orders/:id/cancel', 'order_controller.cancelOrder')
  }).middleware('auth')
}).prefix('/api')

