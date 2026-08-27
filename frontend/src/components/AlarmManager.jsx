// Toast de alarmes e lembretes — notificacoes premium.
import React, { useState, useEffect, useRef } from 'react'
import { eventoService, categoriaService } from '../services/api'
import { FiBell, FiVolume2, FiCalendar, FiX, FiClock } from 'react-icons/fi'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'

function AlarmManager() {
  const [eventosProximos, setEventosProximos] = useState([])
  const [notificacao, setNotificacao] = useState(null)
  const audioRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    const buscar = async () => {
      try {
        const agora = new Date()
        const [evRes, catRes] = await Promise.all([
          eventoService.listar({ data_inicio: agora.toISOString(), data_fim: new Date(agora.getTime() + 86400000).toISOString() }),
          categoriaService.listar()
        ])
        const evs = evRes.data || evRes.data?.dados || []
        const cats = catRes.data || catRes.data?.dados || []
        const map = {}
        cats.forEach((c) => { map[c.id] = c })
        setEventosProximos(evs.map((e) => ({
          ...e,
          categoria_nome: map[e.categoria_id]?.nome,
          categoria_cor: map[e.categoria_id]?.cor,
        })))
      } catch (err) { console.error('Erro ao buscar alarmes:', err) }
    }
    buscar()
    const i = setInterval(buscar, 60000)
    return () => clearInterval(i)
  }, [])

  useEffect(() => {
    const verificar = () => {
      const agora = new Date()
      eventosProximos.forEach((ev) => {
        const diff = Math.floor((new Date(ev.data_inicio) - agora) / 60000)
        if (diff === 0 && !ev._alarmado) { ev._alarmado = true; dispararAlarme(ev) }
        else if (diff === ev.lembrete_minutos && !ev._lembrado) { ev._lembrado = true; dispararLembrete(ev) }
      })
    }
    const i = setInterval(verificar, 1000)
    return () => clearInterval(i)
  }, [eventosProximos])

  const dispararAlarme = (ev) => {
    setNotificacao({ tipo: 'alarme', titulo: ev.titulo, ev, ts: Date.now() })
    if (audioRef.current) audioRef.current.play().catch(() => {})
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Alarme de Rotina', { body: `${ev.titulo} — Hora de executar!` })
    }
    timeoutRef.current = setTimeout(() => {
      setNotificacao(null)
      if (audioRef.current) audioRef.current.pause()
    }, 60000)
  }

  const dispararLembrete = (ev) => {
    setNotificacao({ tipo: 'lembrete', titulo: ev.titulo, ev, ts: Date.now(),
      mensagem: `${ev.lembrete_minutos} minuto(s) antes` })
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Lembrete de Rotina', { body: `${ev.titulo} em ${ev.lembrete_minutos} min` })
    }
  }

  const fechar = () => {
    setNotificacao(null)
    if (audioRef.current) audioRef.current.pause()
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  useEffect(() => {
    if ('Notification' in window) Notification.requestPermission()
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [])

  const eventosHoje = eventosProximos.filter((ev) =>
    new Date(ev.data_inicio).toDateString() === new Date().toDateString()
  )

  return (
    <>
      <audio ref={audioRef}>
        <source src="/sounds/alarme.mp3" type="audio/mpeg" />
        <source src="/sounds/alarme.wav" type="audio/wav" />
      </audio>

      {/* Toast de notificacao */}
      {notificacao && (
        <div className="toast">
          <div className="glass-strong p-4" style={{
            borderLeft: `3px solid ${notificacao.tipo === 'alarme' ? '#06b6d4' : '#f59e0b'}`,
          }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: notificacao.tipo === 'alarme' ? 'rgba(6,182,212,0.15)' : 'rgba(245,158,11,0.15)' }}>
                <FiBell className="w-4 h-4"
                  style={{ color: notificacao.tipo === 'alarme' ? '#06b6d4' : '#f59e0b' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-wider mb-0.5"
                  style={{ color: notificacao.tipo === 'alarme' ? '#06b6d4' : '#f59e0b' }}>
                  {notificacao.tipo === 'alarme' ? 'Alarme' : 'Lembrete'}
                </div>
                <div className="text-[14px] font-medium truncate" style={{ color: '#f1f5f9' }}>
                  {notificacao.titulo}
                </div>
                {notificacao.mensagem && (
                  <div className="text-[12px] mt-0.5" style={{ color: '#94a3b8' }}>
                    {notificacao.mensagem}
                  </div>
                )}
                <div className="flex items-center gap-1 mt-1 text-[12px]" style={{ color: '#64748b' }}>
                  <FiClock className="w-3 h-3" />
                  {format(new Date(notificacao.ev.data_inicio), 'HH:mm', { locale: ptBR })}
                </div>
              </div>
              <button onClick={fechar} className="btn-icon" style={{ width: '28px', height: '28px' }}>
                <FiX className="w-3.5 h-3.5" />
              </button>
            </div>
            {notificacao.tipo === 'alarme' && (
              <div className="flex items-center gap-1.5 mt-3 pt-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <FiVolume2 className="w-3.5 h-3.5 animate-pulse" style={{ color: '#06b6d4' }} />
                <span className="text-[11px] font-medium" style={{ color: '#06b6d4' }}>Som ativo</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Eventos de hoje — mini floating */}
      {eventosHoje.length > 0 && !notificacao && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-[276px] sm:right-auto z-40 max-w-[280px] space-y-2"
          style={{ opacity: 0.7 }}>
          {eventosHoje.slice(0, 2).map((ev) => (
            <div key={ev.id} className="glass-subtle flex items-center gap-2.5 p-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${ev.categoria_cor || '#6366f1'}15` }}>
                <FiCalendar className="w-3.5 h-3.5" style={{ color: ev.categoria_cor || '#6366f1' }} />
              </div>
              <div className="min-w-0">
                <div className="text-[12px] font-medium truncate">{ev.titulo}</div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {format(new Date(ev.data_inicio), 'HH:mm')} — {ev.categoria_nome}
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
