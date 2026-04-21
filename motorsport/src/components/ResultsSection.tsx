import { useState, useRef, useEffect } from 'react'

const RESULTS = [
  {
    year: '2024',
    category: 'Ferrari Challenge',
    categoryColor: '#E8002D',
    rounds: [
      { race: 'Rd. 1 — Interlagos', result: '🥇 1º', detail: 'Pole Position + Vitória' },
      { race: 'Rd. 2 — Interlagos', result: '🥈 2º', detail: 'Largou P3 → Subiu P2' },
      { race: 'Rd. 3 — Goiânia',   result: '🥇 1º', detail: 'Vitória + Volta mais rápida' },
      { race: 'Rd. 4 — Goiânia',   result: '4º',    detail: 'Contato no 1º setor' },
      { race: 'Rd. 5 — Curitiba',  result: '🥈 2º', detail: 'Pódio após recovery' },
    ],
    championship: '2º Campeonato',
  },
  {
    year: '2023',
    category: 'Porsche Cup',
    categoryColor: '#D4A017',
    rounds: [
      { race: 'Rd. 1 — Interlagos', result: '🥈 2º', detail: 'Largou P4 → Subiu P2' },
      { race: 'Rd. 2 — Cascavel',   result: '🥇 1º', detail: 'Vitória dominante' },
      { race: 'Rd. 3 — Curitiba',   result: '🥉 3º', detail: 'Pódio sob chuva' },
      { race: 'Rd. 4 — Goiânia',    result: '5º',    detail: 'Safety Car prejudicou' },
      { race: 'Rd. 5 — Interlagos', result: '🥈 2º', detail: 'P2 na final da temporada' },
    ],
    championship: '3º Campeonato',
  },
  {
    year: '2022',
    category: 'Stock Car Brasil',
    categoryColor: '#00A651',
    rounds: [
      { race: 'Rd. 1 — Goiânia',    result: '8º',    detail: 'Estreia na categoria' },
      { race: 'Rd. 2 — Interlagos', result: '🥉 3º', detail: 'Primeiro pódio!' },
      { race: 'Rd. 3 — Cascavel',   result: '6º',    detail: 'Forte batalha no meio-campo' },
      { race: 'Rd. 4 — Curitiba',   result: '🥈 2º', detail: 'Ultrapassagem decisiva na reta' },
      { race: 'Rd. 5 — Santa Cruz', result: '🥇 1º', detail: 'Primeira vitória no Stock!' },
    ],
    championship: '5º Campeonato',
  },
  {
    year: '2022',
    category: 'GP3 / Fórmula',
    categoryColor: '#0066FF',
    rounds: [
      { race: 'Rd. 1 — Interlagos',  result: '🥉 3º', detail: 'Classificação excelente' },
      { race: 'Rd. 2 — Goiânia',     result: '🥇 1º', detail: 'Vitória do início ao fim' },
      { race: 'Rd. 3 — Curitiba',    result: '🥈 2º', detail: 'Duelo acirrado até a bandeira' },
      { race: 'Rd. 4 — Cascavel',    result: '4º',    detail: 'Furo de pneu na 2ª parte' },
      { race: 'Rd. 5 — Interlagos',  result: '🥇 1º', detail: 'Vitória + Título garantido' },
    ],
    championship: '🏆 Campeão',
  },
]

function ResultCard({ result, index }: { result: typeof RESULTS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(index === 0)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const wins   = result.rounds.filter(r => r.result.includes('1º')).length
  const podiums = result.rounds.filter(r => r.result.includes('º') && parseInt(r.result.replace(/\D/g,'')) <= 3).length

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ease ${index * 100}ms, transform 0.6s ease ${index * 100}ms`,
        border: `1px solid ${expanded ? result.categoryColor : 'rgba(255,255,255,0.07)'}`,
        background: 'var(--dark)',
        boxShadow: expanded ? `0 0 20px ${result.categoryColor}18` : 'none',
        transition2: 'all 0.3s ease',
      } as React.CSSProperties}
    >
      {/* Header — clickable */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer"
        style={{ borderBottom: expanded ? `1px solid ${result.categoryColor}30` : 'none' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-4">
          {/* Year badge */}
          <div
            className="font-orbitron font-bold text-sm px-3 py-1.5"
            style={{
              background: `${result.categoryColor}20`,
              color: result.categoryColor,
              border: `1px solid ${result.categoryColor}40`,
              letterSpacing: '0.1em',
            }}
          >
            {result.year}
          </div>
          <div>
            <div className="font-orbitron font-bold text-sm" style={{ color: 'var(--white)', letterSpacing: '0.05em' }}>
              {result.category}
            </div>
            <div
              className="font-orbitron text-xs mt-0.5"
              style={{ color: result.categoryColor, letterSpacing: '0.15em', fontSize: '0.6rem' }}
            >
              {result.championship}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Quick stats */}
          <div className="hidden sm:flex gap-5">
            <div className="text-center">
              <div className="font-orbitron font-bold text-lg" style={{ color: result.categoryColor }}>{wins}</div>
              <div className="font-orbitron text-xs" style={{ color: 'var(--gray)', fontSize: '0.55rem', letterSpacing: '0.15em' }}>VITÓRIAS</div>
            </div>
            <div className="text-center">
              <div className="font-orbitron font-bold text-lg" style={{ color: result.categoryColor }}>{podiums}</div>
              <div className="font-orbitron text-xs" style={{ color: 'var(--gray)', fontSize: '0.55rem', letterSpacing: '0.15em' }}>PÓDIOS</div>
            </div>
          </div>
          {/* Chevron */}
          <div
            className="transition-transform duration-300"
            style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              color: result.categoryColor,
              fontSize: '1.2rem',
            }}
          >
            ▾
          </div>
        </div>
      </div>

      {/* Expanded results table */}
      {expanded && (
        <div className="overflow-hidden" style={{ animation: 'fadeUp 0.3s ease' }}>
          {result.rounds.map((round, i) => {
            const position = parseInt(round.result.replace(/\D/g,''))
            const isPodium = position <= 3
            return (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-3"
                style={{
                  borderBottom: i < result.rounds.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  background: isPodium ? `${result.categoryColor}08` : 'transparent',
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="font-orbitron text-xs" style={{ color: 'var(--gray)', width: '20px', letterSpacing: '0.1em' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="font-orbitron text-xs" style={{ color: 'var(--chrome)', letterSpacing: '0.08em' }}>
                      {round.race}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--gray)', fontWeight: 300 }}>
                      {round.detail}
                    </div>
                  </div>
                </div>
                <span
                  className="font-orbitron font-bold text-sm flex-shrink-0 ml-4"
                  style={{
                    color: isPodium ? result.categoryColor : 'var(--gray)',
                    textShadow: isPodium ? `0 0 10px ${result.categoryColor}` : 'none',
                  }}
                >
                  {round.result}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ResultsSection() {
  return (
    <section id="resultados" className="py-24 px-4" style={{ background: 'var(--dark)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="font-orbitron text-xs uppercase mb-3" style={{ color: 'var(--red)', letterSpacing: '0.4em' }}>
            HISTÓRICO
          </p>
          <h2 className="font-orbitron font-bold text-4xl mb-4" style={{ color: 'var(--white)', letterSpacing: '0.05em' }}>
            RESULTADOS
          </h2>
          <div className="h-px w-16" style={{ background: 'var(--red)', boxShadow: '0 0 8px var(--red)' }} />
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-0.5">
          {RESULTS.map((r, i) => (
            <ResultCard key={`${r.year}-${r.category}`} result={r} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
