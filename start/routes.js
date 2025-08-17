import router from '@adonisjs/core/services/router';
router.get("/", ctx) =>{
 return  ctx?.view?.render('welcomer')
})
