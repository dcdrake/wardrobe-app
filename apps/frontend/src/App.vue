<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()
const isAuth = computed(() => auth.isAuthenticated)
</script>

<template>
  <div class="min-h-screen">
    <nav class="bg-cream border-b border-sand-200">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
        <RouterLink to="/" class="font-serif text-2xl text-espresso-600 hover:text-espresso-700">The Wardrobe</RouterLink>
        <div v-if="isAuth" class="flex items-center gap-6">
          <RouterLink to="/wardrobe" class="text-sm tracking-wider uppercase text-charcoal-400 hover:text-espresso-800">My Wardrobe</RouterLink>
          <RouterLink to="/outfits" class="text-sm tracking-wider uppercase text-charcoal-400 hover:text-espresso-800">Get Outfits</RouterLink>
          <button @click="auth.logout()" class="text-sm tracking-wider uppercase text-charcoal-300 hover:text-espresso-800">Logout</button>
        </div>
        <div v-else class="flex items-center gap-4">
          <RouterLink to="/login" class="text-sm tracking-wider uppercase text-charcoal-400 hover:text-espresso-800">Login</RouterLink>
          <RouterLink to="/signup" class="bg-terracotta-500 hover:bg-terracotta-600 text-white px-5 py-2 rounded-lg text-sm tracking-wider uppercase">Sign Up</RouterLink>
        </div>
      </div>
    </nav>
    <main class="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      <Transition name="page" mode="out-in">
        <RouterView />
      </Transition>
    </main>
  </div>
</template>
