import { useState } from 'react'

export default function PortraitPhoto() {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ minHeight: '420px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Photo */}
      <img
        src="/pedro.jpg"
        alt="Pedro Henrique do Carmo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          transition: 'transform 0.7s ease, filter 0.7s ease',
          transform: hovered ? 'scale(1.04)' : 'scale(1.0)',
          filter: hovered
            ? 'brightness(1.0) saturate(1.1)'
            : 'brightness(0.85) saturate(0.9)',
          display: 'block',
        }}
      />

      {/* Blue energy overlay on hover */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: hovered
            ? 'linear-gradient(135deg, rgba(0,51,160,0.15) 0%, transparent 60%)'
            : 'linear-gradient(135deg, rgba(0,51,160,0.3) 0%, transparent 70%)',
          transition: 'background 0.7s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Bottom gradient */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(to top, rgba(10,22,40,0.9) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Red corner accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '3px',
          height: hovered ? '100%' : '60px',
          background: 'var(--red)',
          boxShadow: '0 0 12px var(--red)',
          transition: 'height 0.5s ease',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: hovered ? '100%' : '60px',
          height: '3px',
          background: 'var(--red)',
          boxShadow: '0 0 12px var(--red)',
          transition: 'width 0.5s ease',
        }}
      />
    </div>
  )
}
