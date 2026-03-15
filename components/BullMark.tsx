interface BullMarkProps {
  size?: number
  opacity?: number
  className?: string
}

export function BullMark({ size = 40, opacity = 1, className }: BullMarkProps) {
  const s = size
  return (
    <svg
      viewBox="-8 -8 216 216"
      width={s}
      height={s}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity, display: 'block', flexShrink: 0 }}
      className={className}
    >
      <defs>
        <linearGradient id="bullG" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffd470" />
          <stop offset="55%" stopColor="#ffa600" />
          <stop offset="100%" stopColor="#b87400" />
        </linearGradient>
      </defs>

      <path d="M 70,67 C 57,50 34,22 47,5 C 53,-1 64,9 73,43 L 74,55"
            stroke="url(#bullG)" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M 130,67 C 143,50 166,22 153,5 C 147,-1 136,9 127,43 L 126,55"
            stroke="url(#bullG)" strokeWidth="5.5" strokeLinecap="round" />

      <path d="M 100,60 C 87,60 75,64 68,71 C 57,78 51,93 50,108 C 48,123 51,138 57,150 C 65,164 80,173 100,174 C 120,173 135,164 143,150 C 149,138 152,123 150,108 C 149,93 143,78 132,71 C 125,64 113,60 100,60 Z"
            stroke="url(#bullG)" strokeWidth="4.5" />

      <path d="M 63,83 C 44,77 38,97 50,104"
            stroke="url(#bullG)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 137,83 C 156,77 162,97 150,104"
            stroke="url(#bullG)" strokeWidth="3.5" strokeLinecap="round" />

      <path d="M 88,65 C 72,59 54,54 42,63"
            stroke="#ffa600" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      <path d="M 86,74 C 67,68 48,70 40,82"
            stroke="#ffa600" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      <path d="M 84,83 C 66,79 50,83 44,95"
            stroke="#ffa600" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />

      <path d="M 75,101 C 78,95 88,94 91,101 C 88,107 78,107 75,101 Z"
            stroke="url(#bullG)" strokeWidth="2.5" fill="rgba(255,166,0,0.1)" />
      <path d="M 109,101 C 112,95 122,94 125,101 C 122,107 112,107 109,101 Z"
            stroke="url(#bullG)" strokeWidth="2.5" fill="rgba(255,166,0,0.1)" />

      <line x1="100" y1="76" x2="100" y2="138" stroke="rgba(255,166,0,0.15)" strokeWidth="1.5" />

      <ellipse cx="100" cy="156" rx="24" ry="15"
               stroke="url(#bullG)" strokeWidth="3.5" fill="rgba(255,166,0,0.04)" />
      <ellipse cx="90" cy="156" rx="6.5" ry="5.5"
               stroke="url(#bullG)" strokeWidth="2" fill="rgba(255,166,0,0.1)" />
      <ellipse cx="110" cy="156" rx="6.5" ry="5.5"
               stroke="url(#bullG)" strokeWidth="2" fill="rgba(255,166,0,0.1)" />
    </svg>
  )
}
