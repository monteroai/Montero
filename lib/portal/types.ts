// Account-level (one per signed-in user)
export interface PortalClient {
  id: string
  user_id: string
  owner_name: string
  primary_email: string | null
  primary_phone: string | null
  is_admin: boolean
  onboarding_step: number
  onboarding_complete: boolean
  onboarding_data: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Each business under an account (one client → many businesses)
export interface PortalBusiness {
  id: string
  client_id: string
  business_name: string
  industry: string | null
  business_phone: string | null
  business_email: string | null
  website_url: string | null
  brand_colors: BrandColors
  brand_logo_url: string | null
  brand_extracted: Record<string, unknown>
  description: string | null
  is_archived: boolean
  sort_order: number
  created_at: string
  updated_at: string
  // Admin-only fields — only populated when the request was made by an admin user.
  // Lets the header switcher group businesses by client / show owner names.
  _client_owner_name?: string | null
  _client_email?: string | null
}

export interface BrandColors {
  primary?: string
  secondary?: string
  accent?: string
  background?: string
  text?: string
  [key: string]: string | undefined
}

export interface PortalAutomation {
  id: string
  business_id: string
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
  business_id: string
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
  business_id: string
  section: string
  content: Record<string, unknown>
  is_live: boolean
  created_at: string
  updated_at: string
}

export interface PortalChangeRequest {
  id: string
  business_id: string
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
  business_id: string | null
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
