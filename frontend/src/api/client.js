import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Auto logout on 401 — but NOT on login/register attempts
api.interceptors.response.use(
  res => res,
  err => {
    const url = err.config?.url || ''
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/me')
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
}

export const statsApi = {
  public: () => api.get('/stats/public'),
}

export const forumApi = {
  categories:  ()               => api.get('/forum/categories'),
  posts:       (params)         => api.get('/forum/posts', { params }),
  post:        (id)             => api.get(`/forum/posts/${id}`),
  createPost:  (data)           => api.post('/forum/posts', data),
  replies:     (postId)         => api.get(`/forum/posts/${postId}/replies`),
  createReply: (postId, data)   => api.post(`/forum/posts/${postId}/replies`, data),
}

export const usersApi = {
  characters:      ()     => api.get('/users/me/characters'),
  createCharacter: (data) => api.post('/users/me/characters', data),
}

export default api
