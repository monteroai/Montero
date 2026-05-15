// GET    /api/portal/integrations            → list connected integrations for the signed-in client (metadata only, never plaintext)
// DELETE /api/portal/integrations?service=n8n → remove an integration (calls the delete_client_secret RPC which cleans up Vault too)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: client } = await supabase
    .from('portal_clients')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!client) return NextResponse.json({ integrations: [] })

  const { data: rows, error } = await supabase
    .from('client_secrets')
    .select('service, verification_status, last_verified_at, last_verification_error, updated_at, is_active')
    .eq('client_id', client.id)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    integrations: (rows || []).map(r => ({
      service: r.service,
      configured: true,
      verification_status: r.verification_status,
      last_verified_at: r.last_verified_at,
      last_verification_error: r.last_verification_error,
      updated_at: r.updated_at,
    })),
  })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const service = url.searchParams.get('service')
  if (!service) return NextResponse.json({ error: 'service required' }, { status: 400 })

  const { data: client } = await supabase
    .from('portal_clients')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!client) return NextResponse.json({ error: 'Account not found' }, { status: 404 })

  // RPC handles Vault cleanup + verifies ownership via auth.uid()
  const { error } = await supabase.rpc('delete_client_secret', {
    p_client_id: client.id,
    p_service: service,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
