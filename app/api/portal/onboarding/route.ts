import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: client } = await supabase
    .from('portal_clients')
    .select('onboarding_step, onboarding_complete, onboarding_data')
    .eq('user_id', user.id)
    .single()

  if (!client) {
    return NextResponse.json({ step: 1, complete: false, data: {} })
  }

  return NextResponse.json({
    step: client.onboarding_step,
    complete: client.onboarding_complete,
    data: client.onboarding_data || {},
  })
}

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

  // Check if client row exists
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
    // If step 1 data has business info, update those fields too
    if (data?.business_name) updates.business_name = data.business_name
    if (data?.owner_name) updates.owner_name = data.owner_name
    if (data?.phone) updates.phone = data.phone
    if (data?.email) updates.email = data.email
    if (data?.industry) updates.industry = data.industry

    const { error } = await supabase.from('portal_clients').update(updates).eq('id', existing.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    // Create new client row
    const { error } = await supabase.from('portal_clients').insert({
      user_id: user.id,
      business_name: (data?.business_name as string) || 'My Business',
      owner_name: (data?.owner_name as string) || 'Owner',
      phone: (data?.phone as string) || null,
      email: (data?.email as string) || user.email,
      industry: (data?.industry as string) || null,
      onboarding_step: step || 1,
      onboarding_complete: complete || false,
      onboarding_data: mergedData,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
