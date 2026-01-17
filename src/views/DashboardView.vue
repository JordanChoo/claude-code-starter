<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="bg-white shadow rounded-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-2 text-gray-600">
        Welcome back, {{ authStore.userEmail }}!
      </p>
      <p class="mt-4 text-sm text-gray-500">
        This is a protected route. Only authenticated users can see this page.
      </p>
    </div>
  </div>
</template>
