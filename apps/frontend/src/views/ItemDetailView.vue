<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWardrobeStore } from '../stores/wardrobe'

const route = useRoute()
const router = useRouter()
const store = useWardrobeStore()
const item = ref(null)
const editing = ref(false)
const form = ref({})
const types = [
  { label: 'Tops', items: ['tshirt', 'shirt', 'polo', 'sweater', 'hoodie', 'tank_top', 'blouse', 'crop_top'] },
  { label: 'Outerwear', items: ['jacket', 'blazer', 'coat', 'vest', 'cardigan'] },
  { label: 'Bottoms', items: ['jeans', 'chinos', 'trousers', 'shorts', 'skirt', 'leggings'] },
  { label: 'Full Body', items: ['dress', 'jumpsuit', 'romper', 'suit'] },
  { label: 'Footwear', items: ['sneakers', 'boots', 'dress_shoes', 'loafers', 'sandals', 'heels', 'flats'] },
  { label: 'Accessories', items: ['belt', 'watch', 'tie', 'bow_tie', 'hat', 'scarf', 'sunglasses', 'necklace', 'bracelet', 'earrings', 'ring', 'bag', 'backpack', 'pocket_square', 'cufflinks', 'gloves'] },
  { label: 'Other', items: ['other'] },
]

onMounted(async () => {
  await store.fetchItems()
  item.value = store.getItemById(route.params.id)
  if (!item.value) router.push('/wardrobe')
})

function startEdit() {
  form.value = { ...item.value, colors: item.value.colors?.join(', ') || '' }
  editing.value = true
}

async function save() {
  const data = { ...form.value, colors: form.value.colors.split(',').map(c => c.trim()) }
  item.value = await store.updateItem(item.value.id, data)
  editing.value = false
}

async function del() {
  if (!confirm('Delete this item?')) return
  await store.deleteItem(item.value.id)
  router.push('/wardrobe')
}
</script>

<template>
  <div v-if="item" class="max-w-4xl mx-auto">
    <button @click="router.push('/wardrobe')" class="text-gray-500 mb-4">← Back</button>
    <div class="bg-white rounded-lg shadow-sm overflow-hidden md:flex">
      <div class="md:w-1/2 bg-gray-100">
        <img v-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover" />
      </div>
      <div class="md:w-1/2 p-6">
        <div v-if="!editing">
          <div class="flex justify-between mb-4">
            <h1 class="text-2xl font-bold">{{ item.item_type_display }}</h1>
            <div class="flex gap-2">
              <button @click="startEdit" class="text-blue-600">Edit</button>
              <button @click="del" class="text-red-600">Delete</button>
            </div>
          </div>
          <dl class="space-y-2">
            <div><dt class="text-sm text-gray-500">Colors</dt><dd>{{ item.colors?.join(', ') }}</dd></div>
            <div><dt class="text-sm text-gray-500">Pattern</dt><dd>{{ item.pattern_display }}</dd></div>
            <div><dt class="text-sm text-gray-500">Formality</dt><dd>{{ item.formality_display }}</dd></div>
            <div v-if="item.material"><dt class="text-sm text-gray-500">Material</dt><dd>{{ item.material }}</dd></div>
            <div v-if="item.brand"><dt class="text-sm text-gray-500">Brand</dt><dd>{{ item.brand }}</dd></div>
          </dl>
        </div>
        <form v-else @submit.prevent="save" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Type</label>
            <select v-model="form.item_type" class="w-full px-3 py-2 border rounded-lg">
              <optgroup v-for="group in types" :key="group.label" :label="group.label">
                <option v-for="t in group.items" :key="t" :value="t">{{ t.replace(/_/g, ' ') }}</option>
              </optgroup>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Colors</label>
            <input v-model="form.colors" class="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div class="flex gap-2">
            <button class="flex-1 bg-blue-600 text-white py-2 rounded-lg">Save</button>
            <button type="button" @click="editing = false" class="px-4 py-2 border rounded-lg">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
