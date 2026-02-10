import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

vi.mock('@/firebase/firestore', () => ({
  getDocument: vi.fn(),
  setDocument: vi.fn()
}))

vi.mock('firebase/firestore', () => ({
  serverTimestamp: vi.fn(() => 'mock-timestamp')
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: null
  }))
}))

import { getDocument, setDocument } from '@/firebase/firestore'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has null profile and no error', () => {
      const store = useUserStore()
      expect(store.userProfile).toBeNull()
      expect(store.profileError).toBeNull()
      expect(store.profileLoading).toBe(false)
    })
  })

  describe('loadProfile()', () => {
    it('creates a user document if one does not exist', async () => {
      vi.mocked(getDocument)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'new-uid', email: 'new@example.com', displayName: 'New User', photoURL: null } as any)
      vi.mocked(setDocument).mockResolvedValue(undefined)

      const store = useUserStore()
      await store.loadProfile('new-uid', 'new@example.com', 'New User', null)

      expect(setDocument).toHaveBeenCalledWith('users', 'new-uid', {
        email: 'new@example.com',
        displayName: 'New User',
        photoURL: null,
        role: 'user',
        createdAt: 'mock-timestamp',
        updatedAt: 'mock-timestamp'
      })
      expect(store.profileLoading).toBe(false)
      expect(store.profileError).toBeNull()
    })

    it('does not create a user document if one already exists', async () => {
      vi.mocked(getDocument).mockResolvedValue({ id: 'existing-uid', email: 'existing@example.com' } as any)

      const store = useUserStore()
      await store.loadProfile('existing-uid', 'existing@example.com', null, null)

      expect(setDocument).not.toHaveBeenCalled()
      expect(store.userProfile).toEqual({ id: 'existing-uid', email: 'existing@example.com' })
    })

    it('sets profileError when ensureUserDocument fails', async () => {
      vi.mocked(getDocument).mockResolvedValue(null)
      vi.mocked(setDocument).mockRejectedValue(new Error('Firestore write failed'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const store = useUserStore()
      await store.loadProfile('fail-uid', 'fail@example.com', null, null)

      expect(store.profileError).toBe('Failed to set up your profile. Please try refreshing the page.')
      expect(store.profileLoading).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Failed to ensure user document:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('sets profileError when getDocument fails', async () => {
      vi.mocked(getDocument).mockRejectedValue(new Error('Firestore unavailable'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const store = useUserStore()
      await store.loadProfile('fail-uid', 'fail@example.com', null, null)

      expect(store.profileError).toBe('Failed to set up your profile. Please try refreshing the page.')
      expect(store.profileLoading).toBe(false)
      consoleSpy.mockRestore()
    })

    it('skips document creation for users with null email', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const store = useUserStore()
      await store.loadProfile('anon-uid', null, null, null)

      expect(getDocument).not.toHaveBeenCalled()
      expect(setDocument).not.toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith('User has no email address, skipping document creation')
      consoleSpy.mockRestore()
    })
  })

  describe('userRole computed', () => {
    it('defaults to "user" when no profile is loaded', () => {
      const store = useUserStore()
      expect(store.userRole).toBe('user')
    })

    it('returns role from profile when loaded', async () => {
      vi.mocked(getDocument).mockResolvedValue({ id: 'uid-admin', email: 'admin@example.com', role: 'admin' } as any)

      const store = useUserStore()
      await store.loadProfile('uid-admin', 'admin@example.com', null, null)

      expect(store.userRole).toBe('admin')
    })

    it('defaults to "user" when profile has no role field', async () => {
      vi.mocked(getDocument).mockResolvedValue({ id: 'uid-old', email: 'old@example.com' } as any)

      const store = useUserStore()
      await store.loadProfile('uid-old', 'old@example.com', null, null)

      expect(store.userRole).toBe('user')
    })
  })

  describe('hasRole()', () => {
    it('returns true when role matches', async () => {
      vi.mocked(getDocument).mockResolvedValue({ id: 'uid-mod', email: 'mod@example.com', role: 'moderator' } as any)

      const store = useUserStore()
      await store.loadProfile('uid-mod', 'mod@example.com', null, null)

      expect(store.hasRole('moderator')).toBe(true)
    })

    it('returns false when role does not match', async () => {
      vi.mocked(getDocument).mockResolvedValue({ id: 'uid-user', email: 'user@example.com', role: 'user' } as any)

      const store = useUserStore()
      await store.loadProfile('uid-user', 'user@example.com', null, null)

      expect(store.hasRole('admin')).toBe(false)
    })

    it('returns true for "user" role when no profile is loaded', () => {
      const store = useUserStore()
      expect(store.hasRole('user')).toBe(true)
    })
  })

  describe('ensureUserDocument sets default role', () => {
    it('sets role to "user" when creating a new user document', async () => {
      vi.mocked(getDocument)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'new-uid', email: 'new@example.com', role: 'user' } as any)
      vi.mocked(setDocument).mockResolvedValue(undefined)

      const store = useUserStore()
      await store.loadProfile('new-uid', 'new@example.com', null, null)

      expect(setDocument).toHaveBeenCalledWith('users', 'new-uid', expect.objectContaining({
        role: 'user'
      }))
    })
  })

  describe('clearProfile()', () => {
    it('resets all profile state', async () => {
      vi.mocked(getDocument).mockResolvedValue({ id: 'uid-1', email: 'user@example.com' } as any)

      const store = useUserStore()
      await store.loadProfile('uid-1', 'user@example.com', null, null)
      expect(store.userProfile).not.toBeNull()

      store.clearProfile()

      expect(store.userProfile).toBeNull()
      expect(store.profileError).toBeNull()
      expect(store.profileLoading).toBe(false)
    })
  })
})
