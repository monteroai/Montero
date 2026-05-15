-- Flip ai@montero.cool's portal_clients row to is_admin = true so the
-- admin-only UI (Sync from n8n button, etc) appears for the test login.
-- Safe to re-run.

update public.portal_clients
   set is_admin = true,
       updated_at = now()
 where user_id = (select id from auth.users where email = 'ai@montero.cool');

-- Show the result so we can confirm the flip
select id, user_id, owner_name, primary_email, email, is_admin, updated_at
  from public.portal_clients
 where user_id = (select id from auth.users where email = 'ai@montero.cool');
