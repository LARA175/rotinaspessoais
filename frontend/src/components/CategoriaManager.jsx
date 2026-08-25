import React, { useState, useEffect } from 'react'
import { categoriaService } from '../services/api'
import { FiEdit, FiTrash2, FiPlus, FiSave, FiX, FiTag } from 'react-icons/fi'

function CategoriaManager() {
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [categoriaEditar, setCategoriaEditar] = useState(null)
  const [formData, setFormData] = useState({ nome: '', cor: '#6366f1', icone: 'calendar' })

  const coresPadrao = [
    '#3b82f6', '#ec4899', '#10b981', '#f59e0b',
    '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16',
  ]

  useEffect(() => {
    carregarCategorias()
  }, [])

  const carregarCategorias = async () => {
    try {
      setCarregando(true)
      const res = await categoriaService.listar()
      setCategorias(res.data || res.data?.dados || [])
    } catch (err) {
      setErro('Erro ao carregar categorias.')
    } finally {
      setCarregando(false)
    }
  }

  const abrirEdicao = (categoria) => {
    setCategoriaEditar(categoria)
    setFormData({ nome: categoria.nome, cor: categoria.cor, icone: categoria.icone })
    setModoEdicao(true)
  }

  const abrirNova = () => {
    setCategoriaEditar(null)
    setFormData({ nome: '', cor: '#6366f1', icone: 'calendar' })
    setModoEdicao(true)
  }

  const fecharEdicao = () => {
    setModoEdicao(false)
    setCategoriaEditar(null)
  }

  const salvar = async () => {
    try {
      if (categoriaEditar) {
        await categoriaService.atualizar(categoriaEditar.id, formData)
      } else {
        await categoriaService.criar(formData)
      }
      await carregarCategorias()
      fecharEdicao()
    } catch (err) {
      setErro('Erro ao salvar categoria.')
    }
  }

  const deletar = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return
    try {
      await categoriaService.deletar(id)
      await carregarCategorias()
    } catch (err) {
      setErro('Erro ao excluir categoria.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Gerenciar Categorias</h1>
          <p className="text-slate-400 mt-1">
            Organize suas rotinas por categorias
          </p>
        </div>
        <button
          onClick={abrirNova}
          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-lg font-semibold transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Nova Categoria
        </button>
      </div>

      {erro && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {erro}
        </div>
      )}

      {modoEdicao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">
              {categoriaEditar ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Nome da categoria..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Cor
                </label>
                <div className="flex gap-2 mb-2">
                  {coresPadrao.map((cor) => (
                    <button
                      key={cor}
                      type="button"
                      onClick={() => setFormData({ ...formData, cor })}
                      className={`w-8 h-8 rounded-full transition-all ${
                        formData.cor === cor ? 'ring-2 ring-offset-2 ring-slate-300' : ''
                      }`}
                      style={{ backgroundColor: cor }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ícone
                </label>
                <input
                  type="text"
                  value={formData.icone}
                  onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Nome do ícone..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={fecharEdicao}
                className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <FiX className="w-4 h-4 inline mr-1" />
                Cancelar
              </button>
              <button
                onClick={salvar}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-lg font-semibold transition-colors"
              >
                <FiSave className="w-4 h-4 inline mr-1" />
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {carregando ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-16 bg-slate-700 rounded-xl"></div>
            ))}
          </div>
        ) : categorias.length === 0 ? (
          <div className="text-center py-8 text-slate-400 glass-card rounded-xl">
            <FiTag className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma categoria criada ainda.</p>
          </div>
        ) : (
          categorias.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-4 glass-card rounded-xl border border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.cor }} />
                <div>
                  <div className="font-medium text-slate-200">{cat.nome}</div>
                  <div className="text-sm text-slate-400">Ícone: {cat.icone}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => abrirEdicao(cat)}
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <FiEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deletar(cat.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CategoriaManager
