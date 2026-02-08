<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true
  error.value = ''
  try { await auth.login(email.value, password.value) }
  catch (e) { error.value = e.response?.data?.detail || 'Login failed' }
  finally { loading.value = false }
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-2xl font-bold text-center mb-8">Login</h1>
    <form @submit.prevent="submit" class="bg-white p-8 rounded-lg shadow-sm">
      <div v-if="error" class="bg-red-50 text-red-600 p-3 rounded mb-4">{{ error }}</div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Email</label>
        <input v-model="email" type="email" required class="w-full px-3 py-2 border rounded-lg" />
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium mb-1">Password</label>
        <input v-model="password" type="password" required class="w-full px-3 py-2 border rounded-lg" />
      </div>
      <button :disabled="loading" class="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
      <p class="mt-4 text-center text-gray-600">
        No account? <RouterLink to="/signup" class="text-blue-600">Sign up</RouterLink>
      </p>
    </form>
  </div>
</template>
