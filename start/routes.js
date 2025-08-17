import router from '@adonisjs/core/services/router';
router.get("/", {view} =>{
  view.render("pages/welcomer")
 //return  ctx["view"].render('welcomer')
})
