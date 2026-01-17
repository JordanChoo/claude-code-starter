import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from 'firebase/auth'
import {
  signIn,
  signUp,
  signOut,
  signInWithGoogle,
  onAuthChange
} from '@/firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const userEmail = computed(() => user.value?.email)
  const userId = computed(() => user.value?.uid)

  function init() {
    onAuthChange((firebaseUser) => {
      user.value = firebaseUser
      loading.value = false
    })
  }

  async function login(email: string, password: string) {
    try {
      error.value = null
      loading.value = true
      await signIn(email, password)
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function register(email: string, password: string) {
    try {
      error.value = null
      loading.value = true
      await signUp(email, password)
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loginWithGoogle() {
    try {
      error.value = null
      loading.value = true
      await signInWithGoogle()
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await signOut()
    } catch (e) {
      error.value = (e as Error).message
      throw e
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    userEmail,
    userId,
    init,
    login,
    register,
    loginWithGoogle,
    logout
  }
})
