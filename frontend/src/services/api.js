import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na API:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const apiRotinas = api

export const categoriaService = {
  listar: () => api.get('/categorias'),
  criar: (dados) => api.post('/categorias', dados),
  atualizar: (id, dados) => api.put(`/categorias/${id}`, dados),
  deletar: (id) => api.delete(`/categorias/${id}`),
}

export const eventoService = {
  listar: (params) => api.get('/eventos', { params }),
  listarPorDia: (data) => api.get(`/eventos/dia/${data}`),
  buscar: (id) => api.get(`/eventos/${id}`),
  criar: (dados) => api.post('/eventos', dados),
  atualizar: (id, dados) => api.put(`/eventos/${id}`, dados),
  deletar: (id) => api.delete(`/eventos/${id}`),
}
