<script setup>
import { ref, onMounted, computed } from 'vue'
import { useWardrobeStore } from '../stores/wardrobe'
import { outfitApi } from '../api'

const store = useWardrobeStore()
const occasion = ref('')
const suggestions = ref(null)
const loading = ref(false)
const streaming = ref(false)
const streamingText = ref('')
const error = ref('')

const hasItems = computed(() => store.items.length > 0)

onMounted(() => store.fetchItems())

function getSuggestions() {
  if (!occasion.value.trim()) return
  loading.value = true
  streaming.value = true
  streamingText.value = ''
  suggestions.value = null
  error.value = ''

  outfitApi.suggestStream(occasion.value, {
    onToken(token) {
      streamingText.value += token
    },
    onDone(data) {
      suggestions.value = data
      streaming.value = false
      loading.value = false
    },
    onError(err) {
      error.value = err || 'Failed'
      streaming.value = false
      loading.value = false
    },
  })
}

const getItem = (id) => store.getItemById(id)
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">What Should I Wear?</h1>

    <div v-if="!hasItems" class="bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-6">
      Add some clothes first! <RouterLink to="/wardrobe/add" class="underline">Add items →</RouterLink>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
      <textarea v-model="occasion" rows="2" placeholder="e.g., Job interview at a tech startup..."
        class="w-full px-3 py-2 border rounded-lg" :disabled="!hasItems"></textarea>
      <button @click="getSuggestions" :disabled="loading || !hasItems"
        class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50">
        {{ loading ? 'Generating...' : 'Get Outfit Ideas' }}
      </button>
      <p v-if="error" class="mt-4 text-red-600">{{ error }}</p>
    </div>

    <div v-if="streaming" class="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div class="flex items-center gap-2">
        <span class="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        <span class="text-sm text-gray-500">Putting together some outfits...</span>
      </div>
    </div>

    <div v-if="suggestions" class="space-y-6">
      <h2 class="text-xl font-semibold">Suggestions for "{{ suggestions.occasion }}"</h2>
      <div v-for="(s, i) in suggestions.suggestions" :key="i" class="bg-white p-6 rounded-lg shadow-sm">
        <h3 class="font-medium mb-4">Option {{ i + 1 }}</h3>
        <div class="flex gap-4 mb-4">
          <div v-for="id in s.item_ids" :key="id" class="w-24">
            <div class="aspect-square bg-gray-100 rounded overflow-hidden">
              <img v-if="getItem(id)?.image_url" :src="getItem(id)?.image_url" class="w-full h-full object-cover" />
            </div>
            <p class="text-xs text-center mt-1">{{ getItem(id)?.item_type_display }}</p>
          </div>
        </div>
        <p class="text-gray-600 text-sm">{{ s.explanation }}</p>
      </div>
    </div>

    <div v-else-if="!loading && hasItems" class="bg-gray-50 p-6 rounded-lg">
      <p class="font-medium mb-2">Try:</p>
      <ul class="text-gray-600 space-y-1">
        <li @click="occasion = 'Job interview at a tech startup'" class="cursor-pointer hover:text-blue-600">• Job interview</li>
        <li @click="occasion = 'First date at a nice restaurant'" class="cursor-pointer hover:text-blue-600">• First date</li>
        <li @click="occasion = 'Casual Friday at the office'" class="cursor-pointer hover:text-blue-600">• Casual Friday</li>
      </ul>
    </div>
  </div>
</template>
