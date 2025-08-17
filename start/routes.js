import router from '@adonisjs/core/services/router';
router.get("/", async ({view}) =>{
 return  view.render('welcomer')
})
