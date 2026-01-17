# Vue Firebase Starter

A boilerplate template for Vue 3 applications with Vite, Tailwind CSS, and Firebase.

## Tech Stack

- **Vue 3** - Composition API with TypeScript
- **Vite** - Fast development and build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase** - Auth, Firestore, Storage
- **Vue Router** - Client-side routing
- **Pinia** - State management

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project

### Installation

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and add your Firebase config:

```bash
cp .env.example .env
```

3. Update `.env` with your Firebase credentials from the Firebase Console.

4. Start the development server:

```bash
npm run dev
```

## Project Structure

```
src/
├── assets/          # Static assets and global CSS
├── components/      # Reusable Vue components
├── composables/     # Vue composables (hooks)
├── firebase/        # Firebase configuration and helpers
│   ├── index.ts     # Firebase initialization
│   ├── auth.ts      # Authentication functions
│   ├── firestore.ts # Firestore CRUD helpers
│   └── storage.ts   # Storage upload/download helpers
├── router/          # Vue Router configuration
├── stores/          # Pinia stores
│   ├── index.ts     # Pinia initialization
│   └── auth.ts      # Auth state management
├── views/           # Page components
├── App.vue          # Root component
└── main.ts          # Application entry point
```

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication and add sign-in methods (Email/Password, Google)
3. Create a Firestore database
4. Enable Storage
5. Copy your web app config to `.env`

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Usage Examples

### Authentication

```typescript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Login
await authStore.login(email, password)

// Register
await authStore.register(email, password)

// Google login
await authStore.loginWithGoogle()

// Logout
await authStore.logout()

// Check auth state
if (authStore.isAuthenticated) {
  console.log(authStore.userEmail)
}
```

### Firestore

```typescript
import { getDocuments, addDocument, updateDocument, deleteDocument, where } from '@/firebase/firestore'

// Get documents
const users = await getDocuments('users', where('active', '==', true))

// Add document
const id = await addDocument('posts', { title: 'Hello', content: 'World' })

// Update document
await updateDocument('posts', id, { title: 'Updated' })

// Delete document
await deleteDocument('posts', id)
```

### Storage

```typescript
import { uploadFile, uploadFileWithProgress, getFileUrl, deleteFile } from '@/firebase/storage'

// Upload file
const url = await uploadFile('images/photo.jpg', file)

// Upload with progress
const url = await uploadFileWithProgress('images/photo.jpg', file, (progress) => {
  console.log(`${progress}% uploaded`)
})

// Get download URL
const url = await getFileUrl('images/photo.jpg')

// Delete file
await deleteFile('images/photo.jpg')
```

## License

MIT
