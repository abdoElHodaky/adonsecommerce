import "reflect-metadata"
import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'
import { inject } from '@adonisjs/core'
import { Edge } from 'edge.js'
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Middleware to bind the view service to the HttpContext
 */
@inject()
export default class ViewMiddleware {
  
  constructor(protected view: Edge) {}

  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Bind the view service to the context
     */
    Object.defineProperty(ctx, 'view', {
      value: this.view,
      writable: false,
      enumerable: true,
      configurable: true,
    })
    const viewsPath = join(__dirname, '../../resources/views');
    console.log('Mounting views path:', viewsPath);
    ctx["view"].mount(viewsPath);
    
    console.log('Adding global helpers...');
    ctx["view"].global('currentYear', () => new Date().getFullYear());
    //ctx["view"].global('appUrl', (path) => `http://localhost:3333${path}`);
   
    /**
     * Call the next middleware
     */
    await next()
  }
}
