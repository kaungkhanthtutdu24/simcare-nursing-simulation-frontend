import type { ReactNode } from 'react'
import type { ApiError } from '../api/http'

/** Plain-language explanation of an API error for the people using the app. */
function describe(error: ApiError): { title: string; detail: string } {
  switch (error.kind) {
    case 'network':
      return {
        title: 'Cannot reach the backend',
        detail: 'Check that the backend is running and that you are online.',
      }
    case 'timeout':
      return { title: 'The backend is taking too long', detail: error.message }
    case 'not-implemented':
      return {
        title: 'Not available on the backend yet',
        detail: `${error.method} ${error.path} has not been built yet. The app keeps using demo data.`,
      }
    case 'not-found':
      return { title: 'Not found', detail: error.message }
    case 'unauthorized':
      return { title: 'Please sign in', detail: 'Your session has ended or you are not signed in.' }
    case 'forbidden':
      return { title: 'No access', detail: 'Your account cannot open this information.' }
    case 'conflict':
      return { title: 'This item changed', detail: error.message }
    case 'validation':
      return { title: 'Some details need fixing', detail: error.message }
    case 'server':
      return {
        title: 'Backend error',
        detail: error.problem
          ? error.message
          : `HTTP ${error.status}. If you are running locally, check that the backend is running on port 5035.`,
      }
    default:
      return { title: 'Something went wrong', detail: error.message }
  }
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="async-state loading-state" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error: ApiError; onRetry?: () => void }) {
  const { title, detail } = describe(error)
  const validation = error.problem?.errors
  return (
    <div className="async-state error-state" role="alert">
      <strong>{title}</strong>
      <p>{detail}</p>
      {validation && (
        <ul>
          {Object.entries(validation).map(([field, messages]) => (
            <li key={field}>
              {field}: {messages.join(' ')}
            </li>
          ))}
        </ul>
      )}
      {onRetry && (
        <button className="secondary-button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="async-state empty-inline-state">
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  )
}
