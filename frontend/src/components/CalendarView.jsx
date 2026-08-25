import React, { useState, useEffect } from 'react'
import { eventoService, categoriaService } from '../services/api'
import { FiCalendar, FiClock, FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi'
import { format, startOfWeek, addWeeks, startOfMonth, addMonths, addDays, isSameDay, isSameMonth, isToday } from 'date-fns'
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
          const inicioDia = new Date(dataAtual)
          inicio = inicioDia.toISOString()
          const fimDia = addDays(inicioDia, 1)
          fim = fimDia.toISOString()
        } else if (visao === 'semana') {
          const inicioSemana = startOfWeek(dataAtual, { weekStartsOn: 0 })
          inicio = inicioSemana.toISOString()
          fim = addWeeks(inicioSemana, 1).toISOString()
        } else {
          const inicioMes = startOfMonth(dataAtual)
          inicio = inicioMes.toISOString()
          fim = addMonths(inicioMes, 1).toISOString()
        }

        const [eventosRes, categoriasRes] = await Promise.all([
          eventoService.listar({ data_inicio: inicio, data_fim: fim }),
          categoriaService.listar()
        ])

        setEventos(eventosRes.data || eventosRes.data?.dados || [])
        setCategorias(categoriasRes.data || categoriasRes.data?.dados || [])
      } catch (err) {
        console.error('Erro ao carregar eventos:', err)
      } finally {
        setCarregando(false)
      }
    }

    carregarEventos()
  }, [visao, dataAtual])

  const categoriaMap = {}
  categorias.forEach((cat) => {
    categoriaMap[cat.id] = cat
  })

  const navegar = (direcao) => {
    if (visao === 'dia') {
      setDataAtual(addDays(dataAtual, direcao))
    } else if (visao === 'semana') {
      setDataAtual(addWeeks(dataAtual, direcao))
    } else {
      setDataAtual(addMonths(dataAtual, direcao))
    }
  }

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const inicioSemana = startOfWeek(dataAtual, { weekStartsOn: 0 })

  const eventosDoDia = (dia) => {
    return eventos.filter((evento) => {
      const dataEvento = new Date(evento.data_inicio)
      return isSameDay(dataEvento, dia)
    })
  }

  const formatarTituloVisao = () => {
    if (visao === 'dia') {
      return format(dataAtual, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    } else if (visao === 'semana') {
      const inicio = format(inicioSemana, "d MMM", { locale: ptBR })
      const fim = format(addWeeks(inicioSemana, 1), "d MMM 'de' yyyy", { locale: ptBR })
      return `${inicio} - ${fim}`
    } else {
      return format(dataAtual, "MMMM 'de' yyyy", { locale: ptBR })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Calendário</h1>
        <p className="text-slate-400 mt-2">Gerencie suas rotinas por data e categoria</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navegar(-1)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-slate-200 min-w-[200px]">
            {formatarTituloVisao()}
          </h2>
          <button
            onClick={() => navegar(1)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setDataAtual(new Date())}
            className="px-3 py-1 text-sm text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Hoje
          </button>
        </div>

        <div className="flex gap-2">
          {['dia', 'semana', 'mês'].map((v) => (
            <button
              key={v}
              onClick={() => setVisao(v)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                visao === v
                  ? 'bg-cyan-500 text-slate-900'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {visao === 'semana' && (
        <div className="grid grid-cols-7 gap-1 mb-4">
          {diasSemana.map((dia, i) => {
            const diaData = addDays(inicioSemana, i)
            const hoje = isToday(diaData)
            const mesAtual = isSameMonth(diaData, dataAtual)
            return (
              <div
                key={dia}
                className={`text-center p-2 border-b-2 ${
                  hoje
                    ? 'border-cyan-500 text-cyan-400'
                    : mesAtual
                      ? 'border-slate-700 text-slate-300'
                      : 'border-slate-700 text-slate-600'
                }`}
              >
                <div className="font-medium">{dia}</div>
                <div className="text-2xl">{format(diaData, 'd')}</div>
              </div>
            )
          })}
        </div>
      )}

      {visao === 'mês' && (
        <div className="grid grid-cols-7 gap-1 mb-4">
          {diasSemana.map((dia) => (
            <div key={dia} className="text-center p-2 text-slate-400 text-sm">
              {dia}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {carregando ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-20 bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-12 text-slate-400 glass-card rounded-xl">
            <FiCalendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Nenhum evento encontrado neste período.</p>
            <Link
              to="/eventos/novo"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-lg transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Criar nova tarefa
            </Link>
          </div>
        ) : (
          <div className={visao === 'mês' ? 'grid grid-cols-7 gap-2' : 'space-y-3'}>
            {visao === 'mês'
              ? Array.from({ length: 35 }).map((_, i) => {
                  const dia = addDays(startOfMonth(dataAtual), i)
                  const eventosDia = eventosDoDia(dia)
                  const mesAtual = isSameMonth(dia, dataAtual)
                  const hoje = isToday(dia)
                  return (
                    <div
                      key={i}
                      className={`min-h-[80px] p-1 border border-slate-700 rounded-lg ${
                        !mesAtual ? 'bg-slate-800/30 opacity-40' : 'bg-slate-800/50'
                      } ${hoje ? 'ring-2 ring-cyan-500' : ''}`}
                    >
                      <div className={`text-xs mb-1 ${mesAtual ? 'text-slate-300' : 'text-slate-500'}`}>
                        {format(dia, 'd')}
                      </div>
                      <div className="space-y-0.5">
                        {eventosDia.slice(0, 2).map((evento) => {
                          const cat = categoriaMap[evento.categoria_id]
                          return (
                            <div
                              key={evento.id}
                              className="text-xs truncate rounded px-1 py-0.5"
                              style={{
                                backgroundColor: `${cat?.cor || '#6366f1'}20`,
                                color: cat?.cor || '#6366f1',
                              }}
                            >
                              {evento.titulo}
                            </div>
                          )
                        })}
                        {eventosDia.length > 2 && (
                          <div className="text-xs text-slate-500">+{eventosDia.length - 2} mais</div>
                        )}
                      </div>
                    </div>
                  )
                })
              : eventos.map((evento) => {
                  const cat = categoriaMap[evento.categoria_id]
                  return (
                    <div
                      key={evento.id}
                      className="glass-card rounded-xl p-4 border border-slate-700"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-3 h-3 rounded-full mt-1"
                          style={{ backgroundColor: cat?.cor || evento.cor_personalizada || '#6366f1' }}
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-slate-100">{evento.titulo}</div>
                          <div className="text-sm text-slate-400 flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <FiCalendar className="w-3 h-3" />
                              {format(new Date(evento.data_inicio), "d 'de' MMMM", { locale: ptBR })}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              {format(new Date(evento.data_inicio), "HH:mm")}
                            </span>
                            {cat && (
                              <span
                                className="text-xs px-2 py-0.5 rounded"
                                style={{ backgroundColor: `${cat.cor}20`, color: cat.cor }}
                              >
                                {cat.nome}
                              </span>
                            )}
                          </div>
                          {evento.descricao && (
                            <p className="text-sm text-slate-300 mt-2">{evento.descricao}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <Link
          to="/eventos/novo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-lg font-semibold transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Nova Tarefa
        </Link>
      </div>
    </div>
  )
}

export default CalendarView
