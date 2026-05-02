# Supabase Integration Setup Guide

## Overview
This guide walks you through setting up Supabase for LaborHub authentication. Follow these steps to configure your Supabase project and database.

## Step 1: Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and log in to your project
2. Navigate to **Project Settings** > **API**
3. Copy your **Project URL** (e.g., `https://your-project.supabase.co`)
4. Copy your **anon (public) key** - This is the public key, NOT the service role key
5. Update your `.env` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
6. Restart your development server: `npm run dev`

## Step 2: Create Database Tables

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the SQL below:

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  user_type TEXT CHECK (user_type IN ('admin', 'worker')),
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Anyone can insert profile on signup
CREATE POLICY "Anyone can insert profile on signup"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Optional: Admin policy - admins can read workers in their company
-- This requires additional company management logic
```

4. Click **Run**
5. Verify the table is created by going to **Table Editor** > **user_profiles**

## Step 3: Configure Email Templates

1. In Supabase, go to **Authentication** > **Email Templates**
2. Review the default email templates for:
   - Confirmation email (if using email verification)
   - Password reset email
   - Magic link email
3. Customize if desired (optional)

## Step 4: Test the Setup

### Test 1: Sign Up
1. Go to `http://localhost:4028/auth/signup`
2. Select "Company Admin"
3. Fill in:
   - Full name: `Test Admin`
   - Email: `admin@test.com`
   - Password: `TestPassword123!`
   - Company name: `Test Company`
4. Click **Create account**
5. Expected: Redirects to `/attendance-monitoring` and user is logged in

### Test 2: Verify Database Entry
1. Go to Supabase > **Table Editor** > **user_profiles**
2. Should see a row with:
   - email: `admin@test.com`
   - full_name: `Test Admin`
   - user_type: `admin`
   - company_name: `Test Company`

### Test 3: Sign In
1. Go to `http://localhost:4028/auth/signin`
2. Enter email: `admin@test.com`
3. Enter password: `TestPassword123!`
4. Click **Sign in**
5. Expected: Redirects to `/attendance-monitoring` and user is logged in

### Test 4: Password Reset
1. Go to `http://localhost:4028/auth/signin`
2. Click **Forgot password?**
3. Enter email: `admin@test.com`
4. Click **Send reset link**
5. Check your email (or Supabase email logs)
6. Click the reset link in the email
7. Enter new password and confirm
8. Expected: Redirects to signin and can login with new password

### Test 5: Worker Sign Up (No Company Name)
1. Go to `http://localhost:4028/auth/signup`
2. Select "Worker"
3. Fill in:
   - Full name: `Test Worker`
   - Email: `worker@test.com`
   - Password: `WorkerPass123!`
   - Note: Company name field should NOT appear
4. Click **Create account**
5. Go to Supabase > **Table Editor** > **user_profiles**
6. Verify new row has:
   - user_type: `worker`
   - company_name: NULL (empty)

## Step 5: Security Configuration

### Enable Email Confirmation (Optional)
1. Go to Supabase > **Authentication** > **Providers** > **Email**
2. Enable **Confirm email** if you want email verification
3. Note: Current implementation skips email verification for immediate signin

### Set Authentication Rules
1. Go to **Authentication** > **Policies**
2. Configure password requirements:
   - Minimum length: 8 characters
   - Require uppercase, numbers, special characters (optional)

## Step 6: Deploy to Production

### Before Deploying:
1. Create a separate Supabase project for production
2. Run the same database setup SQL on production
3. Update production `.env` with production Supabase credentials
4. Test everything on production database

### Environment Variables:
- Keep `.env` and `.env.local` in `.gitignore`
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your hosting platform's environment variables
- Netlify: **Build & deploy** > **Environment**
- Vercel: **Settings** > **Environment variables**

## Troubleshooting

### Issue: "Can't resolve '@supabase/supabase-js'"
**Solution**: Run `npm install @supabase/supabase-js`

### Issue: Credentials not loading
**Solution**: 
1. Delete `.next` folder: `rm -rf .next`
2. Restart dev server: `npm run dev`
3. Ensure `.env` file is in project root (not in `src/`)

### Issue: Sign up fails with "User already exists"
**Solution**: Email already registered. Use a different email or go to Supabase > **Authentication** > **Users** to delete the test user.

### Issue: Password reset email not received
**Solution**:
1. Check spam folder
2. Go to Supabase > **Logs** to see email logs
3. Verify email templates are configured
4. Check SMTP settings if using custom email provider

### Issue: "RLS violation" errors
**Solution**: Ensure RLS policies are created correctly. Go to Supabase > **Authentication** > **Policies** and verify policies exist for `user_profiles` table.

## Database Schema Reference

### user_profiles Table
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key, references auth.users(id) |
| email | TEXT | Unique, indexed for fast lookup |
| full_name | TEXT | User's full name |
| user_type | TEXT | 'admin' or 'worker' |
| company_name | TEXT | Nullable, only for admins |
| created_at | TIMESTAMP | Auto-set on creation |
| updated_at | TIMESTAMP | Auto-set on creation/update |

## Next Steps

1. Set up Email Service (optional)
   - Configure SMTP for custom email domain
   - Customize email templates

2. Add Admin Dashboard
   - View all users in company
   - Manage worker accounts
   - Update company settings

3. Implement Additional Security
   - Two-factor authentication
   - Session management
   - Audit logging

4. Performance Optimization
   - Add database indexes
   - Implement caching
   - Optimize queries

## Support

- Supabase Docs: https://supabase.com/docs
- LaborHub Documentation: See `README.md` in project root
- Report issues: Create an issue on GitHub

---
Last Updated: May 1, 2026
