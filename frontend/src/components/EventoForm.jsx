// Formulário de criação/edição de eventos.
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { eventoService, categoriaService } from '../services/api'
import { FiSave, FiX, FiTag, FiCalendar, FiUsers, FiBell } from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'

function EventoForm({ editar = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      titulo: '', descricao: '', categoria_id: '', data_inicio: '', data_fim: '',
      convidados: '', lembrete_minutos: 0, recorrencia: 'unico',
    },
  })

  const categoriaSel = watch('categoria_id')

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await categoriaService.listar()
        const cats = res.data || res.data?.dados || []
        setCategorias(cats)
        if (cats.length > 0 && !categoriaSel) setValue('categoria_id', cats[0].id)
      } catch { setErro('Erro ao carregar categorias.') }
    }
    carregar()
    if (editar && id) {
      const carregarEvento = async () => {
        try {
          const res = await eventoService.buscar(id)
          const ev = res.data
          setValue('titulo', ev.titulo)
          setValue('descricao', ev.descricao || '')
          setValue('categoria_id', ev.categoria_id)
          setValue('data_inicio', format(new Date(ev.data_inicio), "yyyy-MM-dd'T'HH:mm"))
          setValue('data_fim', ev.data_fim ? format(new Date(ev.data_fim), "yyyy-MM-dd'T'HH:mm") : '')
          setValue('convidados', ev.convidados || '')
          setValue('lembrete_minutos', ev.lembrete_minutos || 0)
          setValue('recorrencia', ev.recorrencia || 'unico')
        } catch { setErro('Erro ao carregar evento.') }
      }
      carregarEvento()
    }
  }, [editar, id, setValue])

  const onSubmit = async (dados) => {
    setCarregando(true)
    setErro(null)
    try {
      if (editar && id) await eventoService.atualizar(id, dados)
      else await eventoService.criar(dados)
      navigate('/')
    } catch (err) {
      setErro('Erro ao salvar evento.')
      console.error(err)
    } finally { setCarregando(false) }
  }

  const Section = ({ icon: Icon, title, children }) => (
    <div className="glass-card p-4 sm:p-6">
      <h2 className="text-[14px] sm:text-[15px] font-semibold mb-4 sm:mb-5 flex items-center gap-2 sm:gap-2.5">
        <Icon className="w-4 h-4" style={{ color: 'var(--accent-1)' }} />
        {title}
      </h2>
      {children}
    </div>
  )

  return (
    <div className="max-w-[720px] mx-auto">
      <div className="flex items-center justify-between mb-6 sm:mb-8 animate-fade-up">
        <div>
          <h1 className="text-xl sm:text-[28px] font-extrabold tracking-tight">
            {editar ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h1>
          <p className="mt-0.5 sm:mt-1 text-[13px] sm:text-[14px]" style={{ color: 'var(--text-muted)' }}>
            {editar ? 'Atualize os dados da sua rotina' : 'Adicione uma nova rotina'}
          </p>
        </div>
        <button onClick={() => navigate('/')} className="btn-icon w-9 h-9 sm:w-10 sm:h-10">
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {erro && (
        <div className="mb-5 p-3 sm:p-4 rounded-xl text-[12px] sm:text-[13px] animate-fade-in"
          style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185' }}>
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        {/* Informações Gerais */}
        <div className="animate-fade-up delay-1">
          <Section icon={FiTag} title="Informações Gerais">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="label-field">Título *</label>
                <input {...register('titulo', { required: 'Título é obrigatório' })}
                  className="input-field" placeholder="Ex: Aula de Matemática" />
                {errors.titulo && <p className="text-[11px] sm:text-[12px] mt-1.5" style={{ color: '#fb7185' }}>{errors.titulo.message}</p>}
              </div>
              <div>
                <label className="label-field">Descrição</label>
                <textarea {...register('descricao')} className="input-field" rows="3"
                  placeholder="Detalhes da tarefa..." />
              </div>
              <div>
                <label className="label-field">Categoria *</label>
                <select {...register('categoria_id', { required: 'Selecione uma categoria' })}
                  className="input-field">
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                {errors.categoria_id && <p className="text-[11px] sm:text-[12px] mt-1.5" style={{ color: '#fb7185' }}>{errors.categoria_id.message}</p>}
              </div>
            </div>
          </Section>
        </div>

        {/* Data e Hora */}
        <div className="animate-fade-up delay-2">
          <Section icon={FiCalendar} title="Data e Hora">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="label-field">Data Início *</label>
                <input type="datetime-local" {...register('data_inicio', { required: 'Obrigatório' })}
                  className="input-field" />
                {errors.data_inicio && <p className="text-[11px] sm:text-[12px] mt-1.5" style={{ color: '#fb7185' }}>{errors.data_inicio.message}</p>}
              </div>
              <div>
                <label className="label-field">Data Fim</label>
                <input type="datetime-local" {...register('data_fim')} className="input-field" />
              </div>
            </div>
          </Section>
        </div>

        {/* Lembretes */}
        <div className="animate-fade-up delay-3">
          <Section icon={FiBell} title="Lembretes e Alertas">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="label-field">Lembrete (minutos antes)</label>
                <select {...register('lembrete_minutos')} className="input-field">
                  <option value="0">Sem lembrete</option>
                  <option value="5">5 minutos</option>
                  <option value="10">10 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="1440">1 dia</option>
                </select>
              </div>
              <div>
                <label className="label-field">Recorrência</label>
                <select {...register('recorrencia')} className="input-field">
                  <option value="unico">Único</option>
                  <option value="diario">Diário</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensal">Mensal</option>
                </select>
              </div>
            </div>
          </Section>
        </div>

        {/* Convidados */}
        <div className="animate-fade-up delay-4">
          <Section icon={FiUsers} title="Convidados">
            <div>
              <label className="label-field">E-mails de Convidados</label>
              <input {...register('convidados')} className="input-field"
                placeholder="email@exemplo.com, email2@exemplo.com" />
              <p className="text-[11px] sm:text-[12px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                Separe múltiplos e-mails com vírgula
              </p>
            </div>
          </Section>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-2.5 sm:gap-3 pt-2 animate-fade-up delay-5">
          <button type="button" onClick={() => navigate('/')} className="btn-ghost text-[12px] sm:text-[13px] px-3 sm:px-4">
            Cancelar
          </button>
          <button type="submit" disabled={carregando} className="btn-primary text-[12px] sm:text-[13px] px-4 sm:px-5">
            {carregando ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FiSave className="w-4 h-4" />
            )}
            {carregando ? 'Salvando...' : editar ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EventoForm
