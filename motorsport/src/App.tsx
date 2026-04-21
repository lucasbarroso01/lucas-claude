import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import HeroCanvas from './components/HeroCanvas'
import CarCard from './components/CarCard'
import PortraitPhoto from './components/PortraitPhoto'
import TelemetryDisplay from './components/TelemetryDisplay'
import EeproCTA from './components/EeproCTA'
import NavBar from './components/NavBar'
import ProjectsSection from './components/ProjectsSection'
import ResultsSection from './components/ResultsSection'
import ContactSection from './components/ContactSection'

import ferrariGlsl from './components/shaders/ferrari.glsl?raw'
import gp3Glsl from './components/shaders/gp3.glsl?raw'
import stockcarGlsl from './components/shaders/stockcar.glsl?raw'
import porscheGlsl from './components/shaders/porsche.glsl?raw'

const CATEGORIES = [
  {
    title: 'FERRARI CHALLENGE',
    subtitle: 'Engenharia de alto desempenho',
    description: 'Setup, telemetria e estratégia em pista com a Ferrari 488 Challenge',
    accentColor: '#E8002D',
    fragSrc: ferrariGlsl,
    imageSrc: '/ferrari.jpeg',
  },
  {
    title: 'GP3 / FÓRMULA',
    subtitle: 'Monoposto de alto nível',
    description: 'Desenvolvimento aerodinâmico e setup de carros de fórmula aberta',
    accentColor: '#0066FF',
    fragSrc: gp3Glsl,
    imageSrc: '/gp3 formula.jpeg',
  },
  {
    title: 'STOCK CAR BRASIL',
    subtitle: 'A categoria mais disputada do Brasil',
    description: 'Engenharia de corrida na categoria mais competitiva do motorsport nacional',
    accentColor: '#00A651',
    fragSrc: stockcarGlsl,
    imageSrc: '/stock car .jpeg',
  },
  {
    title: 'PORSCHE CUP',
    subtitle: 'Precisão e consistência',
    description: 'Otimização de performance e análise de dados na Porsche GT3 Cup',
    accentColor: '#D4A017',
    fragSrc: porscheGlsl,
    imageSrc: '/porsche cup .png',
  },
]

const TELEMETRY = {
  ferrari: [
    { label: 'RPM', value: '12.400' },
    { label: 'SPEED', value: '287', unit: 'km/h' },
    { label: 'G_FORCE', value: '3.2', unit: 'G' },
    { label: 'THROTTLE', value: '98', unit: '%' },
    { label: 'BRAKE_BIAS', value: '58%' },
  ],
  gp3: [
    { label: 'RPM', value: '9.800' },
    { label: 'SPEED', value: '220', unit: 'km/h' },
    { label: 'DOWNFORCE', value: '1200', unit: 'N' },
    { label: 'FUEL_LOAD', value: '40.5', unit: 'kg' },
    { label: 'ERS_DEPLOY', value: '100', unit: '%' },
  ],
  stockcar: [
    { label: 'RPM', value: '7.200' },
    { label: 'SPEED', value: '260', unit: 'km/h' },
    { label: 'TIRE_TEMP_FL', value: '92', unit: '°C' },
    { label: 'TIRE_TEMP_RR', value: '88', unit: '°C' },
    { label: 'LAP_DELTA', value: '+0.043', unit: 's' },
  ],
  porsche: [
    { label: 'RPM', value: '8.500' },
    { label: 'SPEED', value: '265', unit: 'km/h' },
    { label: 'FLAT6_TEMP', value: '95', unit: '°C' },
    { label: 'SUSPENSION_F', value: '42', unit: 'N/mm' },
    { label: 'BEST_LAP', value: '1:42.310' },
  ],
}

const TABS = ['FERRARI', 'GP3', 'STOCK CAR', 'PORSCHE'] as const
const TAB_COLORS = ['#E8002D', '#0066FF', '#00A651', '#D4A017']

const FACTS = {
  'FERRARI': [
    'Engenharia de setup para a Ferrari 488 Challenge Brasil',
    'Análise de telemetria em tempo real com equipes nacionais',
    'Desenvolvimento de estratégia de corrida e pit stop',
    'Treinamento técnico de pilotos para extração máxima de performance',
  ],
  'GP3': [
    'Experiência com monoposto de alta performance aerodinâmica',
    'Análise de dados e setup em categorias de fórmula aberta',
    'Desenvolvimento de downforce e equilíbrio aerodinâmico',
    'Trabalho com pilotos jovens em categorias de acesso à F1',
  ],
  'STOCK CAR': [
    'Atuação na Stock Car Brasil — a maior categoria do país',
    'Setup de suspensão e afinação para circuitos variados',
    'Análise de competidores e estratégia de corrida em tempo real',
    'Gestão de pneus e estratégia de pit stop em condições adversas',
  ],
  'PORSCHE': [
    'Engenharia de corrida na Porsche Cup Brasil',
    'Otimização de setup do GT3 Cup para diferentes traçados',
    'Análise aprofundada de dados de telemetria pós-sessão',
    'Consistência de performance em longas temporadas',
  ],
} as const

