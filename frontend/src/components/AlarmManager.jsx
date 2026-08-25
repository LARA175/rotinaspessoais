import React, { useState, useEffect, useRef } from 'react'
import { eventoService, categoriaService } from '../services/api'
import { FiBell, FiVolume2, FiCalendar, FiX, FiClock } from 'react-icons/fi'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'

function AlarmManager() {
  const [eventosProximos, setEventosProximos] = useState([])
  const [notificacaoAtual, setNotificacaoAtual] = useState(null)
  const audioRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    const buscarEventos = async () => {
      try {
        const agora = new Date()
        const inicio = agora.toISOString()
        const fim = new Date(agora.getTime() + 24 * 60 * 60 * 1000).toISOString()

        const [eventosRes, categoriasRes] = await Promise.all([
          eventoService.listar({ data_inicio: inicio, data_fim: fim }),
          categoriaService.listar()
        ])

        const eventos = eventosRes.data || eventosRes.data?.dados || []
        const categorias = categoriasRes.data || categoriasRes.data?.dados || []

        const categoriaMap = {}
        categorias.forEach((cat) => {
          categoriaMap[cat.id] = cat
        })

        const eventosComCategoria = eventos.map((evento) => ({
          ...evento,
          categoria_nome: categoriaMap[evento.categoria_id]?.nome,
          categoria_cor: categoriaMap[evento.categoria_id]?.cor,
        }))

        setEventosProximos(eventosComCategoria)
      } catch (err) {
        console.error('Erro ao buscar eventos para alarmes:', err)
      }
    }

    buscarEventos()
    const intervalo = setInterval(buscarEventos, 60000)
    return () => clearInterval(intervalo)
  }, [])

  useEffect(() => {
    const verificarAlarmes = () => {
      const agora = new Date()

      eventosProximos.forEach((evento) => {
        const dataEvento = new Date(evento.data_inicio)
        const diffMinutos = Math.floor((dataEvento - agora) / (1000 * 60))

        if (diffMinutos === 0 && !evento._alarmado) {
          evento._alarmado = true
          dispararAlarme(evento)
        } else if (diffMinutos === evento.lembrete_minutos && !evento._lembrado) {
          evento._lembrado = true
          dispararLembrete(evento)
        }
      })
    }

    const intervalo = setInterval(verificarAlarmes, 1000)
    return () => clearInterval(intervalo)
  }, [eventosProximos])

  const dispararAlarme = (evento) => {
    setNotificacaoAtual({
      tipo: 'alarme',
      titulo: evento.titulo,
      evento,
      timestamp: Date.now(),
    })

    if (audioRef.current) {
      audioRef.current.play().catch((err) => console.log('Autoplay bloqueado:', err))
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Alarme de Rotina', {
        body: `${evento.titulo} - Hora de executar!`,
        icon: '/favicon.ico',
      })
    }

    timeoutRef.current = setTimeout(() => {
      setNotificacaoAtual(null)
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }, 60000)
  }

  const dispararLembrete = (evento) => {
    setNotificacaoAtual({
      tipo: 'lembrete',
      titulo: evento.titulo,
      evento,
      timestamp: Date.now(),
      mensagem: `${evento.lembrete_minutos} minuto(s) antes`,
    })

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Lembrete de Rotina', {
        body: `${evento.titulo} em ${evento.lembrete_minutos} minutos`,
        icon: '/favicon.ico',
      })
    }
  }

  const fecharNotificacao = () => {
    setNotificacaoAtual(null)
    if (audioRef.current) {
      audioRef.current.pause()
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const solicitarPermissaoNotificacao = () => {
    if ('Notification' in window) {
      Notification.requestPermission()
    }
  }

  useEffect(() => {
    solicitarPermissaoNotificacao()
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const eventosHoje = eventosProximos.filter((evento) => {
    const dataEvento = new Date(evento.data_inicio)
    const hoje = new Date()
    return dataEvento.toDateString() === hoje.toDateString()
  })

  return (
    <>
      <audio ref={audioRef}>
        <source src="/sounds/alarme.mp3" type="audio/mpeg" />
        <source src="/sounds/alarme.wav" type="audio/wav" />
      </audio>

      {notificacaoAtual && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full">
          <div
            className={`p-4 rounded-xl shadow-lg border text-slate-900 ${
              notificacaoAtual.tipo === 'alarme'
                ? 'bg-cyan-400 border-cyan-300'
                : 'bg-amber-400 border-amber-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <FiBell className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-bold">
                  {notificacaoAtual.tipo === 'alarme' ? 'ALARME' : 'LEMBRETE'}
                </div>
                <div className="text-sm mt-1">{notificacaoAtual.titulo}</div>
                {notificacaoAtual.mensagem && (
                  <div className="text-xs opacity-80 mt-1">
                    {notificacaoAtual.mensagem}
                  </div>
                )}
                <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
                  <FiClock className="w-3 h-3" />
                  {format(new Date(notificacaoAtual.evento.data_inicio), "HH:mm", { locale: ptBR })}
                </div>
              </div>
              <button
                onClick={fecharNotificacao}
                className="p-1 hover:bg-black/10 rounded"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
            {notificacaoAtual.tipo === 'alarme' && (
              <div className="mt-2 text-center">
                <FiVolume2 className="w-4 h-4 inline animate-pulse" />
                <span className="text-xs ml-1">Som ativo</span>
              </div>
            )}
          </div>
        </div>
      )}

      {eventosHoje.length > 0 && (
        <div className="fixed bottom-4 left-4 z-40 max-w-xs w-full opacity-80">
          {eventosHoje.slice(0, 3).map((evento) => (
            <div
              key={evento.id}
              className="glass-card rounded-lg p-3 mb-2 border border-slate-700"
            >
              <div className="flex items-center gap-2">
                <FiCalendar className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-200">{evento.titulo}</div>
                  <div className="text-xs text-slate-400">
                    {format(new Date(evento.data_inicio), "HH:mm", { locale: ptBR })}
                    {' - '}
                    {evento.categoria_nome}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default AlarmManager
