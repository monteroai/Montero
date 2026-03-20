import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AiAssistant from './AiAssistant'
import LogoutButton from './LogoutButton'

export default async function AgentOsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let userEmail: string | null = null
  let firstName: string | null = null

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        redirect('/login')
      }
      userEmail = user.email ?? null
      const fullName = user.user_metadata?.full_name as string | undefined
      firstName = fullName ? fullName.split(' ')[0] : null
    } catch (e) {
      // redirect() throws a special NEXT_REDIRECT error — must re-throw it
      if (e && typeof e === 'object' && 'digest' in e) throw e
      // Other Supabase errors: redirect to login for safety
      redirect('/login')
    }
  } else {
    // If Supabase isn't configured, block access
    redirect('/login')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e8eaf6 0%, #e3e9f7 20%, #f0e6f6 40%, #fce4ec 60%, #e8eaf6 80%, #dbeafe 100%)',
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <header
        style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          padding: '12px 24px', margin: '12px 16px 0',
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
        }}
      >
        <Link href="/agent-os" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <img src="/logo.png" alt="MONTERO" width={32} height={32} style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#1B2B5E', letterSpacing: '0.02em' }}>MONTERO</span>
        </Link>
        <nav
          style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '6px',
            padding: '0 12px',
          }}
        >
          <Link href="/agent-os" style={{
            fontSize: '13px', fontWeight: 600, color: '#1B2B5E', textDecoration: 'none',
            padding: '7px 14px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)',
          }}>
            Dashboard
          </Link>
          <Link href="/agent-os/remarks" style={{
            fontSize: '13px', fontWeight: 600, color: '#64748b', textDecoration: 'none',
            padding: '7px 14px', borderRadius: '10px',
          }}>
            Remarks
          </Link>
          <Link href="/agent-os/content" style={{
            fontSize: '13px', fontWeight: 600, color: '#64748b', textDecoration: 'none',
            padding: '7px 14px', borderRadius: '10px',
          }}>
            Content
          </Link>
          <Link href="/agent-os/context" style={{
            fontSize: '13px', fontWeight: 600, color: '#64748b', textDecoration: 'none',
            padding: '7px 14px', borderRadius: '10px',
          }}>
            Context
          </Link>
          <Link href="/agent-os/settings" style={{
            fontSize: '13px', fontWeight: 600, color: '#64748b', textDecoration: 'none',
            padding: '7px 14px', borderRadius: '10px',
          }}>
            DNA
          </Link>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Notification icon */}
          <button style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
          {/* Agent name + avatar */}
          {firstName && (
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#1B2B5E' }}>
              {firstName}
            </span>
          )}
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #1B2B5E, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ffffff', fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em',
            border: '2px solid rgba(255,255,255,0.6)',
          }}>
            {(firstName ? firstName[0] : userEmail ? userEmail[0] : 'A').toUpperCase()}
          </div>
          {/* Logout */}
          <LogoutButton />
        </div>
      </header>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', padding: '12px 16px 16px', gap: '12px', minHeight: 0 }}>
        {children}
      </div>

      {/* Persistent AI Assistant */}
      <AiAssistant />
    </div>
  )
}
