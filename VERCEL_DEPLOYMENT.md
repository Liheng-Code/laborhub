# Vercel Deployment Configuration
# Set these in Vercel Dashboard → Settings → Environment Variables

## Environment Variables (Production)

### Required
```
NEXT_PUBLIC_API_URL=https://laborhub-backend.onrender.com
NEXT_PUBLIC_SITE_URL=https://laborhub.vercel.app
```

### Supabase (Copy from existing .env)
```
NEXT_PUBLIC_SUPABASE_URL=https://wijpikhfiupzztqcxjes.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_uMWPMNQzv9WYkV14WvAICg_j8mA0zK-
```

### Optional
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=your-google-analytics-id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
```

## Build Settings
- **Framework Preset**: Next.js
- **Root Directory**: `laborhub` (or `/` if repo root)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

## Deployment Steps
1. Push to GitHub: `Liheng-Code/laborhub`
2. Import project in Vercel
3. Set root directory to `laborhub`
4. Add environment variables above
5. Deploy!

## Custom Domain (Optional)
- Vercel Dashboard → Domains → Add Domain
