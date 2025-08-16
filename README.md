# Multi-Merchant E-commerce Platform with AdonisJS v6

A comprehensive multi-merchant e-commerce platform built with AdonisJS v6, allowing multiple vendors to sell products through a single marketplace.

## Features

- **Multi-Merchant System**: Allow multiple merchants to register and sell products
- **User Management**: Admin, merchant, and customer roles with appropriate permissions
- **Product Management**: Complete product catalog with categories, variants, and images
- **Order Processing**: Full order lifecycle management
- **Shopping Cart**: Persistent cart functionality for users
- **Reviews & Ratings**: Product and merchant review system
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## Tech Stack

- **Backend**: AdonisJS v6
- **Database**: MySQL/SQLite
- **ORM**: Lucid ORM
- **Frontend**: Edge templating engine with Tailwind CSS
- **Authentication**: AdonisJS Auth

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

5. Configure your database in the `.env` file

6. Run migrations:
   ```bash
   node ace migration:run
   ```

7. Seed the database:
   ```bash
   node ace db:seed
   ```

8. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- **app/models**: Database models
- **app/controllers**: Application controllers
- **app/middleware**: Custom middleware
- **database/migrations**: Database migrations
- **database/seeders**: Database seeders
- **resources/views**: Edge templates
- **public**: Static assets
- **start**: Application bootstrap files
- **config**: Configuration files

## Default Users

After seeding the database, you can log in with the following credentials:

- **Admin**:
  - Email: admin@example.com
  - Password: admin123

- **Merchant**:
  - Email: merchant@example.com
  - Password: merchant123

- **Customer**:
  - Email: customer@example.com
  - Password: customer123

## License

This project is open-sourced software licensed under the MIT license.

