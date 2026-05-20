import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/portal/onboarding → current state of the account onboarding wizard
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: client } = await supabase
    .from('portal_clients')
    .select('id, onboarding_step, onboarding_complete, onboarding_data, owner_name, primary_email, primary_phone')
    .eq('user_id', user.id)
    .single()

  if (!client) {
    return NextResponse.json({ step: 1, complete: false, data: {}, account: null })
  }

  return NextResponse.json({
    step: client.onboarding_step,
    complete: client.onboarding_complete,
    data: client.onboarding_data || {},
    account: {
      owner_name: client.owner_name,
      primary_email: client.primary_email,
      primary_phone: client.primary_phone,
    },
  })
}

// PATCH /api/portal/onboarding → update wizard state and account-level fields
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { step, data, complete } = body as {
    step?: number
    data?: Record<string, unknown>
    complete?: boolean
  }

  const { data: existing } = await supabase
    .from('portal_clients')
    .select('id, onboarding_data')
    .eq('user_id', user.id)
    .single()

  const mergedData = { ...(existing?.onboarding_data || {}), ...(data || {}) }

  if (existing) {
    const updates: Record<string, unknown> = { onboarding_data: mergedData, updated_at: new Date().toISOString() }
    if (step !== undefined) updates.onboarding_step = step
    if (complete !== undefined) updates.onboarding_complete = complete
    if (data?.owner_name) updates.owner_name = data.owner_name
    if (data?.primary_email) updates.primary_email = data.primary_email
    if (data?.primary_phone) updates.primary_phone = data.primary_phone

    const { error } = await supabase.from('portal_clients').update(updates).eq('id', existing.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Mirror the display name into Supabase Auth user_metadata so it's
    // consistent in the Auth dashboard, in raw_user_meta_data, and in any
    // future flows that pull from user.user_metadata. Best-effort — don't
    // fail the save if this hiccups.
    if (data?.owner_name) {
      const newName = String(data.owner_name)
      const { error: authErr } = await supabase.auth.updateUser({
        data: { full_name: newName, display_name: newName },
      })
      if (authErr) console.error('[settings] auth.updateUser failed:', authErr.message)
    }
  } else {
    const { error } = await supabase.from('portal_clients').insert({
      user_id: user.id,
      owner_name: (data?.owner_name as string) || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Owner',
      primary_email: (data?.primary_email as string) || user.email,
      primary_phone: (data?.primary_phone as string) || null,
      onboarding_step: step || 1,
      onboarding_complete: complete || false,
      onboarding_data: mergedData,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
