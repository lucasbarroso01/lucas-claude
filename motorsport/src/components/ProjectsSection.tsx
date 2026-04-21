import { useState, useRef, useEffect } from 'react'

const PROJECTS = [
  {
    id: '01',
    title: 'Análise de Telemetria Ferrari 488',
    category: 'Ferrari Challenge',
    categoryColor: '#E8002D',
    year: '2023',
    description:
      'Desenvolvimento de metodologia proprietária de análise de dados para extração de performance na Ferrari 488 Challenge. Redução de 0,4s por volta em circuito de médio tempo.',
    tags: ['Telemetria', 'Setup', 'Dados'],
    stats: [
      { label: 'Ganho de Performance', value: '0.4s/volta' },
      { label: 'Corridas analisadas', value: '18' },
    ],
  },
  {
    id: '02',
    title: 'Programa de Desenvolvimento GP3',
    category: 'GP3 / Fórmula',
    categoryColor: '#0066FF',
    year: '2022',
    description:
      'Coordenação técnica completa de programa de desenvolvimento de piloto em categoria de fórmula aberta. Atuação em setup aerodinâmico, análise de dados e estratégia de corrida.',
    tags: ['Aero', 'Desenvolvimento', 'Estratégia'],
    stats: [
      { label: 'Pódios conquistados', value: '6' },
      { label: 'Voltas analisadas', value: '2.400+' },
    ],
  },
  {
    id: '03',
    title: 'Engenharia de Setup Stock Car',
    category: 'Stock Car Brasil',
    categoryColor: '#00A651',
    year: '2023–2024',
    description:
      'Trabalho de engenharia de corrida na principal categoria do Brasil. Foco em setup de suspensão, gestão de pneus e estratégia de pit stop em condições variadas de pista.',
    tags: ['Suspensão', 'Pneus', 'Pit Stop'],
    stats: [
      { label: 'Etapas acompanhadas', value: '12' },
      { label: 'Melhora média qualif.', value: '+3 pos.' },
    ],
  },
  {
    id: '04',
    title: 'Consultoria Técnica Porsche Cup',
    category: 'Porsche Cup',
    categoryColor: '#D4A017',
    year: '2022–2024',
    description:
      'Consultoria técnica especializada na Porsche Cup Brasil. Otimização de setup do GT3 Cup, análise pós-sessão aprofundada e consistência de performance ao longo da temporada.',
    tags: ['GT3', 'Consistência', 'Dados'],
    stats: [
      { label: 'Temporadas', value: '3' },
      { label: 'Corridas no top-5', value: '71%' },
    ],
  },
  {
    id: '05',
    title: 'Curso EEPRO — Engenharia de Corrida',
    category: 'Educação',
    categoryColor: '#C8D8E8',
    year: '2024',
    description:
      'Criação e desenvolvimento do único programa completo de engenharia de corrida do Brasil. Conteúdo que cobre telemetria, setup, aerodinâmica e estratégia para engenheiros e entusiastas.',
    tags: ['Educação', 'Telemetria', 'Setup'],
    stats: [
      { label: 'Alunos formados', value: '500+' },
      { label: 'Horas de conteúdo', value: '40h' },
    ],
  },
  {
    id: '06',
    title: 'Sistema de Análise de Dados em Tempo Real',
    category: 'Tecnologia',
    categoryColor: '#8A9AB0',
    year: '2023',
    description:
      'Desenvolvimento de pipeline de análise de dados em tempo real para equipes de motorsport, integrando múltiplas fontes de telemetria e gerando insights acionáveis durante a corrida.',
    tags: ['Software', 'Dados', 'Inovação'],
    stats: [
      { label: 'Latência de dados', value: '<50ms' },
      { label: 'Canais monitorados', value: '120+' },
    ],
  },
]

function ProjectCard({ project, index }: { project: typeof PROJECTS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
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
        transition: `opacity 0.6s ease ${index * 80}ms, transform 0.6s ease ${index * 80}ms`,
        border: `1px solid ${hovered ? project.categoryColor : 'rgba(255,255,255,0.07)'}`,
        background: 'var(--mid)',
        boxShadow: hovered ? `0 0 24px ${project.categoryColor}22` : 'none',
        transition2: 'border-color 0.3s ease, box-shadow 0.3s ease',
      } as React.CSSProperties}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top bar */}
      <div
        className="h-0.5 w-full transition-all duration-500"
        style={{
          background: project.categoryColor,
          opacity: hovered ? 1 : 0.3,
          boxShadow: hovered ? `0 0 8px ${project.categoryColor}` : 'none',
        }}
      />

      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span
              className="font-orbitron text-xs tracking-widest uppercase px-2 py-1 mb-3 inline-block"
              style={{ color: project.categoryColor, border: `1px solid ${project.categoryColor}44`, fontSize: '0.6rem', letterSpacing: '0.25em' }}
            >
              {project.category}
            </span>
            <h3 className="font-orbitron font-bold text-base" style={{ color: 'var(--white)', letterSpacing: '0.03em' }}>
              {project.title}
            </h3>
          </div>
          <span
            className="font-orbitron text-xs flex-shrink-0 ml-4"
            style={{ color: 'var(--gray)', letterSpacing: '0.1em' }}
          >
            {project.year}
          </span>
        </div>

        <p className="text-sm mb-5" style={{ color: 'var(--gray)', lineHeight: 1.7, fontWeight: 300 }}>
          {project.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {project.stats.map((stat, i) => (
            <div key={i} style={{ borderLeft: `2px solid ${project.categoryColor}`, paddingLeft: '10px' }}>
              <div className="font-orbitron font-bold text-sm" style={{ color: project.categoryColor }}>
                {stat.value}
              </div>
              <div className="text-xs" style={{ color: 'var(--gray)', fontWeight: 300 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.tags.map(tag => (
            <span
              key={tag}
              className="font-orbitron text-xs px-2 py-1"
              style={{
                color: 'var(--gray)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProjectsSection() {
  return (
    <section id="projetos" className="py-24 px-4" style={{ background: 'var(--mid)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="font-orbitron text-xs uppercase mb-3" style={{ color: 'var(--red)', letterSpacing: '0.4em' }}>
            PORTFÓLIO
          </p>
          <h2 className="font-orbitron font-bold text-4xl mb-4" style={{ color: 'var(--white)', letterSpacing: '0.05em' }}>
            PROJETOS
          </h2>
          <div className="h-px w-16" style={{ background: 'var(--red)', boxShadow: '0 0 8px var(--red)' }} />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0.5">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
