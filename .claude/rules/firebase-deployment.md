# Firebase Deployment Guide

Instructions for deploying the Vue + Firebase application to Firebase Hosting.

---

## Mandatory Pre-Deployment Step

> **STOP**: Before ANY deployment, you MUST run the environment variable verification script.

```bash
# REQUIRED: Run this before every deployment
./scripts/verify-env.sh
```

This ensures:
- All required environment variables exist
- No variables are accidentally removed
- Unused variables are identified for cleanup
- Production secrets in Google Secret Manager are current

See `.claude/rules/environment-variables.md` for complete environment variable management rules.

---

## Prerequisites

- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- Google Cloud SDK: `gcloud` (for Secret Manager)
- Firebase project configured
- Environment variables set (see below)

## Environment Setup

See [environment-variables.md](environment-variables.md) for complete environment variable management, including:
- Required variables and their sources
- Local development setup (`.env` file)
- Google Secret Manager setup for production
- Verification scripts and update procedures

## Build Process

### Development Build

```bash
npm run dev
```

Opens development server at `http://localhost:5173`

### Production Build

```bash
npm run build
```

Outputs static files to `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment Options

### Option 1: Firebase Hosting (Recommended)

#### Initial Setup

```bash
# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init hosting

# Select options:
# - Use existing project
# - Public directory: dist
# - Single-page app: Yes
# - Don't overwrite index.html
```

#### Deploy

```bash
# Build and deploy
npm run build && firebase deploy --only hosting
```

#### Preview Channel (Staging)

```bash
# Deploy to preview channel
firebase hosting:channel:deploy preview --expires 7d
```

### Option 2: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Option 3: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# Production deployment
netlify deploy --prod
```

### Option 4: Manual/Static Host

Upload contents of `dist/` to any static file host.

## Pre-Deployment Checklist

Before every deployment:

1. [ ] **Run `./scripts/verify-env.sh`** - MANDATORY environment variable check
2. [ ] Run `npm run build` - verify no TypeScript errors
3. [ ] Cross-reference `firebase-data-models.md` for any model changes
4. [ ] Test authentication flow locally
5. [ ] Verify Google Secret Manager secrets are current
6. [ ] Check Firestore security rules are deployed
7. [ ] Run any pending database migrations

### Quick Deploy Command

```bash
# Single command that verifies and deploys
./scripts/verify-env.sh && npm run build && firebase deploy --only hosting
```

## Firebase Services Deployment

### Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Storage Rules

```bash
firebase deploy --only storage
```

### All Firebase Services

```bash
firebase deploy
```

> **Note:** `firebase deploy` (with no `--only` flag) deploys **all** configured Firebase services, including Hosting, Firestore Rules, and Storage Rules.

## Rollback Procedures

### Firebase Hosting

```bash
# List recent deploys
firebase hosting:releases:list

# Rollback to previous version
firebase hosting:rollback
```

### Manual Rollback

1. Checkout previous working commit
2. Run build: `npm run build`
3. Deploy: `firebase deploy --only hosting`

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
```

## Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

### Firebase Deploy Fails

```bash
# Re-authenticate
firebase login --reauth

# Check project selection
firebase use --add
```

### 404 on Page Refresh

Ensure your hosting is configured for SPA routing. For Firebase, `firebase.json` should include:

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  }
}
```
