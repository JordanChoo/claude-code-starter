import type { FieldValue, Timestamp } from 'firebase/firestore'

/**
 * Base interface for all Firestore documents
 * All models must extend this interface
 */
export interface BaseDocument {
  /** Document ID — injected from Firestore document reference on read, NOT stored as a field in the document */
  id: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * User document stored in the 'users' collection
 * @see .claude/rules/firebase-data-models.md for full documentation
 */
export interface User extends BaseDocument {
  email: string
  displayName?: string
  photoURL?: string
}

/**
 * Maps Firestore collection names to their document types.
 * Add new collections here as they are created.
 */
export interface CollectionMap {
  users: User
}

/** Union of all valid Firestore collection names. */
export type CollectionName = keyof CollectionMap

/**
 * Converts a document type into its Firestore write-side equivalent.
 * - Timestamp fields accept FieldValue (e.g. serverTimestamp())
 * - Optional fields accept null in addition to their declared type
 * - The `id` field is excluded since it comes from the document reference
 */
export type WriteData<T extends BaseDocument> = {
  [P in keyof Omit<T, 'id'>]: T[P] extends Timestamp
    ? Timestamp | FieldValue
    : undefined extends T[P]
      ? T[P] | null
      : T[P]
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
