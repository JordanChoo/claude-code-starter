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
  type DocumentData
} from 'firebase/firestore'
import { db } from './index'

export async function getDocument<T = DocumentData>(
  collectionName: string,
  documentId: string
): Promise<T | null> {
  const docRef = doc(db, collectionName, documentId)
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as T) : null
}

export async function getDocuments<T = DocumentData>(
  collectionName: string,
  ...queryConstraints: QueryConstraint[]
): Promise<Array<T & { id: string }>> {
  const q = query(collection(db, collectionName), ...queryConstraints)
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T & { id: string }))
}

export async function addDocument<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), data)
  return docRef.id
}

export async function updateDocument(
  collectionName: string,
  documentId: string,
  data: Partial<DocumentData>
): Promise<void> {
  const docRef = doc(db, collectionName, documentId)
  await updateDoc(docRef, data)
}

export async function deleteDocument(
  collectionName: string,
  documentId: string
): Promise<void> {
  const docRef = doc(db, collectionName, documentId)
  await deleteDoc(docRef)
}

export async function setDocument(
  collectionName: string,
  documentId: string,
  data: DocumentData
): Promise<void> {
  const docRef = doc(db, collectionName, documentId)
  await setDoc(docRef, data)
}

export { where, orderBy, limit }
