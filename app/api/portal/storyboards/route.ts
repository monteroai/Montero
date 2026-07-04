import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

// Storyboards — marketing creatives as reviewable frame-by-frame stories.
//
// Storage-backed (bucket "storyboards", one index.json per business) so it
// needs zero schema changes. Flow: Montero builds a storyboard (status
// "draft") → admin reviews it in the Marketing tab (full detail: image
// prompts, animation prompts, audio direction) → admin approves → the client
// sees it (story + frames + audio only, never the prompts).
//
// GET   ?business_id=xxx                 → { storyboards, _admin }
// PATCH { business_id, storyboard_id, action: 'approve' | 'unapprove' }

const BUCKET = 'storyboards'

export type StoryboardFrame = {
  idx: number
  image: string          // public URL
  story: string          // client-facing: what happens in this beat
  duration?: string
  image_prompt?: string  // admin-only
  motion_prompt?: string // admin-only
}

export type Storyboard = {
  id: string
  title: string
  concept: string
  format: string
  status: 'draft' | 'approved'
  created_at: string
  approved_at?: string | null
  audio: { music?: string; voiceover?: string; sfx?: string }
  frames: StoryboardFrame[]
}

async function resolveAccess(businessId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const { data: caller } = await supabase
    .from('portal_clients')
    .select('id, is_admin')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!caller) return { error: NextResponse.json({ error: 'No account' }, { status: 403 }) }

  if (!caller.is_admin) {
    // RLS scopes this to the caller's own businesses
    const { data: biz } = await supabase
      .from('portal_businesses')
      .select('id')
      .eq('id', businessId)
      .maybeSingle()
    if (!biz) return { error: NextResponse.json({ error: 'Business not found' }, { status: 404 }) }
  }
  return { isAdmin: Boolean(caller.is_admin) }
}

async function readIndex(businessId: string): Promise<Storyboard[]> {
  const { data, error } = await adminClient().storage.from(BUCKET).download(`${businessId}/index.json`)
  if (error || !data) return []
  try {
    return JSON.parse(await data.text()) as Storyboard[]
  } catch {
    return []
  }
}

async function writeIndex(businessId: string, boards: Storyboard[]) {
  const blob = new Blob([JSON.stringify(boards, null, 2)], { type: 'application/json' })
  return adminClient().storage.from(BUCKET).upload(`${businessId}/index.json`, blob, {
    upsert: true,
    contentType: 'application/json',
  })
}

export async function GET(request: NextRequest) {
  const businessId = new URL(request.url).searchParams.get('business_id')
  if (!businessId) return NextResponse.json({ storyboards: [], _admin: false })

  const access = await resolveAccess(businessId)
  if ('error' in access) return access.error

  let boards = await readIndex(businessId)
  if (!access.isAdmin) {
    boards = boards
      .filter(b => b.status === 'approved')
      .map(b => ({
        ...b,
        frames: b.frames.map(({ image_prompt: _ip, motion_prompt: _mp, ...rest }) => rest),
      }))
  }
  return NextResponse.json({ storyboards: boards, _admin: access.isAdmin })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const { business_id, storyboard_id, action } = (body || {}) as {
    business_id?: string
    storyboard_id?: string
    action?: string
  }
  if (!business_id || !storyboard_id || !['approve', 'unapprove'].includes(action || '')) {
    return NextResponse.json({ error: 'business_id, storyboard_id, action required' }, { status: 400 })
  }

  const access = await resolveAccess(business_id)
  if ('error' in access) return access.error
  if (!access.isAdmin) return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const boards = await readIndex(business_id)
  const board = boards.find(b => b.id === storyboard_id)
  if (!board) return NextResponse.json({ error: 'Storyboard not found' }, { status: 404 })

  board.status = action === 'approve' ? 'approved' : 'draft'
  board.approved_at = action === 'approve' ? new Date().toISOString() : null

  const { error } = await writeIndex(business_id, boards)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ storyboard: board })
}
