-- 20260515_fix_missing_columns.sql
-- Surgical fix — adds the columns the Next.js app already queries but the
-- live DB is missing. All additive, idempotent, no destructive operations.
-- Run after scripts/portal-tables.sql + the actualwebsite portal_foundation
-- migration from 2026-05-15.

-- ============================================================================
-- 1. portal_clients — Next.js expects primary_phone
-- ============================================================================
alter table public.portal_clients
  add column if not exists primary_phone text;

-- ============================================================================
-- 2. portal_businesses — Next.js form sends business_phone, business_email,
--    brand_extracted; none exist on live table
-- ============================================================================
alter table public.portal_businesses
  add column if not exists business_phone text,
  add column if not exists business_email text,
  add column if not exists brand_extracted jsonb default '{}'::jsonb;

-- ============================================================================
-- 3. portal_interactions — Next.js activity route filters .eq('business_id', X)
-- ============================================================================
alter table public.portal_interactions
  add column if not exists business_id uuid references public.portal_businesses(id) on delete cascade;
create index if not exists idx_portal_interactions_business
  on public.portal_interactions(business_id, created_at desc);

-- ============================================================================
-- 4. portal_documents — Next.js documents route filters .eq('business_id', X)
-- ============================================================================
alter table public.portal_documents
  add column if not exists business_id uuid references public.portal_businesses(id) on delete set null;
create index if not exists idx_portal_documents_business
  on public.portal_documents(business_id);

-- ============================================================================
-- 4a. portal_change_requests — canonical schema scopes change requests to a business
-- ============================================================================
alter table public.portal_change_requests
  add column if not exists business_id uuid references public.portal_businesses(id) on delete cascade;
create index if not exists idx_portal_change_requests_business
  on public.portal_change_requests(business_id);

-- ============================================================================
-- 4b. portal_website_content — canonical schema scopes website content to a business
-- ============================================================================
alter table public.portal_website_content
  add column if not exists business_id uuid references public.portal_businesses(id) on delete cascade;
create index if not exists idx_portal_website_content_business
  on public.portal_website_content(business_id);

-- ============================================================================
-- 5. Backfill portal_automations.business_id from the existing client_id mapping
-- ============================================================================
-- For now: 1 client → 1 business. Map every automation to that business.
update public.portal_automations a
  set business_id = b.id
  from public.portal_businesses b
  where a.business_id is null
    and a.client_id = b.client_id;

-- ============================================================================
-- 6. RLS — match the canonical scripts/portal-tables.sql expectations for the
--    tables we just touched. Idempotent (drop policy if exists + recreate).
-- ============================================================================
alter table public.portal_interactions    enable row level security;
alter table public.portal_documents       enable row level security;
alter table public.portal_website_content enable row level security;
alter table public.portal_change_requests enable row level security;

drop policy if exists "portal_interactions_select_own" on public.portal_interactions;
create policy "portal_interactions_select_own" on public.portal_interactions
  for select using (
    business_id in (
      select b.id from public.portal_businesses b
      join public.portal_clients c on c.id = b.client_id
      where c.user_id = auth.uid()
    )
  );

drop policy if exists "portal_interactions_insert_service" on public.portal_interactions;
create policy "portal_interactions_insert_service" on public.portal_interactions
  for insert with check (true);  -- n8n + VAPI webhooks (service role)

drop policy if exists "portal_documents_select_own" on public.portal_documents;
create policy "portal_documents_select_own" on public.portal_documents
  for select using (
    client_id in (select id from public.portal_clients where user_id = auth.uid())
  );

drop policy if exists "portal_documents_insert_own" on public.portal_documents;
create policy "portal_documents_insert_own" on public.portal_documents
  for insert with check (
    client_id in (select id from public.portal_clients where user_id = auth.uid())
  );

drop policy if exists "portal_website_content_select_own" on public.portal_website_content;
create policy "portal_website_content_select_own" on public.portal_website_content
  for select using (
    business_id in (
      select b.id from public.portal_businesses b
      join public.portal_clients c on c.id = b.client_id
      where c.user_id = auth.uid()
    )
  );

drop policy if exists "portal_change_requests_select_own" on public.portal_change_requests;
create policy "portal_change_requests_select_own" on public.portal_change_requests
  for select using (
    business_id in (
      select b.id from public.portal_businesses b
      join public.portal_clients c on c.id = b.client_id
      where c.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Done. After this runs, refresh montero.cool/portal/businesses and the
-- "Application error" should be gone — the activity and documents fetches
-- will return empty arrays instead of 500-ing.
-- ============================================================================
