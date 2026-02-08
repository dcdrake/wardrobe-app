<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()
const isAuth = computed(() => auth.isAuthenticated)
</script>

<template>
  <div class="min-h-screen">
    <nav class="bg-white shadow-sm">
      <div class="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <RouterLink to="/" class="text-xl font-semibold">Wardrobe Stylist</RouterLink>
        <div v-if="isAuth" class="flex gap-4">
          <RouterLink to="/wardrobe" class="text-gray-600 hover:text-gray-900">My Wardrobe</RouterLink>
          <RouterLink to="/outfits" class="text-gray-600 hover:text-gray-900">Get Outfits</RouterLink>
          <button @click="auth.logout()" class="text-gray-500">Logout</button>
        </div>
        <div v-else class="flex gap-4">
          <RouterLink to="/login" class="text-gray-600">Login</RouterLink>
          <RouterLink to="/signup" class="bg-blue-600 text-white px-4 py-2 rounded-lg">Sign Up</RouterLink>
        </div>
      </div>
    </nav>
    <main class="max-w-6xl mx-auto px-4 py-8"><RouterView /></main>
  </div>
</template>
