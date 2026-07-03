-- Site Studio AI — run once in Supabase Studio (lfaqxsuscjtabsvrhlrd → SQL editor).
-- Adds the AI-edit usage meter + the billing exemption flag, and marks Janeth
-- exempt (unlimited free AI edits, forever).
--
-- The feature works BEFORE this runs (the API route degrades to unmetered);
-- this script turns on metering + the free-forever flag.

-- 1) Exemption flag on the account
alter table portal_clients
  add column if not exists billing_exempt boolean not null default false;

-- 2) Usage meter (one row per AI generation; written by the API route via service role)
create table if not exists portal_ai_edits (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references portal_clients(id) on delete cascade,
  business_id uuid references portal_businesses(id) on delete set null,
  section text,
  instruction text,
  input_tokens int default 0,
  output_tokens int default 0,
  created_at timestamptz not null default now()
);
create index if not exists portal_ai_edits_client_month on portal_ai_edits (client_id, created_at);

alter table portal_ai_edits enable row level security;

-- Clients may read their own usage (the page shows the X/30 counter);
-- inserts come only from the service role (no insert policy on purpose).
drop policy if exists "own ai edits read" on portal_ai_edits;
create policy "own ai edits read" on portal_ai_edits for select
  using (client_id in (select id from portal_clients where user_id = auth.uid()));

-- 3) Janeth = everything free, forever (matches her by primary email; adjust if needed)
update portal_clients
set billing_exempt = true
where primary_email ilike '%janeth%'
   or owner_name ilike '%janeth%';

-- Sanity check — expect at least one row with billing_exempt = true
select owner_name, primary_email, billing_exempt from portal_clients order by created_at;
