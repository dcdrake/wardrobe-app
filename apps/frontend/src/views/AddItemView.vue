<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWardrobeStore } from '../stores/wardrobe'

const router = useRouter()
const store = useWardrobeStore()
const file = ref(null)
const preview = ref(null)
const itemType = ref('')
const colors = ref('')
const pattern = ref('solid')
const formality = ref('casual')
const material = ref('')
const brand = ref('')
const loading = ref(false)
const error = ref('')

const types = ['tshirt', 'shirt', 'polo', 'sweater', 'jacket', 'blazer', 'jeans', 'chinos', 'trousers', 'shorts', 'sneakers', 'boots', 'dress_shoes', 'other']

function onFile(e) {
  file.value = e.target.files[0]
  if (file.value) preview.value = URL.createObjectURL(file.value)
}

async function submit() {
  if (!file.value) { error.value = 'Please select an image'; return }
  loading.value = true
  const fd = new FormData()
  fd.append('image', file.value)
  if (itemType.value) fd.append('item_type', itemType.value)
  if (colors.value) fd.append('colors', JSON.stringify(colors.value.split(',').map(c => c.trim())))
  fd.append('pattern', pattern.value)
  fd.append('formality', formality.value)
  if (material.value) fd.append('material', material.value)
  if (brand.value) fd.append('brand', brand.value)
  try { await store.addItem(fd); router.push('/wardrobe') }
  catch { error.value = 'Failed to add item' }
  finally { loading.value = false }
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Add Clothing Item</h1>
    <form @submit.prevent="submit" class="bg-white p-6 rounded-lg shadow-sm">
      <div v-if="error" class="bg-red-50 text-red-600 p-3 rounded mb-4">{{ error }}</div>
      
      <div class="mb-6 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer" @click="$refs.input.click()">
        <input ref="input" type="file" accept="image/*" class="hidden" @change="onFile" />
        <img v-if="preview" :src="preview" class="max-h-64 mx-auto rounded" />
        <div v-else class="py-8"><p class="text-4xl mb-2">📷</p><p>Click to upload</p></div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Type</label>
          <select v-model="itemType" class="w-full px-3 py-2 border rounded-lg">
            <option value="">Let AI decide</option>
            <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Pattern</label>
          <select v-model="pattern" class="w-full px-3 py-2 border rounded-lg">
            <option value="solid">Solid</option>
            <option value="striped">Striped</option>
            <option value="plaid">Plaid</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium mb-1">Colors (comma separated)</label>
          <input v-model="colors" class="w-full px-3 py-2 border rounded-lg" placeholder="navy blue, white" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Formality</label>
          <select v-model="formality" class="w-full px-3 py-2 border rounded-lg">
            <option value="casual">Casual</option>
            <option value="smart_casual">Smart Casual</option>
            <option value="business_casual">Business Casual</option>
            <option value="formal">Formal</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Material</label>
          <input v-model="material" class="w-full px-3 py-2 border rounded-lg" />
        </div>
      </div>

      <div class="mt-6 flex gap-4">
        <button :disabled="loading" class="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50">
          {{ loading ? 'Adding...' : 'Add to Wardrobe' }}
        </button>
        <button type="button" @click="router.back()" class="px-6 py-2 border rounded-lg">Cancel</button>
      </div>
    </form>
  </div>
</template>
