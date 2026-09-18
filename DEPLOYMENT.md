# CropLink — Vercel Production Deployment Guide

This guide provides concise, step-by-step instructions to deploy CropLink to **Vercel** with Supabase database persistence, Razorpay payment processing, and production OTP verification.

---

## 1. Prerequisites & GitHub Setup

1. Initialize Git repository and commit changes:
   ```bash
   git add .
   git commit -m "Prepare CropLink for Vercel deployment"
   ```
2. Push your repository to GitHub / GitLab / Bitbucket.

---

## 2. Vercel Project Import & Build Settings

1. Log in to [Vercel Dashboard](https://vercel.com) and click **Add New > Project**.
2. Import your CropLink GitHub repository.
3. Keep default build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

---

## 3. Required Environment Variables

Configure the following Environment Variables under **Vercel Project Settings > Environment Variables**:

| Variable Name | Description | Client/Server Scope |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Application canonical URL (e.g. `https://croplink.vercel.app`) | Client & Server |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | Client & Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Public Key | Client & Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (Secret) | **Server-Only** |
| `DATABASE_URL` | PostgreSQL connection string | **Server-Only** |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Key ID (Test or Live) | Client & Server |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | **Server-Only** |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Webhook Secret | **Server-Only** |
| `OTP_DEMO_MODE` | Set to `false` in production for real SMS OTP delivery | **Server-Only** |
| `OTP_PROVIDER` | SMS Provider (`TWILIO`, `MSG91`, or `FAST2SMS`) | **Server-Only** |
| `OTP_API_KEY` | SMS Provider API Key | **Server-Only** |
| `OTP_API_SECRET` | SMS Provider API Secret | **Server-Only** |
| `OTP_SENDER_ID` | SMS Sender Header (e.g. `CROPLK`) | **Server-Only** |

> [!WARNING]
> Never prefix secret keys (`RAZORPAY_KEY_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) with `NEXT_PUBLIC_`.

---

## 4. Database Setup & Migrations

Execute the SQL database schema migration in your Supabase SQL Editor:
- Migration File: [`supabase/migrations/20260918000000_init_croplink.sql`](file:///d:/croplink/supabase/migrations/20260918000000_init_croplink.sql)

This provisions:
- `profiles` table with unique normalized `mobile` and `email`
- `farmer_profiles` and `industry_profiles` tables
- `approval_applications` table for the Admin Approval Queue
- `auctions`, `bids`, `payments`, `agreements`, `deliveries`, and `audit_logs` tables

---

## 5. Verification & Final Checklist

After Vercel deployment completes:

1. **Farmer Registration**: Open `/register/farmer` -> verify inputs start completely blank -> complete mobile OTP (`123456` in demo or real SMS) -> submit registration.
2. **Industry Registration**: Open `/register/industry` -> verify blank inputs -> submit registration.
3. **Admin Approval Queue**: Navigate to `/admin/approvals` -> verify new applicant appears with real contact details & uploaded document links -> click **Approve User**.
4. **Razorpay Bidding Fee**: Log in as Industry user -> click **Register & Pay ₹1,999** on an auction -> verify test Razorpay checkout modal opens and server verifies payment signature.
5. **Forgot Password**: Click `Forgot password?` on `/login` -> enter registered Gmail -> verify 6-digit reset OTP -> set new password -> sign in.
6. **Dynamic Routing**: Refresh `/farmer/dashboard`, `/industry/dashboard`, `/admin/approvals` directly in browser -> verify zero 404 routing errors.