// ---- Hero letter reveal ----
function HeroText() {
  const [phase, setPhase] = useState(0)
  const line1 = 'PEDRO HENRIQUE'
  const line2 = 'DO CARMO'

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1000),
      setTimeout(() => setPhase(4), 1200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const renderLetters = (text: string, baseDelay: number, color: string) =>
    text.split('').map((ch, i) => (
      <span
        key={i}
        className="letter-reveal"
        style={{ animationDelay: `${baseDelay + i * 30}ms`, color, display: 'inline-block' }}
      >
        {ch === ' ' ? '\u00A0' : ch}
      </span>
    ))

  return (
    <div className="text-center z-10 relative px-4">
      <div
        className="font-orbitron font-black tracking-widest mb-1"
        style={{ fontSize: 'clamp(2rem, 7vw, 5rem)', lineHeight: 1.1 }}
      >
        {phase >= 1 && renderLetters(line1, 0, '#FFFFFF')}
      </div>
      <div
        className="font-orbitron font-black tracking-widest mb-6"
        style={{ fontSize: 'clamp(2rem, 7vw, 5rem)', lineHeight: 1.1 }}
      >
        {phase >= 1 && renderLetters(line2, line1.length * 30 + 60, '#E8002D')}
      </div>

      {phase >= 3 && (
        <div className="flex justify-center mb-6">
          <div
            className="line-grow h-px"
            style={{ width: '260px', background: 'var(--red)', boxShadow: '0 0 12px var(--red)' }}
          />
        </div>
      )}

      {phase >= 3 && (
        <div
          className="fade-up font-orbitron tracking-widest uppercase mb-10"
          style={{ animationDelay: '100ms', fontSize: 'clamp(0.65rem, 1.5vw, 0.9rem)', color: 'var(--chrome)', letterSpacing: '0.4em' }}
        >
          ENGENHEIRO DE CORRIDA
        </div>
      )}

      {phase >= 4 && (
        <div className="fade-up flex flex-col items-center gap-2" style={{ animationDelay: '200ms' }}>
          <SteeringWheel />
          <span className="font-orbitron text-xs" style={{ color: 'var(--gray)', letterSpacing: '0.3em' }}>
            SCROLL
          </span>
        </div>
      )}
    </div>
  )
}

function SteeringWheel() {
  return (
    <svg className="spin-slow" width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="16" stroke="#E8002D" strokeWidth="2" opacity="0.7" />
      <circle cx="18" cy="18" r="6" stroke="#E8002D" strokeWidth="1.5" opacity="0.7" />
      <line x1="18" y1="2" x2="18" y2="12" stroke="#E8002D" strokeWidth="1.5" opacity="0.7" />
      <line x1="18" y1="24" x2="18" y2="34" stroke="#E8002D" strokeWidth="1.5" opacity="0.7" />
      <line x1="2" y1="18" x2="12" y2="18" stroke="#E8002D" strokeWidth="1.5" opacity="0.7" />
      <line x1="24" y1="18" x2="34" y2="18" stroke="#E8002D" strokeWidth="1.5" opacity="0.7" />
    </svg>
  )
}

// ---- Load flash overlay ----
function LoadFlash() {
  const [phase, setPhase] = useState<'dot' | 'flash' | 'done'>('dot')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('flash'), 200)
    const t2 = setTimeout(() => setPhase('done'), 240)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (phase === 'done') return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{ background: phase === 'flash' ? '#E8002D' : 'var(--dark)' }}
    >
      {phase === 'dot' && (
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E8002D', boxShadow: '0 0 20px #E8002D' }} />
      )}
    </div>
  )
}

// ---- Scroll reveal ----
function useReveal() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

