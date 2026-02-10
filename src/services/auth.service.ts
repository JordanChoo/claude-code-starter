import type { User, UserCredential } from 'firebase/auth'
import type { Unsubscribe } from 'firebase/auth'
import {
  signIn,
  signUp,
  signOut,
  signInWithGoogle,
  onAuthChange,
  getCurrentUser
} from '@/firebase/auth'

/**
 * Authentication service interface.
 * Decouples stores from Firebase Auth SDK for testability and future backend swaps.
 */
export interface IAuthService {
  signIn(email: string, password: string): Promise<UserCredential>
  signUp(email: string, password: string): Promise<UserCredential>
  signInWithGoogle(): Promise<UserCredential>
  signOut(): Promise<void>
  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe
  getCurrentUser(): User | null
}

/**
 * Firebase-backed implementation of the auth service.
 */
export const authService: IAuthService = {
  signIn: (email, password) => signIn(email, password),
  signUp: (email, password) => signUp(email, password),
  signInWithGoogle: () => signInWithGoogle(),
  signOut: () => signOut(),
  onAuthStateChanged: (callback) => onAuthChange(callback),
  getCurrentUser: () => getCurrentUser()
}
