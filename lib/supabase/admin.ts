// Service-role Supabase client for admin-only server actions.
//
// IMPORTANT: only ever import this from server code (API routes, server
// components). NEVER pass instances to client components — the service role
// bypasses RLS entirely.
//
// Requires SUPABASE_SERVICE_ROLE_KEY in the deployment env. If missing,
// adminClient() throws a helpful error so the route can return a useful 500
// instead of a cryptic Supabase auth failure.

import { createClient } from '@supabase/supabase-js'

export function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it under Netlify Site settings → Environment variables (same value as line 26 of the master .env).'
    )
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function isAdminEnvConfigured(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
}
