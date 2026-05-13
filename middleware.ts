import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase isn't configured, block access to protected routes
  if (!supabaseUrl || !supabaseKey) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  let response = NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Use getSession() instead of getUser() — it reads the JWT from cookies
    // locally without a network round-trip to Supabase, making it much faster.
    // The layout does the full getUser() verification as a second layer.
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session && request.nextUrl.pathname.startsWith('/portal')) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  } catch {
    // If auth check fails, let the request through — the layout has its own auth guard
    // This prevents redirect loops when there's a transient Supabase error
    return response
  }

  return response
}

export const config = {
  matcher: ['/portal/:path*'],
}
