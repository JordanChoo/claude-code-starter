import type { Timestamp } from 'firebase/firestore'

/**
 * Base interface for all Firestore documents
 * All models must extend this interface
 */
export interface BaseDocument {
  id: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * User document stored in the 'users' collection
 * @see .claude/rules/data-models.md for full documentation
 */
export interface User extends BaseDocument {
  email: string
  displayName?: string
  photoURL?: string
}

/**
 * Type helper for creating new documents (without id and timestamps)
 * Timestamps are set by Firestore or application code
 */
export type NewDocument<T extends BaseDocument> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Type helper for updating documents (all fields optional except id)
 */
export type UpdateDocument<T extends BaseDocument> = Partial<Omit<T, 'id' | 'createdAt'>> & {
  updatedAt: Timestamp
}
