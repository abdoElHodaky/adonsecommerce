"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("@adonisjs/core/services/router");
const kernel_js_1 = require("../kernel.js");
// Store routes
const HomeController = () => Promise.resolve().then(() => require('#controllers/home_controller'));
const CategoryController = () => Promise.resolve().then(() => require('#controllers/category_controller'));
const ProductController = () => Promise.resolve().then(() => require('#controllers/product_controller'));
const CartController = () => Promise.resolve().then(() => require('#controllers/cart_controller'));
const OrderController = () => Promise.resolve().then(() => require('#controllers/order_controller'));
// Home routes
router_1.default.get('/', [HomeController, 'index']);
router_1.default.get('/about', [HomeController, 'about']);
router_1.default.get('/contact', [HomeController, 'contact']);
router_1.default.post('/contact', [HomeController, 'submitContact']);
router_1.default.get('/faq', [HomeController, 'faq']);
router_1.default.get('/terms', [HomeController, 'terms']);
router_1.default.get('/privacy', [HomeController, 'privacy']);
// Categories routes
router_1.default.get('/categories', [CategoryController, 'index']);
router_1.default.get('/categories/:slug', [CategoryController, 'show']);
// Products routes
router_1.default.get('/products', [ProductController, 'index']);
router_1.default.get('/products/:slug', [ProductController, 'show']);
router_1.default.post('/products/:id/reviews', [ProductController, 'storeReview'])
    .use(kernel_js_1.middleware.auth( /*{ guards: ['web'] }*/));
// Cart routes
router_1.default.group(() => {
    router_1.default.get('/', [CartController, 'index']);
    router_1.default.post('/add', [CartController, 'addToCart']);
    router_1.default.put('/items/:id', [CartController, 'updateCartItem']);
    router_1.default.delete('/items/:id', [CartController, 'removeCartItem']);
    router_1.default.post('/clear', [CartController, 'clearCart']);
    router_1.default.post('/apply-coupon', [CartController, 'applyCoupon']);
}).prefix('/cart');
// Checkout routes
router_1.default.group(() => {
    router_1.default.get('/', async ({ view }) => {
        return view.render('pages/store/checkout');
    });
    router_1.default.post('/', [OrderController, 'store'])
        .use(kernel_js_1.middleware.auth( /*{ guards: ['web'] }*/));
}).prefix('/checkout');
