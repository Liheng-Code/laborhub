#!/bin/bash
# Start full development environment

echo "🚀 Starting LaborHub Development Environment"
echo "================================="

# Check if backend .env exists
if [ ! -f backend/.env ]; then
  echo "❌ backend/.env not found!"
  echo "Creating from example..."
  cp backend/.env.example backend/.env
  echo "⚠️  Please update backend/.env with your credentials"
fi

# Start backend in background
echo "📦 Starting backend (Fastify) on port 3001..."
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳  Waiting for backend to start..."
sleep 5

# Check if backend is running
if curl -s http://localhost:3001/health > /dev/null; then
  echo "✅ Backend running on http://localhost:3001"
else
  echo "❌ Backend failed to start. Check logs/backend.log"
  exit 1
fi

# Start ngrok in background (if available)
if command -v ngrok &> /dev/null; then
  echo "📦 Starting ngrok tunnel..."
  cd backend && ngrok http 3001 > ../logs/ngrok.log 2>&1 &
  cd ..
  sleep 3
  echo "✅ Ngrok tunnel active (check logs/ngrok.log for URL)"
fi

# Start frontend
echo "📦 Starting frontend (Next.js) on port 4028..."
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT
