#!/bin/bash
# Production Deployment Script
# Usage: ./deploy-prod.sh

set -e

echo "🚀 Starting Production Deployment..."

# 1. Check if logged in to GitHub
if ! gh auth status &>/dev/null; then
  echo "❌ Not logged in to GitHub CLI. Run: gh auth login"
  exit 1
fi

# 2. Commit and push changes
echo "📦 Committing and pushing to GitHub..."
git add .
git commit -m "Production ready: Supabase + Render + Vercel config"
git push origin main

echo "✓ Pushed to GitHub"

# 3. Instructions for Render.com
echo ""
echo "========================================="
echo "📌 NEXT: Deploy Backend to Render.com"
echo "========================================="
echo "1. Go to https://dashboard.render.com"
echo "2. New + → Web Service"
echo "3. Connect GitHub repo: Liheng-Code/laborhub"
echo "4. Settings:"
echo "   - Name: laborhub-backend"
echo "   - Root Directory: backend"
echo "   - Build: npm install && npm run build"
echo "   - Start: npm start"
echo "5. Add Environment Variables (copy from backend/.env.production)"
echo "6. Deploy!"
echo ""

# 4. Instructions for Vercel
echo "========================================="
echo "📌 THEN: Deploy Frontend to Vercel"
echo "========================================="
echo "1. Go to https://vercel.com/new"
echo "2. Import: Liheng-Code/laborhub"
echo "3. Configure:"
echo "   - Root Directory: laborhub (or /)"
echo "   - Framework: Next.js"
echo "4. Environment Variables:"
echo "   - NEXT_PUBLIC_API_URL: https://laborhub-backend.onrender.com"
echo "   - Copy others from .env.production"
echo "5. Deploy!"
echo ""

echo "✅ Deployment scripts complete!"
echo "📖 See PRODUCTION_SETUP.md for detailed guides"
