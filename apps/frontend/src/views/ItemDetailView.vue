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
    <button @click="router.push('/wardrobe')" class="text-charcoal-400 hover:text-espresso-800 mb-6 inline-block">&larr; Back</button>
    <div class="bg-cream rounded-xl border border-sand-200/60 overflow-hidden md:flex">
      <div class="md:w-1/2 bg-sand-100">
        <img v-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover" />
      </div>
      <div class="md:w-1/2 p-8">
        <div v-if="!editing">
          <div class="flex justify-between items-start mb-6">
            <h1 class="text-2xl font-serif font-semibold text-espresso-800">{{ item.item_type_display }}</h1>
            <div class="flex gap-3">
              <button @click="startEdit" class="text-sm text-terracotta-500 hover:text-terracotta-600">Edit</button>
              <button @click="del" class="text-sm text-red-500 hover:text-red-600">Delete</button>
            </div>
          </div>
          <dl class="space-y-0">
            <div class="py-3 border-b border-sand-200/60">
              <dt class="text-xs tracking-wider uppercase text-charcoal-400 mb-1">Colors</dt>
              <dd class="text-espresso-900">{{ item.colors?.join(', ') }}</dd>
            </div>
            <div class="py-3 border-b border-sand-200/60">
              <dt class="text-xs tracking-wider uppercase text-charcoal-400 mb-1">Pattern</dt>
              <dd class="text-espresso-900">{{ item.pattern_display }}</dd>
            </div>
            <div class="py-3 border-b border-sand-200/60">
              <dt class="text-xs tracking-wider uppercase text-charcoal-400 mb-1">Formality</dt>
              <dd class="text-espresso-900">{{ item.formality_display }}</dd>
            </div>
            <div v-if="item.material" class="py-3 border-b border-sand-200/60">
              <dt class="text-xs tracking-wider uppercase text-charcoal-400 mb-1">Material</dt>
              <dd class="text-espresso-900">{{ item.material }}</dd>
            </div>
            <div v-if="item.brand" class="py-3">
              <dt class="text-xs tracking-wider uppercase text-charcoal-400 mb-1">Brand</dt>
              <dd class="text-espresso-900">{{ item.brand }}</dd>
            </div>
          </dl>
        </div>
        <form v-else @submit.prevent="save" class="space-y-4">
          <div>
            <label class="block text-xs tracking-wider uppercase text-charcoal-400 mb-2">Type</label>
            <select v-model="form.item_type" class="w-full px-3 py-2 bg-cream border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent">
              <optgroup v-for="group in types" :key="group.label" :label="group.label">
                <option v-for="t in group.items" :key="t" :value="t">{{ t.replace(/_/g, ' ') }}</option>
              </optgroup>
            </select>
          </div>
          <div>
            <label class="block text-xs tracking-wider uppercase text-charcoal-400 mb-2">Colors</label>
            <input v-model="form.colors" class="w-full px-3 py-2 bg-cream border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent" />
          </div>
          <div class="flex gap-3">
            <button class="flex-1 bg-terracotta-500 hover:bg-terracotta-600 text-white py-2.5 rounded-lg">Save</button>
            <button type="button" @click="editing = false" class="px-4 py-2.5 border border-sand-300 hover:border-espresso-600 rounded-lg text-espresso-800">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
