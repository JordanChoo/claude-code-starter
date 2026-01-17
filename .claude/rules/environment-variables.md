# Environment Variables Management

## Overview

This document defines the mandatory rules for managing environment variables across all environments, with production secrets stored in Google Secret Manager.

---

## Mandatory Deployment Rule

> **STOP**: Before ANY deployment, you MUST verify environment variables are synchronized. Failure to do so may cause application failures or security vulnerabilities.

### Pre-Deployment Checklist

Before every deployment, complete ALL items:

1. [ ] **Audit current environment variables** - List all variables in use
2. [ ] **Compare with source code** - Verify all `import.meta.env.VITE_*` references have corresponding values
3. [ ] **Check Google Secret Manager** - Ensure production secrets are current
4. [ ] **Remove deprecated variables** - Clean up unused secrets
5. [ ] **Document changes** - Update changelog if variables changed

---

## Environment Variable Sources

| Environment | Source | Access Method |
|-------------|--------|---------------|
| **Local Development** | `.env` file | `import.meta.env.VITE_*` |
| **CI/CD Pipeline** | GitHub Secrets | Injected at build time |
| **Production** | Google Secret Manager | Pulled during deployment |

---

## Google Secret Manager Setup

### Initial Setup

```bash
# 1. Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# 2. Create secrets for each environment variable
gcloud secrets create VITE_FIREBASE_API_KEY --replication-policy="automatic"
gcloud secrets create VITE_FIREBASE_AUTH_DOMAIN --replication-policy="automatic"
gcloud secrets create VITE_FIREBASE_PROJECT_ID --replication-policy="automatic"
gcloud secrets create VITE_FIREBASE_STORAGE_BUCKET --replication-policy="automatic"
gcloud secrets create VITE_FIREBASE_MESSAGING_SENDER_ID --replication-policy="automatic"
gcloud secrets create VITE_FIREBASE_APP_ID --replication-policy="automatic"

# 3. Add secret values
echo -n "your-api-key" | gcloud secrets versions add VITE_FIREBASE_API_KEY --data-file=-
```

### Secret Naming Convention

```
Format: VITE_{SERVICE}_{PROPERTY}

Examples:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_PROJECT_ID
- VITE_STRIPE_PUBLIC_KEY
- VITE_API_BASE_URL
```

---

## Required Environment Variables

### Current Variables (Keep Updated)

| Variable | Required | Description | Last Verified |
|----------|----------|-------------|---------------|
| `VITE_FIREBASE_API_KEY` | Yes | Firebase Web API Key | 2025-01-16 |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase Auth Domain | 2025-01-16 |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase Project ID | 2025-01-16 |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Cloud Storage Bucket | 2025-01-16 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | FCM Sender ID | 2025-01-16 |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase App ID | 2025-01-16 |

### Adding New Variables

When adding a new environment variable:

1. Add to `.env.example` with placeholder value
2. Add to this table with `Last Verified` date
3. Create secret in Google Secret Manager
4. Update CI/CD workflow to include the variable
5. Update deployment scripts

### Removing Variables

When removing an environment variable:

1. Search codebase for all references: `grep -r "VITE_VARIABLE_NAME" src/`
2. Remove from source code
3. Remove from `.env.example`
4. Remove from this table
5. Delete from Google Secret Manager: `gcloud secrets delete VITE_VARIABLE_NAME`
6. Remove from CI/CD workflow
7. Document removal in changelog

---

## Deployment Verification Script

Run this script before EVERY deployment:

```bash
#!/bin/bash
# scripts/verify-env.sh

set -e

echo "🔍 Verifying environment variables..."

# Define required variables
REQUIRED_VARS=(
  "VITE_FIREBASE_API_KEY"
  "VITE_FIREBASE_AUTH_DOMAIN"
  "VITE_FIREBASE_PROJECT_ID"
  "VITE_FIREBASE_STORAGE_BUCKET"
  "VITE_FIREBASE_MESSAGING_SENDER_ID"
  "VITE_FIREBASE_APP_ID"
)

# Check source code for environment variable usage
echo ""
echo "📋 Variables referenced in source code:"
USED_VARS=$(grep -roh 'import\.meta\.env\.VITE_[A-Z_]*' src/ | sort -u | sed 's/import.meta.env.//')
echo "$USED_VARS"

# Check for missing required variables
echo ""
echo "🔐 Checking Google Secret Manager..."
MISSING=()
for var in "${REQUIRED_VARS[@]}"; do
  if ! gcloud secrets describe "$var" &>/dev/null; then
    MISSING+=("$var")
  fi
done

if [ ${#MISSING[@]} -ne 0 ]; then
  echo "❌ Missing secrets in Google Secret Manager:"
  for var in "${MISSING[@]}"; do
    echo "   - $var"
  done
  exit 1
fi

# Check for unused secrets (potential cleanup needed)
echo ""
echo "🧹 Checking for unused secrets..."
ALL_SECRETS=$(gcloud secrets list --format="value(name)" | grep "^VITE_" || true)
for secret in $ALL_SECRETS; do
  if ! echo "$USED_VARS" | grep -q "^$secret$"; then
    echo "   ⚠️  Potentially unused: $secret"
  fi
done

# Verify .env.example is in sync
echo ""
echo "📄 Checking .env.example..."
for var in $USED_VARS; do
  if ! grep -q "^$var=" .env.example; then
    echo "   ❌ Missing from .env.example: $var"
    exit 1
  fi
done

echo ""
echo "✅ Environment variable verification complete!"
```

