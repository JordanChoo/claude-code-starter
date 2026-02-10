# Firebase Data Models Reference

**CRITICAL**: This file MUST be cross-referenced before ANY data model change. Update the changelog after every modification.

## Overview

This document defines all Firebase/Firestore data models used in the application. All Firestore collections, TypeScript interfaces, and data structures are documented here.

---

## Mandatory Review Rule

> **STOP**: Before writing ANY code that reads, stores, or uses data from the database, you MUST review this document first.

### When This Rule Applies

This mandatory review applies to ANY code change that:

| Operation Type | Examples | Review Required |
|----------------|----------|-----------------|
| **Data Reading** | `getDocument()`, `getDocuments()`, Firestore queries, fetching user data | **YES** |
| **Data Storage** | `addDocument()`, `updateDocument()`, `setDoc()`, creating/updating records | **YES** |
| **Data Usage** | Accessing document fields, type assertions, data transformations | **YES** |
| **Schema Changes** | Adding/removing fields, changing types, new collections | **YES** |
| **Security Rules** | Modifying Firestore rules, validation logic | **YES** |

### Review Checklist

Before implementing any data-related code:

> **Note**: This checklist is advisory. Consider adding pre-commit hooks for automated enforcement.

1. [ ] **Read the relevant collection schema** in this document
2. [ ] **Verify field names** match exactly (case-sensitive)
3. [ ] **Check field types** and constraints
4. [ ] **Review required vs optional fields**
5. [ ] **Understand validation rules** that apply
6. [ ] **Check for immutable fields** (e.g., `createdAt`, `id`)
7. [ ] **Verify your code matches** the documented data flow

### Consequences of Skipping Review

- **Runtime errors**: Accessing non-existent fields
- **Type mismatches**: Wrong data types causing crashes
- **Data corruption**: Writing invalid data to the database
- **Security vulnerabilities**: Bypassing validation rules
- **Failed deployments**: TypeScript compilation errors

### How to Review

```
1. Open this file: .claude/rules/firebase-data-models.md
2. Find the collection you're working with
3. Review the interface definition
4. Check the Field Definitions table
5. Review the Property Rules table
6. Verify your code aligns with the schema
```

---

## Pre-Change Checklist (Schema Modifications)

Before modifying any data model schema:

1. [ ] Review existing model definition below
2. [ ] Check changelog for recent changes
3. [ ] Verify backward compatibility
4. [ ] Update this document BEFORE implementing
5. [ ] Add changelog entry with date and description

---

## Database Schema

### Schema Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     FIRESTORE DATABASE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  users (collection)                                      │   │
│  │  └── {userId} (document)                                 │   │
│  │      ├── id: string (Firebase Auth UID)                  │   │
│  │      ├── email: string                                   │   │
│  │      ├── displayName?: string                            │   │
│  │      ├── photoURL?: string                               │   │
│  │      ├── createdAt: Timestamp                            │   │
│  │      └── updatedAt: Timestamp                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [future_collection] (collection)                        │   │
│  │  └── {documentId} (document)                             │   │
│  │      └── ... fields                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Collections

### users

The primary collection storing user profile data, linked to Firebase Authentication.

```typescript
interface User extends BaseDocument {
  id: string                    // Firebase Auth UID (document ID)
  email: string                 // User email address
  displayName?: string          // Optional display name
  photoURL?: string             // Profile photo URL (from OAuth or uploaded)
  createdAt: Timestamp          // Account creation timestamp
  updatedAt: Timestamp          // Last profile modification timestamp
}
```

**Firestore Path**: `users/{userId}`

**Document ID**: Must match the Firebase Auth UID

**Indexes**: None required (queries by document ID only)

#### Field Definitions

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | `string` | Yes | Auth UID | Firebase Authentication UID, serves as document ID |
| `email` | `string` | Yes | - | User's email address from authentication |
| `displayName` | `string` | No | `null` | User-provided or OAuth-provided display name |
| `photoURL` | `string` | No | `null` | URL to profile photo (OAuth or Cloud Storage) |
| `createdAt` | `Timestamp` | Yes | Server timestamp | Set once on document creation |
| `updatedAt` | `Timestamp` | Yes | Server timestamp | Updated on every modification |

