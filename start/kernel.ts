/*
|--------------------------------------------------------------------------
| HTTP kernel file
|--------------------------------------------------------------------------
|
| The HTTP kernel file is used to register the middleware with the server
| or the router.
|
*/

import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

/**
 * The middleware to register with the server. The server middleware
 * runs for all the HTTP requests, including the assets requests.
 */
server.use([
  () => import('#middleware/container_bindings_middleware'),
  () => import('@adonisjs/static/static_middleware'),
])

/**
 * The middleware to register with the router. The router middleware
 * only runs for the routes registered with the router and does not
 * run for the assets.
 */
router.use([
  () => import('@adonisjs/core/bodyparser_middleware'),
  () => import('@adonisjs/session/session_middleware'),
  () => import('@adonisjs/shield/shield_middleware'),
])

/**
 * Named middleware collection must be explicitly assigned to routes.
 * However, you can also define the middleware inline when registering
 * the route.
 */
export const middleware = router.named({
  auth: () => import('#middleware/auth_middleware'),
  admin: () => import('#middleware/auth_middleware').then((mod) => mod.AdminMiddleware),
  merchant: () => import('#middleware/auth_middleware').then((mod) => mod.MerchantMiddleware),
  customer: () => import('#middleware/auth_middleware').then((mod) => mod.CustomerMiddleware),
})

