import router from '@adonisjs/core/services/router';
router.get("/", ctx =>{
  ctx.response.json(ctx)
})
