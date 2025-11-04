# Deployment Guide

This guide covers deploying VectorMail to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
- [Docker Deployment](#docker-deployment)
- [AWS Deployment](#aws-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Post-Deployment](#post-deployment)

## Prerequisites

- Node.js 20+
- PostgreSQL 16+ with pgvector extension
- Redis (recommended for production)
- Clerk account for authentication
- Aurinko account for email integration
- OpenAI API key or Gemini API key

## Vercel Deployment (Recommended)

### 1. Prepare Your Repository

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Configure environment variables (see below)
5. Click "Deploy"

### 3. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```env
DATABASE_URL=your-postgres-connection-string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
AURINKO_CLIENT_ID=...
AURINKO_CLIENT_SECRET=...
AURINKO_SIGNING_SECRET=...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 4. Set Up Database

Use a managed PostgreSQL service with pgvector:

**Recommended Providers:**
- [Neon](https://neon.tech) - Built-in pgvector support
- [Supabase](https://supabase.com) - Free tier available
- [Railway](https://railway.app) - Easy setup

```bash
npm run db:push
```

## Docker Deployment

### 1. Build Docker Image

```bash
docker build -t vectormail:latest .
```

### 2. Run with Docker Compose

```bash
docker-compose up -d
```

This starts:
- PostgreSQL with pgvector
- Redis cache
- VectorMail application

### 3. Environment Variables

Create `.env` file:

```env
DATABASE_URL=postgresql://vectormail:password@postgres:5432/vectormail
REDIS_URL=redis://redis:6379
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
AURINKO_CLIENT_ID=...
AURINKO_CLIENT_SECRET=...
OPENAI_API_KEY=sk-...
```

### 4. Health Checks

```bash
curl http://localhost:3000/api/health
```

## AWS Deployment

### 1. ECS with Fargate

```yaml
version: "3"
services:
  app:
    image: your-ecr-repo/vectormail:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=...
      - REDIS_URL=...
```

### 2. Using AWS RDS for PostgreSQL

1. Create RDS instance with PostgreSQL 16
2. Enable pgvector extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Update DATABASE_URL in environment variables

### 3. Using ElastiCache for Redis

1. Create ElastiCache Redis cluster
2. Update REDIS_URL in environment variables

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk secret key | `sk_test_...` |
| `AURINKO_CLIENT_ID` | Aurinko client ID | `your-client-id` |
| `AURINKO_CLIENT_SECRET` | Aurinko secret | `your-secret` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection string | Not set |
| `GEMINI_API_KEY` | Google Gemini API key | Not set |
| `SENTRY_DSN` | Sentry error tracking | Not set |
| `NODE_ENV` | Environment | `development` |

## Database Setup

### 1. Enable pgvector Extension

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Run Migrations

```bash
npm run db:push
```

### 3. Verify Setup

```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

## Post-Deployment

### 1. Set Up Webhooks

Configure webhooks in Clerk dashboard:
- Endpoint: `https://your-domain.com/api/clerk/webhook`
- Events: `user.created`, `user.updated`, `user.deleted`

### 2. Configure Aurinko Callback

Set redirect URI in Aurinko dashboard:
- `https://your-domain.com/api/aurinko/callback`

### 3. Test Email Integration

1. Sign in to your application
2. Connect an email account
3. Verify emails are syncing

### 4. Monitor Application

- Check Vercel Analytics for performance
- Monitor error rates in Sentry
- Review database performance

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Database Connection Issues

```bash
# Test database connection
npx prisma db pull
```

### Email Sync Not Working

- Verify Aurinko credentials
- Check webhook endpoints
- Review application logs

## Performance Optimization

### 1. Enable Caching

Set up Redis for session and query caching.

### 2. Database Indexing

```sql
CREATE INDEX idx_emails_user ON emails(user_id);
CREATE INDEX idx_emails_created ON emails(created_at);
```

### 3. CDN Configuration

Enable Vercel Edge Network for static assets.

## Security Checklist

- [ ] All environment variables set securely
- [ ] HTTPS enabled
- [ ] Database credentials rotated regularly
- [ ] API rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers in place

## Backup Strategy

### Database Backups

```bash
# Automated daily backups
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### S3 Backup Storage

```bash
aws s3 cp backup.sql s3://your-bucket/backups/
```

## Scaling Considerations

### Horizontal Scaling

- Use Vercel's automatic scaling
- Configure read replicas for database
- Implement connection pooling

### Vertical Scaling

- Increase database instance size
- Upgrade Redis cache capacity
- Monitor memory usage

## Support

For deployment issues:
- Check [GitHub Issues](https://github.com/parbhatkapila4/Vector-Mail/issues)
- Email: [help@productionsolution.net](mailto:help@productionsolution.net)

---

**Happy Deploying! 🚀**

