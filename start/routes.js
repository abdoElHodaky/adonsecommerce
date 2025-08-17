import { middleware } from './kernel.js'
import router from '@adonisjs/core/services/router';
router.get("/home", {view} =>{
   return view.render("pages/home")
}).use(middleware.view)
