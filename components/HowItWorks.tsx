const steps = [
  {
    number: '01',
    title: 'Build your DNA profile',
    body: 'Tell us your voice, your market, and your tone. Takes 5 minutes once. Every piece of content after that sounds like you.',
  },
  {
    number: '02',
    title: 'Upload your listing',
    body: 'Drop your photos and the address. Agent OS reads every room, identifies features, and pulls context from the listing automatically.',
  },
  {
    number: '03',
    title: 'Get your full package',
    body: 'MLS remarks, Instagram caption, SMS teaser, email, and a live presentation website — all ready in under 60 seconds.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '100px 24px', background: '#0A0D14' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '72px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
            How it works
          </h2>
          <p style={{ fontSize: '16px', color: '#8B95A9', lineHeight: 1.6 }}>
            From zero to published in three steps.
          </p>
        </div>

        {/* Steps */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '40px',
        }}>
          {steps.map((step) => (
            <div key={step.number} style={{ position: 'relative', padding: '8px 0' }}>
              {/* Watermark number */}
              <div style={{
                position: 'absolute',
                top: '-8px',
                left: '-4px',
                fontSize: '80px',
                fontWeight: 800,
                color: 'rgba(79,110,247,0.07)',
                lineHeight: 1,
                userSelect: 'none',
                letterSpacing: '-0.04em',
              }}>
                {step.number}
              </div>
              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1, paddingTop: '48px' }}>
                <div style={{
                  display: 'inline-block',
                  fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
                  color: '#4F6EF7', marginBottom: '12px',
                }}>
                  STEP {step.number}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#8B95A9', lineHeight: 1.7 }}>
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