#### Property Rules

| Field | Validation Rules |
|-------|-----------------|
| `id` | Must be non-empty string; must match authenticated user's UID |
| `email` | Must match auth token email on create; immutable after creation (note: `validEmail` helper is defined but not called in rules) |
| `displayName` | Null allowed; when provided, min 1 and max 100 characters; no leading/trailing whitespace |
| `photoURL` | Must be valid URL (https only); max 2048 characters |
| `createdAt` | Immutable after creation; must be server timestamp |
| `updatedAt` | Must equal server timestamp (`request.time`) on every write |

---

### Base Document Interface

All collections must extend this base interface:

```typescript
interface BaseDocument {
  id: string                    // Document ID
  createdAt: Timestamp          // Creation timestamp (immutable)
  updatedAt: Timestamp          // Last modification timestamp
}
```

---

### [Template: New Collection]

```typescript
// Copy this template when adding new collections
interface NewCollection extends BaseDocument {
  id: string
  // Add collection-specific fields here
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Firestore Path**: `[collection_name]/{documentId}`

**Indexes**: List any composite indexes required

---

## Validation Rules

### Global Field Rules

All documents MUST include:
- `createdAt`: Set on document creation using `serverTimestamp()`, never modified afterward
- `updatedAt`: Set to `serverTimestamp()` on every modification

### Field Type Constraints

| Type | Firestore Type | TypeScript Type | Size Limit |
|------|---------------|-----------------|------------|
| String | `string` | `string` | 1 MiB (1,048,487 bytes) |
| Email | `string` | `string` | 320 characters |
| URL | `string` | `string` | 2048 characters |
| Timestamp | `timestamp` | `Timestamp` | - |
| Boolean | `boolean` | `boolean` | - |
| Number | `number` | `number` | 64-bit signed integer or 64-bit IEEE 754 |
| Array | `array` | `T[]` | Max 20,000 elements |
| Map | `map` | `Record<string, T>` | Nested to 20 levels |

### Collection-Specific Constraints

| Collection | Field | Type | Required | Constraints |
|------------|-------|------|----------|-------------|
| users | id | string | Yes | Matches Firebase Auth UID |
| users | email | string | Yes | Must match auth token email; immutable after creation |
| users | displayName | string | No | Null allowed; min 1, max 100 chars; no leading/trailing whitespace |
| users | photoURL | string | No | Valid HTTPS URL, max 2048 chars |
| users | createdAt | Timestamp | Yes | Server timestamp, immutable |
| users | updatedAt | Timestamp | Yes | Server timestamp |

---

## Data Flow Logic

### Authentication Flow

```
┌──────────────┐     ┌───────────────────┐     ┌──────────────────┐
│   Client     │     │  Firebase Auth    │     │    Firestore     │
│   (Vue App)  │     │                   │     │    (users)       │
└──────┬───────┘     └─────────┬─────────┘     └────────┬─────────┘
       │                       │                        │
       │ 1. signUp/signIn      │                        │
       │──────────────────────>│                        │
       │                       │                        │
       │ 2. Auth credential    │                        │
       │<──────────────────────│                        │
       │                       │                        │
       │ 3. Create/fetch user document                  │
       │───────────────────────────────────────────────>│
       │                       │                        │
       │ 4. User document data                          │
       │<───────────────────────────────────────────────│
       │                       │                        │
       │ 5. Store in Pinia     │                        │
       │ (auth store)          │                        │
       ▼                       ▼                        ▼
