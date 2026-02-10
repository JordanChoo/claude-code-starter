import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock firebase/firestore module
const mockGetDoc = vi.fn()
const mockGetDocs = vi.fn()
const mockAddDoc = vi.fn()
const mockSetDoc = vi.fn()
const mockUpdateDoc = vi.fn()
const mockDeleteDoc = vi.fn()
const mockCollection = vi.fn()
const mockDoc = vi.fn()
const mockQuery = vi.fn()
const mockServerTimestamp = vi.fn(() => 'mock-server-timestamp')

vi.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  doc: (...args: any[]) => mockDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  setDoc: (...args: any[]) => mockSetDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  query: (...args: any[]) => mockQuery(...args),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: () => mockServerTimestamp()
}))

vi.mock('@/firebase/index', () => ({
  db: 'mock-db'
}))

import {
  getDocument,
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  setDocument
} from '@/firebase/firestore'

describe('Firestore Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDoc.mockReturnValue('mock-doc-ref')
    mockCollection.mockReturnValue('mock-collection-ref')
    mockQuery.mockReturnValue('mock-query')
  })

  describe('getDocument', () => {
    it('returns document data with injected id when document exists', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: 'user-123',
        data: () => ({ email: 'test@example.com', displayName: 'Test' })
      })

      const result = await getDocument('users', 'user-123')

      expect(mockDoc).toHaveBeenCalledWith('mock-db', 'users', 'user-123')
      expect(result).toEqual({ id: 'user-123', email: 'test@example.com', displayName: 'Test' })
    })

    it('returns null when document does not exist', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
        id: 'missing-id',
        data: () => undefined
      })

      const result = await getDocument('users', 'missing-id')
      expect(result).toBeNull()
    })
  })

  describe('getDocuments', () => {
    it('returns array of documents with injected ids', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          { id: 'u1', data: () => ({ email: 'a@b.com' }) },
          { id: 'u2', data: () => ({ email: 'c@d.com' }) }
        ]
      })

      const result = await getDocuments('users')

      expect(result).toEqual([
        { id: 'u1', email: 'a@b.com' },
        { id: 'u2', email: 'c@d.com' }
      ])
    })

    it('returns empty array when no documents match', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] })

      const result = await getDocuments('users')
      expect(result).toEqual([])
    })
  })

  describe('addDocument', () => {
    it('creates document and returns the generated id', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-doc-id' })

      const result = await addDocument('users', { email: 'new@example.com' } as any)

      expect(result).toBe('new-doc-id')
    })

    it('auto-injects createdAt and updatedAt serverTimestamp', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-id' })

      await addDocument('users', { email: 'new@example.com' } as any)

      expect(mockAddDoc).toHaveBeenCalledWith('mock-collection-ref', {
        email: 'new@example.com',
        createdAt: 'mock-server-timestamp',
        updatedAt: 'mock-server-timestamp'
      })
    })
  })

  describe('updateDocument', () => {
    it('updates document with provided data', async () => {
      mockUpdateDoc.mockResolvedValue(undefined)

      await updateDocument('users', 'user-123', { displayName: 'Updated' } as any)

      expect(mockDoc).toHaveBeenCalledWith('mock-db', 'users', 'user-123')
    })

    it('auto-injects updatedAt serverTimestamp', async () => {
      mockUpdateDoc.mockResolvedValue(undefined)

      await updateDocument('users', 'user-123', { displayName: 'Updated' } as any)

      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', {
        displayName: 'Updated',
        updatedAt: 'mock-server-timestamp'
      })
    })
  })

  describe('deleteDocument', () => {
    it('deletes the document', async () => {
      mockDeleteDoc.mockResolvedValue(undefined)

      await deleteDocument('users', 'user-123')

      expect(mockDoc).toHaveBeenCalledWith('mock-db', 'users', 'user-123')
      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc-ref')
    })
  })

  describe('setDocument', () => {
    it('sets document with provided data', async () => {
      mockSetDoc.mockResolvedValue(undefined)

      await setDocument('users', 'user-123', {
        email: 'test@example.com',
        createdAt: 'ts',
        updatedAt: 'ts'
      } as any)

      expect(mockDoc).toHaveBeenCalledWith('mock-db', 'users', 'user-123')
      expect(mockSetDoc).toHaveBeenCalledWith('mock-doc-ref', {
        email: 'test@example.com',
        createdAt: 'ts',
        updatedAt: 'ts'
      })
    })
  })
})
