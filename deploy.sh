#!/bin/bash

# Exit on error
set -e

# Display help message
show_help() {
  echo "AdonisJS Multi-Merchant E-commerce Platform Deployment Script"
  echo ""
  echo "Usage: ./deploy.sh [options]"
  echo ""
  echo "Options:"
  echo "  -h, --help                 Show this help message"
  echo "  -e, --env <environment>    Set environment (development, production, staging)"
  echo "  -b, --build                Build the Docker images"
  echo "  -m, --migrate              Run database migrations"
  echo "  -s, --seed                 Run database seeders"
  echo "  -d, --down                 Stop and remove containers"
  echo "  -r, --restart              Restart containers"
  echo "  -l, --logs                 Show container logs"
  echo ""
  echo "Examples:"
  echo "  ./deploy.sh -e production -b -m -s    # Full production deployment with build, migrations, and seeders"
  echo "  ./deploy.sh -r                        # Restart containers"
  echo "  ./deploy.sh -l                        # Show logs"
}

# Default values
ENVIRONMENT="development"
BUILD=false
MIGRATE=false
SEED=false
DOWN=false
RESTART=false
LOGS=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      show_help
      exit 0
      ;;
    -e|--env)
      ENVIRONMENT="$2"
      shift 2
      ;;
    -b|--build)
      BUILD=true
      shift
      ;;
    -m|--migrate)
      MIGRATE=true
      shift
      ;;
    -s|--seed)
      SEED=true
      shift
      ;;
    -d|--down)
      DOWN=true
      shift
      ;;
    -r|--restart)
      RESTART=true
      shift
      ;;
    -l|--logs)
      LOGS=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Creating .env file from .env.example..."
  cp .env.example .env
  
  # Generate random APP_KEY
  APP_KEY=$(openssl rand -base64 32)
  sed -i "s/APP_KEY=/APP_KEY=$APP_KEY/" .env
  
  echo "Please update the .env file with your configuration."
  echo "You can edit it now or continue with the default values."
  read -p "Press Enter to continue..."
fi

# Set environment
echo "Setting environment to $ENVIRONMENT..."
sed -i "s/NODE_ENV=.*/NODE_ENV=$ENVIRONMENT/" .env

# Stop and remove containers if requested
if [ "$DOWN" = true ]; then
  echo "Stopping and removing containers..."
  docker-compose down
  
  if [ "$RESTART" != true ] && [ "$BUILD" != true ]; then
    echo "Containers stopped and removed."
    exit 0
  fi
fi

# Build and start containers
if [ "$BUILD" = true ]; then
  echo "Building and starting containers..."
  docker-compose up -d --build
elif [ "$RESTART" = true ]; then
  echo "Restarting containers..."
  docker-compose restart
else
  echo "Starting containers..."
  docker-compose up -d
fi

# Run migrations if requested
if [ "$MIGRATE" = true ]; then
  echo "Running database migrations..."
  docker-compose exec app node ace migration:run
fi

# Run seeders if requested
if [ "$SEED" = true ]; then
  echo "Running database seeders..."
  docker-compose exec app node ace db:seed
fi

# Show logs if requested
if [ "$LOGS" = true ]; then
  echo "Showing container logs (press Ctrl+C to exit)..."
  docker-compose logs -f
fi

echo "Deployment completed successfully!"
echo "Application is running at: http://localhost:${PORT:-3333}"
echo "phpMyAdmin is available at: http://localhost:${PMA_PORT:-8080}"

