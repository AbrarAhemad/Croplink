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

Configure Environment Variables under **Vercel Project Settings > Environment Variables**:

### Demo Mode Configuration (Default)
| Variable Name | Value | Scope | Description |
| :--- | :--- | :--- | :--- |
| `OTP_MODE` | `demo` | **Server-Only** | Configures honest Demo OTP verification mode |
| `DEMO_OTP_CODE` | `123456` | **Server-Only** | Server-side verification code for demo mode |

### Real SMS Mode Configuration (Production Switch)
To switch to real SMS delivery, set the following environment variables in Vercel:
| Variable Name | Example Value | Scope | Description |
| :--- | :--- | :--- | :--- |
| `OTP_MODE` | `sms` | **Server-Only** | Enables real SMS delivery via provider |
| `OTP_PROVIDER` | `TWILIO` / `MSG91` / `FAST2SMS` | **Server-Only** | Configured SMS gateway provider |
| `OTP_API_KEY` | `your_sms_api_key` | **Server-Only** | SMS provider API key credential |
| `OTP_API_SECRET` | `your_sms_api_secret` | **Server-Only** | SMS provider API secret credential |
| `OTP_SENDER_ID` | `CROPLK` | **Server-Only** | Header/sender ID for SMS gateway |

> [!IMPORTANT]
> If `OTP_MODE=sms` is set and required provider credentials (`OTP_API_KEY`) are missing, the server will explicitly fail with a status 500 configuration error. It will **never** silently fall back to demo mode.

### Database & Payment Integration Variables
| Variable Name | Description | Client/Server Scope |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Application canonical URL (e.g. `https://croplink.vercel.app`) | Client & Server |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | Client & Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Public Key | Client & Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (Secret) | **Server-Only** |
| `DATABASE_URL` | PostgreSQL connection string | **Server-Only** |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Key ID (Test or Live) | Client & Server |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | **Server-Only** |

> [!WARNING]
> Never prefix secret keys (`RAZORPAY_KEY_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `OTP_API_KEY`) with `NEXT_PUBLIC_`.

---

## 4. Database Setup & Migrations

Execute the SQL database schema migration in your Supabase SQL Editor:
- Migration File: [`supabase/migrations/20260918000000_init_croplink.sql`](file:///d:/croplink/supabase/migrations/20260918000000_init_croplink.sql)

This provisions:
- `profiles` table with unique normalized `mobile` and `email`
- `farmer_profiles` and `industry_profiles` tables
- `otp_verifications` table for Vercel serverless OTP session persistence
- `approval_applications` table for the Admin Approval Queue
- `auctions`, `bids`, `payments`, `agreements`, `deliveries`, and `audit_logs` tables

---

## 5. Verification & Final Checklist

After Vercel deployment completes:

1. **Farmer Registration**: Open `/register/farmer` -> enter mobile number -> click **Send OTP** -> verify UI shows *"Demo OTP ready"*, *"Demo verification code: 123456"*, and *"Demo mode — no SMS is sent."* -> enter `123456` -> submit registration.
2. **Industry Registration**: Open `/register/industry` -> complete same Demo OTP verification -> submit registration.
3. **Admin Approval Queue**: Navigate to `/admin/approvals` -> verify new applicant appears -> click **Approve User**.
4. **Razorpay Bidding Fee**: Log in as Industry user -> click **Register & Pay ₹1,999** on an auction -> verify Razorpay checkout modal opens.
5. **Forgot Password**: Click `Forgot password?` on `/login` -> enter registered Gmail -> verify 6-digit reset OTP -> set new password -> sign in.
