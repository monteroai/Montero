// Catalog of every integration the client portal supports.
// Adding a new integration here + a matching probe in the test route
// is all it takes to surface a new card in /portal/integrations.

export type IntegrationKey = 'n8n' | 'vapi' | 'twilio' | 'enginehire'

export interface IntegrationField {
  key: string                // form field key
  label: string              // human label
  placeholder?: string
  type?: 'text' | 'password'
  required?: boolean
}

export interface IntegrationDef {
  key: IntegrationKey
  service: string                // string written to client_secrets.service
  name: string                   // display name in cards
  blurb: string                  // one-line description shown on the card
  purpose: string                // 2-3 sentence "what we'll do with this"
  fields: IntegrationField[]     // form fields (the first one is the value stored in Vault)
  instructions: string[]         // numbered steps to find the key
  docsUrl?: string
  category: 'automation' | 'phone' | 'staffing' | 'messaging'
  recommended: boolean           // shows a "Required" badge if true
}

export const INTEGRATIONS: IntegrationDef[] = [
  {
    key: 'n8n',
    service: 'n8n',
    name: 'n8n',
    blurb: 'Workflow engine — runs your automations behind the scenes.',
    purpose:
      "We connect to your n8n account to deploy and monitor the automations we build for your business. " +
      "You don't need to log in to n8n yourself — we handle everything, you'll see results in your dashboard.",
    fields: [
      { key: 'value', label: 'n8n API key', placeholder: 'n8n_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', type: 'password', required: true },
    ],
    instructions: [
      'Open your n8n cloud dashboard (n8n.cloud or your custom URL).',
      'Click your avatar (top right) → "Settings".',
      'Open the "API" tab in the left sidebar.',
      'Click "Create an API Key", give it a name like "Montero", and copy the value.',
      'Paste it here and press Test & Save.',
    ],
    docsUrl: 'https://docs.n8n.io/api/authentication/',
    category: 'automation',
    recommended: true,
  },
  {
    key: 'vapi',
    service: 'vapi',
    name: 'VAPI',
    blurb: 'AI phone agent — answers and places calls on your business line.',
    purpose:
      "Lets us build and run AI voice agents on your phone number (inbound greetings, outbound reminders, etc). " +
      "Your callers will never know it's automated — voice quality is the same as a real receptionist.",
    fields: [
      { key: 'value', label: 'VAPI API key', placeholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', type: 'password', required: true },
    ],
    instructions: [
      'Go to dashboard.vapi.ai and sign in.',
      'Click "Provider Keys" in the sidebar.',
      'Find your API key and click the copy icon next to it.',
      'Paste it here and press Test & Save.',
    ],
    docsUrl: 'https://docs.vapi.ai/quickstart',
    category: 'phone',
    recommended: true,
  },
  {
    key: 'twilio',
    service: 'twilio',
    name: 'Twilio',
    blurb: 'SMS + call routing — used for broadcasts and number forwarding.',
    purpose:
      "Twilio powers SMS broadcasts (like the temp-broadcast automation) and any call forwarding we set up. " +
      "Optional — only needed if you want SMS-based automations.",
    fields: [
      { key: 'value', label: 'Auth Token', placeholder: 'your-twilio-auth-token', type: 'password', required: true },
    ],
    instructions: [
      'Sign in to your Twilio Console.',
      'On the dashboard home, find "Account Info" on the right side.',
      'Click the eye icon next to "Auth Token" to reveal it.',
      'Copy and paste here.',
    ],
    docsUrl: 'https://www.twilio.com/docs/iam/api/account-secrets-api',
    category: 'messaging',
    recommended: false,
  },
  {
    key: 'enginehire',
    service: 'enginehire',
    name: 'EngineHire',
    blurb: 'Staffing CRM — only relevant for dental staffing agencies.',
    purpose:
      "EngineHire is the system of record for your temps and clinic clients. " +
      "We integrate read-only — never overwrite your data, only sync into your dashboard.",
    fields: [
      { key: 'value', label: 'EngineHire API key', placeholder: 'eh_xxxxxxxxxxxxxx', type: 'password', required: true },
    ],
    instructions: [
      'Sign in to your EngineHire admin.',
      'Go to Settings → Integrations / API.',
      "If you don't see an API option, email support@enginehire.com asking them to enable API access for your account.",
      'Copy the key they provide and paste it here.',
    ],
    category: 'staffing',
    recommended: false,
  },
]

export function getIntegrationByService(service: string): IntegrationDef | undefined {
  return INTEGRATIONS.find(i => i.service === service)
}

export type VerificationStatus = 'pending' | 'verified' | 'failed'

export interface IntegrationStatus {
  service: string
  configured: boolean
  verification_status: VerificationStatus
  last_verified_at: string | null
  last_verification_error: string | null
  updated_at: string | null
}
