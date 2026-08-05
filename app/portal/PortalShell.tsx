'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalSidebar } from '@/components/portal/PortalSidebar'
import { ChatPanel } from '@/components/portal/ChatPanel'
import { mainBg, glass, colors } from '@/lib/portal/styles'
import { BusinessProvider } from '@/lib/portal/BusinessContext'
import { ChatProvider, useChat } from '@/lib/portal/ChatContext'

interface PortalShellProps {
  clientName: string
  businessName: string
  children: React.ReactNode
}

// The assistant rail: the same conversation as the Assistant tab, following
// the user across every other tab. Hidden on the Assistant tab itself (the
// chat IS that tab), hideable via the header button, recalled via the slim
// edge handle. Disappears below 1100px — the Assistant tab always remains.
function ChatRail() {
  const pathname = usePathname()
  const { railHidden, setRailHidden } = useChat()
  const onAssistantTab = pathname.startsWith('/portal/assistant')

  if (onAssistantTab) return null

  return (
    <>
      <style>{`
        .mchat-rail { display: none; }
        .mchat-handle { display: none; }
        @media (min-width: 1100px) {
          .mchat-rail.open { display: flex; }
          .mchat-handle.open { display: flex; }
        }
        @keyframes mchatRailIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      {!railHidden && (
        <aside
          className="mchat-rail open"
          style={{
            ...glass,
            width: '324px', flexShrink: 0, padding: '14px',
            flexDirection: 'column', gap: '10px', minHeight: 0,
            // Sticky + flex-start so the rail holds its own size and stays put
            // as the page scrolls, mirroring the left tab column.
            position: 'sticky', top: '18px', alignSelf: 'flex-start',
            animation: 'mchatRailIn .45s cubic-bezier(.16,1,.3,1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 200, letterSpacing: '.3em', textTransform: 'uppercase', fontSize: '12px', color: '#16203a' }}>MONTERO</span>
            <button
              onClick={() => setRailHidden(true)}
              style={{
                background: 'rgba(120,120,128,.12)', border: 0, borderRadius: '999px', padding: '4px 12px',
                fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase',
                color: colors.textMuted, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Hide
            </button>
          </div>
          <ChatPanel variant="rail" />
        </aside>
      )}

      {railHidden && (
        <button
          className="mchat-handle open"
          onClick={() => setRailHidden(false)}
          title="Show assistant"
          style={{
            position: 'fixed', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 40,
            width: '26px', height: '62px', borderRadius: '12px 0 0 12px',
            background: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.7)', borderRight: 0,
            backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: colors.blue,
            boxShadow: '0 10px 24px rgba(23,32,64,.14)',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
      )}
    </>
  )
}

export function PortalShell({ clientName, businessName, children }: PortalShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <BusinessProvider>
      <ChatProvider>
        <div style={{
          minHeight: '100vh',
          background: mainBg,
          backgroundAttachment: 'fixed',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <PortalHeader
            clientName={clientName}
            businessName={businessName}
            onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          />

          <div style={{
            flex: 1, display: 'flex',
            padding: '12px 16px 16px', gap: '12px',
            minHeight: 0,
            height: 'calc(100vh - 64px)',
          }}>
            <PortalSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main style={{
              flex: 1, minWidth: 0,
              overflowY: 'auto',
              display: 'flex', flexDirection: 'column', gap: '12px',
            }}>
              {children}
            </main>

            <ChatRail />
          </div>
        </div>
      </ChatProvider>
    </BusinessProvider>
  )
}
