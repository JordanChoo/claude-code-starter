<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const isDev = import.meta.env.DEV
const error = ref<Error | null>(null)
const renderKey = ref(0)

onErrorCaptured((err: Error) => {
  error.value = err
  return false
})

function reset() {
  error.value = null
  renderKey.value++
}
</script>

<template>
  <div v-if="error" class="flex flex-col items-center justify-center py-20 px-4 text-center">
    <div class="max-w-md">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
      <p class="text-gray-600 mb-6">
        An unexpected error occurred. Please try again.
      </p>
      <div
        v-if="isDev"
        class="mb-6 rounded-md bg-red-50 border border-red-200 p-4 text-left"
      >
        <p class="text-sm font-medium text-red-800 mb-1">{{ error.name }}: {{ error.message }}</p>
        <pre
          v-if="error.stack"
          class="text-xs text-red-700 overflow-auto max-h-48 whitespace-pre-wrap"
        >{{ error.stack }}</pre>
      </div>
      <button
        @click="reset"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Try Again
      </button>
    </div>
  </div>
  <div v-else :key="renderKey">
    <slot />
  </div>
</template>
