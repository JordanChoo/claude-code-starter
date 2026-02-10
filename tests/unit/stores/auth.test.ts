import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// Mock firebase modules used by the auth store
vi.mock('@/firebase/auth', () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  signInWithGoogle: vi.fn(),
  onAuthChange: vi.fn()
}))

vi.mock('@/firebase/firestore', () => ({
  getDocument: vi.fn(),
  setDocument: vi.fn()
}))

vi.mock('firebase/firestore', () => ({
  serverTimestamp: vi.fn(() => 'mock-timestamp')
}))

import { signIn, signUp, signOut, signInWithGoogle, onAuthChange } from '@/firebase/auth'
import { getDocument, setDocument } from '@/firebase/firestore'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has null user and loading true', () => {
      const store = useAuthStore()
      expect(store.user).toBeNull()
      expect(store.loading).toBe(true)
      expect(store.error).toBeNull()
    })

    it('computes isAuthenticated as false', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
    })

    it('computes userEmail as undefined', () => {
      const store = useAuthStore()
      expect(store.userEmail).toBeUndefined()
    })

    it('computes userId as undefined', () => {
      const store = useAuthStore()
      expect(store.userId).toBeUndefined()
    })
  })

  describe('init()', () => {
    it('registers an auth state listener', () => {
      const store = useAuthStore()
      store.init()
      expect(onAuthChange).toHaveBeenCalledOnce()
      expect(onAuthChange).toHaveBeenCalledWith(expect.any(Function))
    })

    it('sets user and loading=false when auth state fires with a user', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com', displayName: null, photoURL: null }
      vi.mocked(onAuthChange).mockImplementation((callback: any) => {
        callback(mockUser)
        return vi.fn()
      })
      vi.mocked(getDocument).mockResolvedValue({ id: 'test-uid', email: 'test@example.com' } as any)

      const store = useAuthStore()
      store.init()

      // Wait for async ensureUserDocument to complete
      await vi.waitFor(() => {
        expect(store.loading).toBe(false)
      })

      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
      expect(store.userEmail).toBe('test@example.com')
    })

    it('creates a user document if one does not exist', async () => {
      const mockUser = { uid: 'new-uid', email: 'new@example.com', displayName: 'New User', photoURL: null }
      vi.mocked(onAuthChange).mockImplementation((callback: any) => {
        callback(mockUser)
        return vi.fn()
      })
      vi.mocked(getDocument).mockResolvedValue(null)
      vi.mocked(setDocument).mockResolvedValue(undefined)

      const store = useAuthStore()
      store.init()

      await vi.waitFor(() => {
        expect(store.loading).toBe(false)
      })

      expect(setDocument).toHaveBeenCalledWith('users', 'new-uid', {
        email: 'new@example.com',
        displayName: 'New User',
        photoURL: null,
        createdAt: 'mock-timestamp',
        updatedAt: 'mock-timestamp'
      })
    })

    it('does not create a user document if one already exists', async () => {
      const mockUser = { uid: 'existing-uid', email: 'existing@example.com', displayName: null, photoURL: null }
      vi.mocked(onAuthChange).mockImplementation((callback: any) => {
        callback(mockUser)
        return vi.fn()
      })
      vi.mocked(getDocument).mockResolvedValue({ id: 'existing-uid' } as any)

      const store = useAuthStore()
      store.init()

      await vi.waitFor(() => {
        expect(store.loading).toBe(false)
      })

      expect(setDocument).not.toHaveBeenCalled()
    })

    it('sets user to null and loading=false when auth state fires with null', async () => {
      vi.mocked(onAuthChange).mockImplementation((callback: any) => {
        callback(null)
        return vi.fn()
      })

      const store = useAuthStore()
      store.init()

      await vi.waitFor(() => {
        expect(store.loading).toBe(false)
      })

      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('login()', () => {
    it('calls signIn and clears error on success', async () => {
      vi.mocked(signIn).mockResolvedValue({} as any)
      const store = useAuthStore()
      await store.login('test@example.com', 'password123')

      expect(signIn).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(store.error).toBeNull()
      expect(store.actionLoading).toBe(false)
    })

    it('sets error on failure and re-throws', async () => {
      const firebaseError = Object.assign(new Error('auth error'), {
        code: 'auth/wrong-password'
      })
      vi.mocked(signIn).mockRejectedValue(firebaseError)
      const store = useAuthStore()

      await expect(store.login('test@example.com', 'wrong')).rejects.toThrow()

      expect(store.error).toBe('Incorrect password. Please try again.')
      expect(store.actionLoading).toBe(false)
    })
  })

  describe('register()', () => {
    it('calls signUp on success', async () => {
      vi.mocked(signUp).mockResolvedValue({} as any)
      const store = useAuthStore()
      await store.register('new@example.com', 'password123')

      expect(signUp).toHaveBeenCalledWith('new@example.com', 'password123')
      expect(store.error).toBeNull()
    })

    it('sets error on email-already-in-use', async () => {
      const firebaseError = Object.assign(new Error('email in use'), {
        code: 'auth/email-already-in-use'
      })
      vi.mocked(signUp).mockRejectedValue(firebaseError)
      const store = useAuthStore()

      await expect(store.register('existing@example.com', 'pass123')).rejects.toThrow()
      expect(store.error).toBe('This email address is already in use.')
    })
  })

  describe('logout()', () => {
    it('calls signOut on success', async () => {
      vi.mocked(signOut).mockResolvedValue(undefined as any)
      const store = useAuthStore()
      await store.logout()

      expect(signOut).toHaveBeenCalledOnce()
      expect(store.error).toBeNull()
      expect(store.actionLoading).toBe(false)
    })
  })

  describe('error mapping', () => {
    const errorCases = [
      { code: 'auth/user-not-found', expected: 'No account found with this email address.' },
      { code: 'auth/wrong-password', expected: 'Incorrect password. Please try again.' },
      { code: 'auth/invalid-email', expected: 'The email address is not valid.' },
      { code: 'auth/email-already-in-use', expected: 'This email address is already in use.' },
      { code: 'auth/weak-password', expected: 'Password should be at least 6 characters.' },
      { code: 'auth/operation-not-allowed', expected: 'Authentication method not enabled. Please contact support.' },
      { code: 'auth/too-many-requests', expected: 'Too many failed attempts. Please try again later.' },
      { code: 'auth/invalid-credential', expected: 'Invalid email or password. Please try again.' },
      { code: 'auth/popup-closed-by-user', expected: 'Google sign-in was cancelled.' },
      { code: 'auth/network-request-failed', expected: 'Network error. Please check your internet connection.' }
    ]

    errorCases.forEach(({ code, expected }) => {
      it(`maps ${code} correctly`, async () => {
        const firebaseError = Object.assign(new Error('test'), { code })
        vi.mocked(signIn).mockRejectedValue(firebaseError)
        const store = useAuthStore()

        await expect(store.login('a@b.com', 'pass')).rejects.toThrow()
        expect(store.error).toBe(expected)
      })
    })

    it('handles unknown Firebase error codes', async () => {
      const firebaseError = Object.assign(new Error('Unknown issue'), {
        code: 'auth/unknown-code'
      })
      vi.mocked(signIn).mockRejectedValue(firebaseError)
      const store = useAuthStore()

      await expect(store.login('a@b.com', 'pass')).rejects.toThrow()
      expect(store.error).toBe('Authentication error: Unknown issue')
    })

    it('handles non-Firebase errors', async () => {
      vi.mocked(signIn).mockRejectedValue(new Error('Network failure'))
      const store = useAuthStore()

      await expect(store.login('a@b.com', 'pass')).rejects.toThrow()
      expect(store.error).toBe('An unexpected error occurred: Network failure')
    })
  })

  describe('loginWithGoogle()', () => {
    it('calls signInWithGoogle and clears error on success', async () => {
      vi.mocked(signInWithGoogle).mockResolvedValue({} as any)
      const store = useAuthStore()
      await store.loginWithGoogle()

      expect(signInWithGoogle).toHaveBeenCalledOnce()
      expect(store.error).toBeNull()
      expect(store.actionLoading).toBe(false)
    })

    it('sets error on popup-closed-by-user and re-throws', async () => {
      const firebaseError = Object.assign(new Error('popup closed'), {
        code: 'auth/popup-closed-by-user'
      })
      vi.mocked(signInWithGoogle).mockRejectedValue(firebaseError)
      const store = useAuthStore()

      await expect(store.loginWithGoogle()).rejects.toThrow()
      expect(store.error).toBe('Google sign-in was cancelled.')
      expect(store.actionLoading).toBe(false)
    })
  })

  describe('dispose() and waitForAuth()', () => {
    it('waitForAuth resolves after init fires auth callback', async () => {
      vi.mocked(onAuthChange).mockImplementation((callback: any) => {
        callback(null)
        return vi.fn()
      })

      const store = useAuthStore()
      store.init()
      await store.waitForAuth()

      expect(store.loading).toBe(false)
    })

    it('dispose resets state and makes waitForAuth block again', async () => {
      // First init cycle
      vi.mocked(onAuthChange).mockImplementation((callback: any) => {
        callback(null)
        return vi.fn()
      })

      const store = useAuthStore()
      store.init()
      await store.waitForAuth()
      expect(store.loading).toBe(false)

      // Dispose
      store.dispose()
      expect(store.initializing).toBe(true)
      expect(store.actionLoading).toBe(false)
      expect(store.loading).toBe(true)

      // After dispose, waitForAuth should NOT resolve immediately
      let resolved = false
      store.waitForAuth().then(() => { resolved = true })

      // Give microtasks a chance to run
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(resolved).toBe(false)

      // Re-init should make it resolve
      store.init()
      await store.waitForAuth()
      expect(store.loading).toBe(false)
    })

    it('waitForAuth rejects after timeout when auth callback never fires', async () => {
      // onAuthChange never calls its callback
      vi.mocked(onAuthChange).mockImplementation(() => {
        return vi.fn()
      })

      const store = useAuthStore()
      store.init()

      await expect(store.waitForAuth(50)).rejects.toThrow('Auth initialization timed out')
    })

    it('waitForAuth uses custom timeout value', async () => {
      vi.mocked(onAuthChange).mockImplementation(() => {
        return vi.fn()
      })

      const store = useAuthStore()
      store.init()

      const start = Date.now()
      await expect(store.waitForAuth(100)).rejects.toThrow('Auth initialization timed out')
      const elapsed = Date.now() - start

      expect(elapsed).toBeGreaterThanOrEqual(90)
      expect(elapsed).toBeLessThan(500)
    })

    it('waitForAuth resolves before timeout when auth callback fires in time', async () => {
      vi.mocked(onAuthChange).mockImplementation((callback: any) => {
        // Fire the callback after a short delay (well before the timeout)
        setTimeout(() => callback(null), 20)
        return vi.fn()
      })

      const store = useAuthStore()
      store.init()

      // Should resolve without throwing, even though timeout is set
      await expect(store.waitForAuth(5000)).resolves.toBeUndefined()
      expect(store.loading).toBe(false)
    })
  })

  describe('ensureUserDocument error handling', () => {
    it('continues with loading=false when ensureUserDocument fails', async () => {
      const mockUser = { uid: 'fail-uid', email: 'fail@example.com', displayName: null, photoURL: null }
      vi.mocked(onAuthChange).mockImplementation((callback: any) => {
        callback(mockUser)
        return vi.fn()
      })
      vi.mocked(getDocument).mockRejectedValue(new Error('Firestore unavailable'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const store = useAuthStore()
      store.init()

      await vi.waitFor(() => {
        expect(store.loading).toBe(false)
      })

      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
      expect(consoleSpy).toHaveBeenCalledWith('Failed to ensure user document:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('sets profileError when ensureUserDocument fails', async () => {
      const mockUser = { uid: 'fail-uid', email: 'fail@example.com', displayName: null, photoURL: null }
      vi.mocked(onAuthChange).mockImplementation((callback: any) => {
        callback(mockUser)
        return vi.fn()
      })
      vi.mocked(getDocument).mockResolvedValue(null)
      vi.mocked(setDocument).mockRejectedValue(new Error('Firestore write failed'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const store = useAuthStore()
      store.init()

      await vi.waitFor(() => {
        expect(store.loading).toBe(false)
      })

      expect(store.profileError).toBe('Failed to set up your profile. Please try refreshing the page.')
      expect(store.loading).toBe(false)
      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
      consoleSpy.mockRestore()
    })

    it('clears profileError on successful auth change', async () => {
      // First trigger a failure
      const mockUser = { uid: 'uid-1', email: 'user@example.com', displayName: null, photoURL: null }
      let authCallback: any
      vi.mocked(onAuthChange).mockImplementation((callback: any) => {
        authCallback = callback
        return vi.fn()
      })

      const store = useAuthStore()
      store.init()

      // Trigger failure
      vi.mocked(getDocument).mockRejectedValue(new Error('Firestore unavailable'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      await authCallback(mockUser)
      expect(store.profileError).toBe('Failed to set up your profile. Please try refreshing the page.')

      // Trigger success
      vi.mocked(getDocument).mockResolvedValue({ id: 'uid-1' } as any)
      await authCallback(mockUser)
      expect(store.profileError).toBeNull()

      consoleSpy.mockRestore()
    })

    it('clears profileError when user signs out', async () => {
      const mockUser = { uid: 'uid-2', email: 'user2@example.com', displayName: null, photoURL: null }
      let authCallback: any
      vi.mocked(onAuthChange).mockImplementation((callback: any) => {
        authCallback = callback
        return vi.fn()
      })

      const store = useAuthStore()
      store.init()

      // Trigger failure
      vi.mocked(getDocument).mockRejectedValue(new Error('Firestore unavailable'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      await authCallback(mockUser)
      expect(store.profileError).toBe('Failed to set up your profile. Please try refreshing the page.')

      // Sign out (null user)
      await authCallback(null)
      expect(store.profileError).toBeNull()

      consoleSpy.mockRestore()
    })

    it('skips document creation for users with null email', async () => {
      const mockUser = { uid: 'anon-uid', email: null, displayName: null, photoURL: null }
      vi.mocked(onAuthChange).mockImplementation((callback: any) => {
        callback(mockUser)
        return vi.fn()
      })

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const store = useAuthStore()
      store.init()

      await vi.waitFor(() => {
        expect(store.loading).toBe(false)
      })

      expect(getDocument).not.toHaveBeenCalled()
      expect(setDocument).not.toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith('User has no email address, skipping document creation')
      consoleSpy.mockRestore()
    })
  })
})
