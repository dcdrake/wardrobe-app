import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('access_token'))
  const isAuthenticated = computed(() => !!token.value)

  async function signup(email, password) {
    await authApi.signup(email, password)
    await login(email, password)
  }

  async function login(email, password) {
    const { data } = await authApi.login(email, password)
    token.value = data.access
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    await fetchUser()
    router.push('/wardrobe')
  }

  async function fetchUser() {
    if (!token.value) return
    try { user.value = (await authApi.me()).data }
    catch { logout() }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.clear()
    router.push('/login')
  }

  if (token.value) fetchUser()

  return { user, token, isAuthenticated, signup, login, logout, fetchUser }
})
