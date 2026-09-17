// Navegação lateral fixa + bottom nav mobile — design 2026.
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiCalendar, FiPlus, FiTag, FiClock } from 'react-icons/fi'

const itensNav = [
  { path: '/dashboard', label: 'Início', icon: FiHome },
  { path: '/calendario', label: 'Calendário', icon: FiCalendar },
  { path: '/eventos/novo', label: 'Tarefa', icon: FiPlus },
  { path: '/categorias', label: 'Categorias', icon: FiTag },
]

function Sidebar() {
  const location = useLocation()

  return (
    <>
      {/* ── DESKTOP: sidebar fixa ── */}
      <aside className="sidebar-desktop">
        <div className="sidebar-logo">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))' }}
          >
            <FiCalendar className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-bold tracking-tight">Rotinas</div>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Pessoais</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {itensNav.map(({ path, label, icon: Icone }) => {
            const ativo = location.pathname === path
            return (
              <Link key={path} to={path} className={`sidebar-link ${ativo ? 'ativo' : ''}`}>
                <Icone className="w-[18px] h-[18px] shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <Link to="/dashboard" className="sidebar-link" style={{ fontSize: '12px', padding: '8px 12px' }}>
            <FiClock className="w-4 h-4 shrink-0" />
            Painel
          </Link>
          <div className="mt-3 px-3">
            <div className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              <span className="font-medium">IFMT</span>
              <br />Dev. Web 2026
            </div>
          </div>
        </div>
      </aside>

      {/* ── MOBILE: bottom nav ── */}
      <nav className="bottom-nav">
        {itensNav.map(({ path, label, icon: Icone }) => {
          const ativo = location.pathname === path
          return (
            <Link key={path} to={path} className={`bottom-nav-item ${ativo ? 'ativo' : ''}`}>
              <Icone />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

export default Sidebar
