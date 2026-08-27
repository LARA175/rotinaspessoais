// Visão de calendário — diária, semanal e mensal.
import React, { useState, useEffect } from 'react'
import { eventoService, categoriaService } from '../services/api'
import { FiCalendar, FiClock, FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi'
import { format, startOfWeek, addWeeks, startOfMonth, addMonths, addDays, isSameDay, isSameMonth, isToday, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Link } from 'react-router-dom'

function CalendarView() {
  const [visao, setVisao] = useState('semana')
  const [dataAtual, setDataAtual] = useState(new Date())
  const [eventos, setEventos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const carregarEventos = async () => {
      setCarregando(true)
      try {
        let inicio, fim
        if (visao === 'dia') {
          inicio = new Date(dataAtual).toISOString()
          fim = addDays(new Date(dataAtual), 1).toISOString()
        } else if (visao === 'semana') {
          const s = startOfWeek(dataAtual, { weekStartsOn: 0 })
          inicio = s.toISOString()
          fim = addWeeks(s, 1).toISOString()
        } else {
          const m = startOfMonth(dataAtual)
          inicio = m.toISOString()
          fim = addMonths(m, 1).toISOString()
        }
        const [evRes, catRes] = await Promise.all([
          eventoService.listar({ data_inicio: inicio, data_fim: fim }),
          categoriaService.listar()
        ])
        setEventos(evRes.data || evRes.data?.dados || [])
        setCategorias(catRes.data || catRes.data?.dados || [])
      } catch (err) {
        console.error('Erro ao carregar eventos:', err)
      } finally {
        setCarregando(false)
      }
    }
    carregarEventos()
  }, [visao, dataAtual])

  const catMap = {}
  categorias.forEach((c) => { catMap[c.id] = c })

  const navegar = (d) => {
    if (visao === 'dia') setDataAtual(addDays(dataAtual, d))
    else if (visao === 'semana') setDataAtual(addWeeks(dataAtual, d))
    else setDataAtual(addMonths(dataAtual, d))
  }

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const inicioSemana = startOfWeek(dataAtual, { weekStartsOn: 0 })
  const eventosDoDia = (dia) => eventos.filter((e) => isSameDay(new Date(e.data_inicio), dia))

  const tituloVisao = () => {
    if (visao === 'dia') return format(dataAtual, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    if (visao === 'semana') {
      const i = format(inicioSemana, "d MMM", { locale: ptBR })
      const f = format(addWeeks(inicioSemana, 1), "d MMM 'de' yyyy", { locale: ptBR })
      return `${i} — ${f}`
    }
    return format(dataAtual, "MMMM 'de' yyyy", { locale: ptBR })
  }

  // Gera os 42 dias da grade mensal (6 semanas)
  const gerarGradeMes = () => {
    const primeiroDiaMes = startOfMonth(dataAtual)
    const diaSemanaInicio = getDay(primeiroDiaMes) // 0=Dom, 1=Seg...
    const inicioGrade = addDays(primeiroDiaMes, -diaSemanaInicio)
    return Array.from({ length: 42 }, (_, i) => addDays(inicioGrade, i))
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Cabeçalho */}
      <div className="mb-5 sm:mb-8 animate-fade-up">
        <h1 className="text-2xl sm:text-[32px] font-extrabold tracking-tight">Calendário</h1>
        <p className="mt-1 text-[14px] sm:text-[15px]" style={{ color: 'var(--text-muted)' }}>
          Gerencie suas rotinas por data e categoria
        </p>
      </div>

      {/* Controles */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5 sm:mb-6 animate-fade-up delay-1">
        {/* Navegação de data */}
        <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
          <button onClick={() => navegar(-1)} className="btn-icon w-9 h-9 sm:w-10 sm:h-10">
            <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <h2 className="text-[14px] sm:text-[16px] font-semibold min-w-0 text-center px-1 truncate max-w-[220px] sm:max-w-none">
            {tituloVisao()}
          </h2>
          <button onClick={() => navegar(1)} className="btn-icon w-9 h-9 sm:w-10 sm:h-10">
            <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => setDataAtual(new Date())}
            className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[12px] sm:text-[13px] font-medium"
            style={{ color: 'var(--accent-1)', background: 'rgba(102,126,234,0.1)' }}
          >
            Hoje
          </button>
        </div>

        {/* Toggle de visão */}
        <div className="flex gap-1 p-1 rounded-xl self-center sm:self-auto" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {['dia', 'semana', 'mes'].map((v) => (
            <button
              key={v}
              onClick={() => setVisao(v)}
              className="px-3 py-1.5 sm:px-4 rounded-lg text-[12px] sm:text-[13px] font-medium transition-all"
              style={{
                background: visao === v ? 'linear-gradient(135deg, var(--accent-1), var(--accent-2))' : 'transparent',
                color: visao === v ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {v === 'mes' ? 'Mês' : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Header da semana */}
      {visao === 'semana' && (
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3 animate-fade-up delay-2">
          {diasSemana.map((dia, i) => {
            const diaData = addDays(inicioSemana, i)
            const hoje = isToday(diaData)
            return (
              <div key={dia} className="text-center py-1.5 sm:py-2">
                <div className="text-[10px] sm:text-[12px] font-medium uppercase tracking-wider mb-0.5 sm:mb-1"
                  style={{ color: hoje ? 'var(--accent-1)' : 'var(--text-muted)' }}>
                  {dia}
                </div>
                <div
                  className={`text-[18px] sm:text-[22px] font-bold ${hoje ? 'calendar-today' : ''}`}
                  style={{ color: hoje ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                >
                  {format(diaData, 'd')}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Header do mês */}
      {visao === 'mes' && (
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1.5 sm:mb-2 animate-fade-up delay-2">
          {diasSemana.map((dia) => (
            <div key={dia} className="text-center py-1.5 sm:py-2 text-[10px] sm:text-[12px] font-medium uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}>
              {dia}
            </div>
          ))}
        </div>
      )}

      {/* Conteúdo */}
      <div className="animate-fade-up delay-3">
        {carregando ? (
          <div className="space-y-2 sm:space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 sm:h-20 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : eventos.length === 0 ? (
          <div className="glass-card text-center py-12 sm:py-16">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4"
              style={{ background: 'rgba(102,126,234,0.1)' }}>
              <FiCalendar className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: 'var(--accent-1)', opacity: 0.5 }} />
            </div>
            <p className="text-[14px] sm:text-[15px] mb-1">Nenhum evento neste período</p>
            <Link to="/eventos/novo" className="btn-primary mt-4 inline-flex text-[13px]">
              <FiPlus className="w-4 h-4" />
              Criar tarefa
            </Link>
          </div>
        ) : visao === 'mes' ? (
          /* ── GRADE MENSAL ── */
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {gerarGradeMes().map((dia, i) => {
              const evs = eventosDoDia(dia)
              const mesAtual = isSameMonth(dia, dataAtual)
              const hoje = isToday(dia)
              return (
                <div
                  key={i}
                  className="min-h-[52px] sm:min-h-[80px] p-1 sm:p-1.5 rounded-lg sm:rounded-xl transition-all"
                  style={{
                    background: hoje ? 'rgba(102,126,234,0.08)' : 'rgba(255,255,255,0.02)',
                    border: hoje ? '1px solid rgba(102,126,234,0.2)' : '1px solid rgba(255,255,255,0.03)',
                    opacity: mesAtual ? 1 : 0.3,
                  }}
                >
                  <div className="text-[10px] sm:text-[12px] font-medium mb-0.5 sm:mb-1"
                    style={{ color: hoje ? 'var(--accent-1)' : mesAtual ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                    {format(dia, 'd')}
                  </div>
                  <div className="space-y-px">
                    {evs.slice(0, 2).map((ev) => {
                      const c = catMap[ev.categoria_id]
                      return (
                        <div key={ev.id} className="text-[8px] sm:text-[10px] truncate rounded px-0.5 sm:px-1 py-px font-medium"
                          style={{ background: `${c?.cor || '#6366f1'}18`, color: c?.cor || '#6366f1' }}>
                          {ev.titulo}
                        </div>
                      )
                    })}
                    {evs.length > 2 && (
                      <div className="text-[8px] sm:text-[10px]" style={{ color: 'var(--text-muted)' }}>+{evs.length - 2}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* ── LISTA (dia / semana) ── */
          <div className="space-y-2 sm:space-y-3">
            {eventos.map((evento) => {
              const cat = catMap[evento.categoria_id]
              return (
                <div key={evento.id} className="glass-card p-3 sm:p-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${cat?.cor || '#6366f1'}12` }}>
                      <span className="text-[12px] sm:text-[13px] font-bold" style={{ color: cat?.cor || '#6366f1' }}>
                        {format(new Date(evento.data_inicio), 'HH:mm')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[14px] sm:text-[15px]">{evento.titulo}</div>
                      <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-[12px] sm:text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                          <FiCalendar className="w-3 h-3" />
                          {format(new Date(evento.data_inicio), "d 'de' MMMM", { locale: ptBR })}
                        </span>
                        <span className="flex items-center gap-1 text-[12px] sm:text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                          <FiClock className="w-3 h-3" />
                          {format(new Date(evento.data_inicio), 'HH:mm')}
                        </span>
                        {cat && (
                          <span className="cat-badge" style={{ background: `${cat.cor}15`, color: cat.cor }}>
                            {cat.nome}
                          </span>
                        )}
                      </div>
                      {evento.descricao && (
                        <p className="text-[12px] sm:text-[13px] mt-1.5 sm:mt-2" style={{ color: 'var(--text-secondary)' }}>{evento.descricao}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default CalendarView
