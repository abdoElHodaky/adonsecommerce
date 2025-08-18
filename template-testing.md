# Edge.js Template Testing

This document explains how to use the template testing tools to verify that your Edge.js templates render correctly.

## Testing Tools

Two scripts are provided for testing Edge.js templates:

1. `test-view.js` - A Node.js script that renders templates and reports errors
2. `test-templates.sh` - A shell script that provides a convenient interface for testing templates

## Prerequisites

- Node.js (v14 or higher)
- Edge.js v6

## Usage

### Basic Usage

To test a specific template:

```bash
./test-templates.sh pages/home
```

To test all templates in a directory:

```bash
./test-templates.sh partials
```

To test all templates:

```bash
./test-templates.sh all
```

To test only critical templates:

```bash
./test-templates.sh critical
```

### Advanced Usage

You can also use the Node.js script directly:

```bash
node test-view.js [template-path]
```

## How It Works

The testing tool:

1. Sets up an Edge.js environment
2. Provides mock data for templates (auth, flashMessages, etc.)
3. Attempts to render each template
4. Reports success or failure

## Troubleshooting

If a template fails to render, the error message will help identify the issue:

- **Syntax errors**: Check for missing or mismatched tags
- **Missing variables**: Make sure all required variables are provided in the mock data
- **Component errors**: Ensure components are properly defined and imported

## Extending the Tests

### Adding Mock Data

To add more mock data for testing, edit the `mockData` object in `test-view.js`:

```javascript
const mockData = {
  // Add your mock data here
  newProperty: 'value'
}
```

### Adding Critical Templates

To add more templates to the critical templates list, edit the `critical_templates` array in `test-templates.sh`:

```bash
critical_templates=(
    "layouts/main"
    "pages/home"
    # Add your critical templates here
    "your/template/path"
)
```

## Best Practices

1. **Test after changes**: Run tests after making changes to templates
2. **Test critical templates**: Always test critical templates before deploying
3. **Add tests for new templates**: When creating new templates, add them to the testing process
4. **Fix errors immediately**: Don't let template errors accumulate

