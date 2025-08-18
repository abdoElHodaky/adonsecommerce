import { middleware } from './kernel.js'
import router from '@adonisjs/core/services/router';
const HomeController = () => import('#controllers/home_controller')

router.get("/", async({view}) =>{
   return await view.render("pages/welcomer")
}).use(middleware.view)

router.get('/home', [HomeController, 'index'])
.use(middleware.view)
