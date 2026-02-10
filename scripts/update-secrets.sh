#!/bin/bash
# Update Google Secret Manager from local .env file
#
# Usage: ./scripts/update-secrets.sh [--dry-run]
#   --dry-run: Show what would be updated without making changes
#
# Security: Uses hash comparison to avoid holding secret values in
# long-lived shell variables. Secrets are piped directly to gcloud
# without intermediate storage.

set -e

DRY_RUN=false
if [ "$1" == "--dry-run" ]; then
  DRY_RUN=true
  echo "DRY RUN MODE - No changes will be made"
  echo ""
fi

echo "========================================"
echo "  Update Google Secret Manager"
echo "========================================"
echo ""

# Check for .env file
if [ ! -f ".env" ]; then
  echo "Error: .env file not found"
  echo "Create a .env file with your secrets first"
  exit 1
fi

# Check for gcloud
if ! command -v gcloud &> /dev/null; then
  echo "Error: gcloud CLI not installed"
  echo "Install from: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# Check authentication
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &>/dev/null; then
  echo "Error: Not authenticated with gcloud"
  echo "Run: gcloud auth login"
  exit 1
fi

echo "Reading from .env file..."
echo ""

UPDATED=0
CREATED=0
SKIPPED=0

while IFS= read -r line || [ -n "$line" ]; do
  # Skip comments and empty lines
  [[ "$line" =~ ^#.*$ ]] && continue
  [[ -z "$line" ]] && continue

  # Parse key=value
  key="${line%%=*}"
  value="${line#*=}"

  # Only process VITE_ prefixed variables
  if [[ "$key" == VITE_* ]]; then
    # Hash the local value for comparison (avoids storing remote secret in a variable)
    local_hash=$(printf '%s' "$value" | shasum -a 256 | cut -d' ' -f1)

    # Check if secret exists
    if gcloud secrets describe "$key" &>/dev/null; then
      # Hash the remote value for comparison
      remote_hash=$(gcloud secrets versions access latest --secret="$key" 2>/dev/null | shasum -a 256 | cut -d' ' -f1 || echo "")

      if [ "$local_hash" == "$remote_hash" ]; then
        echo "   SKIP: $key (unchanged)"
        ((SKIPPED++))
      else
        if [ "$DRY_RUN" = true ]; then
          echo "   WOULD UPDATE: $key"
        else
          printf '%s' "$value" | gcloud secrets versions add "$key" --data-file=- &>/dev/null
          echo "   UPDATED: $key"
        fi
        ((UPDATED++))
      fi
    else
      if [ "$DRY_RUN" = true ]; then
        echo "   WOULD CREATE: $key"
      else
        gcloud secrets create "$key" --replication-policy="automatic" &>/dev/null
        printf '%s' "$value" | gcloud secrets versions add "$key" --data-file=- &>/dev/null
        echo "   CREATED: $key"
      fi
      ((CREATED++))
    fi
  fi
done < .env

echo ""
echo "========================================"
echo "  Summary"
echo "========================================"
echo "   Created: $CREATED"
echo "   Updated: $UPDATED"
echo "   Skipped: $SKIPPED (unchanged)"

if [ "$DRY_RUN" = true ]; then
  echo ""
  echo "   This was a dry run. Run without --dry-run to apply changes."
fi

echo "========================================"
