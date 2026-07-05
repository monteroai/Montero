'use client'

import { useState } from 'react'
import { card, colors, gradientButton, secondaryButton } from '@/lib/portal/styles'
import { StatusBadge } from './StatusBadge'
import { CATEGORY_LABELS } from '@/lib/portal/constants'
import type { PortalAutomation } from '@/lib/portal/types'

function timeAgo(dateStr: string | null) {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export const KIND_META: Record<string, { icon: string; color: string }> = {
  trigger: { icon: '⚡', color: '#d97706' },
  branch: { icon: '◇', color: '#7c3aed' },
  email: { icon: '✉', color: '#64748b' },
  sms: { icon: '☎', color: '#0891b2' },
  ai: { icon: '✦', color: '#8b5cf6' },
  data: { icon: '▤', color: '#16a34a' },
  api: { icon: '⇄', color: '#2563eb' },
  call: { icon: '☎', color: '#0891b2' },
  wait: { icon: '◷', color: '#94a3b8' },
  step: { icon: '●', color: '#475569' },
}

export type FlowNode = { name: string; kind: string }
export type Graph =
  | { managed: true; description: string | null }
  | { name: string; levels: FlowNode[][]; edges?: Array<{ from: string; to: string }> }
  | { error: string }

// n8n-style tree: nodes laid out on a level grid, SVG lines connecting each
// parent to its children so branching and order are visually explicit.
const TREE = { W: 172, H: 46, GAP: 14, VGAP: 40 }

export function FlowTree({ levels, edges }: { levels: FlowNode[][]; edges: Array<{ from: string; to: string }> }) {
  const maxCount = Math.max(...levels.map(l => l.length), 1)
  const fullWidth = maxCount * TREE.W + (maxCount - 1) * TREE.GAP
  const height = levels.length * TREE.H + (levels.length - 1) * TREE.VGAP

  // Position each node: levels vertically, nodes centered within each level
  const pos = new Map<string, { x: number; y: number }>()
  levels.forEach((level, li) => {
    const levelWidth = level.length * TREE.W + (level.length - 1) * TREE.GAP
    const offsetX = (fullWidth - levelWidth) / 2
    level.forEach((node, ni) => {
      pos.set(node.name, { x: offsetX + ni * (TREE.W + TREE.GAP), y: li * (TREE.H + TREE.VGAP) })
    })
  })

  return (
    <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
      <div style={{ position: 'relative', width: `${fullWidth}px`, height: `${height}px` }}>
        <svg width={fullWidth} height={height} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {edges.map((e, i) => {
            const from = pos.get(e.from)
            const to = pos.get(e.to)
            if (!from || !to) return null
            const x1 = from.x + TREE.W / 2
            const y1 = from.y + TREE.H
            const x2 = to.x + TREE.W / 2
            const y2 = to.y
            const midY = (y1 + y2) / 2
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />
            )
          })}
        </svg>
        {levels.flat().map(node => {
          const p = pos.get(node.name)
          if (!p) return null
          const meta = KIND_META[node.kind] || KIND_META.step
          return (
            <div
              key={node.name}
              title={node.name}
              style={{
                position: 'absolute', left: `${p.x}px`, top: `${p.y}px`,
                width: `${TREE.W}px`, height: `${TREE.H}px`,
                display: 'flex', alignItems: 'center', gap: '8px',
                background: '#fff', border: `1px solid ${colors.border}`,
                borderLeft: `3px solid ${meta.color}`,
                borderRadius: '10px', padding: '0 10px', boxSizing: 'border-box',
              }}
            >
              <span style={{ color: meta.color, fontSize: '13px', flexShrink: 0 }}>{meta.icon}</span>
              <span style={{
                fontSize: '11.5px', fontWeight: 600, color: colors.textDark, lineHeight: 1.25,
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {node.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface AutomationRowProps {
  automation: PortalAutomation
  onToggle: (id: string, active: boolean) => Promise<void>
}

export function AutomationRow({ automation, onToggle }: AutomationRowProps) {
  const [toggling, setToggling] = useState(false)
  const [active, setActive] = useState(automation.active)
  const [confirmOff, setConfirmOff] = useState(false)
  const [toggleError, setToggleError] = useState('')
  const [flowOpen, setFlowOpen] = useState(false)
  const [graph, setGraph] = useState<Graph | null>(null)
  const [graphLoading, setGraphLoading] = useState(false)
  const cat = CATEGORY_LABELS[automation.category] || { label: automation.category, color: '#64748b', bg: '#f1f5f9' }

  async function doToggle(next: boolean) {
    setToggling(true)
    setToggleError('')
    try {
      await onToggle(automation.id, next)
      setActive(next)
    } catch {
      setToggleError(`Couldn't ${next ? 'turn on' : 'turn off'} "${automation.friendly_name}" — nothing was changed. Try again in a minute or use Talk to Emilio.`)
    }
    setToggling(false)
  }

  function handleToggleClick() {
    if (active) {
      setConfirmOff(true) // turning OFF is disruptive — confirm first
    } else {
      doToggle(true)
    }
  }

  async function openFlow() {
    setFlowOpen(o => !o)
    if (graph || graphLoading) return
    setGraphLoading(true)
    try {
      const r = await fetch(`/api/portal/automations/graph?automation_id=${automation.id}`)
      setGraph(await r.json())
    } catch {
      setGraph({ error: 'Could not load the flow right now.' })
    } finally {
      setGraphLoading(false)
    }
  }

  return (
    <div style={{ ...card, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Toggle switch */}
        <button
          onClick={handleToggleClick}
          disabled={toggling}
          aria-label={active ? 'Turn off' : 'Turn on'}
          style={{
            width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: toggling ? 'wait' : 'pointer',
            background: active ? colors.success : '#cbd5e1',
            position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            opacity: toggling ? 0.6 : 1,
          }}
        >
          <span style={{
            position: 'absolute', top: '2px',
            left: active ? '22px' : '2px',
            width: '20px', height: '20px', borderRadius: '50%',
            background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            transition: 'left 0.2s',
          }} />
        </button>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textDark }}>{automation.friendly_name}</span>
            <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600, background: cat.bg, color: cat.color }}>
              {cat.label}
            </span>
            <button
              onClick={openFlow}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11.5px', fontWeight: 600, color: colors.blue, padding: 0 }}
            >
              {flowOpen ? '▾ Hide how it works' : '▸ How it works'}
            </button>
          </div>
          {automation.description && (
            <div style={{ fontSize: '12px', color: colors.textMuted, lineHeight: '1.5' }}>{automation.description}</div>
          )}
          {toggleError && (
            <div style={{ fontSize: '12px', color: colors.error, marginTop: '6px' }}>{toggleError}</div>
          )}
        </div>

        {/* Status + last run */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <StatusBadge status={active ? (automation.last_status === 'error' ? 'error' : 'running') : 'stopped'} />
          <div style={{ fontSize: '11px', color: colors.textLight, marginTop: '4px' }}>
            Last run: {timeAgo(automation.last_run)}
          </div>
        </div>
      </div>

      {/* Flow view — simplified n8n-style tree, BFS levels top to bottom */}
      {flowOpen && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: `1px dashed ${colors.border}` }}>
          {graphLoading && <div style={{ fontSize: '12px', color: colors.textMuted }}>Loading flow…</div>}
          {graph && 'error' in graph && <div style={{ fontSize: '12px', color: colors.textMuted }}>{graph.error}</div>}
          {graph && 'managed' in graph && (
            <div style={{ fontSize: '12.5px', color: colors.textMuted, lineHeight: 1.6 }}>
              This automation runs inside the Montero platform itself (no external workflow).{' '}
              {graph.description || ''}
            </div>
          )}
          {graph && 'levels' in graph && (
            <FlowTree levels={graph.levels} edges={graph.edges || []} />
          )}
        </div>
      )}

      {/* Confirm turn-off dialog */}
      {confirmOff && (
        <div
          onClick={() => setConfirmOff(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '18px', padding: '24px',
              maxWidth: '420px', width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: colors.textDark, margin: '0 0 8px' }}>
              Turn off “{automation.friendly_name}”?
            </h3>
            <p style={{ fontSize: '13px', color: colors.textMuted, lineHeight: 1.6, margin: '0 0 6px' }}>
              While it&apos;s off, this automation stops completely — anything it normally handles won&apos;t happen until you turn it back on.
            </p>
            <p style={{ fontSize: '12.5px', color: colors.textMuted, lineHeight: 1.6, margin: '0 0 18px' }}>
              You can switch it back on anytime, and nothing already processed is affected.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmOff(false)}
                style={{ ...secondaryButton, fontSize: '13px', padding: '9px 16px' }}
              >
                Keep it running
              </button>
              <button
                onClick={() => { setConfirmOff(false); doToggle(false) }}
                style={{ ...gradientButton, fontSize: '13px', padding: '9px 16px', background: colors.error }}
              >
                Turn it off
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
