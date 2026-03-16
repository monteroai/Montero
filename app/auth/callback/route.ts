import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // 'recovery' for password reset

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] Exchange error:', error.message)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // If this is a password recovery, redirect to reset page in update mode
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/reset-password?mode=update`)
  }

  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Ensure agents row exists (created on first email confirmation)
    const { data: existingAgent } = await supabase
      .from('agents')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!existingAgent) {
      const meta = user.user_metadata || {}
      await supabase.from('agents').insert({
        id: user.id,
        email: user.email,
        full_name: meta.full_name || null,
        brokerage: meta.brokerage || null,
        plan: 'free',
        credits_remaining: 3,
        total_generations: 0,
      })
    }

    // Check if agent has completed onboarding (has DNA profile)
    const { data: dna } = await supabase
      .from('agent_dna')
      .select('id')
      .eq('agent_id', user.id)
      .maybeSingle()

    if (!dna) {
      return NextResponse.redirect(`${origin}/agent-os/onboarding`)
    }
  }

  return NextResponse.redirect(`${origin}/agent-os`)
}
