import { create } from 'zustand'
import { authApi } from '../api'

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('access_token'),

  get isAuthenticated() {
    return !!get().token
  },

  signup: async (email, password) => {
    await authApi.signup(email, password)
    await get().login(email, password)
  },

  login: async (email, password) => {
    const { data } = await authApi.login(email, password)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    set({ token: data.access })
    await get().fetchUser()
  },

  fetchUser: async () => {
    if (!get().token) return
    try {
      const { data } = await authApi.me()
      set({ user: data })
    } catch {
      get().logout()
    }
  },

  logout: () => {
    set({ user: null, token: null })
    localStorage.clear()
  },
}))

// Fetch user on store creation if token exists
if (useAuthStore.getState().token) {
  useAuthStore.getState().fetchUser()
}

export default useAuthStore
