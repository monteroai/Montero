'use client'

import { ChatPanel } from '@/components/portal/ChatPanel'

// The Assistant's own tab — just the conversation, centered, fixed height.
export default function AssistantPage() {
  return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '18px 4px 8px' }}>
      <ChatPanel variant="page" />
    </div>
  )
}
