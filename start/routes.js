import { middleware } from './kernel.js'
import router from '@adonisjs/core/services/router';
router.get("/home", ctx =>{
   return "78"
})
