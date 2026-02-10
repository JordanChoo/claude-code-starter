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
