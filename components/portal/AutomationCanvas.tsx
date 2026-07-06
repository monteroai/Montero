'use client'

// n8n-style automation canvas v2.
// - Sequence-aware layout: automations are placed in columns by their order
//   in the operational flow (entry points left, follow-on steps right),
//   derived from live n8n handoff edges + curated flow hints.
// - Click a node → it EXPANDS IN PLACE on the canvas, revealing its
//   plain-English description, on/off control, and internal flow tree;
//   nodes below shift down to stay organized.
// - Drag to pan, scroll/buttons to zoom. Off requires confirmation.

import { useRef, useState, useCallback, useEffect } from 'react'
import { colors, gradientButton, secondaryButton } from '@/lib/portal/styles'
import { FlowTree, type Graph } from './AutomationRow'
import type { PortalAutomation } from '@/lib/portal/types'

export type MapNode = { id: string; name: string; category: string; channel: string; outputs: string[]; active: boolean; linked: boolean }
export type SystemMap = { nodes: MapNode[]; edges: Array<{ from: string; to: string; note?: string }> }

const CHANNEL_META: Record<string, { icon: string; color: string; blurb: string }> = {
  Phone: { icon: '☎', color: '#0891b2', blurb: 'calls in & out' },
  Website: { icon: '🌐', color: '#2563eb', blurb: 'forms & site visitors' },
  Chat: { icon: '💬', color: '#d97706', blurb: 'chat widget' },
  Email: { icon: '✉', color: '#64748b', blurb: 'inbound email' },
  Schedule: { icon: '◷', color: '#7c3aed', blurb: 'runs on a timer' },
  Internal: { icon: '⚙', color: '#475569', blurb: 'supports other automations' },
}
const OUTPUT_LABEL: Record<string, string> = { sms: 'SMS', email: 'email', calls: 'calls', ai: 'AI', data: 'records' }

const A_W = 235, A_H = 62, EXP_W = 340, EXP_H = 350
const CH_W = 165, CH_H = 54
const COL_SPACING = 130, ROW_GAP = 20, PAD = 40

type Rect = { x: number; y: number; w: number; h: number }
type Layout = {
  width: number
  height: number
  channels: Array<{ name: string; x: number; y: number }>
  nodes: Map<string, Rect>
}

// Column = longest-path depth from an entry node, so "what runs after what"
// reads left to right.
function computeDepths(map: SystemMap): Map<string, number> {
  const incoming = new Map<string, number>()
  map.nodes.forEach(n => incoming.set(n.id, 0))
  map.edges.forEach(e => incoming.set(e.to, (incoming.get(e.to) || 0) + 1))
  const depth = new Map<string, number>()
  map.nodes.forEach(n => { if ((incoming.get(n.id) || 0) === 0) depth.set(n.id, 0) })
  // relax edges (graph is small; iterate a few times, guard cycles)
  for (let pass = 0; pass < 8; pass++) {
    let changed = false
    for (const e of map.edges) {
      const d = (depth.get(e.from) ?? 0) + 1
      if (d > (depth.get(e.to) ?? 0) && d < 12) { depth.set(e.to, d); changed = true }
    }
    if (!changed) break
  }
  map.nodes.forEach(n => { if (!depth.has(n.id)) depth.set(n.id, 0) })
  return depth
}

