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
  () => import('@adonisjs/static/static_middleware'),
  () => import('@adonisjs/core/body_parser_middleware'),
  () => import('@adonisjs/session/session_middleware'),
  () => import('@adonisjs/shield/shield_middleware'),
])

/**
 * The middleware to register with the router. The router middleware
 * only runs for the routes registered with the router and does not
 * run for the static assets.
 */
router.use([
  () => import('@adonisjs/auth/initialize_auth_middleware'),
])

/**
 * Named middleware that can be referenced later by their names
 */
router.named({
  auth: () => import('#middleware/auth_middleware'),
  admin: () => import('#middleware/auth_middleware').then((mod) => mod.AdminMiddleware),
  merchant: () => import('#middleware/auth_middleware').then((mod) => mod.MerchantMiddleware),
  customer: () => import('#middleware/auth_middleware').then((mod) => mod.CustomerMiddleware),
  view: () => import('@adonisjs/core/http').then((mod) => mod.ViewMiddleware),
})
