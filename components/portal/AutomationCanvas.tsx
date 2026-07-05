'use client'

// n8n-style automation canvas: the whole system as one zoomable, pannable
// map. Entry channels (Phone / Website / Chat / Schedule / Internal) branch
// left-to-right into automation nodes; cross-workflow handoffs draw as
// dashed purple curves. Click a node → detail panel with plain-English
// explanation, the internal flow tree, and the on/off toggle (off requires
// confirmation).

import { useRef, useState, useCallback, useEffect } from 'react'
import { colors, gradientButton, secondaryButton } from '@/lib/portal/styles'
import { FlowTree, type Graph } from './AutomationRow'
import type { PortalAutomation } from '@/lib/portal/types'

export type MapNode = { id: string; name: string; category: string; channel: string; outputs: string[]; active: boolean; linked: boolean }
export type SystemMap = { nodes: MapNode[]; edges: Array<{ from: string; to: string }> }

const CHANNEL_META: Record<string, { icon: string; color: string; blurb: string }> = {
  Phone: { icon: '☎', color: '#0891b2', blurb: 'calls in & out' },
  Website: { icon: '🌐', color: '#2563eb', blurb: 'forms & site visitors' },
  Chat: { icon: '💬', color: '#d97706', blurb: 'chat widget' },
  Email: { icon: '✉', color: '#64748b', blurb: 'inbound email' },
  Schedule: { icon: '◷', color: '#7c3aed', blurb: 'runs on a timer' },
  Internal: { icon: '⚙', color: '#475569', blurb: 'supports other automations' },
}
const OUTPUT_LABEL: Record<string, string> = { sms: 'SMS', email: 'email', calls: 'calls', ai: 'AI', data: 'records' }

// Layout constants (canvas coordinates, pre-zoom)
const CH_W = 170, CH_H = 54, A_W = 235, A_H = 62, COL_GAP = 110, ROW_GAP = 18, GROUP_GAP = 44, PAD = 40

type Layout = {
  width: number
  height: number
  channels: Array<{ name: string; x: number; y: number }>
  nodes: Map<string, { x: number; y: number }>
}

function computeLayout(map: SystemMap): Layout {
  const channels = Array.from(new Set(map.nodes.map(n => n.channel)))
  const layoutChannels: Layout['channels'] = []
  const nodePos = new Map<string, { x: number; y: number }>()
  let y = PAD
  for (const ch of channels) {
    const members = map.nodes.filter(n => n.channel === ch)
    const groupHeight = members.length * A_H + (members.length - 1) * ROW_GAP
    layoutChannels.push({ name: ch, x: PAD, y: y + groupHeight / 2 - CH_H / 2 })
    members.forEach((m, i) => {
      nodePos.set(m.id, { x: PAD + CH_W + COL_GAP, y: y + i * (A_H + ROW_GAP) })
    })
    y += groupHeight + GROUP_GAP
  }
  return {
    width: PAD + CH_W + COL_GAP + A_W + PAD,
    height: y - GROUP_GAP + PAD,
    channels: layoutChannels,
    nodes: nodePos,
  }
}

