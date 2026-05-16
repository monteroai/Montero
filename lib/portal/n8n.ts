import type { N8nExecution, N8nWorkflowStatus } from './types'

const N8N_API_URL = process.env.N8N_API_URL || 'https://montero-cool.app.n8n.cloud'
const N8N_API_KEY = process.env.N8N_API_KEY || ''

async function n8nFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${N8N_API_URL}/api/v1${path}`, {
    ...options,
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error')
    throw new Error(`n8n API error ${res.status}: ${text}`)
  }
  return res.json()
}

export async function toggleWorkflow(workflowId: string, active: boolean): Promise<boolean> {
  // n8n cloud rejects PATCH on /workflows/{id} for the active field — use the
  // dedicated /activate and /deactivate POST endpoints instead.
  const action = active ? 'activate' : 'deactivate'
  await n8nFetch(`/workflows/${workflowId}/${action}`, { method: 'POST' })
  return true
}

// Same as toggleWorkflow but uses a provided API key (per-client vault) instead
// of the global env var. Called by the automations PATCH route once we've
// decrypted the owning client's n8n key.
export async function toggleWorkflowWithKey(workflowId: string, active: boolean, apiKey: string): Promise<boolean> {
  const action = active ? 'activate' : 'deactivate'
  const res = await fetch(`${N8N_API_URL}/api/v1/workflows/${workflowId}/${action}`, {
    method: 'POST',
    headers: {
      'X-N8N-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => 'unknown error')
    throw new Error(`n8n API error ${res.status}: ${text}`)
  }
  return true
}

export async function getWorkflowStatus(workflowId: string): Promise<N8nWorkflowStatus> {
  const data = await n8nFetch(`/workflows/${workflowId}`)
  return {
    id: data.id,
    name: data.name,
    active: data.active,
    updatedAt: data.updatedAt,
  }
}

export async function getWorkflowExecutions(
  workflowId: string,
  limit = 20
): Promise<N8nExecution[]> {
  const data = await n8nFetch(
    `/executions?workflowId=${workflowId}&limit=${limit}&status=success,error,waiting`
  )
  const results = data.data || data.results || []
  return results.map((e: Record<string, unknown>) => ({
    id: e.id as string,
    finished: e.finished as boolean,
    mode: e.mode as string,
    startedAt: e.startedAt as string,
    stoppedAt: e.stoppedAt as string | null,
    status: e.status as N8nExecution['status'],
  }))
}

export async function getWorkflowsOverview(): Promise<N8nWorkflowStatus[]> {
  const data = await n8nFetch('/workflows?limit=50')
  const results = data.data || data.results || []
  return results.map((w: Record<string, unknown>) => ({
    id: w.id as string,
    name: w.name as string,
    active: w.active as boolean,
    updatedAt: w.updatedAt as string,
  }))
}
