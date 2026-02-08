import axios from 'axios'

const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(r => r, async error => {
  const req = error.config
  if (error.response?.status === 401 && !req._retry) {
    req._retry = true
    const refresh = localStorage.getItem('refresh_token')
    if (refresh) {
      try {
        const { data } = await axios.post('/api/auth/refresh/', { refresh })
        localStorage.setItem('access_token', data.access)
        req.headers.Authorization = `Bearer ${data.access}`
        return api(req)
      } catch { localStorage.clear(); window.location.href = '/login' }
    }
  }
  return Promise.reject(error)
})

export default api

export const authApi = {
  signup: (email, password) => api.post('/auth/signup/', { email, password, password_confirm: password }),
  login: (email, password) => api.post('/auth/login/', { email, password }),
  me: () => api.get('/auth/me/'),
}

export const wardrobeApi = {
  list: () => api.get('/wardrobe/'),
  create: (formData) => api.post('/wardrobe/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.patch(`/wardrobe/${id}/`, data),
  delete: (id) => api.delete(`/wardrobe/${id}/`),
  analyze: (id) => api.post(`/wardrobe/${id}/analyze/`),
}

export const outfitApi = {
  suggest: (occasion) => api.post('/outfits/suggest/', { occasion }),
}
