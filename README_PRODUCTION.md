# 🚀 LaborHub Production Setup - COMPLETE

## ✅ Setup Complete

### 1. Supabase Database ✓
- **Project**: `wijpikhfiupzztqcxjes`
- **Region**: `ap-northeast-1` (Tokyo)
- **Connection**: `postgresql://postgres.wijpikhfiupzztqcxjes:HyVs4skQ4N01J0A0@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`
- **Status**: Migrated, tables created, data imported

### 2. Backend (Fastify) ✓
- **Build**: Passing (TypeScript errors fixed)
- **CORS**: Production-ready (supports Vercel + ngrok)
- **Config**: `.env` (local), `.env.production` (production)
- **Package.json**: Updated with deploy script

### 3. Frontend (Next.js) ✓
- **Config**: `.env.local`, `.env.production`
- **API Client**: Points to backend URL
- **Status**: Deployed on Vercel (https://laborhub-one.vercel.app)

### 4. Documentation ✓
- `PRODUCTION_SETUP.md` - Overview
- `RENDER_DEPLOYMENT.md` - Backend deploy guide
- `VERCEL_DEPLOYMENT.md` - Frontend deploy guide
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- `README_PRODUCTION.md` - Complete summary

## 🎯 Next Steps (Actual Production Deployment)

### Step 1: Get Upstash Redis (Free)
1. Go to https://upstash.com
2. Create free Redis database
3. Copy URL to `backend/.env.production` (REDIS_URL)

### Step 2: Generate Strong JWT Secret
```bash
openssl rand -base64 32
# Copy output to JWT_SECRET in backend/.env.production
```

### Step 3: Deploy Backend to Render.com
1. https://dashboard.render.com → New + → Web Service
2. Connect GitHub: `Liheng-Code/laborhub`
3. Configure:
   - **Name**: `laborhub-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add Environment Variables (from `backend/.env.production`)
5. Deploy → Get URL: `https://laborhub-backend.onrender.com`

### Step 4: Update Frontend & Redeploy on Vercel
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` = `https://laborhub-backend.onrender.com`
3. Redeploy

## 🧪 Testing Production
```bash
# Test backend health
curl https://laborhub-backend.onrender.com/health

# Test signup
curl -X POST https://laborhub-backend.onrender.com/tenants/signup \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Test","slug":"test","plan":"starter","adminEmail":"test@test.com","adminPassword":"pass123","adminFullName":"Test User"}'
```

## 📝 Git Commit & Push
```bash
cd "D:\Rocket Project\laborhub"
git add .
git commit -m "Production ready: Supabase + Render + Vercel config"
git push origin main
```

## 🔗 Links
- **GitHub**: https://github.com/Liheng-Code/laborhub
- **Supabase**: https://supabase.com/dashboard/project/wijpikhfiupzztqcxjes
- **Render**: https://dashboard.render.com
- **Vercel**: https://vercel.com/dashboard

## 📊 Project Structure
```
laborhub/
├── backend/
│   ├── src/
│   │   ├── index.ts (Fastify server)
│   │   ├── routes/ (API endpoints)
│   │   ├── services/ (business logic)
│   │   └── db/ (database config)
│   ├── .env (local config)
│   ├── .env.production (production config)
│   └── package.json
├── src/ (Next.js frontend)
│   ├── app/ (pages)
│   ├── components/
│   └── lib/api/client.ts (API client)
├── .env (frontend local)
├── .env.production (frontend production)
└── Documentation/*.md
```
