'use client'

import { useState } from 'react'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalSidebar } from '@/components/portal/PortalSidebar'
import { mainBg } from '@/lib/portal/styles'
import { BusinessProvider } from '@/lib/portal/BusinessContext'
import AiAssistant from './AiAssistant'

interface PortalShellProps {
  clientName: string
  businessName: string
  children: React.ReactNode
}

export function PortalShell({ clientName, businessName, children }: PortalShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <BusinessProvider>
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
        }}>
          <PortalSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main style={{
            flex: 1, minWidth: 0,
            overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: '12px',
          }}>
            {children}
          </main>
        </div>

        <AiAssistant />
      </div>
    </BusinessProvider>
  )
}
