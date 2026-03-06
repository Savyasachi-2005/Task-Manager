import axios from 'axios'

/**
 * Axios instance pre-configured for the FastAPI backend.
 * 
 * Development: Uses Vite proxy (/api/* → http://localhost:8000)
 * Production: Uses VITE_API_URL environment variable
 */
const getBaseURL = () => {
  // In production, use the environment variable
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api/v1`
  }
  // In development, use the proxy
  return '/api/v1'
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
})

// Attach the JWT token from localStorage to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global response error interceptor – redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export const tasksAPI = {
  list: (page = 1, pageSize = 10) =>
    api.get('/tasks', { params: { page, page_size: pageSize } }),
  get: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  remove: (id) => api.delete(`/tasks/${id}`),
}

export default api
