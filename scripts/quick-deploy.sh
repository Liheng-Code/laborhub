#!/bin/bash
# Quick deployment helper

echo "🚀 Quick Deploy to Production"
echo "================================="
echo ""
echo "This will:"
echo "  1. Check backend builds successfully"
echo "  2. Commit any pending changes"
echo "  3. Push to GitHub (triggers Render.com auto-deploy)"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 0
fi

# Check backend builds
echo "🔨 Testing backend build..."
cd backend && npm run build
if [ $? -ne 0 ]; then
  echo "❌ Backend build failed. Fix errors and try again."
  exit 1
fi
cd ..

# Git add, commit, push
echo "📦 Committing and pushing..."
git add .
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M')"
git push origin main

echo ""
echo "✅ Pushed to GitHub!"
echo ""
echo "Next:"
echo "  - Render.com should auto-deploy backend"
echo "  - Redeploy frontend on Vercel if needed"
