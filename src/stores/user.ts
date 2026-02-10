import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { serverTimestamp } from 'firebase/firestore'
import { useAuthStore } from '@/stores/auth'
import { getDocument, setDocument } from '@/firebase/firestore'
import type { User } from '@/types/models'

export const useUserStore = defineStore('user', () => {
  const userProfile = ref<User | null>(null)
  const profileError = ref<string | null>(null)
  const profileLoading = ref(false)

  async function ensureUserDocument(uid: string, email: string, displayName: string | null, photoURL: string | null) {
    const existing = await getDocument('users', uid)
    if (!existing) {
      await setDocument('users', uid, {
        email,
        displayName: displayName || null,
        photoURL: photoURL || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
    return existing ?? await getDocument('users', uid)
  }

  async function loadProfile(uid: string, email: string | null, displayName: string | null, photoURL: string | null) {
    if (!email) {
      console.warn('User has no email address, skipping document creation')
      return
    }

    profileLoading.value = true
    profileError.value = null
    try {
      const profile = await ensureUserDocument(uid, email, displayName, photoURL)
      userProfile.value = profile
    } catch (e) {
      console.error('Failed to ensure user document:', e)
      profileError.value = 'Failed to set up your profile. Please try refreshing the page.'
    } finally {
      profileLoading.value = false
    }
  }

  function clearProfile() {
    userProfile.value = null
    profileError.value = null
    profileLoading.value = false
  }

  function setupAuthWatcher() {
    const authStore = useAuthStore()
    watch(
      () => authStore.user,
      async (firebaseUser) => {
        if (firebaseUser) {
          await loadProfile(
            firebaseUser.uid,
            firebaseUser.email,
            firebaseUser.displayName,
            firebaseUser.photoURL
          )
        } else {
          clearProfile()
        }
      }
    )
  }

  return {
    userProfile,
    profileError,
    profileLoading,
    loadProfile,
    clearProfile,
    setupAuthWatcher
  }
})
