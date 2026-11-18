import { Link } from 'react-router'
import { getBackendStatus } from '../api/backendStatus'
import { useApiResource } from '../api/useApiResource'
import type { DataSourceName } from '../data/sources'
import { paths } from '../routes/paths'

/** Small live indicator of whether the backend is reachable. */
function BackendIndicator() {
  const status = useApiResource('backend-status', ({ refresh }) => getBackendStatus({ refresh }))
  const label =
    status.status === 'loading'
      ? 'Backend: checking…'
      : status.status === 'success'
        ? 'Backend: connected'
        : 'Backend: not reachable'

  return (
    <Link
      to={paths.backendStatus}
      className={`backend-indicator ${status.status}`}
      title="Open backend status"
    >
      <span className="indicator-dot" aria-hidden="true" />
      {label}
    </Link>
  )
}

export function StatusBar({ casesSource }: { casesSource: DataSourceName }) {
  return (
    <footer className="statusbar">
      <span>
        <span className="status-dot" /> SimCare frontend prototype{' '}
        <span className="footer-divider">·</span> React + TypeScript
      </span>
      <span>
        Fictional data <span className="footer-divider">·</span>{' '}
        {casesSource === 'api' ? 'Cases from API, other data local' : 'Local demo storage'}{' '}
        <span className="footer-divider">·</span> <BackendIndicator />
      </span>
    </footer>
  )
}
