export interface PortalClient {
  id: string
  user_id: string
  business_name: string
  owner_name: string
  phone: string | null
  email: string | null
  industry: string | null
  is_admin: boolean
  onboarding_step: number
  onboarding_complete: boolean
  onboarding_data: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface PortalAutomation {
  id: string
  client_id: string
  n8n_workflow_id: string
  friendly_name: string
  description: string | null
  category: string
  active: boolean
  last_run: string | null
  last_status: 'idle' | 'success' | 'error'
  sort_order: number
}

export interface PortalInteraction {
  id: string
  client_id: string
  type: 'call' | 'form' | 'email' | 'chat'
  summary: string
  detail: string | null
  raw_data: Record<string, unknown>
  flagged: boolean
  flag_reason: string | null
  created_at: string
}

export interface PortalWebsiteContent {
  id: string
  client_id: string
  section: string
  content: Record<string, unknown>
  is_live: boolean
  created_at: string
  updated_at: string
}

export interface PortalChangeRequest {
  id: string
  client_id: string
  section: string
  old_content: Record<string, unknown> | null
  new_content: Record<string, unknown>
  status: 'pending' | 'approved' | 'rejected'
  requested_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  reviewer_note: string | null
}

export interface PortalDocument {
  id: string
  client_id: string
  type: 'contract' | 'invoice' | 'onboarding' | 'upload' | 'automation-guide'
  title: string
  file_url: string | null
  file_size: number | null
  status: string
  signed_at: string | null
  created_at: string
}

export interface N8nExecution {
  id: string
  finished: boolean
  mode: string
  startedAt: string
  stoppedAt: string | null
  status: 'success' | 'error' | 'waiting' | 'running'
}

export interface N8nWorkflowStatus {
  id: string
  name: string
  active: boolean
  updatedAt: string
}
