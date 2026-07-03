-- Phase 1 seed for Janeth's showcase.
-- Paste this into the Supabase SQL editor for project lfaqxsuscjtabsvrhlrd.
-- Safe to re-run: every statement is idempotent.

-- =====================================================
-- 1) Mark Janeth's account onboarding complete so the
--    dashboard renders clean instead of nudging her into
--    /portal/businesses/new (she already added all three).
-- =====================================================
update public.portal_clients
set onboarding_complete = true,
    onboarding_step     = 5,
    updated_at          = now()
where user_id = '9d0d8e23-1a93-4f46-a582-926329be4d5c';

-- =====================================================
-- 2) Point Smile Management & Consulting at the live
--    Netlify site so the portal shows a real website.
-- =====================================================
update public.portal_businesses
set website_url = 'https://smileconsultingplaceholder.netlify.app',
    updated_at  = now()
where id = 'a0bbeee7-0837-41bf-83b2-2dbe51e92f4d';

-- =====================================================
-- 3) Seed portal_website_content for the consulting
--    business so /portal/website shows real, editable
--    copy pulled from the live site.
-- =====================================================
insert into public.portal_website_content (business_id, section, content, is_live)
values
  ('a0bbeee7-0837-41bf-83b2-2dbe51e92f4d', 'hero',
   jsonb_build_object('text',
     E'The quiet work of building a practice worth running.\n\nOwners hire us when the chair is full but the office isn''t calm — when growth stops feeling like progress and starts feeling like noise. We rebuild the operations, the team, and the brand underneath, so the practice runs the way it was always supposed to.'
   ), true),

  ('a0bbeee7-0837-41bf-83b2-2dbe51e92f4d', 'about',
   jsonb_build_object('text',
     E'Built by an operator who has done the work.\n\nSmile Management & Consulting Solutions was founded by Janeth Osinowo — an oral healthcare provider and the founder of two sister companies in the dental space.\n\nJaneth runs Smile Family Dental, a thriving New Jersey practice. She runs Smile Dental Temps, a staffing agency that places clinicians into hundreds of chairs a year. She has lived every problem the consulting firm now solves — and that lived experience is the entire point.'
   ), true),

  ('a0bbeee7-0837-41bf-83b2-2dbe51e92f4d', 'services',
   jsonb_build_object('text',
     E'Four levers we pull until the practice runs quieter.\n\n01 / Practice Management — Systems, schedules, and workflows engineered to compound.\n02 / Staffing & Team Solutions — Same-week temp coverage and long-term bench-building.\n03 / Startup Consulting — For owners opening their first office or their next one.\n04 / Branding & Patient Experience — Practices grow on referrals, but referrals follow how the patient felt.'
   ), true),

  ('a0bbeee7-0837-41bf-83b2-2dbe51e92f4d', 'testimonials',
   jsonb_build_object('text',
     E'"The first ninety days felt less like consulting and more like having a partner who happened to have already solved every problem we were about to hit. The schedule was the first thing to change. The team was the second. The numbers followed."\n— Practice Owner, New Jersey'
   ), true),

  ('a0bbeee7-0837-41bf-83b2-2dbe51e92f4d', 'contact',
   jsonb_build_object('text',
     E'Let''s see if we''re the right fit.\n\nMost engagements begin with a free 30-minute call. Tell us what''s pressing in the practice right now — we''ll tell you, honestly, whether this is something we can help with.\n\nEmail: smilemanagementconsultings@gmail.com\nPhone: (908) 487-8669\nHours: Mon–Fri · 9am–6pm ET'
   ), true),

  ('a0bbeee7-0837-41bf-83b2-2dbe51e92f4d', 'footer',
   jsonb_build_object('text',
     E'© 2026 Smile Management & Consulting Solutions LLC. All Rights Reserved.'
   ), true)
on conflict do nothing;

-- =====================================================
-- 4) Display-only automation row so /portal/automations
--    shows "Lead Triage" as active for the consulting
--    business. The actual logic lives in the Next.js
--    route /api/leads/intake — this row is just the
--    user-facing surface.
-- =====================================================
insert into public.portal_automations (
  client_id, business_id, n8n_workflow_id, friendly_name, description,
  category, active, last_status, sort_order
)
values (
  'a046a033-a3bc-4d13-a4a1-30c0d5182d46',
  'a0bbeee7-0837-41bf-83b2-2dbe51e92f4d',
  'lead-triage-consulting-v1',
  'Lead Triage — Smile Consulting',
  'New form submissions on the consulting site land here. Janeth gets an instant SMS, the lead is logged under Activity, and the lead receives an auto-reply.',
  'outreach',
  true,
  'idle',
  0
)
on conflict (n8n_workflow_id) do update
set friendly_name = excluded.friendly_name,
    description   = excluded.description,
    active        = excluded.active;

-- =====================================================
-- 5) Sanity checks — should all return 1 row.
-- =====================================================
select 'client'   as kind, onboarding_complete::text as state from public.portal_clients     where user_id = '9d0d8e23-1a93-4f46-a582-926329be4d5c'
union all
select 'business' as kind, coalesce(website_url, 'NULL')      from public.portal_businesses where id      = 'a0bbeee7-0837-41bf-83b2-2dbe51e92f4d'
union all
select 'content'  as kind, count(*)::text                     from public.portal_website_content where business_id = 'a0bbeee7-0837-41bf-83b2-2dbe51e92f4d'
union all
select 'autom'    as kind, friendly_name                      from public.portal_automations where business_id = 'a0bbeee7-0837-41bf-83b2-2dbe51e92f4d' and n8n_workflow_id = 'lead-triage-consulting-v1';