export function AutomationCanvas({ map, automations, onToggle }: {
  map: SystemMap
  automations: PortalAutomation[]
  onToggle: (id: string, active: boolean) => Promise<void>
}) {
  const layout = computeLayout(map)
  const byId = new Map(map.nodes.map(n => [n.id, n]))
  const autoById = new Map(automations.map(a => [a.id, a]))

  // Pan + zoom state
  const [scale, setScale] = useState(0.9)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null)
  const viewportRef = useRef<HTMLDivElement>(null)

  // Selected node detail panel
  const [selected, setSelected] = useState<string | null>(null)
  const [graph, setGraph] = useState<Graph | null>(null)
  const [graphLoading, setGraphLoading] = useState(false)
  const [confirmOff, setConfirmOff] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [toggleError, setToggleError] = useState('')
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>(
    () => Object.fromEntries(map.nodes.map(n => [n.id, n.active]))
  )
  useEffect(() => {
    setActiveMap(Object.fromEntries(map.nodes.map(n => [n.id, n.active])))
  }, [map])

  const zoomBy = useCallback((factor: number) => {
    setScale(s => Math.min(1.8, Math.max(0.35, s * factor)))
  }, [])

  function onWheel(e: React.WheelEvent) {
    e.preventDefault()
    zoomBy(e.deltaY < 0 ? 1.1 : 0.9)
  }
  function onPointerDown(e: React.PointerEvent) {
    dragRef.current = { startX: e.clientX, startY: e.clientY, baseX: offset.x, baseY: offset.y }
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return
    setOffset({
      x: dragRef.current.baseX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.baseY + (e.clientY - dragRef.current.startY),
    })
  }
  function onPointerUp() { dragRef.current = null }

  async function selectNode(id: string) {
    setSelected(id)
    setGraph(null)
    setToggleError('')
    setGraphLoading(true)
    try {
      const r = await fetch(`/api/portal/automations/graph?automation_id=${id}`)
      setGraph(await r.json())
    } catch {
      setGraph({ error: 'Could not load the flow right now.' })
    } finally {
      setGraphLoading(false)
    }
  }

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

  const sel = selected ? byId.get(selected) : null
  const selAuto = selected ? autoById.get(selected) : null
  const selActive = selected ? Boolean(activeMap[selected]) : false

  const btn: React.CSSProperties = {
    width: '32px', height: '32px', borderRadius: '9px', border: `1px solid ${colors.border}`,
    background: '#fff', cursor: 'pointer', fontSize: '15px', color: colors.textDark,
  }

  return (
    <div style={{ position: 'relative', height: '560px', borderRadius: '14px', overflow: 'hidden', background: '#f6f8fb', border: `1px solid ${colors.border}` }}>
      {/* dot grid backdrop, n8n-style */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle 1px at center, #d3dae6 1px, transparent 1px)',
        backgroundSize: `${22 * scale}px ${22 * scale}px`,
        backgroundPosition: `${offset.x}px ${offset.y}px`,
      }} />

      {/* zoom controls */}
      <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 20, display: 'flex', gap: '6px' }}>
        <button style={btn} onClick={() => zoomBy(1.15)} aria-label="Zoom in">＋</button>
        <button style={btn} onClick={() => zoomBy(0.87)} aria-label="Zoom out">－</button>
        <button style={{ ...btn, width: 'auto', padding: '0 10px', fontSize: '11px' }} onClick={() => { setScale(0.9); setOffset({ x: 0, y: 0 }) }}>Reset</button>
      </div>
      <div style={{ position: 'absolute', bottom: '10px', left: '12px', zIndex: 20, fontSize: '10.5px', color: colors.textLight }}>
        drag to move · scroll to zoom · click a node for details
      </div>

      {/* pannable viewport */}
      <div
        ref={viewportRef}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ position: 'absolute', inset: 0, cursor: dragRef.current ? 'grabbing' : 'grab', touchAction: 'none' }}
      >
        <div style={{
          position: 'absolute', left: 0, top: 0,
          width: `${layout.width}px`, height: `${layout.height}px`,
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}>
          {/* connector lines */}
          <svg width={layout.width} height={layout.height} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {/* channel → automation stems */}
            {map.nodes.map(n => {
              const p = layout.nodes.get(n.id)
              const ch = layout.channels.find(c => c.name === n.channel)
              if (!p || !ch) return null
              const x1 = ch.x + CH_W, y1 = ch.y + CH_H / 2
              const x2 = p.x, y2 = p.y + A_H / 2
              const midX = (x1 + x2) / 2
              return <path key={`s${n.id}`} d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`} fill="none" stroke="#c3cbd9" strokeWidth="1.75" />
            })}
            {/* cross-workflow handoffs */}
            {map.edges.map((e, i) => {
              const from = layout.nodes.get(e.from)
              const to = layout.nodes.get(e.to)
              if (!from || !to) return null
              const x1 = from.x + A_W, y1 = from.y + A_H / 2
              const x2 = to.x + A_W, y2 = to.y + A_H / 2
              const bow = 60 + Math.abs(y2 - y1) * 0.15
              return <path key={`e${i}`} d={`M ${x1} ${y1} C ${x1 + bow} ${y1}, ${x2 + bow} ${y2}, ${x2} ${y2}`} fill="none" stroke="#8b5cf6" strokeWidth="1.75" strokeDasharray="5 4" />
            })}
          </svg>

          {/* channel roots */}
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

          {/* automation nodes */}
          {map.nodes.map(n => {
            const p = layout.nodes.get(n.id)
            if (!p) return null
            const isActive = Boolean(activeMap[n.id])
            const isSel = selected === n.id
            return (
              <div
                key={n.id}
                onClick={e => { e.stopPropagation(); selectNode(n.id) }}
                onPointerDown={e => e.stopPropagation()}
                style={{
                  position: 'absolute', left: `${p.x}px`, top: `${p.y}px`, width: `${A_W}px`, height: `${A_H}px`,
                  background: '#fff', borderRadius: '12px', boxSizing: 'border-box', padding: '9px 12px',
                  border: isSel ? `2px solid ${colors.blue}` : `1px solid ${colors.border}`,
                  boxShadow: isSel ? '0 4px 18px rgba(37,99,235,0.18)' : '0 1px 4px rgba(0,0,0,0.05)',
                  opacity: isActive ? 1 : 0.62, cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{
                    width: '8px', height: '8px', borderRadius: '999px', flexShrink: 0,
                    background: isActive ? colors.success : '#cbd5e1',
                  }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: colors.textDark, lineHeight: 1.25, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {n.name}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: colors.textLight, marginTop: '4px' }}>
                  {isActive ? 'running' : 'off'}{n.outputs.length > 0 ? ` · ${n.outputs.map(o => OUTPUT_LABEL[o] || o).join(', ')}` : ''}{!n.linked ? ' · setup pending' : ''}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* detail panel */}
      {sel && (
        <div
          onPointerDown={e => e.stopPropagation()}
          style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(360px, 92%)', zIndex: 30,
            background: 'rgba(255,255,255,0.97)', borderLeft: `1px solid ${colors.border}`,
            padding: '16px', overflowY: 'auto', boxShadow: '-8px 0 24px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: colors.navy }}>{sel.name}</div>
              <div style={{ fontSize: '11px', color: colors.textLight, marginTop: '2px' }}>
                starts from: {sel.channel}{sel.outputs.length > 0 ? ` · produces: ${sel.outputs.map(o => OUTPUT_LABEL[o] || o).join(', ')}` : ''}
              </div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', color: colors.textMuted }}>✕</button>
          </div>

          {selAuto?.description && (
            <p style={{ fontSize: '12.5px', color: colors.textMuted, lineHeight: 1.6, margin: '10px 0 0' }}>{selAuto.description}</p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0 0' }}>
            <button
              onClick={() => selActive ? setConfirmOff(true) : doToggle(sel.id, true)}
              disabled={toggling}
              style={{ ...(selActive ? secondaryButton : gradientButton), fontSize: '12px', padding: '8px 14px', opacity: toggling ? 0.5 : 1 }}
            >
              {toggling ? 'Working…' : selActive ? 'Turn off' : 'Turn on'}
            </button>
            <span style={{ fontSize: '11.5px', color: selActive ? colors.success : colors.textLight, fontWeight: 600 }}>
              {selActive ? '● running' : '○ off'}
            </span>
          </div>
          {toggleError && <p style={{ fontSize: '11.5px', color: colors.error, margin: '8px 0 0' }}>{toggleError}</p>}

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: `1px dashed ${colors.border}` }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.textLight, marginBottom: '10px' }}>
              Inside this automation
            </div>
            {graphLoading && <div style={{ fontSize: '12px', color: colors.textMuted }}>Loading flow…</div>}
            {graph && 'error' in graph && <div style={{ fontSize: '12px', color: colors.textMuted }}>{graph.error}</div>}
            {graph && 'managed' in graph && (
              <div style={{ fontSize: '12px', color: colors.textMuted, lineHeight: 1.6 }}>
                Runs inside the Montero platform itself. {graph.description || ''}
              </div>
            )}
            {graph && 'levels' in graph && <FlowTree levels={graph.levels} edges={graph.edges || []} />}
          </div>
        </div>
      )}

      {/* confirm turn-off */}
      {confirmOff && sel && (
        <div
          onClick={() => setConfirmOff(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '18px', padding: '24px', maxWidth: '420px', width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: colors.textDark, margin: '0 0 8px' }}>Turn off “{sel.name}”?</h3>
            <p style={{ fontSize: '13px', color: colors.textMuted, lineHeight: 1.6, margin: '0 0 18px' }}>
              While it&apos;s off, this automation stops completely until you turn it back on. Nothing already processed is affected.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmOff(false)} style={{ ...secondaryButton, fontSize: '13px', padding: '9px 16px' }}>Keep it running</button>
              <button onClick={() => { setConfirmOff(false); doToggle(sel.id, false) }} style={{ ...gradientButton, fontSize: '13px', padding: '9px 16px', background: colors.error }}>Turn it off</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
