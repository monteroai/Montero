// Thin-line SVG icons for interaction types — replaces the emoji set.
// Inherit color via currentColor; sized for the 28px icon chip.

const P = {
  strokeWidth: 1.7,
  stroke: 'currentColor',
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function InteractionIcon({ type, size = 15 }: { type: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24' }
  switch (type) {
    case 'call':
      return (
        <svg {...common}>
          <path {...P} d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      )
    case 'email':
      return (
        <svg {...common}>
          <rect {...P} x="2" y="4" width="20" height="16" rx="3" />
          <path {...P} d="m3 6 9 7 9-7" />
        </svg>
      )
    case 'chat':
      return (
        <svg {...common}>
          <path {...P} d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      )
    case 'form':
    default:
      return (
        <svg {...common}>
          <path {...P} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path {...P} d="M14 2v6h6M9 13h6M9 17h4" />
        </svg>
      )
  }
}
