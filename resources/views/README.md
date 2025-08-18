# Edge.js Templates Guide

This document provides an overview of the Edge.js templates structure and best practices used in this project.

## Directory Structure

```
resources/views/
├── admin/             # Admin dashboard templates
├── auth/              # Authentication templates
├── components/        # Reusable components
├── customer/          # Customer dashboard templates
├── errors/            # Error page templates
├── helpers/           # Helper functions
├── layouts/           # Layout templates
├── merchant/          # Merchant dashboard templates
├── pages/             # Page templates
├── partials/          # Partial templates
└── store/             # Store templates
```

## Template Types

### Layouts

Layouts define the overall structure of pages. The main layout is in `layouts/main.edge`.

```edge
@layout('layouts/main')

@section('content')
  <!-- Your content here -->
@end
```

### Components

Components are reusable UI elements with their own logic. Use them with the `@component` tag.

```edge
@!component('components/product-card', { product })
```

### Partials

Partials are reusable template fragments. Use them with the `@include` tag.

```edge
@include('partials/header')
```

### Helpers

Helper functions provide reusable logic. Import them at the top of your template.

```edge
@include('helpers/index')

<!-- Then use the functions -->
{{ formatCurrency(product.price) }}
```

## Edge.js Syntax

### Variables and Expressions

```edge
{{ variable }}                 <!-- Output escaped variable -->
{{{ rawHtml }}}                <!-- Output unescaped HTML -->
{{ condition ? 'Yes' : 'No' }} <!-- Ternary operator -->
```

### Conditionals

```edge
@if(condition)
  <!-- Content -->
@elseif(otherCondition)
  <!-- Content -->
@else
  <!-- Content -->
@end

@unless(condition)
  <!-- Content when condition is false -->
@end
```

### Loops

```edge
@each(item in items)
  <!-- Content -->
@else
  <!-- Content when items is empty -->
@end

@for(let i = 0; i < 5; i++)
  <!-- Content -->
@end
```

### Components

```edge
<!-- Auto-closed component -->
@!component('components/alert', { type: 'error', message: 'Error message' })

<!-- Component with slots -->
@component('components/card')
  @slot('header')
    Card Header
  @end
  
  Card Body
  
  @slot('footer')
    Card Footer
  @end
@end
```

### Sections

```edge
@section('content')
  <!-- Content -->
@end

<!-- Render a section -->
@!section('content')
```

### Variables

```edge
@set('title', 'Page Title')

@let(count = 0)
```

## Best Practices

1. **Use components for reusable UI elements**
   - Create components for UI elements used in multiple places
   - Pass data to components using props

2. **Use partials for repeated template fragments**
   - Extract common parts like headers and footers into partials
   - Keep partials focused on presentation, not logic

3. **Use helper functions for reusable logic**
   - Create helper functions for formatting, calculations, etc.
   - Import helpers at the top of templates that use them

4. **Use layouts for consistent page structure**
   - Define the overall HTML structure in layouts
   - Use sections to define where content goes

5. **Add comments to templates**
   - Use `{{-- Comment --}}` for template comments
   - Document complex logic and component props

6. **Follow Edge.js v6 syntax**
   - Use `@end` to close all block-level tags
   - Use `@!component` for auto-closed components
   - Use `@include` for partials

