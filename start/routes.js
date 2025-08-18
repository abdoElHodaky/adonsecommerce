import { middleware } from './kernel.js'
import router from '@adonisjs/core/services/router'

/*// Import route modules
import homeRoutes from './routes/routes/home.js'
import authRoutes from './routes/routes/auth.js'
import adminRoutes from './routes/routes/admin.js'
import merchantRoutes from './routes/routes/merchant.js'
import customerRoutes from './routes/routes/customer.js'
import storeRoutes from './routes/routes/store.js'
import productRoutes from './routes/routes/product.js'
import categoryRoutes from './routes/routes/category.js'
import cartRoutes from './routes/routes/cart.js'
import paymentRoutes from './routes/routes/payment.js'
import notificationRoutes from './routes/routes/notification.js'
import pagesRoutes from './routes/routes/pages.js'
*/
// Main route for the homepage
router.get("/about", async({view}) => {
   return await view.render("pages/about/index")
}).use(middleware.view)

// Register all route modules
/*router.use(homeRoutes)
router.use(authRoutes)
router.use(adminRoutes)
router.use(merchantRoutes)
router.use(customerRoutes)
router.use(storeRoutes)
router.use(productRoutes)
router.use(categoryRoutes)
router.use(cartRoutes)
router.use(paymentRoutes)
router.use(notificationRoutes)
router.use(pagesRoutes)
*/
