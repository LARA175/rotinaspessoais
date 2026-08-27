// Painel principal — stat cards premium, tarefas, categorias.
import React, { useState, useEffect } from 'react'
import { eventoService, categoriaService } from '../services/api'
import { FiCalendar, FiTag, FiPlus, FiArrowRight, FiBell } from 'react-icons/fi'
import { format, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Link } from 'react-router-dom'

function Dashboard() {
  const [eventosHoje, setEventosHoje] = useState([])
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const hoje = new Date()
        const inicio = startOfDay(hoje).toISOString()
        const fim = endOfDay(hoje).toISOString()
        const [eventosRes, categoriasRes] = await Promise.all([
          eventoService.listar({ data_inicio: inicio, data_fim: fim }),
          categoriaService.listar()
        ])
        setEventosHoje(eventosRes.data || eventosRes.data?.dados || [])
        setCategorias(categoriasRes.data || categoriasRes.data?.dados || [])
      } catch (err) {
        setErro('Erro ao carregar dados. Verifique a conexão com a API.')
        console.error(err)
      } finally {
        setCarregando(false)
      }
    }
    carregarDados()
  }, [])

  const categoriaMap = {}
  categorias.forEach((cat) => { categoriaMap[cat.id] = cat })

  const eventosDoDia = eventosHoje.filter((e) => {
    const dataEvento = new Date(e.data_inicio)
    return dataEvento.toDateString() === new Date().toDateString()
  })

  const eventosOrdenados = [...eventosDoDia].sort(
    (a, b) => new Date(a.data_inicio) - new Date(b.data_inicio)
  )

  const eventosRecentes = eventosOrdenados.slice(0, 6)
  const comLembrete = eventosDoDia.filter((e) => e.lembrete_minutos > 0).length

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Cabeçalho */}
      <div className="mb-6 sm:mb-10 animate-fade-up">
        <h1 className="text-2xl sm:text-[32px] font-extrabold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-[14px] sm:text-[15px]" style={{ color: 'var(--text-muted)' }}>
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {erro && (
        <div
          className="mb-5 p-3 sm:p-4 rounded-xl text-sm animate-fade-in"
          style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            color: '#fb7185'
          }}
        >
          {erro}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 mb-6 sm:mb-10">
        <div className="stat-card accent-blue animate-fade-up delay-1">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(102, 126, 234, 0.15)' }}
            >
              <FiCalendar className="w-[18px] h-[18px] sm:w-5 sm:h-5" style={{ color: 'var(--accent-1)' }} />
            </div>
            <div className="pulse-dot" />
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-1)' }}>
            {carregando ? (
              <div className="h-7 sm:h-9 w-10 sm:w-12 rounded-lg animate-pulse" style={{ background: 'rgba(102,126,234,0.15)' }} />
            ) : (
              eventosDoDia.length
            )}
          </div>
          <div className="stat-label">Hoje</div>
        </div>

        <div className="stat-card accent-purple animate-fade-up delay-2">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(118, 75, 162, 0.15)' }}
            >
              <FiTag className="w-[18px] h-[18px] sm:w-5 sm:h-5" style={{ color: 'var(--accent-2)' }} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-2)' }}>
            {carregando ? (
              <div className="h-7 sm:h-9 w-10 sm:w-12 rounded-lg animate-pulse" style={{ background: 'rgba(118,75,162,0.15)' }} />
            ) : (
              categorias.length
            )}
          </div>
          <div className="stat-label">Categorias</div>
        </div>

        <div className="stat-card accent-amber animate-fade-up delay-3 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(245, 158, 11, 0.15)' }}
            >
              <FiBell className="w-[18px] h-[18px] sm:w-5 sm:h-5" style={{ color: 'var(--accent-warm)' }} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-warm)' }}>
            {carregando ? (
              <div className="h-7 sm:h-9 w-10 sm:w-12 rounded-lg animate-pulse" style={{ background: 'rgba(245,158,11,0.15)' }} />
            ) : (
              comLembrete
            )}
          </div>
          <div className="stat-label">Com Lembrete</div>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Lista de tarefas */}
        <div className="lg:col-span-2 animate-fade-up delay-4">
          <div className="glass-card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-[17px] font-semibold">Tarefas de Hoje</h2>
              <Link to="/eventos/novo" className="btn-primary text-[12px] sm:text-[13px] px-3 py-2 sm:px-4 sm:py-2.5">
                <FiPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Nova</span>
              </Link>
            </div>

            {carregando ? (
              <div className="space-y-2 sm:space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 sm:h-16 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                ))}
              </div>
            ) : eventosRecentes.length === 0 ? (
              <div className="text-center py-10 sm:py-12">
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4"
                  style={{ background: 'rgba(102,126,234,0.1)' }}
                >
                  <FiCalendar className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: 'var(--accent-1)', opacity: 0.6 }} />
                </div>
                <p className="text-[14px] sm:text-[15px] mb-1">Nenhuma tarefa para hoje</p>
                <p className="text-[12px] sm:text-[13px]" style={{ color: 'var(--text-muted)' }}>
                  Que tal adicionar uma nova rotina?
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
                {eventosRecentes.map((evento) => {
                  const cat = categoriaMap[evento.categoria_id] || {}
                  return (
                    <div
                      key={evento.id}
                      className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-xl transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      {/* Hora */}
                      <div
                        className="w-11 h-11 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0"
                        style={{
                          background: `${cat.cor || '#6366f1'}18`,
                          color: cat.cor || '#6366f1',
                        }}
                      >
                        {format(new Date(evento.data_inicio), 'HH:mm')}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[13px] sm:text-[14px] truncate">
                          {evento.titulo}
                        </div>
                        {evento.descricao && (
                          <div className="text-[11px] sm:text-[12px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {evento.descricao}
                          </div>
                        )}
                      </div>

                      {/* Badge categoria — escondido no mobile se espaço apertado */}
                      <div
                        className="cat-badge flex-shrink-0 hidden sm:inline-flex"
                        style={{
                          background: `${cat.cor || '#6366f1'}15`,
                          color: cat.cor || '#6366f1',
                        }}
                      >
                        {cat.nome || 'Sem cat.'}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Categorias */}
        <div className="animate-fade-up delay-5">
          <div className="glass-card p-4 sm:p-6">
            <h2 className="text-base sm:text-[17px] font-semibold mb-4 sm:mb-5">Categorias</h2>
            <div className="space-y-1.5 sm:space-y-2">
              {categorias.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.cor }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] sm:text-[14px] font-medium truncate">{cat.nome}</div>
                  </div>
                  <div className="text-[11px] sm:text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    {eventosDoDia.filter((e) => e.categoria_id === cat.id).length}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 sm:mt-6 pt-4 sm:pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <Link
                to="/categorias"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[13px] font-medium transition-all"
                style={{ color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                Gerenciar
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
