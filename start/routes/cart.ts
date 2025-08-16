import router from '@adonisjs/core/services/router'
import { middleware } from '../kernel.js'

// Cart routes
const CartController = () => import('#controllers/cart_controller')

router
  .group(() => {
    // View cart
    router.get('/', [CartController, 'index'])
    
    // Add item to cart
    router.post('/add', [CartController, 'addToCart'])
    
    // Update cart item
    router.put('/items/:id', [CartController, 'updateCartItem'])
    
    // Remove item from cart
    router.delete('/items/:id', [CartController, 'removeCartItem'])
    
    // Clear cart
    router.post('/clear', [CartController, 'clearCart'])
    
    // Apply coupon
    router.post('/apply-coupon', [CartController, 'applyCoupon'])
  })
  .prefix('/store/cart')

