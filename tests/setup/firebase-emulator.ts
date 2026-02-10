/**
 * Firebase Emulator helpers for E2E tests.
 *
 * Provides utilities for clearing emulator state between tests
 * to ensure test isolation. Used by Playwright E2E tests.
 *
 * Requires emulators running: npm run firebase:emulators:ci
 */

const EMULATOR_HOST = '127.0.0.1'
const AUTH_PORT = 9099
const FIRESTORE_PORT = 8080
const PROJECT_ID = 'demo-test'

/** Clear all Auth emulator accounts. */
export async function clearAuthEmulator(): Promise<void> {
  const response = await fetch(
    `http://${EMULATOR_HOST}:${AUTH_PORT}/emulator/v1/projects/${PROJECT_ID}/accounts`,
    { method: 'DELETE' }
  )
  if (!response.ok) {
    throw new Error(`Failed to clear auth emulator: ${response.statusText}`)
  }
}

/** Clear all Firestore emulator data. */
export async function clearFirestoreEmulator(): Promise<void> {
  const response = await fetch(
    `http://${EMULATOR_HOST}:${FIRESTORE_PORT}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' }
  )
  if (!response.ok) {
    throw new Error(`Failed to clear firestore emulator: ${response.statusText}`)
  }
}

/** Clear all emulator state. */
export async function clearAllEmulators(): Promise<void> {
  await Promise.all([
    clearAuthEmulator(),
    clearFirestoreEmulator()
  ])
}
