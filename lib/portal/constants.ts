export const SDT_WORKFLOWS = [
  {
    n8n_workflow_id: 'PIo3mYTZKOlJdXM4',
    friendly_name: 'AI Receptionist (Inbound Calls)',
    description: 'Answers all inbound calls via VAPI, collects caller info, routes to candidate or client intake, sends confirmations.',
    category: 'calls',
    sort_order: 1,
  },
  {
    n8n_workflow_id: 'WF2',
    friendly_name: 'Follow-Up Scheduler',
    description: 'Schedules automatic follow-up calls and emails for new candidates and clients.',
    category: 'outreach',
    sort_order: 2,
  },
  {
    n8n_workflow_id: 'WF3',
    friendly_name: 'Email Unsubscribe Handler',
    description: 'Handles unsubscribe requests from reminder emails and updates contact preferences.',
    category: 'email',
    sort_order: 3,
  },
  {
    n8n_workflow_id: 'WF4',
    friendly_name: 'Candidate Application Intake',
    description: 'Receives website applications from dental professionals, creates profiles in your database, checks for duplicates.',
    category: 'candidates',
    sort_order: 4,
  },
  {
    n8n_workflow_id: 'WF5',
    friendly_name: 'Client Practice Application',
    description: 'Receives applications from dental practices looking to hire, creates client profiles.',
    category: 'clients',
    sort_order: 5,
  },
  {
    n8n_workflow_id: '3fe5HKWS2vWRisD0',
    friendly_name: 'Shift Reminder Calls (Outbound)',
    description: 'Automated outbound calls to remind dental professionals about upcoming shifts and appointments.',
    category: 'calls',
    sort_order: 6,
  },
  {
    n8n_workflow_id: 'WF7',
    friendly_name: 'Booking Handler',
    description: 'Manages shift bookings — confirms placements, updates availability, notifies both parties.',
    category: 'bookings',
    sort_order: 7,
  },
  {
    n8n_workflow_id: 'WF8',
    friendly_name: 'Availability Checker',
    description: 'Checks dental professional availability when a practice requests coverage.',
    category: 'bookings',
    sort_order: 8,
  },
  {
    n8n_workflow_id: 'WF9',
    friendly_name: 'Approval Handler',
    description: 'Manages approval workflows for shift assignments and placements.',
    category: 'bookings',
    sort_order: 9,
  },
  {
    n8n_workflow_id: 'WF10',
    friendly_name: 'Call Outcome Tracker',
    description: 'Logs call results — who picked up, who is interested, who needs a callback.',
    category: 'calls',
    sort_order: 10,
  },
  {
    n8n_workflow_id: 'WF11',
    friendly_name: 'Outbound Call Tools',
    description: 'Supporting tools for outbound calling — dialer setup, call scripts, voicemail detection.',
    category: 'calls',
    sort_order: 11,
  },
  {
    n8n_workflow_id: 'e90WJnsvQgAKVqN6',
    friendly_name: 'Database Sync',
    description: 'Syncs data between Airtable and your portal database every 4 hours to keep everything up to date.',
    category: 'sync',
    sort_order: 12,
  },
  {
    n8n_workflow_id: '7fWaVKEHxMXEWGj4',
    friendly_name: 'AI Chat Assistant',
    description: 'Powers the chat widget on your website — answers questions from candidates and practices 24/7.',
    category: 'chat',
    sort_order: 13,
  },
] as const

export const CATEGORY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  calls: { label: 'Calls', color: '#2563eb', bg: '#dbeafe' },
  candidates: { label: 'Candidates', color: '#7c3aed', bg: '#ede9fe' },
  clients: { label: 'Clients', color: '#0891b2', bg: '#cffafe' },
  outreach: { label: 'Outreach', color: '#ea580c', bg: '#fff7ed' },
  email: { label: 'Email', color: '#64748b', bg: '#f1f5f9' },
  bookings: { label: 'Bookings', color: '#16a34a', bg: '#dcfce7' },
  sync: { label: 'Sync', color: '#64748b', bg: '#f1f5f9' },
  chat: { label: 'Chat', color: '#d97706', bg: '#fef3c7' },
}

export const INTERACTION_ICONS = {
  call: { label: 'Call', emoji: '📞' },
  form: { label: 'Form', emoji: '📋' },
  email: { label: 'Email', emoji: '📧' },
  chat: { label: 'Chat', emoji: '💬' },
} as const

export const WEBSITE_SECTIONS = [
  'hero',
  'about',
  'testimonials',
  'services',
  'contact',
  'footer',
] as const

export const ONBOARDING_STEPS = [
  { step: 1, label: 'Business Info' },
  { step: 2, label: 'Agreement' },
  { step: 3, label: 'Payment' },
  { step: 4, label: 'Automations' },
  { step: 5, label: 'Go Live' },
] as const
