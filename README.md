# Multi-Merchant E-commerce Platform

A multi-merchant e-commerce platform built with AdonisJS v6.

## Features

- Multi-merchant support
- User authentication and authorization
- Product management
- Order processing
- Shopping cart functionality
- Responsive design with Tailwind CSS

## Requirements

- Node.js >= 18.0.0
- MySQL or SQLite

## Installation

1. Clone the repository:

```bash
git clone https://github.com/abdoElHodaky/adonsecommerce.git
cd adonsecommerce
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment file:

```bash
cp .env.example .env
```

4. Generate application key:

```bash
node ace generate:key
```

5. Update the `.env` file with your database credentials.

6. Run migrations:

```bash
node ace migration:run
```

7. Start the development server:

```bash
node ace serve --watch
```

## Project Structure

- `app/` - Application code
  - `controllers/` - Controllers
  - `middleware/` - Middleware
  - `models/` - Database models
- `config/` - Configuration files
- `database/` - Database migrations and seeders
- `resources/` - Frontend assets
  - `views/` - Edge templates
- `start/` - Application bootstrap files
- `public/` - Static assets

## License

MIT

