"use strict";
/*
|--------------------------------------------------------------------------
| HTTP kernel file
|--------------------------------------------------------------------------
|
| The HTTP kernel file is used to register the middleware with the server
| or the router.
|
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.middleware = void 0;
const router_1 = require("@adonisjs/core/services/router");
const server_1 = require("@adonisjs/core/services/server");
/**
 * The middleware to register with the router
 */
exports.middleware = router_1.default.named({
    auth: () => Promise.resolve().then(() => require('#middleware/auth_middleware')),
    role: () => Promise.resolve().then(() => require('#middleware/role_middleware')),
    view: () => Promise.resolve().then(() => require('#middleware/view_middleware'))
});
/**
 * The server middleware to register with the server
 */
server_1.default.use([
    () => Promise.resolve().then(() => require('@adonisjs/static/static_middleware')),
    () => Promise.resolve().then(() => require('@adonisjs/core/body_parser_middleware')),
    () => Promise.resolve().then(() => require('@adonisjs/session/session_middleware')),
    () => Promise.resolve().then(() => require('@adonisjs/shield/shield_middleware')),
    () => Promise.resolve().then(() => require('#middleware/view_middleware'))
]);
