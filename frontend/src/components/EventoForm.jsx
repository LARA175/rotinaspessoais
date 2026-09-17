function EventoForm({ editar = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  // Lista fixa de horas 24h (00 a 23) e minutos (00 a 59) — sem AM/PM, sempre Brasil
  const HORAS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const MINUTOS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      titulo: '', descricao: '', categoria_id: '', data_dia: '',
      hini_h: '', hini_m: '', hfim_h: '', hfim_m: '',
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
          // Separa data e hora 24h (sem AM/PM) nos selects
          setValue('data_dia', format(new Date(ev.data_inicio), 'yyyy-MM-dd'))
          const [hiH, hiM] = format(new Date(ev.data_inicio), 'HH:mm').split(':')
          setValue('hini_h', hiH)
          setValue('hini_m', hiM)
          if (ev.data_fim) {
            const [hfH, hfM] = format(new Date(ev.data_fim), 'HH:mm').split(':')
            setValue('hfim_h', hfH)
            setValue('hfim_m', hfM)
          } else {
            setValue('hfim_h', '')
            setValue('hfim_m', '')
          }
        } catch { setErro('Erro ao carregar evento.') }
      }
      carregarEvento()
    }
  }, [editar, id])

  const onSubmit = async (dados) => {
    setCarregando(true)
    setErro(null)
    try {
      // Junta data + hora (24h) no formato ISO que a API espera
      const payload = {
        titulo: dados.titulo,
        descricao: dados.descricao || null,
        categoria_id: Number(dados.categoria_id),
        data_inicio: `${dados.data_dia}T${dados.hini_h}:${dados.hini_m}`,
        data_fim: (dados.hfim_h !== '' && dados.hfim_m !== '') ? `${dados.data_dia}T${dados.hfim_h}:${dados.hfim_m}` : null,
        convidados: dados.convidados || null,
        lembrete_minutos: Number(dados.lembrete_minutos),
        recorrencia: dados.recorrencia,
      }
      if (editar && id) await eventoService.atualizar(id, payload)
      else await eventoService.criar(payload)
      navigate('/')
    } catch (err) {
      setErro('Erro ao salvar evento.')
      console.error(err)
    } finally { setCarregando(false) }
  }

  // --- Seletor de presets de categoria (apenas ao criar) ---
  const aplicarPreset = (preset) => {
    setFormData({ nome: preset.nome, cor: preset.cor, icone: preset.icone })
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
        <button onClick={() => navigate('/')} className="btn-icon w-9 h-9 sm:w-10 sm:h-10 shrink-0">
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {erro && (
        <div className="mb-5 p-3 sm:p-4 rounded-xl text-[12px] sm:text-[13px] animate-fade-in"
          style={{ background: 'rgba(176,86,62,0.1)', border: '1.5px solid rgba(176,86,62,0.35)', color: '#b0563e' }}>
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
                {errors.titulo && <p className="text-[11px] sm:text-[12px] mt-1.5" style={{ color: '#b0563e' }}>{errors.titulo.message}</p>}
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
                {(categoriaSel && categorias.find((c) => String(c.id) === String(categoriaSel))) && (
                  <div className="cat-badge mt-2">
                    <CategoriaIcone icone={categoriaSel.icone} cor={categoriaSel.cor} tamanho={13} />
                    {categoriaSel.nome}
                  </div>
                )}
                {errors.categoria_id && <p className="text-[11px] sm:text-[12px] mt-1.5" style={{ color: '#b0563e' }}>{errors.categoria_id.message}</p>}
              </div>
            </div>
          </Section>
        </div>

        {/* Data e Hora — 24h, padrão Brasil, SEM AM/PM */}
        <div className="animate-fade-up delay-2">
          <Section icon={FiCalendar} title="Data e Hora">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="min-w-0">
                <label className="label-field">Dia *</label>
                <input type="date" {...register('data_dia', { required: 'Escolha o dia' })}
                  className="input-field" />
                {errors.data_dia && <p className="text-[11px] sm:text-[12px] mt-1.5" style={{ color: '#b0563e' }}>{errors.data_dia.message}</p>}
              </div>
              <div className="min-w-0">
                <label className="label-field">Hora início *</label>
                <div className="flex items-center gap-1.5">
                  <select {...register('hini_h', { required: 'Hora?' })} className="input-field" aria-label="Hora de início">
                    <option value="">--</option>
                    {HORAS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="font-bold shrink-0" style={{ color: 'var(--sage-dark)' }}>:</span>
                  <select {...register('hini_m', { required: 'Min?' })} className="input-field" aria-label="Minuto de início">
                    <option value="">--</option>
                    {MINUTOS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                {(errors.hini_h || errors.hini_m) && <p className="text-[11px] sm:text-[12px] mt-1.5" style={{ color: '#b0563e' }}>Informe hora e minuto</p>}
              </div>
              <div className="min-w-0">
                <label className="label-field">Hora fim</label>
                <div className="flex items-center gap-1.5">
                  <select {...register('hfim_h')} className="input-field" aria-label="Hora de fim">
                    <option value="">--</option>
                    {HORAS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="font-bold shrink-0" style={{ color: 'var(--sage-dark)' }}>:</span>
                  <select {...register('hfim_m')} className="input-field" aria-label="Minuto de fim">
                    <option value="">--</option>
                    {MINUTOS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Lembrete */}
        <div className="animate-fade-up delay-3">
          <Section icon={FiBell} title="Lembrete">
            <div>
              <label className="label-field">Lembrete</label>
              <select {...register('lembrete_minutos')} className="input-field">
                <option value="0">Sem lembrete</option>
                <option value="5">5 minutos</option>
                <option value="10">10 minutos</option>
                <option value="30">30 minutos</option>
                <option value="60">1 hora</option>
                <option value="1440">1 dia</option>
              </select>
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