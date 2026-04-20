import { useRef, useState, useCallback, useEffect } from 'react'
import { useWebGL } from '../hooks/useWebGL'

interface CarCardProps {
  index: number
  title: string
  subtitle: string
  description: string
  accentColor: string
  fragSrc: string
  active: boolean
}

export default function CarCard({
  index,
  title,
  subtitle,
  description,
  accentColor,
  fragSrc,
  active,
}: CarCardProps) {
  const [hovered, setHovered] = useState(false)
  const [speed, setSpeed] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)
  const speedRafRef = useRef<number>(0)
  const speedRef = useRef(0)
  const targetSpeedRef = useRef(0)

  const { canvasRef, setHover, setMouse } = useWebGL(fragSrc, active)

  // Animate speed meter
  useEffect(() => {
    const tick = () => {
      const diff = targetSpeedRef.current - speedRef.current
      speedRef.current += diff * 0.08
      setSpeed(Math.round(speedRef.current))
      speedRafRef.current = requestAnimationFrame(tick)
    }
    speedRafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(speedRafRef.current)
  }, [])

  const handleMouseEnter = useCallback(() => {
    setHovered(true)
    setHover(1)
    targetSpeedRef.current = 100
  }, [setHover])

  const handleMouseLeave = useCallback(() => {
    setHovered(false)
    setHover(0)
    targetSpeedRef.current = 0
  }, [setHover])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width
    const y = 1 - (e.clientY - rect.top) / rect.height
    setMouse(x, y)
  }, [setMouse])

  const numStr = String(index + 1).padStart(2, '0')

  return (
    <div
      ref={cardRef}
      className="relative flex flex-col cursor-pointer group"
      style={{ border: `1px solid ${hovered ? accentColor : 'rgba(255,255,255,0.08)'}`,
               transition: 'border-color 0.3s ease',
               boxShadow: hovered ? `0 0 30px ${accentColor}33, 0 0 60px ${accentColor}11` : 'none' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* Canvas */}
      <div className="relative" style={{ height: '400px', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%' }}
        />
        {/* Speed overlay (top-right) */}
        <div className="absolute top-3 right-3 flex flex-col items-end">
          <span
            className="font-orbitron text-xs tracking-widest"
            style={{ color: accentColor, opacity: 0.7 }}
          >
            SPEED
          </span>
          <span
            className="font-orbitron text-2xl font-bold leading-none"
            style={{ color: accentColor,
                     textShadow: `0 0 20px ${accentColor}` }}
          >
            {speed}
          </span>
          <span className="font-orbitron text-xs" style={{ color: 'var(--gray)' }}>
            km/h
          </span>
        </div>
      </div>

      {/* Speed progress bar */}
      <div className="h-0.5 w-full bg-white/5 relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 transition-none"
          style={{
            width: `${speed}%`,
            background: accentColor,
            boxShadow: `0 0 8px ${accentColor}`,
          }}
        />
      </div>

      {/* Card info */}
      <div className="p-6 bg-racing-mid" style={{ background: 'var(--mid)' }}>
        <div className="flex items-baseline gap-4 mb-3">
          <span
            className="font-orbitron font-bold text-3xl transition-transform duration-300"
            style={{
              color: accentColor,
              transform: hovered ? 'scale(1.2)' : 'scale(1.0)',
              transformOrigin: 'left center',
              display: 'inline-block',
            }}
          >
            {numStr}
          </span>
          <span
            className="font-orbitron font-bold text-lg tracking-widest uppercase"
            style={{ color: 'var(--white)' }}
          >
            {title}
          </span>
        </div>

        <p className="text-sm mb-4" style={{ color: 'var(--gray)', fontWeight: 300 }}>
          {subtitle}
        </p>

        {/* Animated underline */}
        <div className="h-px mb-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full transition-all duration-500"
            style={{
              width: hovered ? '100%' : '0%',
              background: accentColor,
              boxShadow: `0 0 6px ${accentColor}`,
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: 'var(--gray)', fontWeight: 300 }}>
            {description}
          </p>
          <span
            className="font-orbitron text-xs tracking-widest transition-all duration-300 whitespace-nowrap ml-4"
            style={{
              color: hovered ? accentColor : 'var(--gray)',
              transform: hovered ? 'translateX(8px)' : 'translateX(0)',
              textShadow: hovered ? `0 0 12px ${accentColor}` : 'none',
            }}
          >
            VER MAIS →
          </span>
        </div>
      </div>
    </div>
  )
}
