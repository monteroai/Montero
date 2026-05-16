-- Add the INSERT policies that should have been part of the foundation migration.
-- Without these, brand-new signups can't auto-create their portal_clients row
-- on first "Add a business" → blocked by RLS as "new row violates row-level
-- security policy for table 'portal_clients'".

-- portal_clients: a user can insert a row tagged with their own user_id
drop policy if exists "own_portal_clients_insert" on public.portal_clients;
create policy "own_portal_clients_insert" on public.portal_clients
  for insert with check (user_id = auth.uid());

-- profiles: same idea — a user can insert their own profile row
drop policy if exists "own_profile_insert" on public.profiles;
create policy "own_profile_insert" on public.profiles
  for insert with check (id = auth.uid());

-- Sanity verify: list policies on portal_clients so we can confirm the new one landed
select schemaname, tablename, policyname, cmd
  from pg_policies
 where tablename in ('portal_clients', 'profiles')
 order by tablename, policyname;