```

### User Registration Flow

1. **Client initiates signup** via `signUp(email, password)` or `signInWithGoogle()`
2. **Firebase Auth creates credential** and returns user object with UID
3. **Client creates Firestore document** in `users/{uid}` with initial data:
   ```typescript
   {
     id: uid,
     email: user.email,
     displayName: user.displayName || null,
     photoURL: user.photoURL || null,
     createdAt: serverTimestamp(),
     updatedAt: serverTimestamp()
   }
   ```
4. **Pinia auth store** updates with user state
5. **Router redirects** to dashboard (protected route)

### User Profile Update Flow

1. **Client requests update** via `updateDocument('users', uid, data)`
2. **Firestore validates** against security rules
3. **Document updated** with new data + `updatedAt: serverTimestamp()`
4. **Client receives** updated document
5. **Pinia store** refreshes user state

### Session Persistence Flow

```
┌──────────────┐     ┌───────────────────┐     ┌──────────────────┐
│   App Start  │     │  Firebase Auth    │     │   Auth Store     │
└──────┬───────┘     └─────────┬─────────┘     └────────┬─────────┘
       │                       │                        │
       │ 1. onAuthStateChanged │                        │
       │──────────────────────>│                        │
       │                       │                        │
       │ 2. Return cached user │                        │
       │<──────────────────────│                        │
       │                       │                        │
       │ 3. init() - set user in store                  │
       │───────────────────────────────────────────────>│
       │                       │                        │
       │ 4. Reactive state available                    │
       │<───────────────────────────────────────────────│
       ▼                       ▼                        ▼
```

---

## Integration Points

### Firebase Services

| Service | Purpose | SDK Location | Configuration |
|---------|---------|--------------|---------------|
| **Firebase Auth** | User authentication | `src/firebase/auth.ts` | Email/Password, Google OAuth |
| **Firestore** | Document database | `src/firebase/firestore.ts` | Generic CRUD operations |
| **Cloud Storage** | File uploads | `src/firebase/storage.ts` | Profile photos, attachments |

### Application Layer Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                        Vue Application                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │     Views       │───>│   Composables   │───>│   Stores    │ │
│  │ (LoginView,     │    │   (useAuth)     │    │  (Pinia)    │ │
│  │  Dashboard)     │    │                 │    │             │ │
│  └─────────────────┘    └────────┬────────┘    └──────┬──────┘ │
│                                  │                     │        │
│                                  ▼                     ▼        │
│                         ┌─────────────────────────────────────┐ │
│                         │         Firebase SDK Layer          │ │
│                         │  ┌───────┐ ┌──────────┐ ┌────────┐  │ │
│                         │  │ Auth  │ │ Firestore│ │Storage │  │ │
│                         │  └───────┘ └──────────┘ └────────┘  │ │
│                         └─────────────────────────────────────┘ │
│                                        │                        │
└────────────────────────────────────────┼────────────────────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │   Firebase Cloud    │
                              │   Infrastructure    │
                              └─────────────────────┘
```

### Data Access Patterns

#### Read Operations

| Operation | Method | Source File | Returns |
|-----------|--------|-------------|---------|
| Get single document | `getDocument<T>(collection, id)` | `src/firebase/firestore.ts` | `T \| null` |
| Get multiple documents | `getDocuments<T>(collection, ...constraints)` | `src/firebase/firestore.ts` | `T[]` |
| Get current user | `getCurrentUser()` | `src/firebase/auth.ts` | `User \| null` |

#### Write Operations

| Operation | Method | Source File | Notes |
|-----------|--------|-------------|-------|
| Create document | `addDocument(collection, data)` | `src/firebase/firestore.ts` | Auto-generates ID if not provided |
| Update document | `updateDocument(collection, id, data)` | `src/firebase/firestore.ts` | Partial update supported |
| Delete document | `deleteDocument(collection, id)` | `src/firebase/firestore.ts` | Hard delete |

### Type Definitions Location

| Type | Location | Purpose |
|------|----------|---------|
| `BaseDocument` | `src/types/models.ts` | Base interface for all documents |
| `User` | `src/types/models.ts` | User collection interface |
| `NewDocument<T>` | `src/types/models.ts` | Helper for creating new documents |
| `UpdateDocument<T>` | `src/types/models.ts` | Helper for updating documents |

### Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | Cloud Storage Bucket | Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM Sender ID | Yes |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | Yes |

---

## Migration Guidelines

When changing existing models:

1. **Adding fields**: Safe - use optional fields with defaults
2. **Removing fields**: Dangerous - ensure no code references removed field
3. **Renaming fields**: Requires migration script
4. **Changing types**: Requires migration script

### Migration Script Template

