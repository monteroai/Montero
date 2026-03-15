import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let dna: any = null

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient()
      const { data } = await supabase
        .from('agent_dna')
        .select('*')
        .eq('org_slug', 'magyar')
        .single()
      dna = data
    } catch {
      // Supabase not available
    }
  }

  const fields = dna
    ? [
        { label: 'Agent Name', value: dna.agent_name },
        { label: 'Brokerage', value: dna.brokerage },
        { label: 'Market Area', value: dna.market_area },
        { label: 'Specialty', value: dna.specialty },
        { label: 'Price Range', value: dna.price_range_min && dna.price_range_max
            ? `$${Number(dna.price_range_min).toLocaleString()} – $${Number(dna.price_range_max).toLocaleString()}`
            : '—' },
        { label: 'Brand Voice', value: dna.brand_voice },
        { label: 'Target Client', value: dna.target_client },
        { label: 'Neighborhoods', value: dna.neighborhoods?.join(', ') || '—' },
        { label: 'Languages', value: dna.languages?.join(', ') || '—' },
        { label: 'Onboarding Complete', value: dna.onboarding_complete ? 'Yes' : 'No' },
      ]
    : []

  const navy = '#1B2B5E'
  const blue = '#2563eb'
  const textDark = '#1e293b'
  const textMuted = '#64748b'
  const border = '#e2e8f0'

  return (
    <div style={{ padding: '32px', maxWidth: '640px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: navy, marginBottom: '4px' }}>Agent Settings</h1>
        <p style={{ fontSize: '14px', color: textMuted }}>DNA profile powering all content generation.</p>
      </div>

      {!dna ? (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px', fontSize: '14px', color: '#92400e' }}>
          No agent DNA found. Run the onboarding webhook to initialize your profile.
        </div>
      ) : (
        <>
          {dna.dna_summary && (
            <div style={{ background: '#ffffff', border: `1px solid ${border}`, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '11px', fontWeight: 600, color: blue, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>DNA Summary</h2>
              <p style={{ fontSize: '14px', color: textDark, lineHeight: 1.7 }}>{dna.dna_summary}</p>
            </div>
          )}

          <div style={{ background: '#ffffff', border: `1px solid ${border}`, borderRadius: '12px', overflow: 'hidden' }}>
            {fields.map(({ label, value }, i) => (
              <div key={label} style={{ padding: '14px 20px', display: 'flex', gap: '16px', borderBottom: i < fields.length - 1 ? `1px solid ${border}` : 'none' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: textMuted, width: '140px', flexShrink: 0, paddingTop: '2px' }}>{label}</span>
                <span style={{ fontSize: '14px', color: textDark }}>{value || '—'}</span>
              </div>
            ))}
          </div>

          <p style={{ marginTop: '16px', fontSize: '12px', color: '#94a3b8' }}>
            Last updated: {dna.updated_at ? new Date(dna.updated_at).toLocaleDateString() : '—'}
            {' · '}DNA ID: <span style={{ fontFamily: 'monospace' }}>{dna.id?.slice(0, 8)}...</span>
          </p>
        </>
      )}
    </div>
  )
}
