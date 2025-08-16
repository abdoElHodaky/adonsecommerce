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
 * The middleware to register with the router
 */
export const middleware = router.named({
  auth: () => import('#middleware/auth_middleware'),
  role: () => import('#middleware/role_middleware'),
})

/**
 * The server middleware to register with the server
 */
server.use([
  () => import('@adonisjs/static/static_middleware'),
  () => import('@adonisjs/core/body_parser_middleware'),
  () => import('@adonisjs/session/session_middleware'),
  () => import('@adonisjs/shield/shield_middleware'),
])