// ---- Lazy card (init WebGL only when visible) ----
function CategoryCard({ cat, index }: { cat: typeof CATEGORIES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setActive(true)
          setVisible(true)
        }
      },
      { threshold: 0.05 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.7s ease ${index * 100}ms, transform 0.7s ease ${index * 100}ms`,
      }}
    >
      {active ? (
        <CarCard
          index={index}
          title={cat.title}
          subtitle={cat.subtitle}
          description={cat.description}
          accentColor={cat.accentColor}
          fragSrc={cat.fragSrc}
          active={active}
          imageSrc={cat.imageSrc}
        />
      ) : (
        <div style={{ height: 540, background: 'var(--mid)', border: '1px solid rgba(255,255,255,0.05)' }} />
      )}
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState(0)
  const aboutSection = useReveal()
  const detailSection = useReveal()

  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
    const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf) }
    const rafId = requestAnimationFrame(raf)
    return () => { lenis.destroy(); cancelAnimationFrame(rafId) }
  }, [])

  const telemetryArr = Object.values(TELEMETRY)
  const factsArr = Object.values(FACTS)

  return (
    <>
      <LoadFlash />
      <NavBar />

      {/* ========== HERO ========== */}
      <section
        id="hero"
        className="relative flex items-center justify-center overflow-hidden"
        style={{ height: '100vh', minHeight: '600px', background: 'var(--dark)' }}
      >
        <HeroCanvas />
        <HeroText />
      </section>

      {/* ========== CATEGORIES ========== */}
      <section id="categorias" className="py-24 px-4" style={{ background: 'var(--dark)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="font-orbitron text-xs uppercase mb-3" style={{ color: 'var(--red)', letterSpacing: '0.4em' }}>
              EXPERIÊNCIA
            </p>
            <h2 className="font-orbitron font-bold text-4xl mb-4" style={{ color: 'var(--white)', letterSpacing: '0.05em' }}>
              CATEGORIAS
            </h2>
            <div className="h-px w-16" style={{ background: 'var(--red)', boxShadow: '0 0 8px var(--red)' }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
            {CATEGORIES.map((cat, i) => (
              <CategoryCard key={cat.title} cat={cat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ========== PROJETOS ========== */}
      <ProjectsSection />

      {/* ========== RESULTADOS ========== */}
      <ResultsSection />

      {/* ========== SOBRE ========== */}
      <section
        id="sobre"
        ref={aboutSection.ref as React.RefObject<HTMLElement>}
        className="py-24 px-4"
        style={{ background: 'var(--mid)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Portrait */}
            <div
              style={{
                opacity: aboutSection.visible ? 1 : 0,
                transform: aboutSection.visible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.7s ease, transform 0.7s ease',
              }}
            >
              <div style={{ aspectRatio: '4/5', maxWidth: '420px', margin: '0 auto', overflow: 'hidden', border: '1px solid var(--light)' }}>
                <PortraitPhoto />
              </div>
            </div>

            {/* Bio */}
            <div
              style={{
                opacity: aboutSection.visible ? 1 : 0,
                transform: aboutSection.visible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.7s ease 150ms, transform 0.7s ease 150ms',
              }}
            >
              <p className="font-orbitron text-xs uppercase mb-4" style={{ color: 'var(--red)', letterSpacing: '0.4em' }}>
                QUEM SOU
              </p>
              <div className="h-px mb-6" style={{ background: 'var(--red)', maxWidth: '60px' }} />
              <h2
                className="font-orbitron font-bold mb-8 leading-tight"
                style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'var(--white)' }}
              >
                Engenheiro que transforma<br />
                <span style={{ color: 'var(--red)' }}>dados em vitórias</span>
              </h2>
              <div className="space-y-4 mb-8" style={{ color: 'var(--gray)', lineHeight: 1.8, fontWeight: 300 }}>
                <p>
                  Pedro Henrique do Carmo é engenheiro de corrida com atuação nas principais categorias
                  do motorsport brasileiro e internacional — Ferrari Challenge, GP3, Stock Car Brasil
                  e Porsche Cup.
                </p>
                <p>
                  Com mais de 4.049 seguidores no Instagram e ampla presença no paddock,
                  Pedro une precisão técnica e visão estratégica para extrair o máximo de cada carro.
                </p>
                <p>
                  Criador do curso <strong style={{ color: 'var(--chrome)' }}>EEPRO</strong> —
                  o programa mais completo de engenharia de corrida do Brasil.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  href="https://instagram.com/phecarmo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ border: '1px solid var(--light)', color: 'var(--chrome)', textDecoration: 'none', background: 'var(--dark)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                  <div>
                    <div className="font-orbitron text-xs tracking-widest">@phecarmo</div>
                    <div className="text-xs" style={{ color: 'var(--gray)' }}>4.049 seguidores</div>
                  </div>
                </a>
                <a
                  href="https://hotmart.com/pt-br/marketplace/produtos/eepro/J88918686L"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ border: '1px solid var(--red)', color: 'var(--red)', textDecoration: 'none' }}
                >
                  <span className="font-orbitron text-xs tracking-widest">CURSO EEPRO →</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== MODALIDADES ========== */}
      <section
        ref={detailSection.ref as React.RefObject<HTMLElement>}
        className="py-24 px-4"
        style={{ background: 'var(--dark)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div
            className="mb-12"
            style={{
              opacity: detailSection.visible ? 1 : 0,
              transform: detailSection.visible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            <p className="font-orbitron text-xs uppercase mb-3" style={{ color: 'var(--red)', letterSpacing: '0.4em' }}>
              TELEMETRIA
            </p>
            <h2 className="font-orbitron font-bold text-3xl mb-4" style={{ color: 'var(--white)' }}>
              MODALIDADES
            </h2>
            <div className="h-px w-16" style={{ background: 'var(--red)', boxShadow: '0 0 8px var(--red)' }} />
          </div>

          {/* Tabs */}
          <div
            className="flex gap-0 mb-12 border-b"
            style={{ borderColor: 'var(--light)',
                     opacity: detailSection.visible ? 1 : 0,
                     transition: 'opacity 0.7s ease 100ms' }}
          >
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className="relative px-6 py-4 font-orbitron text-xs uppercase border-0 bg-transparent cursor-pointer"
                style={{ color: activeTab === i ? TAB_COLORS[i] : 'var(--gray)', letterSpacing: '0.2em', transition: 'color 0.3s ease' }}
              >
                {tab}
                {activeTab === i && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: TAB_COLORS[i], boxShadow: `0 0 8px ${TAB_COLORS[i]}` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Panel */}
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            style={{
              opacity: detailSection.visible ? 1 : 0,
              transition: 'opacity 0.7s ease 200ms',
            }}
          >
            <div>
              <p className="font-orbitron text-xs uppercase mb-4" style={{ color: TAB_COLORS[activeTab], letterSpacing: '0.3em' }}>
                TELEMETRIA AO VIVO
              </p>
              <TelemetryDisplay lines={telemetryArr[activeTab]} active={detailSection.visible} />
            </div>
            <div>
              <p className="font-orbitron text-xs uppercase mb-4" style={{ color: TAB_COLORS[activeTab], letterSpacing: '0.3em' }}>
                ATUAÇÃO
              </p>
              <ul className="space-y-5">
                {factsArr[activeTab].map((fact, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="font-orbitron text-xs mt-1 flex-shrink-0" style={{ color: TAB_COLORS[activeTab] }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p style={{ color: 'var(--gray)', fontWeight: 300, lineHeight: 1.7 }}>{fact}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========== EEPRO CTA ========== */}
      <EeproCTA />

      {/* ========== CONTATO ========== */}
      <ContactSection />

      {/* ========== FOOTER ========== */}
      <footer className="py-16 px-8" style={{ background: 'var(--dark)', borderTop: '1px solid var(--light)' }}>
        <div className="max-w-6xl mx-auto text-center">
          <div
            className="font-orbitron font-black mb-2"
            style={{ fontSize: '3.5rem', color: 'var(--red)', lineHeight: 1, textShadow: '0 0 30px rgba(232,0,45,0.5)' }}
          >
            PHC
          </div>
          <div className="font-orbitron font-bold tracking-widest mb-1" style={{ color: 'var(--white)', letterSpacing: '0.3em' }}>
            PEDRO HENRIQUE DO CARMO
          </div>
          <div className="font-orbitron text-xs tracking-widest mb-8" style={{ color: 'var(--gray)', letterSpacing: '0.4em' }}>
            ENGENHEIRO DE CORRIDA
          </div>
          <div className="h-px mb-8 mx-auto" style={{ background: 'var(--red)', maxWidth: '120px', boxShadow: '0 0 8px var(--red)' }} />
          <a
            href="https://instagram.com/phecarmo"
            target="_blank"
            rel="noopener noreferrer"
            className="font-orbitron text-xs block mb-8"
            style={{ color: 'var(--gray)', textDecoration: 'none', letterSpacing: '0.3em' }}
          >
            INSTAGRAM: @phecarmo
          </a>
          <div className="font-orbitron text-xs" style={{ color: 'rgba(138,154,176,0.4)', letterSpacing: '0.2em' }}>
            © 2025 PEDRO HENRIQUE DO CARMO
          </div>
        </div>
      </footer>
    </>
  )
}
