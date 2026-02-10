import { ref, readonly } from 'vue'

export interface ErrorReport {
  error: Error
  context: Record<string, string>
  timestamp: Date
}

const _errors = ref<ErrorReport[]>([])
const MAX_STORED_ERRORS = 50

/**
 * Report an error for tracking. In development, logs to console.
 * In production, stores in memory and can be extended to send to
 * external services (Sentry, LogRocket, etc.).
 */
export function reportError(error: Error, context: Record<string, string> = {}): void {
  const report: ErrorReport = {
    error,
    context,
    timestamp: new Date()
  }

  if (import.meta.env.DEV) {
    console.error('[Error Report]', error.message, context)
    console.error(error.stack)
  }

  _errors.value = [..._errors.value.slice(-(MAX_STORED_ERRORS - 1)), report]

  // Integration point: send to external service in production
  // if (import.meta.env.PROD && typeof SENTRY_DSN !== 'undefined') {
  //   Sentry.captureException(error, { extra: context })
  // }
}

/** Read-only access to collected error reports */
export const errors = readonly(_errors)

/** Clear all stored errors */
export function clearErrors(): void {
  _errors.value = []
}