function computeLayout(map: SystemMap, expandedId: string | null): Layout {
  const depths = computeDepths(map)
  const maxDepth = Math.max(...Array.from(depths.values()), 0)
  const channels = Array.from(new Set(map.nodes.map(n => n.channel)))
  const nodes = new Map<string, Rect>()

  const colX = (d: number) => PAD + CH_W + 90 + d * (A_W + COL_SPACING)
  const colCursor: number[] = new Array(maxDepth + 1).fill(PAD)
  const channelYs = new Map<string, number[]>()

  // Stack nodes per column; iterate channels in canonical order for stable,
  // grouped placement of the entry column.
  for (const ch of channels) {
    for (const n of map.nodes.filter(m => m.channel === ch)) {
      const d = depths.get(n.id) || 0
      const isExp = expandedId === n.id
      const w = isExp ? EXP_W : A_W
      const h = isExp ? EXP_H : A_H
      const y = colCursor[d]
      nodes.set(n.id, { x: colX(d), y, w, h })
      colCursor[d] = y + h + ROW_GAP
      if (d === 0) {
        if (!channelYs.has(ch)) channelYs.set(ch, [])
        channelYs.get(ch)!.push(y + h / 2)
      }
    }
  }

  const layoutChannels = channels
    .filter(ch => channelYs.has(ch))
    .map(ch => {
      const ys = channelYs.get(ch)!
      return { name: ch, x: PAD, y: ys.reduce((a, b) => a + b, 0) / ys.length - CH_H / 2 }
    })

  return {
    width: colX(maxDepth) + Math.max(A_W, expandedId ? EXP_W : A_W) + PAD,
    height: Math.max(...colCursor, PAD) + PAD,
    channels: layoutChannels,
    nodes,
  }
}

