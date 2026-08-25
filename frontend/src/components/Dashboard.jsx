import React, { useState, useEffect } from 'react'
import { eventoService, categoriaService } from '../services/api'
import { FiCalendar, FiClock, FiPlus } from 'react-icons/fi'
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
  categorias.forEach((cat) => {
    categoriaMap[cat.id] = cat
  })

  const eventosDoDia = eventosHoje.filter((e) => {
    const dataEvento = new Date(e.data_inicio)
    const hoje = new Date()
    return dataEvento.toDateString() === hoje.toDateString()
  })

  const eventosOrdenados = [...eventosDoDia].sort((a, b) => {
    const timeA = new Date(a.data_inicio)
    const timeB = new Date(b.data_inicio)
    return timeA - timeB
  })

  const eventosRecentes = eventosOrdenados.slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400 mt-2">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {erro && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {erro}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-cyan-400">{eventosDoDia.length}</div>
          <div className="text-slate-400">Tarefas de Hoje</div>
        </div>
        <div className="glass-card rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-blue-400">{categorias.length}</div>
          <div className="text-slate-400">Categorias Ativas</div>
        </div>
        <div className="glass-card rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-400">
            {eventosDoDia.filter((e) => e.lembrete_minutos > 0).length}
          </div>
          <div className="text-slate-400">Com Lembrete</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-200">Tarefas de Hoje</h2>
              <Link
                to="/eventos/novo"
                className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-lg text-sm font-semibold transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Nova
              </Link>
            </div>

            {carregando ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse h-16 bg-slate-700 rounded-lg"></div>
                ))}
              </div>
            ) : eventosRecentes.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <FiCalendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma tarefa para hoje. Que tal adicionar uma?</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eventosRecentes.map((evento) => {
                  const cat = categoriaMap[evento.categoria_id] || {}
                  return (
                    <div
                      key={evento.id}
                      className="border border-slate-700 rounded-lg p-3 hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cat.cor || evento.cor_personalizada || '#6366f1' }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-slate-200">{evento.titulo}</div>
                          <div className="text-sm text-slate-400 flex items-center gap-2">
                            <FiClock className="w-3 h-3" />
                            {format(new Date(evento.data_inicio), "HH:mm")}
                            {evento.descricao && (
                              <span className="truncate ml-2">{evento.descricao}</span>
                            )}
                          </div>
                        </div>
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{ backgroundColor: cat.cor || '#3b82f6' }}
                        >
                          {cat.nome || 'Categoria'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Categorias</h2>
            <div className="space-y-3">
              {categorias.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 p-3 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.cor }} />
                  <div className="flex-1">
                    <div className="font-medium text-slate-200">{cat.nome}</div>
                    <div className="text-sm text-slate-400">
                      {eventosDoDia.filter((e) => e.categoria_id === cat.id).length} tarefas hoje
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 glass-card rounded-xl p-6">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Navegação Rápida</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/calendario"
            className="flex items-center justify-center gap-2 p-4 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors text-center"
          >
            <FiCalendar className="w-5 h-5 text-cyan-400" />
            <span>Calendário</span>
          </Link>
          <Link
            to="/eventos/novo"
            className="flex items-center justify-center gap-2 p-4 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors text-center"
          >
            <FiPlus className="w-5 h-5 text-cyan-400" />
            <span>Nova Tarefa</span>
          </Link>
          <Link
            to="/categorias"
            className="flex items-center justify-center gap-2 p-4 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors text-center"
          >
            <FiCalendar className="w-5 h-5 text-cyan-400" />
            <span>Categorias</span>
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 p-4 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors text-center"
          >
            <FiClock className="w-5 h-5 text-cyan-400" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
