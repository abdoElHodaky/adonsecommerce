import "reflect-metadata"
import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'
import { inject } from '@adonisjs/core'
import { Edge } from 'edge.js'
import { join } from 'node:path'
import { existsSync, writeFileSync, mkdirSync } from 'node:fs'

//import { fileURLToPath } from 'url';
//import { dirname } from 'path';
//import fs from 'fs';

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = dirname(__filename);

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
    const viewsPath = join(process.cwd(), 'resources', 'views')
    console.log('Views path:', viewsPath)
    console.log('Views path exists:', existsSync(viewsPath))
    //const edge=ctx["view"]
    ctx["view"].mount(viewsPath);
   // const viewsPath = join(__dirname, '../../resources/views/');
    //console.log('Mounting views path:', viewsPath);
    
    
  console.log('Adding global helpers...');
  ctx["view"].global('auth', {
  isAuthenticated: true,
  user: {
    id: 1,
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    userType: 'customer'
  }
})

ctx["view"].global('flashMessages', {
  has: (key) => false,
  get: (key) => ''
})

ctx["view"].global('cart', {
  items: []
})

// Add helper functions
ctx["view"].global('formatCurrency', (amount) => `$${amount.toFixed(2)}`)
ctx["view"].global('formatDate', (date) => new Date(date).toLocaleDateString())
ctx["view"].global('calculateDiscount', (original, sale) => Math.round((1 - sale / original) * 100))
ctx["view"].global('truncate', (text, length = 100) => text.length > length ? text.substring(0, length) + '...' : text)
ctx["view"].global('currentYear', () => new Date().getFullYear())
    
    //ctx["view"].global('appUrl', (path) => `http://localhost:3333${path}`);
   
    /**
     * Call the next middleware
     */
    await next()
  }
}