### Usage

```bash
# Make executable (first time only)
chmod +x scripts/verify-env.sh

# Run before deployment
./scripts/verify-env.sh
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  verify-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      # Authenticate with Google Cloud
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SERVICE_ACCOUNT_KEY }}

      - name: Setup Google Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      # Pull secrets from Google Secret Manager
      - name: Fetch secrets from Google Secret Manager
        run: |
          echo "VITE_FIREBASE_API_KEY=$(gcloud secrets versions access latest --secret=VITE_FIREBASE_API_KEY)" >> $GITHUB_ENV
          echo "VITE_FIREBASE_AUTH_DOMAIN=$(gcloud secrets versions access latest --secret=VITE_FIREBASE_AUTH_DOMAIN)" >> $GITHUB_ENV
          echo "VITE_FIREBASE_PROJECT_ID=$(gcloud secrets versions access latest --secret=VITE_FIREBASE_PROJECT_ID)" >> $GITHUB_ENV
          echo "VITE_FIREBASE_STORAGE_BUCKET=$(gcloud secrets versions access latest --secret=VITE_FIREBASE_STORAGE_BUCKET)" >> $GITHUB_ENV
          echo "VITE_FIREBASE_MESSAGING_SENDER_ID=$(gcloud secrets versions access latest --secret=VITE_FIREBASE_MESSAGING_SENDER_ID)" >> $GITHUB_ENV
          echo "VITE_FIREBASE_APP_ID=$(gcloud secrets versions access latest --secret=VITE_FIREBASE_APP_ID)" >> $GITHUB_ENV

      # Verify all required variables are set
      - name: Verify environment variables
        run: |
          REQUIRED_VARS=(
            "VITE_FIREBASE_API_KEY"
            "VITE_FIREBASE_AUTH_DOMAIN"
            "VITE_FIREBASE_PROJECT_ID"
            "VITE_FIREBASE_STORAGE_BUCKET"
            "VITE_FIREBASE_MESSAGING_SENDER_ID"
            "VITE_FIREBASE_APP_ID"
          )

          MISSING=()
          for var in "${REQUIRED_VARS[@]}"; do
            if [ -z "${!var}" ]; then
              MISSING+=("$var")
            fi
          done

          if [ ${#MISSING[@]} -ne 0 ]; then
            echo "❌ Missing environment variables:"
            for var in "${MISSING[@]}"; do
              echo "   - $var"
            done
            exit 1
          fi

          echo "✅ All environment variables verified"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: ${{ env.VITE_FIREBASE_PROJECT_ID }}
```

---

## Updating Secrets

### Update a Single Secret

```bash
# Update secret value
echo -n "new-value" | gcloud secrets versions add VITE_FIREBASE_API_KEY --data-file=-

# Verify update
gcloud secrets versions access latest --secret=VITE_FIREBASE_API_KEY
```

### Bulk Update All Secrets

```bash
#!/bin/bash
# scripts/update-secrets.sh

# Read from local .env file and update Google Secret Manager
if [ ! -f .env ]; then
  echo "❌ .env file not found"
  exit 1
fi

echo "🔄 Updating secrets in Google Secret Manager..."

while IFS='=' read -r key value; do
  # Skip comments and empty lines
  [[ $key =~ ^#.*$ ]] && continue
  [[ -z $key ]] && continue

  # Only process VITE_ prefixed variables
  if [[ $key == VITE_* ]]; then
    echo "   Updating $key..."
    echo -n "$value" | gcloud secrets versions add "$key" --data-file=- 2>/dev/null || \
    (gcloud secrets create "$key" --replication-policy="automatic" && \
     echo -n "$value" | gcloud secrets versions add "$key" --data-file=-)
  fi
done < .env

echo "✅ Secrets updated"
```

---

## Audit Trail

### Secret Access Logging

Enable audit logging for secret access:

```bash
# Enable Data Access audit logs for Secret Manager
gcloud projects get-iam-policy PROJECT_ID --format=json > policy.json

# Add audit config (edit policy.json to include):
# {
#   "service": "secretmanager.googleapis.com",
#   "auditLogConfigs": [
#     { "logType": "DATA_READ" },
#     { "logType": "DATA_WRITE" }
#   ]
# }

gcloud projects set-iam-policy PROJECT_ID policy.json
```

### View Secret Access History

```bash
# View who accessed secrets
gcloud logging read 'resource.type="secretmanager.googleapis.com/Secret"' --limit=50
```

---

## Changelog

Track all environment variable changes here:

### 2025-01-16

- **Initial Setup**
  - Created environment variables management rule
  - Defined Google Secret Manager integration
  - Added deployment verification script
  - Added CI/CD workflow template

---

## Quick Reference

### Commands Cheat Sheet

```bash
# List all secrets
gcloud secrets list

# View secret value
gcloud secrets versions access latest --secret=SECRET_NAME

# Create new secret
gcloud secrets create SECRET_NAME --replication-policy="automatic"
echo -n "value" | gcloud secrets versions add SECRET_NAME --data-file=-

# Update secret
echo -n "new-value" | gcloud secrets versions add SECRET_NAME --data-file=-

# Delete secret
gcloud secrets delete SECRET_NAME

# View secret versions
gcloud secrets versions list SECRET_NAME

# Disable old version
gcloud secrets versions disable SECRET_NAME --version=1

# Verify deployment
./scripts/verify-env.sh
```

### Pre-Deployment Command

**Always run before deploying:**

```bash
./scripts/verify-env.sh && npm run build && firebase deploy
```
