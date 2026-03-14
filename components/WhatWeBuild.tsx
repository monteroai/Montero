const cards = [
  {
    label: 'AI Content Tools',
    title: 'AI Content Tools',
    body: 'Upload listing photos and get MLS remarks, Instagram captions, SMS teasers, and email content — all written in the agent\'s own voice. No editing required.',
  },
  {
    label: 'Listing Presentations',
    title: 'Listing Presentations',
    body: 'We generate branded seller presentation websites from a single form. Address, photos, and agent info in. Live URL out. Clients see a property site that looks like it took a week to build.',
  },
  {
    label: 'Market Intelligence',
    title: 'Market Intelligence',
    body: 'Weekly contract data, price-per-square-foot trends, and neighborhood breakdowns published automatically. Agents who lead with data win more listings.',
  },
]

export function WhatWeBuild() {
  return (
    <section
      id="what-we-build"
      style={{
        padding: '100px 24px',
        background: '#0F1117',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
            What we build
          </h2>
          <p style={{ fontSize: '16px', color: '#8B95A9', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
            Purpose-built tools that replace the manual work between listing and closing.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {cards.map((card) => (
            <div
              key={card.label}
              style={{
                background: '#161B27',
                border: '1px solid rgba(79,110,247,0.15)',
                borderLeft: '3px solid #4F6EF7',
                borderRadius: '12px',
                padding: '28px 24px',
              }}
            >
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                marginBottom: '12px',
              }}>
                {card.label}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>
                {card.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#8B95A9', lineHeight: 1.7 }}>
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
