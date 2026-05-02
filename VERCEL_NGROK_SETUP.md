# Vercel + Ngrok Setup Complete

## Status: ✓ WORKING

### 1. Backend Running Locally
- Server: `localhost:3001`
- Exposed via ngrok: `https://mai-multimacular-leontine.ngrok-free.dev`

### 2. Frontend Configuration
File: `D:\Rocket Project\laborhub\.env`
```
NEXT_PUBLIC_API_URL=https://mai-multimacular-leontine.ngrok-free.dev
```

### 3. Update Vercel Environment Variable
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your `laborhub` project
3. Settings → Environment Variables
4. Add/Update:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://mai-multimacular-leontine.ngrok-free.dev`
5. Redeploy: Deployments → Redeploy

### 4. Test Signup on Vercel
Visit: `https://laborhub-one.vercel.app/auth/signup`

## Important Notes:
- **Ngrok URL changes every time you restart** (free plan)
- When you restart ngrok, update both:
  1. `laborhub\.env` (NEXT_PUBLIC_API_URL)
  2. Vercel Environment Variable
- **Free ngrok sessions last 2 hours**

## For Production (Persistent Backend):
Deploy backend to **Render.com** (free tier):
1. Push code to GitHub (already done)
2. Create Render account → New Web Service
3. Connect GitHub repo: `Liheng-Code/laborhub`
4. Set environment variables (see `SUPABASE_MIGRATION.md`)
5. Get permanent URL like `https://laborhub-backend.onrender.com`
6. Update Vercel `NEXT_PUBLIC_API_URL` to this permanent URL
