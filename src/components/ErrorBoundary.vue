<script setup lang="ts">
// Limitation: onErrorCaptured only catches errors from synchronous rendering,
// watchers, and lifecycle hooks. It does NOT catch errors from async event
// handlers, unhandled promise rejections, or setTimeout/setInterval callbacks.
// Most real-world errors in this app (Firebase auth, Firestore operations) are
// async and will bypass this component entirely. The global app.config.errorHandler
// in main.ts handles those cases but only logs to console.
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

defineExpose({ error, reset, renderKey })
</script>

<template>
  <div :key="error ? 'error' : renderKey">
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
          class="btn-primary"
        >
          Try Again
        </button>
      </div>
    </div>
    <div v-else>
      <slot />
    </div>
  </div>
</template>
