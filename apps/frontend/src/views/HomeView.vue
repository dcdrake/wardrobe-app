<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
const isAuth = computed(() => useAuthStore().isAuthenticated)
</script>

<template>
  <div class="max-w-3xl mx-auto text-center py-24">
    <h1 class="text-5xl md:text-6xl font-serif font-semibold text-espresso-800 mb-6">Your Personal<br />Wardrobe Stylist</h1>
    <div class="flex justify-center mb-8">
      <div class="w-16 h-0.5 bg-terracotta-400"></div>
    </div>
    <p class="text-xl text-charcoal-400 mb-12 max-w-xl mx-auto leading-relaxed">Catalog your clothes, get AI-powered outfit suggestions for any occasion.</p>
    <div v-if="!isAuth" class="flex justify-center gap-4">
      <RouterLink to="/signup" class="bg-terracotta-500 hover:bg-terracotta-600 text-white px-8 py-3 rounded-lg text-lg">Get Started</RouterLink>
      <RouterLink to="/login" class="border border-sand-300 hover:border-espresso-600 text-espresso-800 px-8 py-3 rounded-lg text-lg">Login</RouterLink>
    </div>
    <div v-else class="flex justify-center gap-4">
      <RouterLink to="/wardrobe" class="bg-terracotta-500 hover:bg-terracotta-600 text-white px-8 py-3 rounded-lg text-lg">My Wardrobe</RouterLink>
      <RouterLink to="/outfits" class="border border-sand-300 hover:border-espresso-600 text-espresso-800 px-8 py-3 rounded-lg text-lg">Get Outfit Ideas</RouterLink>
    </div>
  </div>
</template>
