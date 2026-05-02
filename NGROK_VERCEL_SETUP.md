# Quick Start for Vercel + Ngrok Testing

## Step 1: Start Backend
```bash
cd "D:\Rocket Project\laborhub\backend"
npm run dev
```

## Step 2: Expose with Ngrok (New Terminal)
```bash
cd "D:\Rocket Project\laborhub\backend"
node expose-ngrok.js
```

This will show you a URL like: `https://abc123.ngrok.io`

## Step 3: Update Frontend .env
Edit `D:\Rocket Project\laborhub\.env`:
```
NEXT_PUBLIC_API_URL=https://abc123.ngrok.io  # Replace with ngrok URL
```

## Step 4: Redeploy to Vercel
- Go to Vercel Dashboard
- Set Environment Variable: `NEXT_PUBLIC_API_URL` = ngrok URL
- Redeploy

## Step 5: Test
- Visit your Vercel URL
- Try signing up - it will call ngrok → your local backend → Supabase

## Notes
- Ngrok URL changes each time (unless you have paid plan)
- Free ngrok sessions last 2 hours
- For production, deploy backend to Render.com instead
