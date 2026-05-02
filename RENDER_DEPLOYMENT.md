# Render.com Deployment Configuration
# Copy these settings when creating your Web Service on Render.com

## Service Settings
- **Name**: laborhub-backend
- **Environment**: Node
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && npm start`

## Environment Variables
```
NODE_ENV=production
PORT=3001

# Supabase Database
DATABASE_URL=postgresql://postgres.wijpikhfiupzztqcxjes:HyVs4skQ4N01J0A0@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
DATABASE_PUBLIC_SCHEMA=public

# Redis (Upstash)
REDIS_URL=https://YOUR-UPSTASH-REDIS-URL.upstash.io

# JWT
JWT_SECRET=YOUR-STRONG-PRODUCTION-SECRET-MIN-32-CHARS
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS (Your Vercel URL)
CORS_ORIGIN=https://laborhub.vercel.app,https://*.vercel.app
```

## Health Check
- Path: `/health`
- Method: GET

## Notes
- Free tier: 750 hours/month (enough for 1 service 24/7)
- Auto-deploys from GitHub: Liheng-Code/laborhub
- Build only the `backend` directory
