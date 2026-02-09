<script setup>
import { RouterLink } from 'vue-router'
defineProps({ item: Object })
</script>

<template>
  <RouterLink :to="`/wardrobe/${item.id}`" class="group block bg-cream rounded-xl border border-sand-200/60 overflow-hidden hover:shadow-lg hover:shadow-sand-300/30 hover:border-sand-300">
    <div class="aspect-[3/4] bg-sand-100 overflow-hidden">
      <img v-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    </div>
    <div class="p-3">
      <h3 class="font-medium text-espresso-800 truncate">{{ item.item_type_display }}</h3>
      <p class="text-xs tracking-wide uppercase text-charcoal-400 mt-1">{{ item.colors?.slice(0,2).join(', ') }}</p>
      <p class="text-xs text-charcoal-300">{{ item.formality_display }}</p>
    </div>
  </RouterLink>
</template>
