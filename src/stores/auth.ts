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
  const initializing = ref(true)
  const actionLoading = ref(false)
  const loading = computed(() => initializing.value || actionLoading.value)
  const error = ref<string | null>(null)
  const profileError = ref<string | null>(null)

  let _initialized = false
  let _unsubscribeAuth: (() => void) | null = null
  let _authReadyResolve: (() => void) | null = null
  let _authReady = new Promise<void>((resolve) => {
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
    if (!firebaseUser.email) {
      console.warn('User has no email address, skipping document creation')
      return
    }
    const existing = await getDocument('users', firebaseUser.uid)
    if (!existing) {
      await setDocument('users', firebaseUser.uid, {
        email: firebaseUser.email,
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
    _unsubscribeAuth = onAuthChange(async (firebaseUser) => {
      user.value = firebaseUser
      if (firebaseUser) {
        try {
          profileError.value = null
          await ensureUserDocument(firebaseUser)
        } catch (e) {
          console.error('Failed to ensure user document:', e)
          profileError.value = 'Failed to set up your profile. Please try refreshing the page.'
        }
      } else {
        profileError.value = null
      }
      initializing.value = false
      _authReadyResolve?.()
      _authReadyResolve = null
    })
  }

  function dispose() {
    _unsubscribeAuth?.()
    _unsubscribeAuth = null
    _initialized = false
    initializing.value = true
    actionLoading.value = false
    _authReady = new Promise<void>((resolve) => {
      _authReadyResolve = resolve
    })
  }

  function waitForAuth(timeoutMs = 10000): Promise<void> {
    return Promise.race([
      _authReady,
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('Auth initialization timed out')), timeoutMs)
      )
    ])
  }

  async function login(email: string, password: string) {
    try {
      error.value = null
      actionLoading.value = true
      await signIn(email, password)
    } catch (e) {
      error.value = mapFirebaseAuthError(e as Error)
      throw e
    } finally {
      actionLoading.value = false
    }
  }

  async function register(email: string, password: string) {
    try {
      error.value = null
      actionLoading.value = true
      await signUp(email, password)
    } catch (e) {
      error.value = mapFirebaseAuthError(e as Error)
      throw e
    } finally {
      actionLoading.value = false
    }
  }

  async function loginWithGoogle() {
    try {
      error.value = null
      actionLoading.value = true
      await signInWithGoogle()
    } catch (e) {
      error.value = mapFirebaseAuthError(e as Error)
      throw e
    } finally {
      actionLoading.value = false
    }
  }

  async function logout() {
    try {
      error.value = null
      actionLoading.value = true
      await signOut()
    } catch (e) {
      error.value = mapFirebaseAuthError(e as Error)
      throw e
    } finally {
      actionLoading.value = false
    }
  }

  return {
    user,
    initializing,
    actionLoading,
    loading,
    error,
    profileError,
    isAuthenticated,
    userEmail,
    userId,
    init,
    dispose,
    waitForAuth,
    login,
    register,
    loginWithGoogle,
    logout
  }
})
