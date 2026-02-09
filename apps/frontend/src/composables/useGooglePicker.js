import { ref, computed } from 'vue'

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ''
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const SCOPE = 'https://www.googleapis.com/auth/drive.readonly'

let gisLoaded = false
let gapiLoaded = false
let pickerLoaded = false

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = resolve
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
}

async function ensureScripts() {
  if (!gisLoaded) {
    await loadScript('https://accounts.google.com/gsi/client')
    gisLoaded = true
  }
  if (!gapiLoaded) {
    await loadScript('https://apis.google.com/js/api.js')
    gapiLoaded = true
  }
  if (!pickerLoaded) {
    await new Promise((resolve) => window.gapi.load('picker', resolve))
    pickerLoaded = true
  }
}

function getAccessToken() {
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error))
        } else {
          resolve(response.access_token)
        }
      },
    })
    client.requestAccessToken({ prompt: 'consent' })
  })
}

function showPicker(accessToken) {
  return new Promise((resolve) => {
    const picker = new window.google.picker.PickerBuilder()
      .addView(
        new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
          .setMimeTypes('image/png,image/jpeg,image/gif,image/webp')
          .setIncludeFolders(true)
          .setSelectFolderEnabled(false)
      )
      .setOAuthToken(accessToken)
      .setDeveloperKey(API_KEY)
      .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
      .setMaxItems(20)
      .setCallback((data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const photos = data.docs.map((doc) => ({
            id: doc.id,
            name: doc.name || `photo_${doc.id}.jpg`,
            url: doc.thumbnails?.[doc.thumbnails.length - 1]?.url || doc.url,
          }))
          resolve(photos)
        } else if (data.action === window.google.picker.Action.CANCEL) {
          resolve(null)
        }
      })
      .build()
    picker.setVisible(true)
  })
}

export function useGooglePhotos() {
  const loading = ref(false)
  const error = ref(null)
  const googleConfigured = computed(() => !!(API_KEY && CLIENT_ID))

  async function openPicker() {
    if (!googleConfigured.value) return null
    loading.value = true
    error.value = null
    try {
      await ensureScripts()
      const accessToken = await getAccessToken()
      const photos = await showPicker(accessToken)
      if (!photos) return null
      return { accessToken, photos }
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  return { openPicker, loading, error, googleConfigured }
}