export function AutomationCanvas({ map, automations, onToggle, focusId }: {
  map: SystemMap
  automations: PortalAutomation[]
  onToggle: (id: string, active: boolean) => Promise<void>
  focusId?: string | null
}) {
  const byId = new Map(map.nodes.map(n => [n.id, n]))
  const autoById = new Map(automations.map(a => [a.id, a]))

  const [scale, setScale] = useState(0.85)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number; moved: boolean } | null>(null)

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [graphs, setGraphs] = useState<Record<string, Graph>>({})
  const [confirmOff, setConfirmOff] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [toggleError, setToggleError] = useState('')
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>(
    () => Object.fromEntries(map.nodes.map(n => [n.id, n.active]))
  )
  useEffect(() => {
    setActiveMap(Object.fromEntries(map.nodes.map(n => [n.id, n.active])))
  }, [map])

  const layout = computeLayout(map, expandedId)

  const expandNode = useCallback(async (id: string) => {
    setExpandedId(cur => (cur === id ? null : id))
    setToggleError('')
    if (!graphs[id]) {
      try {
        const r = await fetch(`/api/portal/automations/graph?automation_id=${id}`)
        const g = await r.json()
        setGraphs(prev => ({ ...prev, [id]: g }))
      } catch {
        setGraphs(prev => ({ ...prev, [id]: { error: 'Could not load the flow right now.' } }))
      }
    }
  }, [graphs])

  // Deep-link: /portal/automations?focus=<automation_id> opens that node
  useEffect(() => {
    if (focusId && byId.has(focusId)) expandNode(focusId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId])

  const zoomBy = useCallback((f: number) => setScale(s => Math.min(1.8, Math.max(0.35, s * f))), [])

  function onWheel(e: React.WheelEvent) { e.preventDefault(); zoomBy(e.deltaY < 0 ? 1.1 : 0.9) }
  function onPointerDown(e: React.PointerEvent) {
    dragRef.current = { startX: e.clientX, startY: e.clientY, baseX: offset.x, baseY: offset.y, moved: false }
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    if (Math.abs(dx) + Math.abs(dy) > 4) dragRef.current.moved = true
    setOffset({ x: dragRef.current.baseX + dx, y: dragRef.current.baseY + dy })
  }
  function onPointerUp() { dragRef.current = null }

  async function doToggle(id: string, next: boolean) {
    setToggling(true)
    setToggleError('')
    try {
      await onToggle(id, next)
      setActiveMap(m => ({ ...m, [id]: next }))
    } catch {
      setToggleError(`Couldn't ${next ? 'turn on' : 'turn off'} this automation — nothing was changed.`)
    }
    setToggling(false)
  }

  const expNode = expandedId ? byId.get(expandedId) : null
  const btn: React.CSSProperties = {
    width: '32px', height: '32px', borderRadius: '9px', border: `1px solid ${colors.border}`,
    background: '#fff', cursor: 'pointer', fontSize: '15px', color: colors.textDark,
  }

  return (
    <div style={{ position: 'relative', height: '580px', borderRadius: '14px', overflow: 'hidden', background: '#f6f8fb', border: `1px solid ${colors.border}` }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle 1px at center, #d3dae6 1px, transparent 1px)',
        backgroundSize: `${22 * scale}px ${22 * scale}px`,
        backgroundPosition: `${offset.x}px ${offset.y}px`,
      }} />

      <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 20, display: 'flex', gap: '6px' }}>
        <button style={btn} onClick={() => zoomBy(1.15)} aria-label="Zoom in">＋</button>
        <button style={btn} onClick={() => zoomBy(0.87)} aria-label="Zoom out">－</button>
        <button style={{ ...btn, width: 'auto', padding: '0 10px', fontSize: '11px' }} onClick={() => { setScale(0.85); setOffset({ x: 0, y: 0 }) }}>Reset</button>
      </div>
      <div style={{ position: 'absolute', bottom: '10px', left: '12px', zIndex: 20, fontSize: '10.5px', color: colors.textLight }}>
        left to right = the order things run · drag to move · scroll to zoom · click a node to open it
      </div>

      <div
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ position: 'absolute', inset: 0, cursor: 'grab', touchAction: 'none' }}
      >
        <div style={{
          position: 'absolute', left: 0, top: 0,
          width: `${layout.width}px`, height: `${layout.height}px`,
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}>
          <svg width={layout.width} height={layout.height} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {/* channel stems into entry-column nodes */}
            {map.nodes.map(n => {
              const r = layout.nodes.get(n.id)
              const ch = layout.channels.find(c => c.name === n.channel)
              const hasIncoming = map.edges.some(e => e.to === n.id)
              if (!r || !ch || hasIncoming) return null
              const x1 = ch.x + CH_W, y1 = ch.y + CH_H / 2
              const x2 = r.x, y2 = r.y + Math.min(r.h, A_H) / 2
              const midX = (x1 + x2) / 2
              return <path key={`s${n.id}`} d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`} fill="none" stroke="#c3cbd9" strokeWidth="1.75" />
            })}
            {/* sequence edges between automations */}
            {map.edges.map((e, i) => {
              const from = layout.nodes.get(e.from)
              const to = layout.nodes.get(e.to)
              if (!from || !to) return null
              const x1 = from.x + from.w, y1 = from.y + Math.min(from.h, A_H) / 2
              const x2 = to.x, y2 = to.y + Math.min(to.h, A_H) / 2
              const midX = (x1 + x2) / 2
              // Stagger label heights so crossing edges don't overprint each
              // other; halo stroke keeps them readable over lines; hide when
              // zoomed out (they'd be unreadable soup at small scales).
              const labelY = (y1 + y2) / 2 - 8 + ((i % 3) - 1) * 16
              return (
                <g key={`e${i}`}>
                  <path d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`} fill="none" stroke="#8b5cf6" strokeWidth="1.75" opacity="0.55" />
                  <circle cx={x2 - 3} cy={y2} r="3" fill="#8b5cf6" opacity="0.7" />
                  {e.note && scale >= 0.7 && (
                    <text
                      x={midX} y={labelY} textAnchor="middle" fontSize="9.5"
                      fill="#7c3aed" stroke="#f6f8fb" strokeWidth="3.5"
                      style={{ paintOrder: 'stroke' }}
                    >
                      {e.note}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>

          {layout.channels.map(ch => {
            const meta = CHANNEL_META[ch.name] || CHANNEL_META.Internal
            return (
              <div key={ch.name} style={{
                position: 'absolute', left: `${ch.x}px`, top: `${ch.y}px`, width: `${CH_W}px`, height: `${CH_H}px`,
                background: '#fff', border: `1px solid ${colors.border}`, borderLeft: `4px solid ${meta.color}`,
                borderRadius: '12px', padding: '8px 12px', boxSizing: 'border-box',
              }}>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: colors.textDark }}>{meta.icon} {ch.name}</div>
                <div style={{ fontSize: '10px', color: colors.textLight }}>{meta.blurb}</div>
              </div>
            )
          })}

          {map.nodes.map(n => {
            const r = layout.nodes.get(n.id)
            if (!r) return null
            const isActive = Boolean(activeMap[n.id])
            const isExp = expandedId === n.id
            const auto = autoById.get(n.id)
            const graph = graphs[n.id]
            return (
              <div
                key={n.id}
                onClick={e => { e.stopPropagation(); if (!dragRef.current?.moved && !isExp) expandNode(n.id) }}
                onPointerDown={e => e.stopPropagation()}
                style={{
                  position: 'absolute', left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px`,
                  background: '#fff', borderRadius: '12px', boxSizing: 'border-box',
                  border: isExp ? `2px solid ${colors.blue}` : `1px solid ${colors.border}`,
                  boxShadow: isExp ? '0 8px 28px rgba(37,99,235,0.16)' : '0 1px 4px rgba(0,0,0,0.05)',
                  opacity: isActive || isExp ? 1 : 0.62,
                  cursor: isExp ? 'default' : 'pointer',
                  transition: 'width 0.15s, height 0.15s',
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '9px 12px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '999px', flexShrink: 0, background: isActive ? colors.success : '#cbd5e1' }} />
                  <span style={{ flex: 1, fontSize: '12px', fontWeight: 700, color: colors.textDark, lineHeight: 1.25, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {n.name}
                  </span>
                  {isExp && (
                    <button onClick={e => { e.stopPropagation(); setExpandedId(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, fontSize: '13px' }}>✕</button>
                  )}
                </div>

                {!isExp && (
                  <div style={{ padding: '0 12px', fontSize: '10px', color: colors.textLight }}>
                    {isActive ? 'running' : 'off'}{n.outputs.length > 0 ? ` · ${n.outputs.map(o => OUTPUT_LABEL[o] || o).join(', ')}` : ''}{!n.linked ? ' · setup pending' : ''}
                  </div>
                )}

                {isExp && (
                  <div style={{ padding: '0 12px 12px', height: `${EXP_H - 46}px`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {auto?.description && (
                      <p style={{ fontSize: '11px', color: colors.textMuted, lineHeight: 1.5, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        {auto.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={e => { e.stopPropagation(); isActive ? setConfirmOff(true) : doToggle(n.id, true) }}
                        disabled={toggling}
                        style={{ ...(isActive ? secondaryButton : gradientButton), fontSize: '11px', padding: '6px 12px', opacity: toggling ? 0.5 : 1 }}
                      >
                        {toggling ? 'Working…' : isActive ? 'Turn off' : 'Turn on'}
                      </button>
                      <span style={{ fontSize: '10.5px', fontWeight: 600, color: isActive ? colors.success : colors.textLight }}>
                        {isActive ? '● running' : '○ off'}
                      </span>
                    </div>
                    {toggleError && <p style={{ fontSize: '10.5px', color: colors.error, margin: 0 }}>{toggleError}</p>}
                    <div style={{ flex: 1, overflow: 'auto', borderTop: `1px dashed ${colors.border}`, paddingTop: '8px' }}>
                      {!graph && <div style={{ fontSize: '11px', color: colors.textMuted }}>Loading flow…</div>}
                      {graph && 'error' in graph && <div style={{ fontSize: '11px', color: colors.textMuted }}>{graph.error}</div>}
                      {graph && 'managed' in graph && (
                        <div style={{ fontSize: '11px', color: colors.textMuted, lineHeight: 1.5 }}>
                          Runs inside the Montero platform itself. {graph.description || ''}
                        </div>
                      )}
                      {graph && 'levels' in graph && <FlowTree levels={graph.levels} edges={graph.edges || []} />}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {confirmOff && expNode && (
        <div
          onClick={() => setConfirmOff(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '18px', padding: '24px', maxWidth: '420px', width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: colors.textDark, margin: '0 0 8px' }}>Turn off “{expNode.name}”?</h3>
            <p style={{ fontSize: '13px', color: colors.textMuted, lineHeight: 1.6, margin: '0 0 18px' }}>
              While it&apos;s off, this automation stops completely until you turn it back on. Nothing already processed is affected.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmOff(false)} style={{ ...secondaryButton, fontSize: '13px', padding: '9px 16px' }}>Keep it running</button>
              <button onClick={() => { setConfirmOff(false); doToggle(expNode.id, false) }} style={{ ...gradientButton, fontSize: '13px', padding: '9px 16px', background: colors.error }}>Turn it off</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
