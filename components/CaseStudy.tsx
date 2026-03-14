const deliverables = [
  {
    title: 'Weekly market dashboard',
    description: 'Automatic contract data, price trends, and days-on-market stats published every Monday.',
  },
  {
    title: 'Agent OS remarks generator',
    description: 'AI-written MLS remarks generated from listing photos in the agent\'s voice.',
  },
  {
    title: 'Seller presentation package',
    description: 'Branded one-page property sites deployed in seconds from a single form submission.',
  },
  {
    title: 'District intelligence',
    description: 'Neighborhood breakdowns for buyer consultations — comps, trends, and talking points ready.',
  },
]

export function CaseStudy() {
  return (
    <section
      id="case-study"
      style={{
        padding: '100px 24px',
        background: '#0A0D14',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '64px' }}>
          <div style={{
            display: 'inline-block',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#C9A84C',
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '100px',
            padding: '4px 12px',
            marginBottom: '20px',
          }}>
            Case Study
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>
            The Magyar Report
          </h2>
          <p style={{ fontSize: '16px', color: '#8B95A9', lineHeight: 1.6 }}>
            A live real estate intelligence platform for the Magyar Team, Greenwich CT.
          </p>
        </div>

        {/* Two-column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '60px',
          alignItems: 'center',
        }}>
          {/* Left: deliverables */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {deliverables.map((item, i) => (
                <div key={item.title} style={{ display: 'flex', gap: '16px' }}>
                  <div style={{
                    flexShrink: 0,
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(79,110,247,0.15)',
                    border: '1px solid rgba(79,110,247,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#4F6EF7',
                    marginTop: '2px',
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '14px', color: '#8B95A9', lineHeight: 1.6 }}>
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '40px' }}>
              <a
                href="https://themagyarreport.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '14px', color: '#4F6EF7', textDecoration: 'underline' }}
              >
                View live: themagyarreport.com
              </a>
              <p style={{ fontSize: '12px', color: '#4B5563', marginTop: '8px', letterSpacing: '0.02em' }}>
                Built in 6 weeks · 35+ routes · Supabase · Vercel · Next.js 14
              </p>
            </div>
          </div>

          {/* Right: browser mockup */}
          <div style={{
            border: '1px solid rgba(79,110,247,0.2)',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#161B27',
          }}>
            {/* Browser chrome */}
            <div style={{
              padding: '12px 16px',
              background: '#1E2433',
              borderBottom: '1px solid rgba(79,110,247,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3A3F4B' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3A3F4B' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3A3F4B' }} />
              <div style={{
                marginLeft: '12px',
                flex: 1,
                background: '#0F1117',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '11px',
                color: '#4B5563',
              }}>
                themagyarreport.com
              </div>
            </div>

            {/* Mock content */}
            <div style={{ padding: '32px 28px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                marginBottom: '8px',
              }}>
                Greenwich CT
              </div>
              <div style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#FFFFFF',
                fontFamily: 'Georgia, serif',
                marginBottom: '4px',
              }}>
                The Magyar Report
              </div>
              <div style={{ fontSize: '12px', color: '#8B95A9', marginBottom: '28px' }}>
                Weekly Market Intelligence
              </div>

              {/* Fake stat bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Contracts Signed', value: 78, color: '#4F6EF7' },
                  { label: 'Median Price / sqft', value: 62, color: '#C9A84C' },
                  { label: 'Avg Days on Market', value: 45, color: '#4F6EF7' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#8B95A9' }}>{stat.label}</span>
                    </div>
                    <div style={{
                      height: '4px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${stat.value}%`,
                        background: stat.color,
                        borderRadius: '2px',
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: '24px',
                padding: '12px',
                background: 'rgba(79,110,247,0.06)',
                border: '1px solid rgba(79,110,247,0.12)',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#8B95A9',
                lineHeight: 1.6,
              }}>
                Weekly update · Published every Monday · Data sourced from MLS
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
