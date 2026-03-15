import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const navItems = [
  { href: '/agent-os', label: 'Dashboard' },
  { href: '/agent-os/remarks', label: 'Agent Remarks' },
  { href: '/agent-os/content', label: 'Content Pack' },
  { href: '/agent-os/settings', label: 'Settings' },
]

export default async function AgentOsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let userEmail: string | null = null

  // Only check auth if Supabase is configured
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        redirect('/login')
      }
      userEmail = user.email ?? null
    } catch {
      // If Supabase fails, continue without auth
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{ width: '220px', background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="MONTERO" width={28} height={28} style={{ mixBlendMode: 'multiply', objectFit: 'contain' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1B2B5E', letterSpacing: '0.04em' }}>MONTERO Agent OS</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px' }}>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'block', padding: '10px 14px', fontSize: '13px', fontWeight: 500,
                color: '#475569', borderRadius: '8px', marginBottom: '2px',
                textDecoration: 'none', transition: 'background 0.15s',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '12px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail || 'Demo mode'}</p>
          {userEmail && (
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                style={{ marginTop: '4px', fontSize: '12px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Sign out
              </button>
            </form>
          )}
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
