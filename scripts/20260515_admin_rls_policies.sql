-- Admin select-all policies so users with portal_clients.is_admin = true can
-- view (and in some cases update) data across every client. Without these the
-- existing RLS scopes everyone to their own rows — including admins — so the
-- admin client picker would show only the admin's own businesses.
--
-- These policies are ADDITIVE: regular users still only see their own data
-- because the existing owner-scoped policies stay in place.

-- ============================================================================
-- portal_clients — admin can see every account
-- ============================================================================
drop policy if exists "admin_portal_clients_select_all" on public.portal_clients;
create policy "admin_portal_clients_select_all" on public.portal_clients
  for select using (
    exists (select 1 from public.portal_clients pc where pc.user_id = auth.uid() and pc.is_admin = true)
  );

-- ============================================================================
-- portal_businesses — admin can see + update every business
-- ============================================================================
drop policy if exists "admin_portal_businesses_select_all" on public.portal_businesses;
create policy "admin_portal_businesses_select_all" on public.portal_businesses
  for select using (
    exists (select 1 from public.portal_clients pc where pc.user_id = auth.uid() and pc.is_admin = true)
  );

drop policy if exists "admin_portal_businesses_update_all" on public.portal_businesses;
create policy "admin_portal_businesses_update_all" on public.portal_businesses
  for update using (
    exists (select 1 from public.portal_clients pc where pc.user_id = auth.uid() and pc.is_admin = true)
  );

-- ============================================================================
-- portal_automations — admin can see + update every automation
-- ============================================================================
drop policy if exists "admin_portal_automations_select_all" on public.portal_automations;
create policy "admin_portal_automations_select_all" on public.portal_automations
  for select using (
    exists (select 1 from public.portal_clients pc where pc.user_id = auth.uid() and pc.is_admin = true)
  );

drop policy if exists "admin_portal_automations_update_all" on public.portal_automations;
create policy "admin_portal_automations_update_all" on public.portal_automations
  for update using (
    exists (select 1 from public.portal_clients pc where pc.user_id = auth.uid() and pc.is_admin = true)
  );

-- ============================================================================
-- portal_interactions — admin can see all activity
-- ============================================================================
drop policy if exists "admin_portal_interactions_select_all" on public.portal_interactions;
create policy "admin_portal_interactions_select_all" on public.portal_interactions
  for select using (
    exists (select 1 from public.portal_clients pc where pc.user_id = auth.uid() and pc.is_admin = true)
  );

-- ============================================================================
-- portal_documents — admin can see all documents
-- ============================================================================
drop policy if exists "admin_portal_documents_select_all" on public.portal_documents;
create policy "admin_portal_documents_select_all" on public.portal_documents
  for select using (
    exists (select 1 from public.portal_clients pc where pc.user_id = auth.uid() and pc.is_admin = true)
  );

-- ============================================================================
-- client_secrets — admin can see METADATA (which clients have which integrations
-- configured) but NOT the plaintext (still gated by service-role RPC).
-- ============================================================================
drop policy if exists "admin_client_secrets_select_all" on public.client_secrets;
create policy "admin_client_secrets_select_all" on public.client_secrets
  for select using (
    exists (select 1 from public.portal_clients pc where pc.user_id = auth.uid() and pc.is_admin = true)
  );

-- ============================================================================
-- Verify
-- ============================================================================
select tablename, policyname, cmd
  from pg_policies
 where policyname like 'admin_%'
 order by tablename, policyname;
