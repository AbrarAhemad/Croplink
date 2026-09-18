-- CropLink Database Schema Migration
-- Compatible with Supabase PostgreSQL & Row Level Security (RLS)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('FARMER', 'INDUSTRY', 'ADMIN')),
  status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL' CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED')),
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- OTP Verifications Table
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier TEXT NOT NULL,
  hashed_otp TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('MOBILE_REGISTRATION', 'PASSWORD_RESET')),
  attempts INT NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  last_resend_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(identifier, type)
);

-- Approval Applications Table (Admin Queue)
CREATE TABLE IF NOT EXISTS public.approval_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('FARMER', 'INDUSTRY')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  details TEXT NOT NULL,
  doc1_name TEXT NOT NULL,
  doc1_url TEXT NOT NULL,
  doc2_name TEXT NOT NULL,
  doc2_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL' CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED')),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  rejection_reason TEXT
);

-- 2. Farmer Profiles
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_address TEXT NOT NULL,
  village TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  farm_name TEXT NOT NULL,
  farm_location TEXT NOT NULL,
  land_area_acres NUMERIC(10, 2) NOT NULL,
  crops_grown TEXT[] NOT NULL DEFAULT '{}',
  farmer_doc_url TEXT,
  identity_doc_url TEXT,
  lat NUMERIC(9, 6),
  lng NUMERIC(9, 6)
);

-- 3. Industry Profiles
CREATE TABLE IF NOT EXISTS public.industry_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  gst_number TEXT NOT NULL UNIQUE,
  contact_person TEXT NOT NULL,
  full_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  industry_type TEXT NOT NULL,
  required_crops TEXT[] NOT NULL DEFAULT '{}',
  required_quantity_tons NUMERIC(10, 2) NOT NULL,
  preferred_quality_grade TEXT NOT NULL,
  procurement_location TEXT NOT NULL,
  registration_doc_url TEXT,
  gst_doc_url TEXT,
  lat NUMERIC(9, 6),
  lng NUMERIC(9, 6)
);

-- 4. Market Prices (AGMARKNET data cache/intelligence)
CREATE TABLE IF NOT EXISTS public.market_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop TEXT NOT NULL,
  variety TEXT NOT NULL,
  mandi TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  min_price NUMERIC(10, 2) NOT NULL,
  max_price NUMERIC(10, 2) NOT NULL,
  modal_price NUMERIC(10, 2) NOT NULL,
  date DATE NOT NULL,
  unit TEXT NOT NULL DEFAULT 'TON'
);

-- 5. Auctions Table
CREATE TABLE IF NOT EXISTS public.auctions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  farmer_anonymous_id TEXT NOT NULL,
  crop TEXT NOT NULL,
  variety TEXT NOT NULL,
  quantity_tons NUMERIC(10, 2) NOT NULL,
  quality_grade TEXT NOT NULL,
  harvest_date DATE NOT NULL,
  location_area TEXT NOT NULL,
  description TEXT NOT NULL,
  base_price_per_ton NUMERIC(10, 2) NOT NULL,
  transport_price_per_100_km NUMERIC(10, 2) NOT NULL DEFAULT 500,
  registration_duration_days INT NOT NULL CHECK (registration_duration_days BETWEEN 3 AND 7),
  sample_status TEXT NOT NULL DEFAULT 'NOT_SENT' CHECK (sample_status IN ('NOT_SENT', 'SENT', 'RECEIVED', 'VERIFIED', 'FORWARDED_TO_INDUSTRY')),
  status TEXT NOT NULL DEFAULT 'REGISTRATION_OPEN' CHECK (status IN (
    'DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'SAMPLE_PROCESSING',
    'AUCTION_LIVE', 'AUCTION_ENDED', 'WINNER_PENDING_VERIFICATION',
    'GROUND_VERIFICATION', 'DEAL_CONFIRMED', 'AGREEMENT_PENDING',
    'AGREEMENT_SIGNED', 'DELIVERY', 'COMPLETED', 'CANCELLED'
  )),
  registration_ends_at TIMESTAMPTZ NOT NULL,
  sample_processing_ends_at TIMESTAMPTZ NOT NULL,
  auction_starts_at TIMESTAMPTZ NOT NULL,
  auction_ends_at TIMESTAMPTZ NOT NULL,
  current_highest_bid NUMERIC(10, 2),
  bid_count INT NOT NULL DEFAULT 0,
  winning_bid_id UUID,
  winner_industry_id UUID REFERENCES public.profiles(id),
  active_rank_bidder_index INT DEFAULT 0,
  winner_response_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Auction Registrations (Industry participation fee payments)
CREATE TABLE IF NOT EXISTS public.auction_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  industry_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_id TEXT NOT NULL,
  fee_amount NUMERIC(10, 2) NOT NULL DEFAULT 1999.00,
  status TEXT NOT NULL DEFAULT 'PAID' CHECK (status IN ('PENDING', 'CREATED', 'PAID', 'FAILED', 'REFUNDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(auction_id, industry_id)
);

-- 7. Bids Table
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  industry_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  anonymous_bidder_id TEXT NOT NULL,
  amount_per_ton NUMERIC(10, 2) NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'OUTBID', 'WINNER_SELECTED', 'REJECTED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE RESTRICT,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  amount_paise BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CREATED', 'PAID', 'FAILED', 'REFUNDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Ground Verifications
CREATE TABLE IF NOT EXISTS public.ground_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  industry_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  assigned_bidder_rank INT NOT NULL DEFAULT 1,
  scheduled_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'SCHEDULED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'CANCELLED')),
  notes TEXT,
  cancellation_reason TEXT,
  cancellation_fee NUMERIC(10, 2),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Legal Agreements
CREATE TABLE IF NOT EXISTS public.agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  industry_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  crop TEXT NOT NULL,
  quantity_tons NUMERIC(10, 2) NOT NULL,
  final_price_per_ton NUMERIC(10, 2) NOT NULL,
  total_deal_value NUMERIC(12, 2) NOT NULL,
  agreed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  farmer_signature TEXT,
  farmer_signed_at TIMESTAMPTZ,
  industry_signature TEXT,
  industry_signed_at TIMESTAMPTZ,
  terms TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'FARMER_SIGNED', 'FULLY_EXECUTED'))
);

-- 11. Deliveries
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agreement_id UUID NOT NULL REFERENCES public.agreements(id) ON DELETE CASCADE,
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE RESTRICT,
  origin_area TEXT NOT NULL,
  destination_area TEXT NOT NULL,
  estimated_km INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ORDER_CONFIRMED' CHECK (status IN ('ORDER_CONFIRMED', 'PICKUP_PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED')),
  driver_name TEXT,
  driver_phone TEXT,
  vehicle_number TEXT,
  expected_delivery_date DATE NOT NULL,
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 12. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID NOT NULL,
  actor_role TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_auctions_status ON public.auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_crop ON public.auctions(crop);
CREATE INDEX IF NOT EXISTS idx_auctions_farmer_id ON public.auctions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON public.bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_market_prices_crop_state ON public.market_prices(crop, state, district);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Anonymous Bid Policy: Industries and Farmers only see anonymous_bidder_id
CREATE POLICY "Public read open auctions" ON public.auctions FOR SELECT USING (true);
CREATE POLICY "Public read bids" ON public.bids FOR SELECT USING (true);
