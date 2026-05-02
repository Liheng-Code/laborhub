#!/bin/bash
# Quick setup for local development

set -e

echo "🚀 Setting up LaborHub locally..."

# 1. Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# 2. Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# 3. Copy environment files if they don't exist
if [ ! -f .env ]; then
  echo "📝 Creating frontend .env from example..."
  cp .env.example .env 2>/dev/null || echo "No .env.example found"
fi

if [ ! -f backend/.env ]; then
  echo "📝 Creating backend .env from example..."
  cp backend/.env.example backend/.env
  echo "⚠️  Don't forget to update backend/.env with your Supabase credentials!"
fi

echo ""
echo "✅ Local setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update backend/.env with your Supabase credentials"
echo "  2. Run: npm run dev:backend (in one terminal)"
echo "  3. Run: npm run dev (in another terminal)"
echo "  4. Visit: http://localhost:4028"
