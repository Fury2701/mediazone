import { create } from 'zustand'
import { authApi } from '../api/client'

const useAuthStore = create((set, get) => ({
  user:    null,
  token:   localStorage.getItem('token'),
  loading: false,

  init: async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const { data } = await authApi.me()
      set({ user: data, token })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, token: null })
    }
  },

  login: async (username, password) => {
    set({ loading: true })
    const { data } = await authApi.login({ username, password })
    localStorage.setItem('token', data.access_token)
    const me = await authApi.me()
    set({ token: data.access_token, user: me.data, loading: false })
  },

  register: async (username, email, password) => {
    set({ loading: true })
    const { data } = await authApi.register({ username, email, password })
    localStorage.setItem('token', data.access_token)
    const me = await authApi.me()
    set({ token: data.access_token, user: me.data, loading: false })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },
}))

export default useAuthStore
