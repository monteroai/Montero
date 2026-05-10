-- ============================================================================
-- MONTERO CLIENT PORTAL — Supabase Schema (multi-business architecture)
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dmbikadnhdrambfbttnk/sql/new
-- ============================================================================
-- Architecture:
--   portal_clients      = the account owner (one per auth.users)
--   portal_businesses   = each business under an account (one client → many businesses)
--   portal_automations  = scoped to a business
--   portal_interactions = scoped to a business
--   portal_website_*    = scoped to a business
--   portal_documents    = scoped to the client account (contracts, invoices)
-- ============================================================================

-- 1. PORTAL CLIENTS — the account / signed-in user
CREATE TABLE IF NOT EXISTS portal_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  primary_email TEXT,
  primary_phone TEXT,
  is_admin BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 1,
  onboarding_complete BOOLEAN DEFAULT false,
  onboarding_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE portal_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portal_clients_select_own" ON portal_clients
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "portal_clients_update_own" ON portal_clients
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "portal_clients_insert_own" ON portal_clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "portal_clients_admin_select_all" ON portal_clients
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM portal_clients pc WHERE pc.user_id = auth.uid() AND pc.is_admin = true)
  );

-- 2. PORTAL BUSINESSES — multiple per account
CREATE TABLE IF NOT EXISTS portal_businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  industry TEXT,
  business_phone TEXT,
  business_email TEXT,
  website_url TEXT,
  brand_colors JSONB DEFAULT '{}',
  brand_logo_url TEXT,
  brand_extracted JSONB DEFAULT '{}',
  description TEXT,
  is_archived BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_businesses_client ON portal_businesses(client_id, sort_order);

ALTER TABLE portal_businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portal_businesses_select_own" ON portal_businesses
  FOR SELECT USING (
    client_id IN (SELECT id FROM portal_clients WHERE user_id = auth.uid())
  );
CREATE POLICY "portal_businesses_insert_own" ON portal_businesses
  FOR INSERT WITH CHECK (
    client_id IN (SELECT id FROM portal_clients WHERE user_id = auth.uid())
  );
CREATE POLICY "portal_businesses_update_own" ON portal_businesses
  FOR UPDATE USING (
    client_id IN (SELECT id FROM portal_clients WHERE user_id = auth.uid())
  );
CREATE POLICY "portal_businesses_delete_own" ON portal_businesses
  FOR DELETE USING (
    client_id IN (SELECT id FROM portal_clients WHERE user_id = auth.uid())
  );
CREATE POLICY "portal_businesses_admin_select_all" ON portal_businesses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM portal_clients WHERE user_id = auth.uid() AND is_admin = true)
  );

-- 3. PORTAL AUTOMATIONS — scoped to a business
CREATE TABLE IF NOT EXISTS portal_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES portal_businesses(id) ON DELETE CASCADE,
  n8n_workflow_id TEXT NOT NULL,
  friendly_name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  active BOOLEAN DEFAULT false,
  last_run TIMESTAMPTZ,
  last_status TEXT DEFAULT 'idle',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automations_business ON portal_automations(business_id, sort_order);

ALTER TABLE portal_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portal_automations_select_own" ON portal_automations
  FOR SELECT USING (
    business_id IN (
      SELECT b.id FROM portal_businesses b
      JOIN portal_clients c ON c.id = b.client_id
      WHERE c.user_id = auth.uid()
    )
  );
CREATE POLICY "portal_automations_update_own" ON portal_automations
  FOR UPDATE USING (
    business_id IN (
      SELECT b.id FROM portal_businesses b
      JOIN portal_clients c ON c.id = b.client_id
      WHERE c.user_id = auth.uid()
    )
  );

-- 4. PORTAL INTERACTIONS — calls, forms, emails, chats per business
CREATE TABLE IF NOT EXISTS portal_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES portal_businesses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('call','form','email','chat')),
  summary TEXT NOT NULL,
  detail TEXT,
  raw_data JSONB DEFAULT '{}',
  flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interactions_business_created
  ON portal_interactions(business_id, created_at DESC);

