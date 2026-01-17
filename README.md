# Vue Firebase Starter

A boilerplate template for Vue 3 applications with Vite, Tailwind CSS, and Firebase — pre-configured with **Claude Code PM** for spec-driven development and **WHobson Agents** for intelligent automation.

## Claude Code Integration

This template comes pre-configured with powerful Claude Code tooling for AI-assisted development:

### Claude Code PM (CCPM)

[Claude Code PM](https://github.com/automazeio/ccpm) is a workflow system that enables spec-driven development using GitHub Issues and Git worktrees. It allows multiple AI agents to work in parallel on decomposed tasks while maintaining full traceability from requirements to production code.

**Key Features:**
- **Context Preservation** - Project state persists across sessions through local workspace files
- **Parallel Execution** - Multiple agents work on independent tasks using Git worktrees
- **GitHub Integration** - Issues serve as the single source of truth with automatic sync
- **Spec-Driven Development** - Every code change traces back to documented specifications
- **Agent Coordination** - Orchestration rules in `.claude/rules/agent-coordination.md` enable multiple agents to work safely in parallel

**Quick Start:**
```bash
# Initialize the PM system (required after cloning)
/pm:init

# Create a new PRD
/pm:prd-new feature-name

# Convert PRD to implementation plan
/pm:prd-parse feature-name

# Decompose into tasks
/pm:epic-decompose feature-name

# Sync to GitHub Issues
/pm:epic-sync feature-name

# Start working on an issue
/pm:issue-start [issue-number]
```

### WHobson Agents Plugin

[WHobson Agents](https://github.com/wshobson/agents) provides a comprehensive system of **100 specialized AI agents**, **15 workflow orchestrators**, **110 agent skills**, and **76 development tools** organized into **68 focused plugins**.

**Key Features:**
- **Granular Architecture** - Each plugin operates independently (~300 tokens per plugin)
- **Progressive Disclosure** - Skills load knowledge only when needed
- **Comprehensive Coverage** - Spans 23 categories from development to security
- **Three-Tier Model Strategy** - Opus 4.5 for critical tasks, Sonnet/Haiku for support

**Installation:**
```bash
# Add the marketplace
/plugin marketplace add wshobson/agents

# Install specific plugins as needed
/plugin install python-development
/plugin install kubernetes-operations
/plugin install security-scanning
```

> **Note:** Install plugins, not individual agents. Agent names alone won't work; you must install their parent plugin.

---

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
