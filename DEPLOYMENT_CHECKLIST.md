# 🚀 Production Deployment Checklist

## Phase 1: Pre-Production ✓
- [x] Supabase project created (wijpikhfiupzztqcxjes)
- [x] Database migrated to Supabase
- [x] Pooler connection working (aws-1-ap-northeast-1.pooler.supabase.com)
- [x] CORS configured for production domains
- [x] Code pushed to GitHub (Liheng-Code/laborhub)

## Phase 2: Backend Deployment (Render.com)
- [ ] Create Render.com account
- [ ] New Web Service → Connect GitHub (Liheng-Code/laborhub)
- [ ] Configure:
  - **Name**: laborhub-backend
  - **Root Directory**: `backend`
  - **Build**: `npm install && npm run build`
  - **Start**: `npm start`
  - **Auto-Deploy**: Yes
- [ ] Add Environment Variables (copy from `backend/.env.production`):
  ```
  NODE_ENV=production
  DATABASE_URL=postgresql://postgres.wijpikhfiupzztqcxjes:HyVs4skQ4N01J0A0@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
  REDIS_URL=https://YOUR-UPSTASH-URL (get free from upstash.com)
  JWT_SECRET=YOUR-STRONG-SECRET (generate 32+ chars)
  CORS_ORIGIN=https://YOUR-VERCEL-APP.vercel.app,https://*.vercel.app
  ```
- [ ] Deploy → Get backend URL (e.g., `https://laborhub-backend.onrender.com`)

## Phase 3: Frontend Deployment (Vercel)
- [ ] Go to Vercel Dashboard → New Project
- [ ] Import: `Liheng-Code/laborhub`
- [ ] Configure:
  - **Root Directory**: `laborhub` (or `/` if repo root)
  - **Framework**: Next.js
- [ ] Environment Variables:
  ```
  NEXT_PUBLIC_API_URL=https://laborhub-backend.onrender.com
  NEXT_PUBLIC_SITE_URL=https://YOUR-VERCEL-APP.vercel.app
  NEXT_PUBLIC_SUPABASE_URL=https://wijpikhfiupzztqcxjes.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
  ```
- [ ] Deploy → Get frontend URL

## Phase 4: Post-Deployment
- [ ] Test health endpoint: `https://your-backend.onrender.com/health`
- [ ] Test signup on production frontend
- [ ] Verify Supabase data is being written
- [ ] Set up custom domains (optional)
- [ ] Configure monitoring & alerts

## Quick Commands
```bash
# Local production test
cd backend
cp .env.production .env
npm run dev

# Deploy to Render (auto via GitHub push)
git add .
git commit -m "Production ready"
git push origin main
```

## Support
- Render docs: https://render.com/docs
- Vercel docs: https://vercel.com/docs
- Supabase docs: https://supabase.com/docs
