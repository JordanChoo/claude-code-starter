<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div class="p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-semibold text-gray-800">{{ msg }}</h2>
    <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-4 bg-blue-50 rounded-lg">
        <h3 class="font-medium text-blue-900">Vue 3</h3>
        <p class="mt-1 text-sm text-blue-700">Composition API with TypeScript</p>
      </div>
      <div class="p-4 bg-green-50 rounded-lg">
        <h3 class="font-medium text-green-900">Tailwind CSS</h3>
        <p class="mt-1 text-sm text-green-700">Utility-first CSS framework</p>
      </div>
      <div class="p-4 bg-orange-50 rounded-lg">
        <h3 class="font-medium text-orange-900">Firebase</h3>
        <p class="mt-1 text-sm text-orange-700">Auth, Firestore, Storage</p>
      </div>
    </div>
  </div>
</template>
