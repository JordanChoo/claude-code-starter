# cURL Commands Reference

Reference guide for cURL commands used in this project.

**When to use cURL**: Use cURL for debugging, testing, and one-off operations. Use the Firebase SDK in application code for better error handling and type safety.

## Firebase REST API

### Authentication

#### Get ID Token (Email/Password)

```bash
curl -X POST \
  'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "returnSecureToken": true
  }'
```

**Response:**
```json
{
  "idToken": "eyJhbG...",
  "email": "user@example.com",
  "refreshToken": "...",
  "expiresIn": "3600",
  "localId": "userId123"
}
```

#### Create User (Sign Up)

```bash
curl -X POST \
  'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "returnSecureToken": true
  }'
```

#### Refresh Token

```bash
curl -X POST \
  'https://securetoken.googleapis.com/v1/token?key=YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "grant_type": "refresh_token",
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

### Firestore

#### Get Document

```bash
curl -X GET \
  'https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default)/documents/COLLECTION/DOCUMENT_ID' \
  -H 'Authorization: Bearer YOUR_ID_TOKEN'
```

#### Create Document

```bash
curl -X POST \
  'https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default)/documents/COLLECTION' \
  -H 'Authorization: Bearer YOUR_ID_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "fields": {
      "name": { "stringValue": "Example" },
      "count": { "integerValue": "42" },
      "active": { "booleanValue": true }
    }
  }'
```

#### Update Document

```bash
curl -X PATCH \
  'https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default)/documents/COLLECTION/DOCUMENT_ID?updateMask.fieldPaths=name' \
  -H 'Authorization: Bearer YOUR_ID_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "fields": {
      "name": { "stringValue": "Updated Name" }
    }
  }'
```

#### Delete Document

```bash
curl -X DELETE \
  'https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default)/documents/COLLECTION/DOCUMENT_ID' \
  -H 'Authorization: Bearer YOUR_ID_TOKEN'
```

#### Query Collection

```bash
curl -X POST \
  'https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default)/documents:runQuery' \
  -H 'Authorization: Bearer YOUR_ID_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "structuredQuery": {
      "from": [{ "collectionId": "COLLECTION" }],
      "where": {
        "fieldFilter": {
          "field": { "fieldPath": "status" },
          "op": "EQUAL",
          "value": { "stringValue": "active" }
        }
      },
      "limit": 10
    }
  }'
```

### Storage

#### Upload File

```bash
curl -X POST \
  'https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET/o?uploadType=media&name=path%2Fto%2Ffile.jpg' \
  -H 'Authorization: Bearer YOUR_ID_TOKEN' \
  -H 'Content-Type: image/jpeg' \
  --data-binary @localfile.jpg
```

#### Get Download URL

```bash
curl -X GET \
  'https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET/o/path%2Fto%2Ffile.jpg' \
  -H 'Authorization: Bearer YOUR_ID_TOKEN'
```

The response includes a `downloadTokens` field. Construct URL as:
```
https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET/o/path%2Fto%2Ffile.jpg?alt=media&token=DOWNLOAD_TOKEN
```

#### Delete File

```bash
curl -X DELETE \
  'https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET/o/path%2Fto%2Ffile.jpg' \
  -H 'Authorization: Bearer YOUR_ID_TOKEN'
```

## Development & Debugging

### Health Check (Local Dev Server)

```bash
curl -I http://localhost:5173
```

### Check Build Output

```bash
curl -I http://localhost:4173  # After npm run preview
```

## Environment Variables

Replace these placeholders in commands:

| Placeholder | .env Variable | Description |
|-------------|---------------|-------------|
| `YOUR_API_KEY` | `VITE_FIREBASE_API_KEY` | Firebase Web API Key |
| `YOUR_PROJECT_ID` | `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `YOUR_BUCKET` | `VITE_FIREBASE_STORAGE_BUCKET` | Cloud Storage Bucket |
| `YOUR_ID_TOKEN` | (runtime) | User ID Token from auth response |

Quick substitution:
```bash
# Load from .env and use in commands
export $(grep -v '^#' .env | xargs)
curl "...?key=$VITE_FIREBASE_API_KEY"
```

## Common Options

### Verbose Output

Add `-v` for verbose output:
```bash
curl -v -X GET 'https://...'
```

### Pretty Print JSON

Pipe to `jq` for formatted output:
```bash
curl -s 'https://...' | jq .
```

### Save Response to File

```bash
curl -o response.json 'https://...'
```

### Include Response Headers

```bash
curl -i 'https://...'
```

## Error Handling

### Common HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Request completed |
| 400 | Bad Request | Check request body/params |
| 401 | Unauthorized | Check/refresh ID token |
| 403 | Forbidden | Check security rules |
| 404 | Not Found | Verify document/path exists |
| 429 | Rate Limited | Implement backoff/retry |

### Debug Authentication Issues

```bash
# Verify token is valid
curl -X POST \
  'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{ "idToken": "YOUR_ID_TOKEN" }'
```

### Example Error Responses

**401 Unauthorized** (invalid/expired token):
```json
{
  "error": {
    "code": 401,
    "message": "Request had invalid authentication credentials.",
    "status": "UNAUTHENTICATED"
  }
}
```

**403 Forbidden** (security rules blocked):
```json
{
  "error": {
    "code": 403,
    "message": "Missing or insufficient permissions.",
    "status": "PERMISSION_DENIED"
  }
}
```

**404 Not Found** (document doesn't exist):
```json
{
  "error": {
    "code": 404,
    "message": "Document not found.",
    "status": "NOT_FOUND"
  }
}
```
