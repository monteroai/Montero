// Curated sequence hints: which automation follows which, for businesses
// whose workflows aren't all wired to live n8n ids yet. Matched by
// friendly_name (case-insensitive). Live-detected n8n handoff edges are
// merged on top of these, and duplicates are removed.
//
// SDT (dental staffing) — the real operational flow:
//   Inbound call → outcome logged → follow-up if no response
//   Applications (candidates & practices) → follow-up nurture
//   Practice request → availability check → booking → approval → shift reminders
//   Follow-up emails → unsubscribe handling
//   Chat assistant routes people into the intake flows

export const FLOW_HINTS: Array<{ from: string; to: string; note?: string }> = [
  { from: 'AI Receptionist (Inbound Calls)', to: 'Call Outcome Tracker', note: 'every call gets logged' },
  { from: 'Call Outcome Tracker', to: 'Follow-Up Scheduler', note: 'no response → scheduled follow-up' },
  { from: 'Candidate Application Intake', to: 'Follow-Up Scheduler', note: 'new applicants get nurtured' },
  { from: 'Client Practice Application', to: 'Availability Checker', note: 'new practice request → who is free?' },
  { from: 'Availability Checker', to: 'Booking Handler', note: 'match found → book the shift' },
  { from: 'Booking Handler', to: 'Approval Handler', note: 'placement needs sign-off' },
  { from: 'Approval Handler', to: 'Shift Reminder Calls (Outbound)', note: 'confirmed shifts get reminders' },
  { from: 'Follow-Up Scheduler', to: 'Outbound Call Tools', note: 'follow-ups dial out through here' },
  { from: 'Follow-Up Scheduler', to: 'Email Unsubscribe Handler', note: 'opt-outs handled automatically' },
  { from: 'AI Chat Assistant', to: 'Candidate Application Intake', note: 'chat routes applicants to intake' },
  { from: 'AI Chat Assistant', to: 'Client Practice Application', note: 'chat routes practices to intake' },
]
