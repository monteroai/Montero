-- ============================================
-- MONTERO CLIENT PORTAL — Supabase Tables
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Portal Clients
CREATE TABLE IF NOT EXISTS portal_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  industry TEXT,
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

CREATE POLICY "portal_clients_admin_select" ON portal_clients
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM portal_clients pc WHERE pc.user_id = auth.uid() AND pc.is_admin = true)
  );

-- 2. Portal Automations
CREATE TABLE IF NOT EXISTS portal_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
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

ALTER TABLE portal_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portal_automations_select_own" ON portal_automations
  FOR SELECT USING (
    client_id IN (SELECT id FROM portal_clients WHERE user_id = auth.uid())
  );

CREATE POLICY "portal_automations_update_own" ON portal_automations
  FOR UPDATE USING (
    client_id IN (SELECT id FROM portal_clients WHERE user_id = auth.uid())
  );

-- 3. Portal Interactions
CREATE TABLE IF NOT EXISTS portal_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('call','form','email','chat')),
  summary TEXT NOT NULL,
  detail TEXT,
  raw_data JSONB DEFAULT '{}',
  flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interactions_client_created
  ON portal_interactions(client_id, created_at DESC);

ALTER TABLE portal_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portal_interactions_select_own" ON portal_interactions
  FOR SELECT USING (
    client_id IN (SELECT id FROM portal_clients WHERE user_id = auth.uid())
  );

CREATE POLICY "portal_interactions_insert_service" ON portal_interactions
  FOR INSERT WITH CHECK (true);
  -- n8n webhooks insert via service role key, so allow all inserts
  -- RLS on SELECT still protects reads

-- 4. Portal Website Content
CREATE TABLE IF NOT EXISTS portal_website_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  is_live BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, section)
);

ALTER TABLE portal_website_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portal_website_content_select_own" ON portal_website_content
  FOR SELECT USING (
    client_id IN (SELECT id FROM portal_clients WHERE user_id = auth.uid())
  );

CREATE POLICY "portal_website_content_update_own" ON portal_website_content
  FOR UPDATE USING (
    client_id IN (SELECT id FROM portal_clients WHERE user_id = auth.uid())
  );

CREATE POLICY "portal_website_content_upsert_admin" ON portal_website_content
  FOR INSERT WITH CHECK (
    client_id IN (SELECT id FROM portal_clients WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM portal_clients WHERE user_id = auth.uid() AND is_admin = true)
  );

-- 5. Portal Change Requests
CREATE TABLE IF NOT EXISTS portal_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
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
    client_id IN (SELECT id FROM portal_clients WHERE user_id = auth.uid())
  );

CREATE POLICY "portal_change_requests_insert_own" ON portal_change_requests
  FOR INSERT WITH CHECK (
    client_id IN (SELECT id FROM portal_clients WHERE user_id = auth.uid())
  );

CREATE POLICY "portal_change_requests_update_admin" ON portal_change_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM portal_clients WHERE user_id = auth.uid() AND is_admin = true)
  );

-- 6. Portal Documents
CREATE TABLE IF NOT EXISTS portal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
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

-- 7. Storage bucket for uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('portal-uploads', 'portal-uploads', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "portal_uploads_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portal-uploads'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "portal_uploads_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'portal-uploads'
    AND auth.uid() IS NOT NULL
  );

-- ============================================
-- SEED DATA: Janeth (Smile Dental Temps)
-- ============================================
-- NOTE: Replace 'JANETH_USER_ID' below with her actual auth.users UUID
-- after you create her account in Supabase Auth.
--
-- To seed AFTER creating her account, run:
--
-- INSERT INTO portal_clients (user_id, business_name, owner_name, phone, email, industry, is_admin, onboarding_step, onboarding_complete)
-- VALUES ('JANETH_USER_ID', 'Smile Dental Temps LLC', 'Janeth', NULL, 'info@smiledentaltemps.com', 'dental-staffing', false, 1, false);
--
-- Then seed her automations:
--
-- WITH client AS (SELECT id FROM portal_clients WHERE email = 'info@smiledentaltemps.com' LIMIT 1)
-- INSERT INTO portal_automations (client_id, n8n_workflow_id, friendly_name, description, category, active, sort_order) VALUES
--   ((SELECT id FROM client), 'PIo3mYTZKOlJdXM4', 'AI Receptionist (Inbound Calls)', 'Answers all inbound calls via VAPI, collects caller info, routes to candidate or client intake.', 'calls', false, 1),
--   ((SELECT id FROM client), 'WF2', 'Follow-Up Scheduler', 'Schedules automatic follow-up calls and emails for new candidates and clients.', 'outreach', false, 2),
--   ((SELECT id FROM client), 'WF3', 'Email Unsubscribe Handler', 'Handles unsubscribe requests from reminder emails.', 'email', false, 3),
--   ((SELECT id FROM client), 'WF4', 'Candidate Application Intake', 'Receives website applications from dental professionals, creates profiles.', 'candidates', false, 4),
--   ((SELECT id FROM client), 'WF5', 'Client Practice Application', 'Receives applications from dental practices looking to hire.', 'clients', false, 5),
--   ((SELECT id FROM client), '3fe5HKWS2vWRisD0', 'Shift Reminder Calls (Outbound)', 'Automated outbound calls to remind professionals about upcoming shifts.', 'calls', false, 6),
--   ((SELECT id FROM client), 'WF7', 'Booking Handler', 'Manages shift bookings — confirms placements, updates availability.', 'bookings', false, 7),
--   ((SELECT id FROM client), 'WF8', 'Availability Checker', 'Checks dental professional availability when a practice requests coverage.', 'bookings', false, 8),
--   ((SELECT id FROM client), 'WF9', 'Approval Handler', 'Manages approval workflows for shift assignments.', 'bookings', false, 9),
--   ((SELECT id FROM client), 'WF10', 'Call Outcome Tracker', 'Logs call results — who picked up, interested, needs callback.', 'calls', false, 10),
--   ((SELECT id FROM client), 'WF11', 'Outbound Call Tools', 'Supporting tools for outbound calling.', 'calls', false, 11),
--   ((SELECT id FROM client), 'e90WJnsvQgAKVqN6', 'Database Sync', 'Syncs data between Airtable and portal every 4 hours.', 'sync', false, 12),
--   ((SELECT id FROM client), '7fWaVKEHxMXEWGj4', 'AI Chat Assistant', 'Powers the chat widget on your website — answers questions 24/7.', 'chat', false, 13);
--
-- For Emilio (admin), run:
-- INSERT INTO portal_clients (user_id, business_name, owner_name, email, is_admin, onboarding_complete)
-- VALUES ('EMILIO_USER_ID', 'Montero Industries', 'Emilio', 'emilio@montero.cool', true, true);
