import { useEffect, useRef, useState } from 'react'

interface TelemetryLine {
  label: string
  value: string
  unit?: string
}

interface TelemetryDisplayProps {
  lines: TelemetryLine[]
  active: boolean
}

export default function TelemetryDisplay({ lines, active }: TelemetryDisplayProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([])
  const [cursor, setCursor] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Typing animation
  useEffect(() => {
    if (!active) return
    setDisplayedLines([])
    let lineIndex = 0
    let charIndex = 0
    const allLines = [
      '> LOADING_TELEMETRY...',
      ...lines.map(l => `> ${l.label}: ${l.value}${l.unit ? ' ' + l.unit : ''}`),
      '> STATUS: ENGINEER_ACTIVE ✓',
    ]

    const tick = () => {
      if (lineIndex >= allLines.length) {
        // loop restart after pause
        setTimeout(() => {
          setDisplayedLines([])
          lineIndex = 0
          charIndex = 0
          intervalRef.current = setInterval(tick, 45)
        }, 3000)
        if (intervalRef.current) clearInterval(intervalRef.current)
        return
      }
      const current = allLines[lineIndex]
      charIndex++
      setDisplayedLines(prev => {
        const next = [...prev]
        next[lineIndex] = current.slice(0, charIndex)
        return next
      })
      if (charIndex >= current.length) {
        lineIndex++
        charIndex = 0
      }
    }
    intervalRef.current = setInterval(tick, 45)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [active, lines])

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setCursor(c => !c), 530)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="font-mono text-sm p-4 rounded-none overflow-hidden"
      style={{
        background: 'rgba(0,20,0,0.7)',
        border: '1px solid rgba(0,200,50,0.3)',
        fontFamily: "'Courier New', monospace",
        minHeight: '200px',
      }}
    >
      {displayedLines.map((line, i) => {
        const isStatus = line.includes('ENGINEER_ACTIVE')
        const isLoading = line.includes('LOADING')
        return (
          <div key={i} className="mb-1" style={{ lineHeight: '1.6' }}>
            <span style={{
              color: isStatus ? '#00ff7f'
                   : isLoading ? '#ffcc00'
                   : '#00cc44',
              fontWeight: isStatus ? 600 : 400,
            }}>
              {line}
            </span>
          </div>
        )
      })}
      {active && (
        <span style={{ color: '#00cc44' }}>
          {'>'}{cursor ? '_' : ' '}
        </span>
      )}
    </div>
  )
}
