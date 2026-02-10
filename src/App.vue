<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

async function handleLogout() {
  try {
    await authStore.logout()
  } catch {
    // Error already stored in authStore.error by the store's logout method
  }
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <router-link to="/" class="text-xl font-bold text-gray-900">
            Vue Firebase Starter
          </router-link>
          <div class="flex items-center space-x-4">
            <template v-if="authStore.loading">
              <span class="text-gray-400 text-sm">Loading...</span>
            </template>
            <template v-else-if="authStore.isAuthenticated">
              <span class="text-gray-600">{{ authStore.userEmail }}</span>
              <button
                @click="handleLogout"
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </template>
            <template v-else>
              <router-link
                to="/login"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Login
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>
    <main>
      <ErrorBoundary>
        <template v-if="!authStore.loading">
          <component :is="route.meta.layout === 'none' ? 'div' : DefaultLayout">
            <router-view v-slot="{ Component }">
              <Suspense>
                <component :is="Component" />
                <template #fallback>
                  <div class="flex justify-center items-center py-20">
                    <span class="text-gray-400">Loading...</span>
                  </div>
                </template>
              </Suspense>
            </router-view>
          </component>
        </template>
        <div v-else class="flex justify-center items-center py-20">
          <span class="text-gray-400">Loading...</span>
        </div>
      </ErrorBoundary>
    </main>
  </div>
</template>
