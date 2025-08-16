import router from '@adonisjs/core/services/router'
import { middleware } from '../kernel.js'

// Product routes
const ProductController = () => import('#controllers/product_controller')

router
  .group(() => {
    // List all products
    router.get('/', [ProductController, 'index'])
    
    // Show product details
    router.get('/:slug', [ProductController, 'show'])
    
    // Add product review (requires authentication)
    router.post('/:id/reviews', [ProductController, 'storeReview'])
      .use(middleware.auth({ guards: ['web'] }))
  })
  .prefix('/store/products')

