import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
  connectStorageEmulator,
  deleteObject,
  type UploadTaskSnapshot
} from 'firebase/storage'
import app from './index'

let _storage: ReturnType<typeof getStorage> | null = null

function getStorageInstance() {
  if (!_storage) {
    _storage = getStorage(app)
    if (import.meta.env.VITE_USE_EMULATOR === 'true') {
      connectStorageEmulator(_storage, '127.0.0.1', 9199)
    }
  }
  return _storage
}

export async function uploadFile(
  path: string,
  file: File
): Promise<string> {
  const storageRef = ref(getStorageInstance(), path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export function uploadFileWithProgress(
  path: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(getStorageInstance(), path)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgress?.(progress)
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref)
        resolve(url)
      }
    )
  })
}

export async function getFileUrl(path: string): Promise<string> {
  const storageRef = ref(getStorageInstance(), path)
  return getDownloadURL(storageRef)
}

export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(getStorageInstance(), path)
  await deleteObject(storageRef)
}
