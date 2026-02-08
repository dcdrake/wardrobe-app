import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { wardrobeApi } from '../api'

export const useWardrobeStore = defineStore('wardrobe', () => {
  const items = ref([])
  const loading = ref(false)

  const itemCount = computed(() => items.value.length)

  async function fetchItems() {
    loading.value = true
    try { items.value = (await wardrobeApi.list()).data }
    finally { loading.value = false }
  }

  async function addItem(formData) {
    const { data } = await wardrobeApi.create(formData)
    items.value.unshift(data)
    return data
  }

  async function updateItem(id, data) {
    const { data: updated } = await wardrobeApi.update(id, data)
    const i = items.value.findIndex(item => item.id === id)
    if (i !== -1) items.value[i] = updated
    return updated
  }

  async function deleteItem(id) {
    await wardrobeApi.delete(id)
    items.value = items.value.filter(item => item.id !== id)
  }

  async function analyzeItem(id) {
    const { data } = await wardrobeApi.analyze(id)
    const i = items.value.findIndex(item => item.id === id)
    if (i !== -1) items.value[i] = data
    return data
  }

  const getItemById = (id) => items.value.find(item => item.id === id)

  return { items, loading, itemCount, fetchItems, addItem, updateItem, deleteItem, analyzeItem, getItemById }
})
