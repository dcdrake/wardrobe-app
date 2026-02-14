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
  googlePhotosUpload: (accessToken, photos, { onItem, onDone, onError }) => {
    const token = localStorage.getItem('access_token')
    const controller = new AbortController()
    fetch('/api/wardrobe/google-photos-upload/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ access_token: accessToken, photos }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text()
          onError?.({ index: -1, message: text || `HTTP ${response.status}` })
          return
        }
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop()
          let eventType = null
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7)
            } else if (line.startsWith('data: ') && eventType) {
              const data = JSON.parse(line.slice(6))
              if (eventType === 'item') onItem?.(data)
              else if (eventType === 'done') onDone?.(data)
              else if (eventType === 'error') onError?.(data)
              eventType = null
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') onError?.({ index: -1, message: err.message })
      })
    return controller
  },
  batchUpload: (files, { onItem, onDone, onError }) => {
    const token = localStorage.getItem('access_token')
    const controller = new AbortController()
    const formData = new FormData()
    files.forEach(f => formData.append('images', f))
    fetch('/api/wardrobe/batch-upload/', {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text()
          onError?.({ index: -1, message: text || `HTTP ${response.status}` })
          return
        }
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop()
          let eventType = null
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7)
            } else if (line.startsWith('data: ') && eventType) {
              const data = JSON.parse(line.slice(6))
              if (eventType === 'item') onItem?.(data)
              else if (eventType === 'done') onDone?.(data)
              else if (eventType === 'error') onError?.(data)
              eventType = null
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') onError?.({ index: -1, message: err.message })
      })
    return controller
  },
}

export const outfitApi = {
  suggest: (occasion) => api.post('/outfits/suggest/', { occasion }),
  suggestStream: (occasion, { onToken, onDone, onError }) => {
    const token = localStorage.getItem('access_token')
    const controller = new AbortController()
    fetch('/api/outfits/suggest-stream/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ occasion }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text()
          onError?.(text || `HTTP ${response.status}`)
          return
        }
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop()
          let eventType = null
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7)
            } else if (line.startsWith('data: ') && eventType) {
              const data = JSON.parse(line.slice(6))
              if (eventType === 'token') onToken?.(data.token)
              else if (eventType === 'done') onDone?.(data)
              else if (eventType === 'error') onError?.(data.error)
              eventType = null
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') onError?.(err.message)
      })
    return controller
  },
}
