import { create } from 'zustand'
import { wardrobeApi } from '../api'

const useWardrobeStore = create((set, get) => ({
  items: [],
  loading: false,

  get itemCount() {
    return get().items.length
  },

  fetchItems: async () => {
    set({ loading: true })
    try {
      const { data } = await wardrobeApi.list()
      set({ items: data })
    } finally {
      set({ loading: false })
    }
  },

  addItem: async (formData) => {
    const { data } = await wardrobeApi.create(formData)
    set({ items: [data, ...get().items] })
    return data
  },

  updateItem: async (id, data) => {
    const { data: updated } = await wardrobeApi.update(id, data)
    set({ items: get().items.map(item => item.id === id ? updated : item) })
    return updated
  },

  deleteItem: async (id) => {
    await wardrobeApi.delete(id)
    set({ items: get().items.filter(item => item.id !== id) })
  },

  analyzeItem: async (id) => {
    const { data } = await wardrobeApi.analyze(id)
    set({ items: get().items.map(item => item.id === id ? data : item) })
    return data
  },

  getItemById: (id) => get().items.find(item => item.id === id),
}))

export default useWardrobeStore
