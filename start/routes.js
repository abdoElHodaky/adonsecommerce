import router from '@adonisjs/core/services/router';
router.get("/", async ctx =>{
 return  ctx.view.render('welcomer')
})
