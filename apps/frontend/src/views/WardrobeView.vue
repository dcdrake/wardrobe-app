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
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">My Wardrobe</h1>
      <RouterLink to="/wardrobe/add" class="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Add Item</RouterLink>
    </div>
    
    <select v-model="filter" class="mb-6 px-3 py-2 border rounded-lg">
      <option value="">All Items</option>
      <option value="tshirt">T-Shirts</option>
      <option value="shirt">Dress Shirts</option>
      <option value="jeans">Jeans</option>
      <option value="chinos">Chinos</option>
      <option value="sneakers">Sneakers</option>
    </select>

    <div v-if="store.loading" class="text-center py-12 text-gray-500">Loading...</div>
    
    <div v-else-if="!store.items.length" class="text-center py-12">
      <p class="text-xl mb-4">Your wardrobe is empty</p>
      <RouterLink to="/wardrobe/add" class="bg-blue-600 text-white px-6 py-2 rounded-lg">Add Your First Item</RouterLink>
    </div>
    
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <ClothingCard v-for="item in filtered" :key="item.id" :item="item" />
    </div>
    
    <p class="mt-6 text-sm text-gray-500">{{ store.itemCount }} items</p>
  </div>
</template>
