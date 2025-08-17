import router from '@adonisjs/core/services/router';
router.get("/", ctx =>{
  console.log(ctx["view"])
 //return  ctx["view"].render('welcomer')
})
