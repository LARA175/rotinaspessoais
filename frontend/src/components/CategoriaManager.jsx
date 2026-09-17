// Gerenciamento de categorias — presets prontos, grade de ícones e lista ilustrada.
import React, { useState, useEffect } from 'react'
import { categoriaService } from '../services/api'
import { FiEdit, FiTrash2, FiPlus, FiSave, FiX, FiTag } from 'react-icons/fi'
import CategoriaIcone, { CATALOGO_ICONES, PRESETS_CATEGORIAS } from './CategoriaIcone'

function CategoriaManager() {
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [catEditar, setCatEditar] = useState(null)
  const [formData, setFormData] = useState({ nome: '', cor: '#5f7f52', icone: 'livro' })

  const cores = ['#5f7f52', '#47633c', '#8aaa7b', '#b08945', '#7a9e7e', '#c4a265', '#b0563e', '#a9bfa0']

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
    setFormData({ nome: '', cor: '#5f7f52', icone: 'livro' })
    setModoEdicao(true)
  }

  const aplicarPreset = (preset) => {
    setFormData({ nome: preset.nome, cor: preset.cor, icone: preset.icone })
  }

  const salvar = async () => {
    if (!formData.nome.trim()) { setErro('Dê um nome para a categoria.') ; return }
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
      <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8 animate-fade-up">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-[28px] font-extrabold tracking-tight">Categorias</h1>
          <p className="mt-0.5 sm:mt-1 text-[13px] sm:text-[14px]" style={{ color: 'var(--text-muted)' }}>
            Organize suas rotinas por categorias
          </p>
        </div>
        <button onClick={abrirNova} className="btn-primary shrink-0 whitespace-nowrap">
          <FiPlus className="w-4 h-4" />
          Nova Categoria
        </button>
      </div>

      {erro && (
        <div className="mb-5 p-3 sm:p-4 rounded-xl text-[12px] sm:text-[13px] animate-fade-in"
          style={{ background: 'rgba(176,86,62,0.1)', border: '1.5px solid rgba(176,86,62,0.35)', color: '#b0563e' }}>
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
              {/* Presets — só ao criar */}
              {!catEditar && (
                <div>
                  <label className="label-field">Comece por uma sugestão</label>
                  <div className="lista-presets flex gap-2 flex-wrap">
                    {PRESETS_CATEGORIAS.map((p) => (
                      <button key={p.nome} type="button"
                        onClick={() => aplicarPreset(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all"
                        style={{
                          background: formData.nome === p.nome ? 'var(--matcha)' : 'rgba(95,127,82,0.06)',
                          border: formData.nome === p.nome ? '1.5px solid var(--sage)' : '1.5px solid #d5dcc0',
                          color: 'var(--sage-dark)',
                          fontWeight: 700,
                        }}>
                        <CategoriaIcone icone={p.icone} cor={p.cor} tamanho={15} />
                        {p.nome}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="label-field">Nome</label>
                <input value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="input-field" placeholder="Ex: Estudos, Casa, Esporte..." />
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
                <div className="grade-icones grid grid-cols-7 sm:grid-cols-9 gap-1.5">
                  {CATALOGO_ICONES.map(({ chave, rotulo }) => {
                    const ativo = formData.icone === chave
                    return (
                      <button key={chave} type="button" title={rotulo}
                        onClick={() => setFormData({ ...formData, icone: chave })}
                        className="flex items-center justify-center p-2 rounded-xl transition-all"
                        style={{
                          background: ativo ? 'var(--matcha)' : 'rgba(95,127,82,0.05)',
                          border: ativo ? '1.5px solid var(--sage)' : '1.5px solid #dfe4cd',
                        }}>
                        <CategoriaIcone icone={chave} cor={ativo ? 'var(--sage-dark)' : formData.cor} tamanho={20} />
                      </button>
                    )
                  })}
                </div>
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
              <div key={i} className="h-14 sm:h-16 rounded-xl animate-pulse" style={{ background: 'rgba(95,127,82,0.1)' }} />
            ))}
          </div>
        ) : categorias.length === 0 ? (
          <div className="glass-card text-center py-10 sm:py-12">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4"
              style={{ background: 'rgba(95,127,82,0.12)' }}>
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
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${cat.cor}26`, border: `1.5px solid ${cat.cor}55` }}>
                  <CategoriaIcone icone={cat.icone} cor={cat.cor} tamanho={22} />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[13px] sm:text-[14px] truncate">{cat.nome}</div>
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
