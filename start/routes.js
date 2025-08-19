import { middleware } from './kernel.js'
import router from '@adonisjs/core/services/router'
import { Edge } from "edge.js"
import { join } from 'node:path'

import  "./routes/home.js";
import "./routes/auth.js"
const edge=new Edge()
edge.mount(join(process.cwd(), 'resources', 'views'))
// Main route for the homepage
//router.get("/", async({view}) => {
/*  try {
  const html=await edge.render("pages/about/index")
router.get("/", async({response}) => {
  try {
   const html=await edge.renderSync("pages/about/index")
   //return await response.send(e)
    // response.safeHeader("Content-Type","text/html")
     return response.send(html)
      
   }catch(error){
      console.log(error)
   }*/
 //  return await view.render("pages/about/index")
//})//.use(middleware.view)

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
