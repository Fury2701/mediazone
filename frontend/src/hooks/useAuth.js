import { create } from 'zustand'
import { authApi } from '../api/client'

const useAuthStore = create((set) => ({
  user:        null,
  token:       localStorage.getItem('token'),
  loading:     false,
  initialized: false,

  init: async () => {
    const token = localStorage.getItem('token')
    if (!token) { set({ initialized: true }); return }
    try {
      const { data } = await authApi.me()
      set({ user: data, token, initialized: true })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, token: null, initialized: true })
    }
  },

  login: async (username, password) => {
    set({ loading: true })
    try {
      const { data } = await authApi.login({ username, password })
      localStorage.setItem('token', data.access_token)
      const me = await authApi.me()
      set({ token: data.access_token, user: me.data, loading: false })
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  register: async (username, email, password) => {
    set({ loading: true })
    try {
      const { data } = await authApi.register({ username, email, password })
      localStorage.setItem('token', data.access_token)
      const me = await authApi.me()
      set({ token: data.access_token, user: me.data, loading: false })
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
    window.location.href = '/'
  },
}))

export default useAuthStore
