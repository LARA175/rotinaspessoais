// Cabeçalho fixo com a navegação principal e botão de nova tarefa.
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiCalendar, FiPlus } from 'react-icons/fi'

function Header() {
  const location = useLocation()
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme')
    return stored || 'oceano'
  })
  useEffect(() => { localStorage.setItem('theme', theme) }, [theme])

  const navItens = [
    { path: '/dashboard', label: 'Início', icon: FiHome },
    { path: '/calendario', label: 'Calendário', icon: FiCalendar },
  ]

  const toggleTheme = () => {
    setTheme(prev => prev === 'oceano' ? 'pôr-do-sol' : prev === 'pôr-do-sol' ? 'cidade' : 'oceano')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(247,242,226,0.95)', borderBottom: '2px solid #d5dcc0' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <span className="font-bold" style={{ color: 'var(--sage-dark)', fontFamily: "'Caveat', cursive", fontSize: '1.9rem', lineHeight: 1 }}>my daily routine</span>
          </div>

<nav className="hidden md:flex" style={{ gap: '4px' }}>
            {navItens.map((item) => {
              const Icone = item.icon
              const ativo = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center px-4 py-2 rounded-lg transition-all"
                  style={ativo
                    ? { background: 'var(--matcha)', color: 'var(--sage-dark)', border: '1.5px solid var(--border)', fontSize: '1.2rem', fontWeight: 700, gap: '8px' }
                    : { color: 'var(--text-secondary)', border: '1.5px dashed transparent', fontSize: '1.2rem', fontWeight: 700, gap: '8px' }}
                >
                  <Icone className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
            <button className="theme-btn" aria-label="Trocar tema" onClick={toggleTheme}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 7v5l5 5"/>
                <path d="M19 14l-5 5v5l5-5"/>
                <path d="M5 14l5-5v5l-5 5"/>
              </svg>
            </button>
          </nav>

          <Link to="/eventos/novo" className="btn-primary">
            <FiPlus className="w-4 h-4" />
            Nova Tarefa
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
