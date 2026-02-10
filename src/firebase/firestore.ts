import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  runTransaction,
  type QueryConstraint,
  type DocumentSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './index'
import type { CollectionMap, CollectionName, WriteData } from '@/types/models'

/**
 * Get a single document by ID.
 * Returns the document data with `id` injected from the document reference (not stored in Firestore).
 */
export async function getDocument<K extends CollectionName>(
  collectionName: K,
  documentId: string
): Promise<CollectionMap[K] | null> {
  const docRef = doc(db, collectionName, documentId)
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as CollectionMap[K]) : null
}

/**
 * Get multiple documents matching query constraints.
 * Returns documents with `id` injected from each document reference (not stored in Firestore).
 */
export async function getDocuments<K extends CollectionName>(
  collectionName: K,
  ...queryConstraints: QueryConstraint[]
): Promise<Array<CollectionMap[K]>> {
  const q = query(collection(db, collectionName), ...queryConstraints)
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as CollectionMap[K]))
}

export async function addDocument<K extends CollectionName>(
  collectionName: K,
  data: Omit<WriteData<CollectionMap[K]>, 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  return docRef.id
}

export async function updateDocument<K extends CollectionName>(
  collectionName: K,
  documentId: string,
  data: Partial<Omit<WriteData<CollectionMap[K]>, 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, collectionName, documentId)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

export async function deleteDocument<K extends CollectionName>(
  collectionName: K,
  documentId: string
): Promise<void> {
  const docRef = doc(db, collectionName, documentId)
  await deleteDoc(docRef)
}

/** Result of a paginated query */
export interface PaginatedResult<T> {
  documents: T[]
  lastDoc: DocumentSnapshot | null
  hasMore: boolean
}

/**
 * Get documents with cursor-based pagination.
 * Returns a page of results plus a cursor for the next page.
 */
export async function getDocumentsPaginated<K extends CollectionName>(
  collectionName: K,
  pageSize: number,
  cursor?: DocumentSnapshot | null,
  ...queryConstraints: QueryConstraint[]
): Promise<PaginatedResult<CollectionMap[K]>> {
  const constraints: QueryConstraint[] = [...queryConstraints]
  if (cursor) {
    constraints.push(startAfter(cursor))
  }
  constraints.push(limit(pageSize + 1))

  const q = query(collection(db, collectionName), ...constraints)
  const querySnapshot = await getDocs(q)
  const docs = querySnapshot.docs

  const hasMore = docs.length > pageSize
  const pageDocs = hasMore ? docs.slice(0, pageSize) : docs

  return {
    documents: pageDocs.map(d => ({ id: d.id, ...d.data() } as CollectionMap[K])),
    lastDoc: pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null,
    hasMore
  }
}

export async function setDocument<K extends CollectionName>(
  collectionName: K,
  documentId: string,
  data: Omit<WriteData<CollectionMap[K]>, 'id'>
): Promise<void> {
  const docRef = doc(db, collectionName, documentId)
  await setDoc(docRef, { ...data })
}

/**
 * Execute multiple write operations atomically.
 * All operations succeed or all fail together.
 * Automatically injects updatedAt on set/update operations.
 * Maximum 500 operations per batch (Firestore limit).
 */
export type BatchOperation =
  | { type: 'set'; collection: CollectionName; id: string; data: Record<string, unknown> }
  | { type: 'update'; collection: CollectionName; id: string; data: Record<string, unknown> }
  | { type: 'delete'; collection: CollectionName; id: string }

export async function batchWrite(operations: BatchOperation[]): Promise<void> {
  if (operations.length === 0) return
  if (operations.length > 500) {
    throw new Error('Firestore batch limit is 500 operations')
  }

  const batch = writeBatch(db)

  for (const op of operations) {
    const docRef = doc(db, op.collection, op.id)
    switch (op.type) {
      case 'set':
        batch.set(docRef, {
          ...op.data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        break
      case 'update':
        batch.update(docRef, {
          ...op.data,
          updatedAt: serverTimestamp()
        })
        break
      case 'delete':
        batch.delete(docRef)
        break
    }
  }

  await batch.commit()
}

/**
 * Execute read-then-write operations atomically with optimistic concurrency.
 * The callback receives typed get/set/update/delete helpers scoped to the transaction.
 * Firestore automatically retries on contention (up to 5 times).
 */
export async function withTransaction<T>(
  callback: (helpers: {
    get: <K extends CollectionName>(collectionName: K, id: string) => Promise<CollectionMap[K] | null>
    set: (collectionName: CollectionName, id: string, data: Record<string, unknown>) => void
    update: (collectionName: CollectionName, id: string, data: Record<string, unknown>) => void
    remove: (collectionName: CollectionName, id: string) => void
  }) => Promise<T>
): Promise<T> {
  return runTransaction(db, async (transaction) => {
    const helpers = {
      get: async <K extends CollectionName>(collectionName: K, id: string): Promise<CollectionMap[K] | null> => {
        const docRef = doc(db, collectionName, id)
        const docSnap = await transaction.get(docRef)
        return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as CollectionMap[K]) : null
      },
      set: (collectionName: CollectionName, id: string, data: Record<string, unknown>) => {
        const docRef = doc(db, collectionName, id)
        transaction.set(docRef, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      },
      update: (collectionName: CollectionName, id: string, data: Record<string, unknown>) => {
        const docRef = doc(db, collectionName, id)
        transaction.update(docRef, {
          ...data,
          updatedAt: serverTimestamp()
        })
      },
      remove: (collectionName: CollectionName, id: string) => {
        const docRef = doc(db, collectionName, id)
        transaction.delete(docRef)
      }
    }
    return callback(helpers)
  })
}

export { where, orderBy, limit, startAfter }
