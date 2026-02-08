<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { wardrobeApi } from '../api'
import { useGooglePicker } from '../composables/useGooglePicker'

const { openPicker, loading: pickerLoading, googleConfigured } = useGooglePicker()

const source = ref(null)
const files = ref([])
const googleAccessToken = ref(null)
const googlePhotos = ref([])
const items = ref([])
const uploading = ref(false)
const done = ref(false)
const doneCount = ref(0)
const controller = ref(null)

const processed = computed(() => items.value.filter(i => i.status !== 'pending').length)

function onFileSelect(e) {
  addFiles(Array.from(e.target.files))
  e.target.value = ''
}

function onDrop(e) {
  e.preventDefault()
  const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
  addFiles(dropped)
}

function addFiles(newFiles) {
  if (uploading.value) return
  source.value = 'local'
  googleAccessToken.value = null
  googlePhotos.value = []
  const remaining = 20 - files.value.length
  const toAdd = newFiles.slice(0, remaining)
  for (const f of toAdd) {
    files.value.push(f)
    items.value.push({ file: f, preview: URL.createObjectURL(f), status: 'pending', result: null, error: null })
  }
}

function removeFile(index) {
  if (uploading.value) return
  if (source.value === 'local') {
    URL.revokeObjectURL(items.value[index].preview)
    files.value.splice(index, 1)
  } else {
    googlePhotos.value.splice(index, 1)
  }
  items.value.splice(index, 1)
  if (!items.value.length) {
    source.value = null
    googleAccessToken.value = null
  }
}

async function pickGooglePhotos() {
  const result = await openPicker()
  if (!result) return
  // Clear any existing local files
  items.value.forEach(i => { if (i.preview?.startsWith('blob:')) URL.revokeObjectURL(i.preview) })
  files.value = []
  items.value = []

  source.value = 'google'
  googleAccessToken.value = result.accessToken
  googlePhotos.value = result.photos
  for (const photo of result.photos) {
    items.value.push({
      file: null,
      preview: photo.url,
      status: 'pending',
      result: null,
      error: null,
    })
  }
}

const sseCallbacks = {
  onItem({ index, item }) {
    items.value[index].status = 'done'
    items.value[index].result = item
    if (index + 1 < items.value.length && items.value[index + 1].status === 'pending') {
      items.value[index + 1].status = 'processing'
    }
  },
  onError({ index, message }) {
    if (index >= 0 && index < items.value.length) {
      items.value[index].status = 'error'
      items.value[index].error = message
      if (index + 1 < items.value.length && items.value[index + 1].status === 'pending') {
        items.value[index + 1].status = 'processing'
      }
    }
  },
  onDone({ count }) {
    uploading.value = false
    done.value = true
    doneCount.value = count
  },
}

function upload() {
  if (!items.value.length || uploading.value) return
  uploading.value = true
  items.value.forEach(i => { i.status = 'pending'; i.result = null; i.error = null })
  if (items.value.length) items.value[0].status = 'processing'

  if (source.value === 'google') {
    controller.value = wardrobeApi.googlePhotosUpload(
      googleAccessToken.value,
      googlePhotos.value,
      sseCallbacks,
    )
  } else {
    controller.value = wardrobeApi.batchUpload(files.value, sseCallbacks)
  }
}

function cancel() {
  controller.value?.abort()
  uploading.value = false
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Batch Upload</h1>

    <!-- File selection area -->
    <div
      v-if="!uploading && !done"
      class="border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors"
      :class="items.length >= 20 ? 'border-gray-300 bg-gray-50' : 'border-blue-300 hover:border-blue-400 cursor-pointer'"
      @click="items.length < 20 && $refs.input.click()"
      @dragover.prevent
      @drop="onDrop"
    >
      <input ref="input" type="file" accept="image/*" multiple class="hidden" @change="onFileSelect" />
      <p class="text-4xl mb-2">+</p>
      <p class="text-lg">Drop images here or click to select</p>
      <p class="text-sm text-gray-500 mt-1">{{ items.length }} / 20 images selected</p>
    </div>

    <!-- Google Photos button -->
    <div v-if="googleConfigured && !uploading && !done && !items.length" class="mb-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="flex-1 border-t border-gray-300" />
        <span class="text-sm text-gray-500">or</span>
        <div class="flex-1 border-t border-gray-300" />
      </div>
      <button
        @click="pickGooglePhotos"
        :disabled="pickerLoading"
        class="w-full py-3 px-4 border-2 border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/>
        </svg>
        <span v-if="pickerLoading">Loading...</span>
        <span v-else>Import from Google Photos</span>
      </button>
    </div>

    <!-- Progress bar -->
    <div v-if="uploading || done" class="mb-6">
      <div class="flex justify-between text-sm mb-1">
        <span v-if="uploading">{{ processed }} of {{ items.length }} items processed</span>
        <span v-else>Done &mdash; {{ doneCount }} items added</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="h-2 rounded-full transition-all"
          :class="done ? 'bg-green-500' : 'bg-blue-500'"
          :style="{ width: (items.length ? (processed / items.length) * 100 : 0) + '%' }"
        />
      </div>
    </div>

    <!-- Thumbnail grid -->
    <div v-if="items.length" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-6">
      <div v-for="(item, i) in items" :key="i" class="relative group">
        <img :src="item.preview" class="w-full aspect-square object-cover rounded-lg" referrerpolicy="no-referrer" />

        <!-- Remove button (before upload) -->
        <button
          v-if="!uploading && !done"
          @click.stop="removeFile(i)"
          class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >&times;</button>

        <!-- Status overlay -->
        <div
          v-if="item.status !== 'pending' || uploading"
          class="absolute inset-0 rounded-lg flex flex-col items-center justify-center"
          :class="{
            'bg-black/40': item.status === 'processing',
            'bg-green-500/30': item.status === 'done',
            'bg-red-500/30': item.status === 'error',
            'bg-black/20': item.status === 'pending' && uploading,
          }"
        >
          <!-- Spinner -->
          <div v-if="item.status === 'processing'" class="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />

          <!-- Done checkmark + type -->
          <template v-if="item.status === 'done'">
            <span class="text-green-700 text-2xl font-bold">&#10003;</span>
            <span class="text-xs bg-white/80 rounded px-1 mt-1">{{ item.result?.item_type_display || 'Added' }}</span>
          </template>

          <!-- Error -->
          <template v-if="item.status === 'error'">
            <span class="text-red-700 text-2xl font-bold">&times;</span>
            <span class="text-xs bg-white/80 rounded px-1 mt-1">Failed</span>
          </template>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-4">
      <template v-if="!uploading && !done">
        <button
          :disabled="!items.length"
          @click="upload"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >{{ source === 'google' ? 'Import' : 'Upload' }} {{ items.length }} Item{{ items.length !== 1 ? 's' : '' }}</button>
        <RouterLink to="/wardrobe" class="px-6 py-2 border rounded-lg">Cancel</RouterLink>
      </template>
      <template v-else-if="uploading">
        <button @click="cancel" class="px-6 py-2 border border-red-300 text-red-600 rounded-lg">Cancel Upload</button>
      </template>
      <template v-else>
        <RouterLink to="/wardrobe" class="bg-blue-600 text-white px-6 py-2 rounded-lg">Back to Wardrobe</RouterLink>
      </template>
    </div>
  </div>
</template>
