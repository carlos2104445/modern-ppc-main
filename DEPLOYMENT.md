# Deployment Guide

This guide explains how to deploy the Modern PPC application using Docker on DigitalOcean or any other server.

## Prerequisites

- Docker and Docker Compose installed on your server
- A server with at least 2GB RAM (4GB recommended)
- Domain name (optional, but recommended for production)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/carlos2104445/modern-ppc.git
cd modern-ppc
```

### 2. Build the Frontend

Before starting Docker Compose, you need to build the frontend locally:

```bash
npm ci
npm run build
```

This will create the `dist/public` directory with the built frontend assets.

### 3. Configure Environment Variables

Create a `.env` file in the root directory with your configuration:

```bash
# Database Configuration
DATABASE_NAME=modern_ppc
DATABASE_USER=postgres
DATABASE_PASSWORD=your_secure_password_here
DATABASE_PORT=5432

# Redis Configuration
REDIS_PASSWORD=your_redis_password_here
REDIS_PORT=6379

# Application Configuration
APP_PORT=5000
NODE_ENV=production

# Security Secrets (generate random strings for production)
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
SESSION_SECRET=your_session_secret_here

# CORS Configuration - IMPORTANT: Set this to your actual domain(s)
ALLOWED_ORIGINS=http://your-domain.com,https://your-domain.com,http://your-ip-address

# Chapa Payment Gateway
CHAPA_SECRET_KEY=your_chapa_secret_key
CHAPA_WEBHOOK_SECRET=your_chapa_webhook_secret

# Nginx Ports
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
```

**IMPORTANT**: Replace all placeholder values with your actual configuration. The `ALLOWED_ORIGINS` variable is critical for CORS to work properly.

### 4. Start the Application

```bash
docker compose up -d --build
```

This will start:

- PostgreSQL database
- Redis cache
- Application server
- Nginx reverse proxy

### 5. Verify Deployment

Check that all containers are running:

```bash
docker ps
```

You should see containers for:

- `modern-ppc-postgres`
- `modern-ppc-redis`
- `modern-ppc-app`
- `modern-ppc-nginx`

Check the application logs:

```bash
docker logs modern-ppc-app -n 100
docker logs modern-ppc-nginx -n 100
```

Test the health endpoint:

```bash
curl http://localhost/api/health
```

You should receive a response indicating the application is healthy.

### 6. Access the Application

Open your browser and navigate to:

- `http://your-server-ip` or `http://your-domain.com`

## Troubleshooting

### Issue: Webpage keeps loading indefinitely

**Possible causes:**

1. **Missing nginx configuration**: Ensure the `nginx/nginx.conf` file exists (it's now included in the repository).

2. **Frontend not built**: Make sure you ran `npm run build` before starting Docker Compose. The `dist/public` directory must exist.

3. **CORS issues**: Check that `ALLOWED_ORIGINS` in your `.env` file includes your actual domain or IP address.

4. **Container not starting**: Check logs with:

   ```bash
   docker logs modern-ppc-app
   docker logs modern-ppc-nginx
   ```

5. **Port conflicts**: Ensure ports 80, 443, 5000, 5432, and 6379 are not already in use.

### Issue: API requests fail with CORS errors

Update the `ALLOWED_ORIGINS` environment variable in your `.env` file to include your domain:

```bash
ALLOWED_ORIGINS=http://your-domain.com,https://your-domain.com
```

Then restart the application:

```bash
docker compose down
docker compose up -d
```

### Issue: Database connection errors

1. Check that PostgreSQL is running:

   ```bash
   docker logs modern-ppc-postgres
   ```

2. Verify the `DATABASE_URL` is correct in the app container:

   ```bash
   docker exec modern-ppc-app env | grep DATABASE_URL
   ```

3. Ensure the database credentials in `.env` match what's configured.

### Issue: Build fails with "terser not found"

This has been fixed in the latest version. If you encounter this, ensure you have the latest code and run:

```bash
npm install --save-dev terser
```

## Updating the Application

To update the application after making changes:

1. Pull the latest changes:

   ```bash
   git pull origin main
   ```

2. Rebuild the frontend:

   ```bash
   npm ci
   npm run build
   ```

3. Rebuild and restart containers:
   ```bash
   docker compose down
   docker compose up -d --build
   ```

## Production Recommendations

1. **Use HTTPS**: Configure SSL certificates in `nginx/ssl/` and update the nginx configuration to use HTTPS.

2. **Secure secrets**: Use strong, randomly generated secrets for all environment variables.

3. **Database backups**: Set up regular backups of the PostgreSQL database.

4. **Monitoring**: Enable the optional monitoring services (Prometheus, Grafana) by using the `monitoring` profile:

   ```bash
   docker compose --profile monitoring up -d
   ```

5. **Resource limits**: Configure resource limits in `docker-compose.yml` for production use.

6. **Firewall**: Configure your firewall to only allow necessary ports (80, 443).

## Alternative: Running Without Nginx

If you want to simplify the deployment, you can run without nginx by:

1. Comment out the nginx service in `docker-compose.yml`
2. Change the app service ports to `"80:5000"`
3. The Node.js server will serve both the API and static frontend

This is simpler but nginx provides better performance and flexibility for production.

## Support

If you encounter issues not covered in this guide, please:

1. Check the application logs
2. Verify all environment variables are set correctly
3. Ensure the build completed successfully
4. Open an issue on GitHub with detailed error messages
