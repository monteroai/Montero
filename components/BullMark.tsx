interface BullMarkProps {
  size?: number
  opacity?: number
  className?: string
}

export function BullMark({ size = 40, opacity = 1, className }: BullMarkProps) {
  return (
    <svg
      viewBox="0 0 120 100"
      width={size}
      height={size * (100 / 120)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity, display: 'block', flexShrink: 0 }}
      className={className}
    >
      <defs>
        <linearGradient id="bullG" x1="0" y1="0" x2="120" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e8c774" />
          <stop offset="50%" stopColor="#d4a24a" />
          <stop offset="100%" stopColor="#a07830" />
        </linearGradient>
      </defs>

      {/* Left horn — wide sweep upward and outward */}
      <path
        d="M 38,42 C 30,32 18,14 8,6 C 4,3 2,6 4,12 C 8,22 22,34 34,42"
        stroke="url(#bullG)" strokeWidth="3.5" strokeLinecap="round"
      />
      {/* Right horn — mirror */}
      <path
        d="M 82,42 C 90,32 102,14 112,6 C 116,3 118,6 116,12 C 112,22 98,34 86,42"
        stroke="url(#bullG)" strokeWidth="3.5" strokeLinecap="round"
      />

      {/* Head — broad, angular bull face */}
      <path
        d="M 34,42 C 30,46 26,54 28,64 C 30,74 38,82 46,86 C 50,88 54,90 60,90 C 66,90 70,88 74,86 C 82,82 90,74 92,64 C 94,54 90,46 86,42 C 80,38 70,36 60,36 C 50,36 40,38 34,42 Z"
        stroke="url(#bullG)" strokeWidth="3" fill="none"
      />

      {/* Left ear */}
      <path
        d="M 32,44 C 26,40 22,44 26,50"
        stroke="url(#bullG)" strokeWidth="2.5" strokeLinecap="round"
      />
      {/* Right ear */}
      <path
        d="M 88,44 C 94,40 98,44 94,50"
        stroke="url(#bullG)" strokeWidth="2.5" strokeLinecap="round"
      />

      {/* Left eye — angular, fierce */}
      <path
        d="M 43,56 C 45,52 51,52 53,56 C 51,59 45,59 43,56 Z"
        stroke="url(#bullG)" strokeWidth="2" fill="rgba(212,162,74,0.08)"
      />
      {/* Right eye */}
      <path
        d="M 67,56 C 69,52 75,52 77,56 C 75,59 69,59 67,56 Z"
        stroke="url(#bullG)" strokeWidth="2" fill="rgba(212,162,74,0.08)"
      />

      {/* Nose bridge */}
      <line x1="60" y1="62" x2="60" y2="74" stroke="rgba(212,162,74,0.2)" strokeWidth="1.5" />

      {/* Snout / muzzle — wide, strong */}
      <ellipse cx="60" cy="80" rx="16" ry="8"
        stroke="url(#bullG)" strokeWidth="2.5" fill="rgba(212,162,74,0.04)"
      />
      {/* Left nostril */}
      <ellipse cx="53" cy="80" rx="4" ry="3"
        stroke="url(#bullG)" strokeWidth="1.8" fill="rgba(212,162,74,0.08)"
      />
      {/* Right nostril */}
      <ellipse cx="67" cy="80" rx="4" ry="3"
        stroke="url(#bullG)" strokeWidth="1.8" fill="rgba(212,162,74,0.08)"
      />

      {/* Nose ring — signature bull detail */}
      <path
        d="M 55,84 C 55,90 65,90 65,84"
        stroke="url(#bullG)" strokeWidth="2" strokeLinecap="round" fill="none"
      />
    </svg>
  )
}