> **Note:** The `migrations/` directory does not yet exist in this project. Create it and
> a runner script before writing your first migration. For simple field additions,
> consider using the Firebase console or a one-off script instead.

```typescript
// migrations/YYYYMMDD_description.ts
import { db } from '@/firebase'
import { collection, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore'

export async function migrate() {
  const snapshot = await getDocs(collection(db, 'collection_name'))

  for (const docSnap of snapshot.docs) {
    await updateDoc(doc(db, 'collection_name', docSnap.id), {
      // newField: defaultValue,
      updatedAt: serverTimestamp()
    })
  }
}
```

### Migration Checklist

1. [ ] Create `migrations/` directory if it doesn't exist, then add migration script
2. [ ] Test migration on emulator first
3. [ ] Back up production data before running
4. [ ] Update this document with new schema
5. [ ] Update TypeScript interfaces in `src/types/models.ts`
6. [ ] Run `npm run build` to verify type safety
7. [ ] Add changelog entry

---

## Changelog

All data model changes MUST be logged here.

### [Unreleased]

- **Security Rules Documentation Sync**
  - Fixed `email` property rule: was "valid email format; max 320 chars", now accurately documents that rules enforce matching auth token email on create and immutability on update (`validEmail` helper is defined but not called)
  - Fixed `displayName` property rule: removed incorrect "alphanumeric and spaces only" constraint, added min 1 character requirement to match actual `validDisplayName` function
  - Fixed `updatedAt` property rule: clarified must equal `request.time` (was "cannot be in future")
  - Updated Collection-Specific Constraints table to match corrected property rules

### 2025-01-16

- **Mandatory Review Rule Added**
  - Added explicit "Mandatory Review Rule" section
  - Defined when review is required (data reading, storage, usage, schema changes, security rules)
  - Added review checklist for data-related code changes
  - Documented consequences of skipping review
  - Added step-by-step review instructions

- **Documentation Update**
  - Added comprehensive database schema section
  - Added property rules for all fields
  - Added data flow diagrams
  - Added integration points documentation

- **Initial Release**
  - Added `users` collection with base fields
  - Established data model documentation standards

---

## Firestore Security Rules Reference

> **Source of truth**: The `firestore.rules` file is the authoritative source.
> This section documents the intended patterns. When modifying rules:
> 1. Update `firestore.rules` first
> 2. Update this documentation to match

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function validTimestamp(field) {
      return request.resource.data[field] == request.time;
    }

    function validEmail(email) {
      return email.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
    }

    function validDisplayName(name) {
      return name == null || (name.size() > 0 && name.size() <= 100 && name.trim() == name);
    }

    function validPhotoURL(url) {
      return url == null || (url.matches('^https://.*') && url.size() <= 2048);
    }

    // Users collection rules
    match /users/{userId} {
      allow read: if isOwner(userId);

      allow create: if request.auth.uid == userId
        && request.resource.data.email == request.auth.token.email
        && validDisplayName(request.resource.data.displayName)
        && validPhotoURL(request.resource.data.photoURL)
        && request.resource.data.createdAt == request.time
        && request.resource.data.updatedAt == request.time;

      allow update: if isOwner(userId)
        && request.resource.data.createdAt == resource.data.createdAt
        && request.resource.data.email == resource.data.email
        && validDisplayName(request.resource.data.displayName)
        && validPhotoURL(request.resource.data.photoURL)
        && request.resource.data.updatedAt == request.time;

      allow delete: if isOwner(userId);
    }

    // Default deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## TypeScript Type Location

All TypeScript interfaces should be defined in:
- `src/types/models.ts` - Shared data model types
- `src/types/[feature].ts` - Feature-specific types

### Type Synchronization

When updating data models:

1. Update this document first
2. Update `src/types/models.ts` to match
3. Run `npm run build` to catch type errors
4. Update any affected components

---

## Verification Commands

```bash
# Check for type errors after model changes
npm run build

# Verify Firestore rules (requires firebase-tools)
firebase emulators:start --only firestore

# Deploy security rules
firebase deploy --only firestore:rules

# Run security rules tests (if configured)
npm run test:rules
```
