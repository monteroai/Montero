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
    // Ensure a portal_clients row exists for this user on first email confirmation.
    // (Agents table was the old Agent OS path; we now provision into portal_clients.)
    const { data: existingClient } = await supabase
      .from('portal_clients')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!existingClient) {
      const meta = user.user_metadata || {}
      await supabase.from('portal_clients').insert({
        user_id: user.id,
        owner_name: meta.full_name || user.email?.split('@')[0] || null,
        primary_email: user.email,
        onboarding_complete: false,
      })
    }
  }

  return NextResponse.redirect(`${origin}/portal`)
}
