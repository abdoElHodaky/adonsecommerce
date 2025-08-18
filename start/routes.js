import { middleware } from './kernel.js'
import router from '@adonisjs/core/services/router'
import { Edge } from "edge.js"
import { join } from 'node:path'
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
const edge=new Edge()
edge.mount(join(process.cwd(), 'resources', 'views'))
// Main route for the homepage
router.get("/", async({response}) => {
   try {
   const html=await edge.render("pages/about/index")
   //return await response.send(e)
    // response.safeHeader("Content-Type","text/html")
     return response.send(html)
      
   }catch(error){
      console.log(error)
   }
})//.use(middleware.view)

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
