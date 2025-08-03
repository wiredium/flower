# Deployment Guide for Dokploy

This guide explains how to deploy the Flower application (both backend and frontend) on Dokploy.

## Prerequisites

1. A Dokploy account and server instance
2. A domain name pointed to your Dokploy server
3. OpenRouter API key for AI features

## Deployment Steps

### 1. Prepare Your Repository

Ensure your repository contains:
- `Dockerfile` (multi-stage build for both services)
- `docker-compose.yml` (orchestrates all services)
- `dokploy.yaml` (Dokploy-specific configuration)
- `.env.production.example` (environment variables template)

### 2. Connect Repository to Dokploy

1. Log into your Dokploy dashboard
2. Click "New Application"
3. Select "Docker Compose" as the deployment type
4. Connect your GitHub/GitLab repository
5. Select the branch to deploy (usually `main` or `production`)

### 3. Configure Environment Variables

In Dokploy dashboard, set these required environment variables:

```bash
# Database
POSTGRES_PASSWORD=<generate-secure-password>

# Authentication
JWT_SECRET=<generate-32-char-secret>
JWT_REFRESH_SECRET=<generate-32-char-secret>

# OpenRouter AI
OPENROUTER_API_KEY=<your-openrouter-api-key>

# Domains (Dokploy will auto-fill these)
DOKPLOY_DOMAIN=yourdomain.com
SSL_EMAIL=your-email@example.com
```

### 4. Configure Domains

1. In Dokploy, go to "Domains" section
2. Add your main domain for the web app: `yourdomain.com`
3. Add subdomain for API: `api.yourdomain.com`
4. Enable SSL (Let's Encrypt) for both domains

### 5. Deploy the Application

1. Click "Deploy" in Dokploy dashboard
2. Dokploy will:
   - Pull your repository
   - Build Docker images using the multi-stage Dockerfile
   - Start services with docker-compose
   - Configure Traefik for routing
   - Set up SSL certificates
   - Create PostgreSQL database

### 6. Post-Deployment Setup

#### Database Migrations
After first deployment, run database migrations:

```bash
# SSH into your Dokploy server
dokploy exec flower-app-api -- npx prisma migrate deploy
```

#### Verify Services

Check that all services are running:
- Web App: https://yourdomain.com
- API Health: https://api.yourdomain.com/health
- Database: Internal connection via Docker network

### 7. Monitoring & Maintenance

#### View Logs
```bash
# In Dokploy dashboard
Services → [Select Service] → Logs
```

#### Database Backups
Automatic daily backups are configured at 2 AM. To manual backup:
```bash
dokploy backup flower-app-postgres
```

#### Scaling
To scale services, update `dokploy.yaml` autoscale settings or manually:
```bash
dokploy scale flower-app-web=3
dokploy scale flower-app-api=2
```

## Environment Variables Reference

### Required Variables
- `POSTGRES_PASSWORD`: Database password
- `JWT_SECRET`: JWT signing secret (min 32 chars)
- `JWT_REFRESH_SECRET`: Refresh token secret (min 32 chars)
- `OPENROUTER_API_KEY`: OpenRouter API key for AI features

### Optional Variables
- `LOG_LEVEL`: Logging verbosity (debug|info|warn|error)
- `SMTP_*`: Email service configuration
- `S3_*`: File storage configuration
- `REDIS_URL`: Redis for caching/rate limiting

## Troubleshooting

### Build Failures
1. Check build logs in Dokploy dashboard
2. Ensure all dependencies are in package.json
3. Verify Node version compatibility (requires Node 18+)

### Database Connection Issues
1. Verify `DATABASE_URL` format
2. Check PostgreSQL container health
3. Ensure database migrations have run

### API Not Accessible
1. Check API container logs
2. Verify CORS settings match your domain
3. Ensure Traefik labels are correct

### Frontend Can't Connect to API
1. Verify `NEXT_PUBLIC_API_URL` is set correctly
2. Check CORS configuration on API
3. Ensure API domain SSL is working

## Update Deployment

To update your application:

1. Push changes to your repository
2. In Dokploy: Click "Redeploy"
3. Or enable auto-deploy for automatic updates

## Rollback

If issues occur after deployment:

1. In Dokploy dashboard, go to "Deployments"
2. Select previous successful deployment
3. Click "Rollback"

## Performance Optimization

1. **Enable CDN**: Configure Cloudflare for static assets
2. **Database Indexing**: Add indexes for frequently queried fields
3. **API Caching**: Implement Redis for API response caching
4. **Image Optimization**: Use Next.js Image component

## Security Checklist

- [ ] Strong database password
- [ ] Secure JWT secrets (32+ characters)
- [ ] SSL enabled on all domains
- [ ] Environment variables not exposed
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Regular security updates

## Support

For Dokploy-specific issues:
- Check Dokploy documentation
- Contact Dokploy support

For application issues:
- Check application logs
- Review error messages
- Check GitHub issues