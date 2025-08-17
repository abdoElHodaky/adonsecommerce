/*
|--------------------------------------------------------------------------
| AdonisJS Server
|--------------------------------------------------------------------------
|
| The contents in this file is meant to bootstrap the AdonisJS application
| and start the HTTP server to accept incoming connections. You must avoid
| adding any code to this file that is not related to starting the server.
|
*/

import 'reflect-metadata';
import { Ignitor, prettyPrintError } from '@adonisjs/core';
const APP_ROOT = new URL('../', import.meta.url);
const IMPORTER = (filePath) => {
    if (filePath.startsWith('./') || filePath.startsWith('../')) {
        return import(new URL(filePath, APP_ROOT).href);
    }
    return import(filePath);
};
new Ignitor(APP_ROOT, { importer: IMPORTER })
    .tap((app) => {
    app.booting(async () => {
      await import('#start/env')
    })
    app.listen('SIGTERM', () => app.terminate())
    app.listen('SIGINT', () => app.terminate())
  })
  .httpServer()
  .start((httpServer) => {
    // Initialize the notification service with the HTTP server
    // This allows Socket.io to attach to the same server
    notificationService.initialize(httpServer)

    const originalHandler = httpServer.handle
    httpServer.handle = function (req, res) {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      if (req.method === 'OPTIONS') {
        res.writeHead(204)
        res.end()
        return
      }
      originalHandler.call(httpServer, req, res)
    }

    return {
      host: SERVER_URL.hostname,
      port: SERVER_URL.port,
    }
  })
  .catch((error) => {
    process.exitCode = 1
    prettyPrintError(error)
  })

