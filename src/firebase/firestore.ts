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
  type QueryConstraint,
  type DocumentData,
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
  } as DocumentData)
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
  } as DocumentData)
}

export async function deleteDocument<K extends CollectionName>(
  collectionName: K,
  documentId: string
): Promise<void> {
  const docRef = doc(db, collectionName, documentId)
  await deleteDoc(docRef)
}

export async function setDocument<K extends CollectionName>(
  collectionName: K,
  documentId: string,
  data: Omit<WriteData<CollectionMap[K]>, 'id'>
): Promise<void> {
  const docRef = doc(db, collectionName, documentId)
  await setDoc(docRef, data as DocumentData)
}

export { where, orderBy, limit }
