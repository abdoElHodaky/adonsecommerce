# Edge.js Template Rendering System

This document explains how the Edge.js template rendering system works in our AdonisJS v6 multi-merchant e-commerce application.

## Overview

Our application uses Edge.js as the template engine. Edge.js is a powerful templating engine that supports:

- Layout inheritance with `@layout`, `@section`, and `@end`
- Partials with `@include`
- Components with `@component`
- Conditional rendering with `@if`, `@else`, and `@end`
- Loops with `@each` and `@end`
- Variable declaration with `@let`
- Custom helpers

## Template Structure

Templates are organized in the following directories:

- `resources/views/layouts`: Layout templates
- `resources/views/partials`: Reusable partial templates
- `resources/views/components`: Reusable component templates
- `resources/views/pages`: Page templates
- `resources/views/auth`: Authentication-related templates
- `resources/views/store`: Store-related templates
- `resources/views/admin`: Admin-related templates
- `resources/views/merchant`: Merchant-related templates
- `resources/views/customer`: Customer-related templates
- `resources/views/errors`: Error templates

## Layout Inheritance

Layout inheritance allows templates to inherit from a base layout and override specific sections. This is implemented using the following directives:

- `@layout('layouts/main')`: Specifies the layout to use
- `@section('title')`: Defines a section
- `@end`: Ends a section
- `@!section('content')`: Renders a section

Example:

```edge
@layout('layouts/main')

@section('title')
  About Us - MultiMarket
@end

@section('content')
  <div class="container">
    <h1>About Us</h1>
    <p>Welcome to our multi-merchant e-commerce platform!</p>
  </div>
@end
```

## Partials

Partials are reusable template fragments that can be included in other templates. They are included using the `@include` directive:

```edge
@include('partials/header')
```

You can also pass data to partials:

```edge
@include('partials/product-card', { product: product })
```

The `@include` directive is processed at render time, and the included template is rendered with the current context plus any additional data passed to it.

## Components

Components are reusable template fragments with parameters. They are included using the `@component` directive:

```edge
@component('components/product-card', { product: product })
@end
```

## Conditional Rendering

Conditional rendering is implemented using the `@if`, `@else`, and `@end` directives:

```edge
@if(user.isAuthenticated)
  <p>Welcome, {{ user.name }}!</p>
@else
  <p>Please log in to continue.</p>
@end
```

## Loops

Loops are implemented using the `@each` and `@end` directives:

```edge
<ul>
  @each(product in products)
    <li>{{ product.name }} - ${{ product.price }}</li>
  @end
</ul>
```

## Variables

Variables can be declared using the `@let` directive:

```edge
@let(discountPercentage = 20)
@let(originalPrice = 100)
@let(salePrice = originalPrice * (1 - discountPercentage / 100))

<p>Original Price: ${{ originalPrice }}</p>
<p>Discount: {{ discountPercentage }}%</p>
<p>Sale Price: ${{ salePrice }}</p>
```

## Global Helpers

The following global helpers are available in all templates:

- `formatCurrency(amount)`: Formats a number as currency
- `formatDate(date)`: Formats a date
- `calculateDiscount(original, sale)`: Calculates the discount percentage
- `truncate(text, length)`: Truncates text to a specified length
- `currentYear()`: Returns the current year
- `route(name, params)`: Generates a URL for a named route
- `csrfField()`: Generates a CSRF field
- `csrfMeta()`: Generates a CSRF meta tag

## Testing Templates

We have several test scripts to verify that templates are rendering correctly:

- `test-view.js`: Tests simple template rendering
- `test-full-page.js`: Tests template rendering with layout inheritance
- `test-templates-simple.js`: Tests multiple templates and partials
- `test-includes.js`: Tests the `@include` directive
- `test-control-flow.js`: Tests control flow directives (`@if`, `@else`, `@each`, `@let`)

To run all tests, use the `test-templates.sh` script:

```bash
./test-templates.sh
```

## Implementation Details

### ViewProvider

The `ViewProvider` class is responsible for setting up the Edge.js instance and registering global helpers:

```typescript
// app/providers/view_provider.ts
import { ApplicationService } from '@adonisjs/core/types'
import { Edge } from 'edge.js'
import viewConfig from '#config/view'

export default class ViewProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    const edge = new Edge()
    
    // Register view paths
    for (const viewPath of viewConfig.viewsPath) {
      edge.mount(viewPath)
    }
    
    // Register global helpers
    edge.global('formatCurrency', (amount) => `$${amount.toFixed(2)}`)
    // ... other globals
    
    // Register the Edge instance as a singleton
    this.app.container.singleton('view', () => edge)
  }
}
```

### ViewMiddleware

The `ViewMiddleware` class is responsible for binding the view service to the HTTP context and processing layout inheritance:

```typescript
// app/middleware/view_middleware.ts
import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { Edge } from 'edge.js'

@inject()
export default class ViewMiddleware {
  constructor(protected view: Edge) {}

  async handle(ctx: HttpContext, next: NextFn) {
    // Bind the view service to the context
    Object.defineProperty(ctx, 'view', {
      value: this.view,
      writable: false,
      enumerable: true,
      configurable: true,
    })
    
    // Add request-specific globals
    this.addRequestGlobals(ctx)
    
    // Process the request
    await next()
    
    // Handle layout inheritance
    if (ctx.response && ctx.response.getBody()) {
      const body = ctx.response.getBody()
      if (typeof body === 'string' && body.includes('@layout')) {
        const processedBody = await this.processLayoutInheritance(body)
        ctx.response.send(processedBody)
      }
    }
  }
  
  // ... other methods
}
```

## Troubleshooting

If templates are not rendering correctly, check the following:

1. Make sure the view paths are correctly configured in `config/view.ts`
2. Make sure the templates are in the correct directories
3. Check for syntax errors in the templates
4. Run the test scripts to verify that templates are rendering correctly
