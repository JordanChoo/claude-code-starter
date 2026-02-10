import { serverTimestamp } from 'firebase/firestore'
import { getDocument, setDocument } from '@/firebase/firestore'
import type { User } from '@/types/models'

/**
 * User profile service interface.
 * Manages Firestore user documents independently of auth state.
 */
export interface IUserService {
  getUser(uid: string): Promise<User | null>
  createUserIfNotExists(
    uid: string,
    data: { email: string; displayName?: string | null; photoURL?: string | null }
  ): Promise<void>
}

/**
 * Firebase-backed implementation of the user service.
 */
export const userService: IUserService = {
  getUser: (uid) => getDocument('users', uid),

  createUserIfNotExists: async (uid, data) => {
    const existing = await getDocument('users', uid)
    if (!existing) {
      await setDocument('users', uid, {
        email: data.email,
        displayName: data.displayName ?? null,
        photoURL: data.photoURL ?? null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
  }
}
