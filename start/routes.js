import { middleware } from './kernel.js'
import router from '@adonisjs/core/services/router';

router.get("/", async({view}) =>{
   return await view.render("pages/welcomer")
}).use(middleware.view)

router.get('/home',  'HomeControler.index').use(middleware.view)

