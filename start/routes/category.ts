import router from '@adonisjs/core/services/router'

// Category routes
const CategoryController = () => import('#controllers/category_controller')

router
  .group(() => {
    // List all categories
    router.get('/', [CategoryController, 'index'])
    
    // Show category with products
    router.get('/:slug', [CategoryController, 'show'])
  })
  .prefix('/store/categories')

