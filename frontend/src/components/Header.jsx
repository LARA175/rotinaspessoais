// Cabeçalho fixo com a navegação principal e botão de nova tarefa.
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiCalendar, FiPlus } from 'react-icons/fi'

function Header() {
  const location = useLocation()

  const navItens = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/calendario', label: 'Calendário', icon: FiCalendar },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <span className="text-xl font-bold text-cyan-400">Rotinas</span>
            <span className="text-xl font-bold text-slate-300">Pessoais</span>
          </div>

          <nav className="hidden md:flex space-x-1">
            {navItens.map((item) => {
              const Icone = item.icon
              const ativo = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    ativo
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icone className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <Link
            to="/eventos/novo"
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-lg text-sm font-semibold transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Nova Tarefa
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
