import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AgentOsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let userEmail: string | null = null

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
        <img src="/logo.png" alt="MONTERO" width={32} height={32} style={{ objectFit: 'contain' }} />
        <div
          style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.5)', borderRadius: '12px',
            padding: '10px 16px', border: '1px solid rgba(255,255,255,0.6)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 400 }}>How can we help you today?</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Notification icons */}
          <button style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
          {/* Avatar */}
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #1B2B5E, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ffffff', fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em',
            border: '2px solid rgba(255,255,255,0.6)',
          }}>
            {(userEmail ? userEmail[0] : 'A').toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', padding: '12px 16px 16px', gap: '12px', minHeight: 0 }}>
        {children}
      </div>
    </div>
  )
}
