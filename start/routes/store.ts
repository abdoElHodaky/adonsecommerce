import router from '@adonisjs/core/services/router'
import { middleware } from '../kernel.js'

// Store routes
const HomeController = () => import('#controllers/home_controller')
const CategoryController = () => import('#controllers/category_controller')
const ProductController = () => import('#controllers/product_controller')
const CartController = () => import('#controllers/cart_controller')
const OrderController = () => import('#controllers/order_controller')

// Home routes
router.get('/', [HomeController, 'index'])
router.get('/about', [HomeController, 'about'])
router.get('/contact', [HomeController, 'contact'])
router.post('/contact', [HomeController, 'submitContact'])
router.get('/faq', [HomeController, 'faq'])
router.get('/terms', [HomeController, 'terms'])
router.get('/privacy', [HomeController, 'privacy'])

// Categories routes
router.get('/categories', [CategoryController, 'index'])
router.get('/categories/:slug', [CategoryController, 'show'])

// Products routes
router.get('/products', [ProductController, 'index'])
router.get('/products/:slug', [ProductController, 'show'])
router.post('/products/:id/reviews', [ProductController, 'storeReview'])
  .use(middleware.auth)//(/*{ guards: ['web'] })*/)

// Cart routes
router.group(() => {
  router.get('/', [CartController, 'index'])
  router.post('/add', [CartController, 'addToCart'])
  router.put('/items/:id', [CartController, 'updateCartItem'])
  router.delete('/items/:id', [CartController, 'removeCartItem'])
  router.post('/clear', [CartController, 'clearCart'])
  router.post('/apply-coupon', [CartController, 'applyCoupon'])
}).prefix('/cart')

// Checkout routes
router.group(() => {
  router.get('/', async ({ view }) => {
    return view.render('pages/store/checkout')
  })
  router.post('/', [OrderController, 'store'])
    .use(middleware.auth(/*{ guards: ['web'] }*/))
}).prefix('/checkout')

