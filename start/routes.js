import router from '@adonisjs/core/services/router';
router.get("/", ctx =>{
  console.log(ctx["response"].render)
 //return  ctx["view"].render('welcomer')
})
