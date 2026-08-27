// Gerenciamento de categorias — grid + modal.
import React, { useState, useEffect } from 'react'
import { categoriaService } from '../services/api'
import { FiEdit, FiTrash2, FiPlus, FiSave, FiX, FiTag } from 'react-icons/fi'

function CategoriaManager() {
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [catEditar, setCatEditar] = useState(null)
  const [formData, setFormData] = useState({ nome: '', cor: '#667eea', icone: 'calendar' })

  const cores = ['#667eea', '#764ba2', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899']

  useEffect(() => { carregar() }, [])

  const carregar = async () => {
    try {
      setCarregando(true)
      const res = await categoriaService.listar()
      setCategorias(res.data || res.data?.dados || [])
    } catch { setErro('Erro ao carregar categorias.') }
    finally { setCarregando(false) }
  }

  const abrirEdicao = (c) => {
    setCatEditar(c)
    setFormData({ nome: c.nome, cor: c.cor, icone: c.icone })
    setModoEdicao(true)
  }

  const abrirNova = () => {
    setCatEditar(null)
    setFormData({ nome: '', cor: '#667eea', icone: 'calendar' })
    setModoEdicao(true)
  }

  const salvar = async () => {
    try {
      if (catEditar) await categoriaService.atualizar(catEditar.id, formData)
      else await categoriaService.criar(formData)
      await carregar()
      setModoEdicao(false)
    } catch { setErro('Erro ao salvar categoria.') }
  }

  const deletar = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return
    try {
      await categoriaService.deletar(id)
      await carregar()
    } catch { setErro('Erro ao excluir categoria.') }
  }

  return (
    <div className="max-w-[800px] mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 animate-fade-up">
        <div>
          <h1 className="text-xl sm:text-[28px] font-extrabold tracking-tight">Categorias</h1>
          <p className="mt-0.5 sm:mt-1 text-[13px] sm:text-[14px]" style={{ color: 'var(--text-muted)' }}>
            Organize suas rotinas por categorias
          </p>
        </div>
        <button onClick={abrirNova} className="btn-primary text-[12px] sm:text-[13px]">
          <FiPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova Categoria</span>
          <span className="sm:hidden">Nova</span>
        </button>
      </div>

      {erro && (
        <div className="mb-5 p-3 sm:p-4 rounded-xl text-[12px] sm:text-[13px] animate-fade-in"
          style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185' }}>
          {erro}
        </div>
      )}

      {/* Modal */}
      {modoEdicao && (
        <div className="modal-overlay" onClick={() => setModoEdicao(false)}>
          <div className="modal-content glass-strong p-5 sm:p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base sm:text-[17px] font-semibold mb-4 sm:mb-5">
              {catEditar ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="label-field">Nome</label>
                <input value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="input-field" placeholder="Nome da categoria" />
              </div>
              <div>
                <label className="label-field">Cor</label>
                <div className="flex gap-2 flex-wrap">
                  {cores.map((c) => (
                    <button key={c} type="button"
                      onClick={() => setFormData({ ...formData, cor: c })}
                      className={`color-dot ${formData.cor === c ? 'selecionado' : ''}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="label-field">Ícone</label>
                <input value={formData.icone}
                  onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                  className="input-field" placeholder="Nome do ícone" />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 sm:gap-3 mt-5 sm:mt-6">
              <button onClick={() => setModoEdicao(false)} className="btn-ghost text-[12px] sm:text-[13px]">
                <FiX className="w-4 h-4" /> Cancelar
              </button>
              <button onClick={salvar} className="btn-primary text-[12px] sm:text-[13px]">
                <FiSave className="w-4 h-4" /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-2 sm:space-y-3">
        {carregando ? (
          <div className="space-y-2 sm:space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 sm:h-16 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : categorias.length === 0 ? (
          <div className="glass-card text-center py-10 sm:py-12">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4"
              style={{ background: 'rgba(102,126,234,0.1)' }}>
              <FiTag className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: 'var(--accent-1)', opacity: 0.5 }} />
            </div>
            <p className="text-[14px] sm:text-[15px]">Nenhuma categoria criada ainda</p>
          </div>
        ) : (
          categorias.map((cat, idx) => (
            <div key={cat.id}
              className="glass-card flex items-center justify-between p-3 sm:p-4 animate-fade-up"
              style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${cat.cor}18` }}>
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full" style={{ backgroundColor: cat.cor }} />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-[13px] sm:text-[14px] truncate">{cat.nome}</div>
                  <div className="text-[11px] sm:text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Ícone: {cat.icone}</div>
                </div>
              </div>
              <div className="flex gap-0.5 sm:gap-1 shrink-0">
                <button onClick={() => abrirEdicao(cat)} className="btn-icon w-8 h-8 sm:w-9 sm:h-9">
                  <FiEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button onClick={() => deletar(cat.id)} className="btn-icon w-8 h-8 sm:w-9 sm:h-9" style={{ color: 'var(--accent-rose)' }}>
                  <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
