<script setup>
import { RouterLink } from 'vue-router'
defineProps({ item: Object })
</script>

<template>
  <RouterLink :to="`/wardrobe/${item.id}`" class="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md">
    <div class="aspect-square bg-gray-100">
      <img v-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover" />
    </div>
    <div class="p-3">
      <h3 class="font-medium truncate">{{ item.item_type_display }}</h3>
      <p class="text-xs text-gray-500">{{ item.colors?.slice(0,2).join(', ') }}</p>
      <p class="text-xs text-gray-400">{{ item.formality_display }}</p>
    </div>
  </RouterLink>
</template>
