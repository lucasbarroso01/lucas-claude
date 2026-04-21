import { useState, useRef, useEffect } from 'react'

export default function ContactSection() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    // Build mailto link
    const subject = encodeURIComponent(`[PHC Portfolio] ${formData.subject}`)
    const body = encodeURIComponent(
      `Nome: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    )
    window.open(`mailto:contato@pedrohenriquecarmo.com?subject=${subject}&body=${body}`)
    setTimeout(() => { setSending(false); setSent(true) }, 800)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--dark)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--white)',
    padding: '12px 16px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 300,
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  }

  const CONTACTS = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="20" height="20" rx="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      ),
      label: 'Instagram',
      value: '@phecarmo',
      href: 'https://instagram.com/phecarmo',
      color: '#E8002D',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
      label: 'E-mail',
      value: 'contato@phecarmo.com',
      href: 'mailto:contato@phecarmo.com',
      color: '#0066FF',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.05 3.4 2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/>
        </svg>
      ),
      label: 'Curso EEPRO',
      value: 'hotmart.com/eepro',
      href: 'https://hotmart.com/pt-br/marketplace/produtos/eepro/J88918686L',
      color: '#D4A017',
    },
  ]

  return (
    <section
      ref={ref}
      id="contato"
      className="py-24 px-4"
      style={{ background: 'var(--mid)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="font-orbitron text-xs uppercase mb-3" style={{ color: 'var(--red)', letterSpacing: '0.4em' }}>
            FALE COMIGO
          </p>
          <h2 className="font-orbitron font-bold text-4xl mb-4" style={{ color: 'var(--white)', letterSpacing: '0.05em' }}>
            CONTATO
          </h2>
          <div className="h-px w-16" style={{ background: 'var(--red)', boxShadow: '0 0 8px var(--red)' }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left — info */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            <p className="text-lg mb-10" style={{ color: 'var(--gray)', lineHeight: 1.8, fontWeight: 300 }}>
              Quer contratar engenharia de corrida, saber mais sobre o curso EEPRO
              ou tem algum projeto em mente? Entre em contato.
            </p>

            <div className="flex flex-col gap-4 mb-12">
              {CONTACTS.map(c => (
                <a
                  key={c.label}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 transition-all duration-300 group"
                  style={{
                    border: '1px solid rgba(255,255,255,0.07)',
                    background: 'var(--dark)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = c.color }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)' }}
                >
                  <div style={{ color: c.color }}>{c.icon}</div>
                  <div>
                    <div className="font-orbitron text-xs tracking-widest uppercase mb-0.5" style={{ color: 'var(--gray)', letterSpacing: '0.25em', fontSize: '0.6rem' }}>
                      {c.label}
                    </div>
                    <div className="font-orbitron text-sm" style={{ color: 'var(--white)' }}>
                      {c.value}
                    </div>
                  </div>
                  <span className="ml-auto font-orbitron text-xs" style={{ color: c.color }}>→</span>
                </a>
              ))}
            </div>

            {/* Location */}
            <div className="flex items-center gap-3" style={{ color: 'var(--gray)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span className="font-orbitron text-xs tracking-widest" style={{ letterSpacing: '0.2em' }}>
                BRASIL — DISPONÍVEL PARA PROJETOS NACIONAIS E INTERNACIONAIS
              </span>
            </div>
          </div>

          {/* Right — form */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.7s ease 150ms, transform 0.7s ease 150ms',
            }}
          >
            {sent ? (
              <div
                className="flex flex-col items-center justify-center h-full text-center"
                style={{ minHeight: '300px', border: '1px solid var(--red)', background: 'var(--dark)', padding: '40px' }}
              >
                <div className="font-orbitron font-bold text-3xl mb-4" style={{ color: 'var(--red)', textShadow: '0 0 20px var(--red)' }}>
                  ✓
                </div>
                <div className="font-orbitron font-bold text-sm tracking-widest mb-2" style={{ color: 'var(--white)', letterSpacing: '0.2em' }}>
                  MENSAGEM ENVIADA
                </div>
                <p className="text-sm" style={{ color: 'var(--gray)', fontWeight: 300 }}>
                  Retorno em até 24h.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-orbitron text-xs tracking-widest block mb-2" style={{ color: 'var(--gray)', letterSpacing: '0.2em', fontSize: '0.6rem' }}>
                      NOME
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Seu nome"
                      style={inputStyle}
                      value={formData.name}
                      onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                      onFocus={e => { e.target.style.borderColor = 'var(--red)' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                    />
                  </div>
                  <div>
                    <label className="font-orbitron text-xs tracking-widest block mb-2" style={{ color: 'var(--gray)', letterSpacing: '0.2em', fontSize: '0.6rem' }}>
                      E-MAIL
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="seu@email.com"
                      style={inputStyle}
                      value={formData.email}
                      onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                      onFocus={e => { e.target.style.borderColor = 'var(--red)' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="font-orbitron text-xs tracking-widest block mb-2" style={{ color: 'var(--gray)', letterSpacing: '0.2em', fontSize: '0.6rem' }}>
                    ASSUNTO
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Engenharia de corrida / EEPRO / Outro"
                    style={inputStyle}
                    value={formData.subject}
                    onChange={e => setFormData(f => ({ ...f, subject: e.target.value }))}
                    onFocus={e => { e.target.style.borderColor = 'var(--red)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                  />
                </div>

                <div>
                  <label className="font-orbitron text-xs tracking-widest block mb-2" style={{ color: 'var(--gray)', letterSpacing: '0.2em', fontSize: '0.6rem' }}>
                    MENSAGEM
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Descreva seu projeto ou dúvida..."
                    style={{ ...inputStyle, resize: 'none' }}
                    value={formData.message}
                    onChange={e => setFormData(f => ({ ...f, message: e.target.value }))}
                    onFocus={e => { e.target.style.borderColor = 'var(--red)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="font-orbitron font-bold tracking-widest uppercase py-4 transition-all duration-300 cursor-pointer"
                  style={{
                    background: sending ? 'var(--light)' : 'var(--red)',
                    color: 'var(--white)',
                    border: 'none',
                    fontSize: '0.8rem',
                    letterSpacing: '0.3em',
                    boxShadow: sending ? 'none' : '0 0 20px rgba(232,0,45,0.3)',
                  }}
                  onMouseEnter={e => { if (!sending) (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(232,0,45,0.5)' }}
                  onMouseLeave={e => { if (!sending) (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(232,0,45,0.3)' }}
                >
                  {sending ? 'ENVIANDO...' : 'ENVIAR MENSAGEM →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
