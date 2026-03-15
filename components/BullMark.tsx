interface BullMarkProps {
  size?: number
  opacity?: number
  className?: string
}

export function BullMark({ size = 40, opacity = 1, className }: BullMarkProps) {
  return (
    <img
      src="/logo.png"
      alt="MONTERO"
      width={size}
      height={size}
      className={className}
      style={{
        opacity,
        display: 'block',
        flexShrink: 0,
        mixBlendMode: 'screen',
        objectFit: 'contain',
      }}
    />
  )
}
