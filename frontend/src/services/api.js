// Configuração do cliente HTTP (axios) para comunicar com a API de rotinas.
import axios from 'axios'

// Instância base apontando para o prefixo /api, com tempo limite de 10s.
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Interceptador que registra erros de resposta no console.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na API:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const apiRotinas = api

// Serviço de categorias: operações de listagem, criação, edição e exclusão.
export const categoriaService = {
  listar: () => api.get('/categorias'),
  criar: (dados) => api.post('/categorias', dados),
  atualizar: (id, dados) => api.put(`/categorias/${id}`, dados),
  deletar: (id) => api.delete(`/categorias/${id}`),
}

// Serviço de eventos: consultas e operações de crud sobre rotinas.
export const eventoService = {
  listar: (params) => api.get('/eventos', { params }),
  listarPorDia: (data) => api.get(`/eventos/dia/${data}`),
  buscar: (id) => api.get(`/eventos/${id}`),
  criar: (dados) => api.post('/eventos', dados),
  atualizar: (id, dados) => api.put(`/eventos/${id}`, dados),
  deletar: (id) => api.delete(`/eventos/${id}`),
}
