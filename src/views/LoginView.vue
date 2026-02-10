<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const isSubmitting = ref(false)

/**
 * Validates and sanitizes redirect URLs to prevent open redirect attacks.
 * Only allows internal paths starting with '/'.
 */
function getSafeRedirect(): string {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect
  }
  return '/'
}

async function handleSubmit() {
  isSubmitting.value = true
  try {
    if (isLogin.value) {
      await authStore.login(email.value, password.value)
    } else {
      await authStore.register(email.value, password.value)
    }
    router.push(getSafeRedirect())
  } catch {
    // Error is handled in the store
  } finally {
    isSubmitting.value = false
  }
}

async function handleGoogleLogin() {
  isSubmitting.value = true
  try {
    await authStore.loginWithGoogle()
    router.push(getSafeRedirect())
  } catch {
    // Error is handled in the store
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">
          {{ isLogin ? 'Sign in to your account' : 'Create a new account' }}
        </h2>
      </div>

      <form @submit.prevent="handleSubmit" class="mt-8 space-y-6">
        <div v-if="authStore.error" class="error-banner">
          {{ authStore.error }}
        </div>

        <div class="space-y-4">
          <div>
            <label for="email" class="input-label">
              Email address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              class="input-field mt-1"
            />
          </div>

          <div>
            <label for="password" class="input-label">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              minlength="6"
              :autocomplete="isLogin ? 'current-password' : 'new-password'"
              class="input-field mt-1"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="btn-primary w-full flex justify-center"
          >
            {{ isSubmitting ? 'Please wait...' : (isLogin ? 'Sign in' : 'Sign up') }}
          </button>
        </div>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-50 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div>
          <button
            type="button"
            @click="handleGoogleLogin"
            :disabled="isSubmitting"
            class="btn-secondary w-full flex justify-center"
          >
            Google
          </button>
        </div>

        <div class="text-center">
          <button
            type="button"
            @click="isLogin = !isLogin"
            class="btn-text"
          >
            {{ isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
