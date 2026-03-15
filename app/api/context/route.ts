import { NextRequest, NextResponse } from 'next/server'

// In-memory store for demo mode (replaced by Supabase when configured)
const contextStore = new Map<string, object[]>()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { listing_id, submitted_by_name, submitted_by_email, relationship, ...answers } = body

    if (!listing_id || !submitted_by_name) {
      return NextResponse.json({ error: 'listing_id and submitted_by_name are required' }, { status: 400 })
    }

    const entry = {
      listing_id,
      submitted_by_name,
      submitted_by_email: submitted_by_email || '',
      relationship,
      ...answers,
      created_at: new Date().toISOString(),
    }

    // Try Supabase first
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const { createBrowserClient } = await import('@supabase/ssr')
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { error } = await supabase.from('listing_context').insert(entry)
        if (error) console.error('[context] Supabase insert error:', error.message)
      } catch {
        // Supabase not available, fall through to in-memory
      }
    }

    // Also store in memory for demo
    const existing = contextStore.get(listing_id) || []
    existing.push(entry)
    contextStore.set(listing_id, existing)

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to save context'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const listingId = req.nextUrl.searchParams.get('listing_id')

  if (!listingId) {
    // Return all listing IDs that have context
    const ids = Array.from(contextStore.keys())
    return NextResponse.json({ listings: ids, count: ids.length })
  }

  const entries = contextStore.get(listingId) || []
  return NextResponse.json({ listing_id: listingId, entries, count: entries.length })
}
