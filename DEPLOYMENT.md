# Deployment Guide for AdonisJS Multi-Merchant E-commerce Platform

This guide provides instructions for deploying the AdonisJS multi-merchant e-commerce platform using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Git

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://github.com/abdoElHodaky/adonsecommerce.git
cd adonsecommerce
```

### 2. Configure Environment Variables

Create a `.env` file based on the `.env.example` file:

```bash
cp .env.example .env
```

Edit the `.env` file and set the following variables:

```
PORT=3333
HOST=0.0.0.0
NODE_ENV=production
APP_KEY=<generate-a-random-key>
SESSION_DRIVER=cookie

# Database
DB_CONNECTION=mysql
MYSQL_HOST=db
MYSQL_PORT=3306
MYSQL_USER=adonsecommerce
MYSQL_PASSWORD=<your-secure-password>
MYSQL_DB_NAME=adonsecommerce
MYSQL_ROOT_PASSWORD=<your-secure-root-password>

# Mail
SMTP_HOST=<your-smtp-host>
SMTP_PORT=587
SMTP_USERNAME=<your-smtp-username>
SMTP_PASSWORD=<your-smtp-password>
```

To generate a random APP_KEY, you can use the following command:

```bash
openssl rand -base64 32
```

### 3. Build and Start the Docker Containers

```bash
docker-compose up -d
```

This command will:
- Build the application image
- Start the MySQL database
- Start the phpMyAdmin interface
- Start the application

### 4. Run Migrations and Seeders

After the containers are up and running, run the migrations and seeders:

```bash
docker-compose exec app node ace migration:run
docker-compose exec app node ace db:seed
```

### 5. Access the Application

- Main application: http://localhost:3333
- phpMyAdmin: http://localhost:8080 (login with MySQL credentials)

## Production Deployment Considerations

### SSL/TLS Configuration

For production, you should use HTTPS. You can set up a reverse proxy like Nginx or use a service like Cloudflare to handle SSL/TLS.

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment Variables

In production, make sure to set secure values for all environment variables, especially:
- APP_KEY
- MYSQL_PASSWORD
- MYSQL_ROOT_PASSWORD
- SMTP credentials

### Database Backups

Set up regular database backups:

```bash
docker-compose exec db mysqldump -u root -p<your-root-password> adonsecommerce > backup_$(date +%Y%m%d).sql
```

### Monitoring

Consider setting up monitoring for your application using tools like:
- PM2 for Node.js process management
- Prometheus and Grafana for metrics
- ELK stack for logging

## Scaling

To scale the application horizontally:

1. Set up a load balancer (e.g., Nginx, HAProxy)
2. Configure session management to use Redis instead of cookies
3. Scale the app service using Docker Compose:

```bash
docker-compose up -d --scale app=3
```

## Troubleshooting

### Checking Logs

```bash
# View application logs
docker-compose logs app

# View database logs
docker-compose logs db
```

### Common Issues

1. **Database Connection Issues**
   - Check if the database container is running
   - Verify database credentials in the .env file

2. **Application Not Starting**
   - Check application logs for errors
   - Verify that all required environment variables are set

3. **File Permission Issues**
   - Ensure the volumes have proper permissions

## Maintenance

### Updates

To update the application:

1. Pull the latest changes:
   ```bash
   git pull origin main
   ```

2. Rebuild and restart the containers:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

3. Run migrations if needed:
   ```bash
   docker-compose exec app node ace migration:run
   ```

### Cleanup

To remove unused Docker resources:

```bash
docker system prune -a
```

