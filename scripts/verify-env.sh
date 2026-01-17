#!/bin/bash
# Environment Variable Verification Script
# Run this BEFORE every deployment to ensure env vars are synchronized
#
# Usage: ./scripts/verify-env.sh [--strict]
#   --strict: Exit with error on warnings (unused secrets)

set -e

STRICT_MODE=false
if [ "$1" == "--strict" ]; then
  STRICT_MODE=true
fi

echo "========================================"
echo "  Environment Variable Verification"
echo "========================================"
echo ""

# Define required variables (update this list when adding/removing variables)
REQUIRED_VARS=(
  "VITE_FIREBASE_API_KEY"
  "VITE_FIREBASE_AUTH_DOMAIN"
  "VITE_FIREBASE_PROJECT_ID"
  "VITE_FIREBASE_STORAGE_BUCKET"
  "VITE_FIREBASE_MESSAGING_SENDER_ID"
  "VITE_FIREBASE_APP_ID"
)

HAS_ERRORS=false
HAS_WARNINGS=false

# Step 1: Check source code for environment variable usage
echo "Step 1: Scanning source code for environment variables..."
echo "--------------------------------------------------------"

if [ -d "src" ]; then
  USED_VARS=$(grep -roh 'import\.meta\.env\.VITE_[A-Z_]*' src/ 2>/dev/null | sort -u | sed 's/import.meta.env.//' || echo "")

  if [ -n "$USED_VARS" ]; then
    echo "Variables referenced in code:"
    echo "$USED_VARS" | while read -r var; do
      echo "   - $var"
    done
  else
    echo "   No VITE_* variables found in source code"
  fi
else
  echo "   Warning: src/ directory not found"
fi

echo ""

# Step 2: Check .env.example has all used variables
echo "Step 2: Verifying .env.example is complete..."
echo "----------------------------------------------"

if [ -f ".env.example" ]; then
  EXAMPLE_VARS=$(grep -o '^VITE_[A-Z_]*' .env.example 2>/dev/null || echo "")

  # Check if any used variables are missing from .env.example
  if [ -n "$USED_VARS" ]; then
    for var in $USED_VARS; do
      if ! echo "$EXAMPLE_VARS" | grep -q "^$var$"; then
        echo "   Missing from .env.example: $var"
        HAS_ERRORS=true
      fi
    done
  fi

  # Check if any example variables are not used in code
  if [ -n "$EXAMPLE_VARS" ]; then
    for var in $EXAMPLE_VARS; do
      if [ -n "$USED_VARS" ] && ! echo "$USED_VARS" | grep -q "^$var$"; then
        echo "   Potentially unused (in .env.example but not in code): $var"
        HAS_WARNINGS=true
      fi
    done
  fi

  if [ "$HAS_ERRORS" = false ] && [ "$HAS_WARNINGS" = false ]; then
    echo "   All variables in sync"
  fi
else
  echo "   .env.example not found"
  HAS_ERRORS=true
fi

echo ""

# Step 3: Check Google Secret Manager (if gcloud is available)
echo "Step 3: Checking Google Secret Manager..."
echo "------------------------------------------"

if command -v gcloud &> /dev/null; then
  # Check if authenticated
  if gcloud auth list --filter=status:ACTIVE --format="value(account)" &>/dev/null; then
    MISSING_SECRETS=()
    FOUND_SECRETS=()

    for var in "${REQUIRED_VARS[@]}"; do
      if gcloud secrets describe "$var" &>/dev/null; then
        FOUND_SECRETS+=("$var")
      else
        MISSING_SECRETS+=("$var")
      fi
    done

    if [ ${#FOUND_SECRETS[@]} -gt 0 ]; then
      echo "   Secrets found in Secret Manager:"
      for var in "${FOUND_SECRETS[@]}"; do
        echo "      - $var"
      done
    fi

    if [ ${#MISSING_SECRETS[@]} -gt 0 ]; then
      echo ""
      echo "   Missing from Secret Manager:"
      for var in "${MISSING_SECRETS[@]}"; do
        echo "      - $var"
      done
      HAS_ERRORS=true
    fi

    # Check for unused secrets
    echo ""
    echo "   Checking for unused secrets..."
    ALL_SECRETS=$(gcloud secrets list --format="value(name)" 2>/dev/null | grep "^VITE_" || true)
    UNUSED_SECRETS=()

    for secret in $ALL_SECRETS; do
      IS_REQUIRED=false
      for req in "${REQUIRED_VARS[@]}"; do
        if [ "$secret" == "$req" ]; then
          IS_REQUIRED=true
          break
        fi
      done

      if [ "$IS_REQUIRED" = false ]; then
        UNUSED_SECRETS+=("$secret")
      fi
    done

    if [ ${#UNUSED_SECRETS[@]} -gt 0 ]; then
      echo "   Potentially unused secrets (consider removing):"
      for var in "${UNUSED_SECRETS[@]}"; do
        echo "      - $var"
      done
      HAS_WARNINGS=true
    else
      echo "      No unused secrets found"
    fi
  else
    echo "   Not authenticated with gcloud. Run: gcloud auth login"
    echo "   Skipping Secret Manager verification..."
  fi
else
  echo "   gcloud CLI not installed. Skipping Secret Manager verification..."
  echo "   Install: https://cloud.google.com/sdk/docs/install"
fi

echo ""

# Step 4: Check local .env file (for development)
echo "Step 4: Checking local .env file..."
echo "------------------------------------"

if [ -f ".env" ]; then
  LOCAL_VARS=$(grep -o '^VITE_[A-Z_]*' .env 2>/dev/null || echo "")

  MISSING_LOCAL=()
  for var in "${REQUIRED_VARS[@]}"; do
    if ! echo "$LOCAL_VARS" | grep -q "^$var$"; then
      MISSING_LOCAL+=("$var")
    fi
  done

  if [ ${#MISSING_LOCAL[@]} -gt 0 ]; then
    echo "   Missing from local .env:"
    for var in "${MISSING_LOCAL[@]}"; do
      echo "      - $var"
    done
    echo "   (This is okay if you're only deploying, not developing locally)"
  else
    echo "   All required variables present"
  fi
else
  echo "   No local .env file (expected for CI/CD environments)"
fi

echo ""
echo "========================================"

# Final summary
if [ "$HAS_ERRORS" = true ]; then
  echo "  RESULT: FAILED"
  echo "  Fix the errors above before deploying"
  echo "========================================"
  exit 1
elif [ "$HAS_WARNINGS" = true ] && [ "$STRICT_MODE" = true ]; then
  echo "  RESULT: FAILED (strict mode)"
  echo "  Warnings found - resolve before deploying"
  echo "========================================"
  exit 1
elif [ "$HAS_WARNINGS" = true ]; then
  echo "  RESULT: PASSED with warnings"
  echo "  Review warnings above"
  echo "========================================"
  exit 0
else
  echo "  RESULT: PASSED"
  echo "  Ready to deploy!"
  echo "========================================"
  exit 0
fi
