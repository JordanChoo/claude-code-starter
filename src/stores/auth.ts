import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from 'firebase/auth'
import { serverTimestamp } from 'firebase/firestore'
import {
  signIn,
  signUp,
  signOut,
  signInWithGoogle,
  onAuthChange
} from '@/firebase/auth'
import { getDocument, setDocument } from '@/firebase/firestore'

interface FirebaseAuthError extends Error {
  code: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  let _initialized = false
  let _authReadyResolve: (() => void) | null = null
  const _authReady = new Promise<void>((resolve) => {
    _authReadyResolve = resolve
  })

  const isAuthenticated = computed(() => !!user.value)
  const userEmail = computed(() => user.value?.email)
  const userId = computed(() => user.value?.uid)

  const mapFirebaseAuthError = (e: Error): string => {
    const authError = e as FirebaseAuthError
    if (authError.code) {
      switch (authError.code) {
        case 'auth/user-not-found':
          return 'No account found with this email address.'
        case 'auth/wrong-password':
          return 'Incorrect password. Please try again.'
        case 'auth/invalid-email':
          return 'The email address is not valid.'
        case 'auth/email-already-in-use':
          return 'This email address is already in use.'
        case 'auth/weak-password':
          return 'Password should be at least 6 characters.'
        case 'auth/operation-not-allowed':
          return 'Authentication method not enabled. Please contact support.'
        case 'auth/popup-closed-by-user':
          return 'Google sign-in was cancelled.'
        case 'auth/too-many-requests':
          return 'Too many failed attempts. Please try again later.'
        case 'auth/invalid-credential':
          return 'Invalid email or password. Please try again.'
        case 'auth/network-request-failed':
          return 'Network error. Please check your internet connection.'
        default:
          return `Authentication error: ${e.message}`
      }
    }
    return `An unexpected error occurred: ${e.message}`
  }

  async function ensureUserDocument(firebaseUser: User) {
    const existing = await getDocument('users', firebaseUser.uid)
    if (!existing) {
      await setDocument('users', firebaseUser.uid, {
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || null,
        photoURL: firebaseUser.photoURL || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
  }

  function init() {
    if (_initialized) return
    _initialized = true
    onAuthChange(async (firebaseUser) => {
      user.value = firebaseUser
      if (firebaseUser) {
        try {
          await ensureUserDocument(firebaseUser)
        } catch (e) {
          console.error('Failed to ensure user document:', e)
        }
      }
      loading.value = false
      _authReadyResolve?.()
      _authReadyResolve = null
    })
  }

  function waitForAuth() {
    return _authReady
  }

  async function login(email: string, password: string) {
    try {
      error.value = null
      loading.value = true
      await signIn(email, password)
    } catch (e) {
      error.value = mapFirebaseAuthError(e as Error)
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
      error.value = mapFirebaseAuthError(e as Error)
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
      error.value = mapFirebaseAuthError(e as Error)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      error.value = null
      loading.value = true
      await signOut()
    } catch (e) {
      error.value = mapFirebaseAuthError(e as Error)
      throw e
    } finally {
      loading.value = false
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
    waitForAuth,
    login,
    register,
    loginWithGoogle,
    logout
  }
})
