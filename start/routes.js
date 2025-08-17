import router from '@adonisjs/core/services/router';
router.get("/", ctx =>{
  console.log(ctx)
 //return  ctx["view"].render('welcomer')
})
