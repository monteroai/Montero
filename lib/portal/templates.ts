// Workflow templates the admin can deploy into client n8n accounts.
// Keep these MINIMAL and SAFE — they should be testable without real
// side-effects. Real production templates (VAPI inbound, Twilio broadcast,
// etc.) will live in a separate, audited library.

export interface WorkflowTemplate {
  key: string                        // stable id used by the deploy route
  name: string                       // shown in the admin picker UI
  description: string                // short explainer
  category: 'test' | 'lead' | 'voice' | 'sms' | 'crm'
  workflow: {
    name: string                     // becomes the workflow name in n8n (we append a timestamp to keep deploys unique)
    nodes: Array<Record<string, unknown>>
    connections: Record<string, unknown>
    settings: Record<string, unknown>
  }
}

// One safe test template — single Manual Trigger node, zero side effects.
// Activates without doing anything; easy to spot + delete in n8n UI.
const TEST_MANUAL: WorkflowTemplate = {
  key: 'test_manual',
  name: 'Test — Manual Trigger (safe)',
  description: 'Empty workflow with a single Manual Trigger node. Zero side effects. Use this to verify the deploy mechanism works end-to-end.',
  category: 'test',
  workflow: {
    name: 'TEST - Manual Probe',
    nodes: [
      {
        parameters: {},
        name: 'When clicked',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: [240, 300],
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      },
    ],
    connections: {},
    settings: { executionOrder: 'v1' },
  },
}

// One slightly less trivial template — webhook in, set node, returns JSON.
// Useful for testing the "deploy + run" loop with an actual HTTP call.
const TEST_WEBHOOK: WorkflowTemplate = {
  key: 'test_webhook',
  name: 'Test — Webhook echo',
  description: 'Webhook → Set node → returns {"ok": true, "message": "Hello from Montero"}. Lets you confirm a deployed workflow actually runs.',
  category: 'test',
  workflow: {
    name: 'TEST - Webhook Echo',
    nodes: [
      {
        parameters: {
          httpMethod: 'GET',
          path: 'montero-test',
          responseMode: 'lastNode',
          options: {},
        },
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 2,
        position: [240, 300],
        id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
        webhookId: 'montero-test',
      },
      {
        parameters: {
          mode: 'manual',
          duplicateItem: false,
          assignments: {
            assignments: [
              { id: 'a1', name: 'ok', value: true, type: 'boolean' },
              { id: 'a2', name: 'message', value: 'Hello from Montero', type: 'string' },
            ],
          },
          options: {},
        },
        name: 'Set Response',
        type: 'n8n-nodes-base.set',
        typeVersion: 3.4,
        position: [460, 300],
        id: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
      },
    ],
    connections: {
      Webhook: {
        main: [[{ node: 'Set Response', type: 'main', index: 0 }]],
      },
    },
    settings: { executionOrder: 'v1' },
  },
}

export const TEMPLATES: WorkflowTemplate[] = [
  TEST_MANUAL,
  TEST_WEBHOOK,
]

export function getTemplateByKey(key: string): WorkflowTemplate | undefined {
  return TEMPLATES.find(t => t.key === key)
}
