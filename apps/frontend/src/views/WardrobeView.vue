<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useWardrobeStore } from '../stores/wardrobe'
import ClothingCard from '../components/ClothingCard.vue'

const store = useWardrobeStore()
const filter = ref('')

const filtered = computed(() => {
  if (!filter.value) return store.items
  return store.items.filter(i => i.item_type === filter.value)
})

onMounted(() => store.fetchItems())
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-serif font-semibold text-espresso-800">My Wardrobe</h1>
      <div class="flex gap-3">
        <RouterLink to="/wardrobe/batch-add" class="border border-clay-500 text-clay-500 hover:bg-clay-500 hover:text-white px-4 py-2 rounded-lg text-sm tracking-wider uppercase">Batch Upload</RouterLink>
        <RouterLink to="/wardrobe/add" class="bg-terracotta-500 hover:bg-terracotta-600 text-white px-4 py-2 rounded-lg text-sm tracking-wider uppercase">+ Add Item</RouterLink>
      </div>
    </div>

    <select v-model="filter" class="mb-6 px-3 py-2 bg-cream border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent">
      <option value="">All Items</option>
      <option value="tshirt">T-Shirts</option>
      <option value="shirt">Dress Shirts</option>
      <option value="jeans">Jeans</option>
      <option value="chinos">Chinos</option>
      <option value="sneakers">Sneakers</option>
    </select>

    <div v-if="store.loading" class="text-center py-12 text-charcoal-300">Loading...</div>

    <div v-else-if="!store.items.length" class="text-center py-12">
      <p class="text-xl text-charcoal-400 mb-4">Your wardrobe is empty</p>
      <RouterLink to="/wardrobe/add" class="bg-terracotta-500 hover:bg-terracotta-600 text-white px-6 py-2 rounded-lg">Add Your First Item</RouterLink>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <ClothingCard v-for="item in filtered" :key="item.id" :item="item" />
    </div>

    <p class="mt-8 text-sm text-charcoal-300">{{ store.itemCount }} items</p>
  </div>
</template>
