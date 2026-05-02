# Production Configuration Guide

## Environment Files Structure

### 1. Backend Environments
- `.env` - Local development (already configured)
- `.env.production` - Production backend (Render.com)
- `.env.example` - Template for new developers

### 2. Frontend Environments  
- `.env.local` - Local development
- `.env.production` - Production frontend (Vercel)
- `.env.example` - Template

## Production URLs (After Deployment)
- Backend: https://laborhub-backend.onrender.com
- Frontend: https://laborhub.vercel.app
- Supabase: https://wijpikhfiupzztqcxjes.supabase.co

## Deployment Checklist
- [x] Supabase configured (wijpikhfiupzztqcxjes)
- [x] Data migrated to Supabase
- [ ] Backend deployed to Render.com
- [ ] Frontend deployed to Vercel
- [ ] Production env vars set
- [ ] End-to-end test on production URLs
