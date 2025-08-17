import { middleware } from './kernel.js'
import router from '@adonisjs/core/services/router';
const HomeController = () => import('#controllers/home_controller')

router.get("/", async({view}) =>{
   return await view.render("pages/welcomer")
}).use(middleware.view)

router.get('/home', [HomeController, 'index']).use(middleware.view)
router.group(()=>{
  router.get('/errors/404', async ({ view }) => {
  return await view.render('errors/404')
})

router.get('/errors/500', async ({ view }) => {
  return await view.render('errors/500')
})

router.get('/errors/403', async ({ view }) => {
  return await view.render('errors/403')
})

router.get('/errors/validation', async ({ view }) => {
  return await view.render('errors/validation')
})

router.get('/errors/maintenance', async ({ view }) => {
  return await view.render('errors/maintenance')
})
}).use(middleware.view)
