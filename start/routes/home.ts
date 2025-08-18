import router from '@adonisjs/core/services/router'

// Home routes
const HomeController = () => import('#controllers/home_controller')

// Home page
/*router.get('/', [HomeController, 'index'])

// Static pages
router.get('/about', [HomeController, 'about'])
router.get('/contact', [HomeController, 'contact'])
router.post('/contact', [HomeController, 'submitContact'])
router.get('/faq', [HomeController, 'faq'])
router.get('/terms', [HomeController, 'terms'])
router.get('/privacy', [HomeController, 'privacy'])

// Error pages
router.get('/404', [HomeController, 'notFound'])
*/

router.resource("home",HomeController)
//export router
