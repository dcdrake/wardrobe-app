<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
const isAuth = computed(() => useAuthStore().isAuthenticated)
</script>

<template>
  <div class="max-w-2xl mx-auto text-center py-16">
    <h1 class="text-4xl font-bold mb-4">Your Personal Wardrobe Stylist</h1>
    <p class="text-xl text-gray-600 mb-8">Catalog your clothes, get AI-powered outfit suggestions for any occasion.</p>
    <div v-if="!isAuth" class="flex justify-center gap-4">
      <RouterLink to="/signup" class="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg">Get Started</RouterLink>
      <RouterLink to="/login" class="border border-gray-300 px-6 py-3 rounded-lg text-lg">Login</RouterLink>
    </div>
    <div v-else class="flex justify-center gap-4">
      <RouterLink to="/wardrobe" class="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg">My Wardrobe</RouterLink>
      <RouterLink to="/outfits" class="border border-gray-300 px-6 py-3 rounded-lg text-lg">Get Outfit Ideas</RouterLink>
    </div>
  </div>
</template>
