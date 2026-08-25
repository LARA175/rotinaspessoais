import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { eventoService, categoriaService } from '../services/api'
import { FiSave, FiX, FiTag } from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'

function EventoForm({ editar = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      titulo: '',
      descricao: '',
      categoria_id: '',
      data_inicio: '',
      data_fim: '',
      convidados: '',
      lembrete_minutos: 0,
      recorrencia: 'unico',
    },
  })

  const categoriaSelecionada = watch('categoria_id')

  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        const res = await categoriaService.listar()
        const cats = res.data || res.data?.dados || []
        setCategorias(cats)

        if (cats.length > 0 && !categoriaSelecionada) {
          setValue('categoria_id', cats[0].id)
        }
      } catch (err) {
        setErro('Erro ao carregar categorias.')
      }
    }

    carregarCategorias()

    if (editar && id) {
      const carregarEvento = async () => {
        try {
          const res = await eventoService.buscar(id)
          const evento = res.data
          setValue('titulo', evento.titulo)
          setValue('descricao', evento.descricao || '')
          setValue('categoria_id', evento.categoria_id)
          setValue('data_inicio', format(new Date(evento.data_inicio), "yyyy-MM-dd'T'HH:mm"))
          setValue('data_fim', evento.data_fim ? format(new Date(evento.data_fim), "yyyy-MM-dd'T'HH:mm") : '')
          setValue('convidados', evento.convidados || '')
          setValue('lembrete_minutos', evento.lembrete_minutos || 0)
          setValue('recorrencia', evento.recorrencia || 'unico')
        } catch (err) {
          setErro('Erro ao carregar evento.')
        }
      }
      carregarEvento()
    }
  }, [editar, id, setValue])

  const onSubmit = async (dados) => {
    setCarregando(true)
    setErro(null)
    try {
      if (editar && id) {
        await eventoService.atualizar(id, dados)
      } else {
        await eventoService.criar(dados)
      }
      navigate('/')
    } catch (err) {
      setErro('Erro ao salvar evento.')
      console.error(err)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            {editar ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h1>
          <p className="text-slate-400 mt-1">
            {editar ? 'Atualize os dados da sua rotina' : 'Adicione uma nova rotina'}
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {erro && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <FiTag className="w-5 h-5" />
            Informações Gerais
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Título *
              </label>
              <input
                type="text"
                {...register('titulo', { required: 'Título é obrigatório' })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Digite o título da tarefa..."
              />
              {errors.titulo && (
                <p className="text-red-400 text-sm mt-1">{errors.titulo.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Descrição
              </label>
              <textarea
                {...register('descricao')}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                placeholder="Descrição detalhada da tarefa..."
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Categoria *
              </label>
              <select
                {...register('categoria_id', { required: 'Selecione uma categoria' })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
              >
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
              {errors.categoria_id && (
                <p className="text-red-400 text-sm mt-1">{errors.categoria_id.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            Data e Hora
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Data Início *
              </label>
              <input
                type="datetime-local"
                {...register('data_inicio', { required: 'Data de início é obrigatória' })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {errors.data_inicio && (
                <p className="text-red-400 text-sm mt-1">{errors.data_inicio.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Data Fim
              </label>
              <input
                type="datetime-local"
                {...register('data_fim')}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            Lembretes e Alertas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Lembrete (minutos antes)
              </label>
              <select
                {...register('lembrete_minutos')}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
              >
                <option value="0">Sem lembrete</option>
                <option value="5">5 minutos</option>
                <option value="10">10 minutos</option>
                <option value="30">30 minutos</option>
                <option value="60">1 hora</option>
                <option value="1440">1 dia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Recorrência
              </label>
              <select
                {...register('recorrencia')}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
              >
                <option value="unico">Único</option>
                <option value="diario">Diário</option>
                <option value="semanal">Semanal</option>
                <option value="mensal">Mensal</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            Convidados
          </h2>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Emails de Convidados
            </label>
            <input
              type="text"
              {...register('convidados')}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="nome@email.com, nome2@email.com..."
            />
            <p className="text-xs text-slate-500 mt-1">
              Separe múltiplos emails com vírgula
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={carregando}
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {carregando ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent" />
            ) : (
              <FiSave className="w-4 h-4" />
            )}
            {carregando ? 'Salvando...' : editar ? 'Atualizar' : 'Salvar Tarefa'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EventoForm
