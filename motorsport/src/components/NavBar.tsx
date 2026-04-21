import { useState, useEffect } from 'react'

const LINKS = [
  { label: 'INÍCIO',    href: '#hero' },
  { label: 'CATEGORIAS', href: '#categorias' },
  { label: 'PROJETOS',  href: '#projetos' },
  { label: 'RESULTADOS',href: '#resultados' },
  { label: 'SOBRE',     href: '#sobre' },
  { label: 'CONTATO',   href: '#contato' },
]

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('hero')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80)

      // Track active section
      const sections = ['hero','categorias','projetos','resultados','sobre','contato']
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id)
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActive(id)
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (href: string) => {
    const id = href.replace('#', '')
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(5,8,16,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(232,0,45,0.15)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between" style={{ height: '64px' }}>
        {/* Logo */}
        <button
          onClick={() => scrollTo('#hero')}
          className="font-orbitron font-black text-xl cursor-pointer border-0 bg-transparent"
          style={{ color: 'var(--red)', textShadow: '0 0 20px rgba(232,0,45,0.5)', letterSpacing: '0.1em' }}
        >
          PHC
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {LINKS.map(link => {
            const id = link.href.replace('#', '')
            const isActive = active === id
            return (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="font-orbitron text-xs tracking-widest cursor-pointer border-0 bg-transparent transition-all duration-200 relative pb-1"
                style={{
                  color: isActive ? 'var(--white)' : 'var(--gray)',
                  letterSpacing: '0.25em',
                }}
              >
                {link.label}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ background: 'var(--red)', boxShadow: '0 0 6px var(--red)' }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 cursor-pointer border-0 bg-transparent p-2"
          onClick={() => setMenuOpen(o => !o)}
        >
          {[0,1,2].map(i => (
            <div
              key={i}
              className="transition-all duration-300"
              style={{
                width: '22px',
                height: '2px',
                background: 'var(--red)',
                transform: menuOpen
                  ? i === 0 ? 'rotate(45deg) translate(5px,5px)'
                  : i === 2 ? 'rotate(-45deg) translate(5px,-5px)'
                  : 'scaleX(0)'
                  : 'none',
                opacity: menuOpen && i === 1 ? 0 : 1,
              }}
            />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden flex flex-col"
          style={{ background: 'rgba(5,8,16,0.98)', borderTop: '1px solid rgba(232,0,45,0.15)' }}
        >
          {LINKS.map(link => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="font-orbitron text-xs tracking-widest py-4 px-6 text-left cursor-pointer border-0 bg-transparent"
              style={{ color: 'var(--gray)', letterSpacing: '0.25em', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}
