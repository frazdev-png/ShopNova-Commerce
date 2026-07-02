# Deployment Guide

## Overview

This guide covers deploying the Ecommerce platform to production. The stack includes:
- **Frontend**: React + Vite + Tailwind CSS (hosted on Vercel/Netlify)
- **Backend**: FastAPI + SQLAlchemy (hosted on Render/Railway/AWS)
- **Database**: PostgreSQL (Neon/Supabase/AWS RDS)

---

## Option 1: Docker Compose (Self-Hosted)

### Prerequisites
- Docker & Docker Compose installed
- Domain name pointed to your server

### Steps

1. **Clone and configure**
```bash
git clone <repo-url> && cd ecommerce
cp backend/.env.example backend/.env
# Edit backend/.env with production values
```

2. **Set environment variables**
```bash
export SECRET_KEY="your-strong-secret-key-here"
export CORS_ORIGINS="https://yourdomain.com"
export FRONTEND_URL="https://yourdomain.com"
```

3. **Start services**
```bash
docker compose up -d --build
```

Services:
- Frontend: `http://localhost:80`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## Option 2: Cloud Deployment

### Backend (Render / Railway)

1. **Create a PostgreSQL database**
   - Use Neon, Supabase, or AWS RDS
   - Copy the connection string

2. **Deploy FastAPI backend**
   - Connect GitHub repo to Render/Railway
   - Set **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables** (Render/Railway dashboard):

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql+asyncpg://user:pass@host:5432/ecommerce` |
| `SECRET_KEY` | Generate with: `openssl rand -hex 32` |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` |
| `REFRESH_TOKEN_EXPIRE_MINUTES` | `43200` |
| `CORS_ORIGINS` | `https://your-frontend.vercel.app` |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` |
| `APP_DEBUG` | `false` |
| `LOG_LEVEL` | `INFO` |
| `RATE_LIMIT_ENABLED` | `true` |

### Frontend (Vercel / Netlify)

1. **Connect GitHub repo** to Vercel/Netlify
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variables** (Vercel/Netlify dashboard):

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend.onrender.com/api` |
| `VITE_WS_URL` | `wss://your-backend.onrender.com` |

---

## Option 3: AWS Deployment

### Backend (ECS / App Runner)

1. **Build Docker image**
```bash
cd backend
docker build -t ecommerce-backend .
docker tag ecommerce-backend:latest <your-ecr-repo>
docker push <your-ecr-repo>
```

2. **Deploy to ECS Fargate or App Runner**
   - Use the Docker image from ECR
   - Set environment variables in the task definition
   - Attach to RDS PostgreSQL

### Frontend (S3 + CloudFront)

1. **Build frontend**
```bash
cd frontend
VITE_API_URL=https://api.yourdomain.com/api npm run build
```

2. **Upload `dist/` to S3 bucket** (enable static hosting)

3. **Set up CloudFront** distribution pointing to S3

---

## CORS Configuration

For production, `CORS_ORIGINS` must include your frontend domain:

```env
# Single domain
CORS_ORIGINS=https://yourfrontend.com

# Multiple domains (comma-separated)
CORS_ORIGINS=https://yourfrontend.com,https://admin.yourfrontend.com

# Local development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## Database Migration (Production)

For SQLite->PostgreSQL migration:

1. Dump SQLite data
```bash
sqlite3 ecommerce.db .dump > dump.sql
```

2. Clean up SQLite-specific syntax
3. Import to PostgreSQL
```bash
psql -h <host> -U <user> -d ecommerce -f cleaned_dump.sql
```

---

## Monitoring & Health

- **Health check**: `GET /api/health` → `{ "status": "ok" }`
- **DB health**: `GET /api/health/db` → `{ "status": "ok", "database": "connected" }`
- **Logs**: Written to `logs/app.log` (configurable via `LOG_FILE` env var)
- **Rate limiting**: 60 req/min general, 10 req/min for auth endpoints

---

## Security Checklist

- [ ] `SECRET_KEY` is a long random string (at least 32 chars)
- [ ] `APP_DEBUG` is `false` in production
- [ ] CORS origins are restricted to your domains
- [ ] Database password is strong and not default
- [ ] HTTPS is enabled (CloudFront/Cloudflare)
- [ ] Rate limiting is enabled
- [ ] Password policy enforces minimum requirements
- [ ] Refresh tokens have appropriate expiry