ALTER TABLE portal_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portal_interactions_select_own" ON portal_interactions
  FOR SELECT USING (
    business_id IN (
      SELECT b.id FROM portal_businesses b
      JOIN portal_clients c ON c.id = b.client_id
      WHERE c.user_id = auth.uid()
    )
  );
CREATE POLICY "portal_interactions_insert_service" ON portal_interactions
  FOR INSERT WITH CHECK (true);
  -- n8n + VAPI webhooks insert via service role key

-- 5. PORTAL WEBSITE CONTENT — per business website sections
CREATE TABLE IF NOT EXISTS portal_website_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES portal_businesses(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  is_live BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, section)
);

ALTER TABLE portal_website_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portal_website_content_select_own" ON portal_website_content
  FOR SELECT USING (
    business_id IN (
      SELECT b.id FROM portal_businesses b
      JOIN portal_clients c ON c.id = b.client_id
      WHERE c.user_id = auth.uid()
    )
  );
CREATE POLICY "portal_website_content_update_own" ON portal_website_content
  FOR UPDATE USING (
    business_id IN (
      SELECT b.id FROM portal_businesses b
      JOIN portal_clients c ON c.id = b.client_id
      WHERE c.user_id = auth.uid()
    )
  );
CREATE POLICY "portal_website_content_insert_own" ON portal_website_content
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT b.id FROM portal_businesses b
      JOIN portal_clients c ON c.id = b.client_id
      WHERE c.user_id = auth.uid()
    )
  );

-- 6. PORTAL CHANGE REQUESTS — per business website edit approvals
CREATE TABLE IF NOT EXISTS portal_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES portal_businesses(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  old_content JSONB,
  new_content JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  requested_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewer_note TEXT
);

ALTER TABLE portal_change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portal_change_requests_select_own" ON portal_change_requests
  FOR SELECT USING (
    business_id IN (
      SELECT b.id FROM portal_businesses b
      JOIN portal_clients c ON c.id = b.client_id
      WHERE c.user_id = auth.uid()
    )
  );
CREATE POLICY "portal_change_requests_insert_own" ON portal_change_requests
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT b.id FROM portal_businesses b
      JOIN portal_clients c ON c.id = b.client_id
      WHERE c.user_id = auth.uid()
    )
  );
CREATE POLICY "portal_change_requests_update_admin" ON portal_change_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM portal_clients WHERE user_id = auth.uid() AND is_admin = true)
  );

-- 7. PORTAL DOCUMENTS — account-level (contracts, invoices per the WHOLE account, not per business)
CREATE TABLE IF NOT EXISTS portal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  business_id UUID REFERENCES portal_businesses(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('contract','invoice','onboarding','upload','automation-guide')),
  title TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  status TEXT DEFAULT 'active',
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE portal_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portal_documents_select_own" ON portal_documents
  FOR SELECT USING (
    client_id IN (SELECT id FROM portal_clients WHERE user_id = auth.uid())
  );
CREATE POLICY "portal_documents_insert_own" ON portal_documents
  FOR INSERT WITH CHECK (
    client_id IN (SELECT id FROM portal_clients WHERE user_id = auth.uid())
  );

-- 8. STORAGE BUCKETS — for logo uploads, document uploads, etc
INSERT INTO storage.buckets (id, name, public)
VALUES ('portal-uploads', 'portal-uploads', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('portal-logos', 'portal-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "portal_uploads_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('portal-uploads','portal-logos')
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "portal_uploads_select" ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('portal-uploads','portal-logos')
    AND (auth.uid() IS NOT NULL OR bucket_id = 'portal-logos')
  );

-- ============================================================================
-- DONE — schema is multi-business and white-label ready.
--
-- After your account is created via /signup, run this to make yourself admin:
--   UPDATE portal_clients
--   SET is_admin = true
--   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE');
-- ============================================================================
