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

import { signIn, signUp, signOut, onAuthChange } from '@/firebase/auth'
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
      expect(store.loading).toBe(false)
    })

    it('sets error on failure and re-throws', async () => {
      const firebaseError = Object.assign(new Error('auth error'), {
        code: 'auth/wrong-password'
      })
      vi.mocked(signIn).mockRejectedValue(firebaseError)
      const store = useAuthStore()

      await expect(store.login('test@example.com', 'wrong')).rejects.toThrow()

      expect(store.error).toBe('Incorrect password. Please try again.')
      expect(store.loading).toBe(false)
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
      expect(store.loading).toBe(false)
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
})
