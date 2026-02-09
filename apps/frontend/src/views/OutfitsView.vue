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
    <h1 class="text-3xl font-serif font-semibold text-espresso-800 mb-8">What Should I Wear?</h1>

    <div v-if="!hasItems" class="bg-sand-100 text-espresso-800 p-4 rounded-xl border border-sand-200/60 mb-6">
      Add some clothes first! <RouterLink to="/wardrobe/add" class="text-terracotta-500 hover:text-terracotta-600 underline">Add items &rarr;</RouterLink>
    </div>

    <div class="bg-cream p-6 rounded-xl border border-sand-200/60 mb-6">
      <textarea v-model="occasion" rows="2" placeholder="e.g., Job interview at a tech startup..."
        class="w-full px-3 py-2 bg-cream border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent" :disabled="!hasItems"></textarea>
      <button @click="getSuggestions" :disabled="loading || !hasItems"
        class="mt-4 bg-terracotta-500 hover:bg-terracotta-600 text-white px-6 py-2.5 rounded-lg disabled:opacity-50">
        {{ loading ? 'Generating...' : 'Get Outfit Ideas' }}
      </button>
      <p v-if="error" class="mt-4 text-red-600">{{ error }}</p>
    </div>

    <div v-if="streaming" class="bg-cream p-6 rounded-xl border border-sand-200/60 mb-6">
      <div class="flex items-center gap-2">
        <span class="inline-block w-2 h-2 bg-terracotta-500 rounded-full animate-pulse"></span>
        <span class="text-sm text-charcoal-400">Putting together some outfits...</span>
      </div>
    </div>

    <div v-if="suggestions" class="space-y-6">
      <h2 class="text-xl font-serif font-semibold text-espresso-800">Suggestions for "{{ suggestions.occasion }}"</h2>
      <div v-for="(s, i) in suggestions.suggestions" :key="i" class="bg-cream p-6 rounded-xl border border-sand-200/60">
        <h3 class="text-xs tracking-wider uppercase text-charcoal-400 mb-4">Option {{ i + 1 }}</h3>
        <div class="flex gap-4 mb-4">
          <div v-for="id in s.item_ids" :key="id" class="w-24">
            <div class="aspect-square bg-sand-100 rounded-lg overflow-hidden">
              <img v-if="getItem(id)?.image_url" :src="getItem(id)?.image_url" class="w-full h-full object-cover" />
            </div>
            <p class="text-xs text-center mt-1 text-charcoal-400">{{ getItem(id)?.item_type_display }}</p>
          </div>
        </div>
        <p class="text-charcoal-500 text-sm leading-relaxed">{{ s.explanation }}</p>
      </div>
    </div>

    <div v-else-if="!loading && hasItems" class="bg-sand-50 p-6 rounded-xl border border-sand-200/60">
      <p class="font-serif font-medium text-espresso-800 mb-3">Try:</p>
      <ul class="text-charcoal-500 space-y-2">
        <li @click="occasion = 'Job interview at a tech startup'" class="cursor-pointer hover:text-terracotta-500">Job interview</li>
        <li @click="occasion = 'First date at a nice restaurant'" class="cursor-pointer hover:text-terracotta-500">First date</li>
        <li @click="occasion = 'Casual Friday at the office'" class="cursor-pointer hover:text-terracotta-500">Casual Friday</li>
      </ul>
    </div>
  </div>
</template>
