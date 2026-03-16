import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Auto logout on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
}

// ── Stats ─────────────────────────────────────────────────────────────────────
export const statsApi = {
  public: () => api.get('/stats/public'),
}

// ── Forum ─────────────────────────────────────────────────────────────────────
export const forumApi = {
  categories:    ()           => api.get('/forum/categories'),
  posts:         (params)     => api.get('/forum/posts', { params }),
  post:          (id)         => api.get(`/forum/posts/${id}`),
  createPost:    (data)       => api.post('/forum/posts', data),
  replies:       (postId)     => api.get(`/forum/posts/${postId}/replies`),
  createReply:   (postId, data) => api.post(`/forum/posts/${postId}/replies`, data),
}

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  characters:       ()     => api.get('/users/me/characters'),
  createCharacter:  (data) => api.post('/users/me/characters', data),
}

export default api
