import { Fragment } from 'react'
import { getBackendStatus, OPENAPI_PATH } from '../api/backendStatus'
import { endpoints } from '../api/endpoints'
import type { ApiResource, EndpointId, EndpointSpec } from '../api/endpoints'
import { useApiResource } from '../api/useApiResource'
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState'
import { PageHead } from '../components/PageHead'
import { dataSources } from '../data/sources'

const catalogue = Object.entries(endpoints) as [EndpointId, EndpointSpec][]
const resources = [...new Set(catalogue.map(([, spec]) => spec.resource))] as ApiResource[]

/** Developer page: which proposed endpoints the running backend implements. */
export function BackendStatusView() {
  const status = useApiResource('backend-status', ({ refresh }) => getBackendStatus({ refresh }))

  return (
    <>
      <PageHead
        title="Backend status"
        description="Which proposed API endpoints the running backend implements. Screens use demo data until their endpoints exist."
        breadcrumb={['System', 'Backend status']}
        action={
          <button
            className="secondary-button"
            onClick={status.reload}
            disabled={status.status === 'loading'}
          >
            Check again
          </button>
        }
      />

      <article className="card">
        <span className="section-kicker">DATA SOURCES</span>
        <h3>Where each area's data comes from</h3>
        <div className="snapshot-row">
          <span>Cases and patients</span>
          <strong>
            {dataSources.cases === 'api' ? 'Backend API' : 'Demo data'} (VITE_CASES_SOURCE)
          </strong>
        </div>
        <div className="snapshot-row">
          <span>Everything else</span>
          <strong>Demo data (no endpoints yet)</strong>
        </div>
      </article>

      <article className="card">
        <div className="card-heading">
          <div>
            <span className="section-kicker">CONNECTION</span>
            <h3>ASP.NET Core backend</h3>
          </div>
          {status.status === 'success' && <span className="soft-pill">Connected</span>}
        </div>
        {status.status === 'loading' && <LoadingState label="Checking the backend…" />}
        {status.status === 'error' && (
          <>
            <ErrorState error={status.error} onRetry={status.reload} />
            <p className="muted">
              This page reads <code>{OPENAPI_PATH}</code>, which the backend only publishes in the
              Development environment.
            </p>
          </>
        )}
        {status.status === 'success' && (
          <p className="muted">
            {status.data.title} {status.data.version} documents {status.data.operations.length}{' '}
            operation{status.data.operations.length === 1 ? '' : 's'}. Checked at{' '}
            {status.data.checkedAt.toLocaleTimeString()}.
          </p>
        )}
      </article>

      {status.status === 'success' && (
        <>
          <article className="card">
            <div className="card-heading">
              <div>
                <span className="section-kicker">PROPOSED CLINICAL API</span>
                <h3>
                  {status.data.implemented.size} of {catalogue.length} endpoints implemented
                </h3>
              </div>
            </div>
            {status.data.implemented.size === 0 && (
              <EmptyState title="No clinical endpoints are implemented yet">
                Every screen keeps using local demo data. The contract for the backend team is in
                docs/API_CONTRACT.md.
              </EmptyState>
            )}
            <div className="table-scroll">
              <table className="vitals-table api-table">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Path</th>
                    <th>Purpose</th>
                    <th>Roles</th>
                    <th>Backend</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((resource) => (
                    <Fragment key={resource}>
                      <tr className="api-group">
                        <th colSpan={5}>{resource}</th>
                      </tr>
                      {catalogue
                        .filter(([, spec]) => spec.resource === resource)
                        .map(([id, spec]) => {
                          const done = status.data.implemented.has(id)
                          return (
                            <tr key={id}>
                              <td>
                                <code>{spec.method}</code>
                              </td>
                              <td>
                                <code>{spec.path}</code>
                              </td>
                              <td>
                                {spec.summary}
                                {'version' in spec && (
                                  <span className="draft-tag"> v1.1 draft</span>
                                )}
                              </td>
                              <td>{spec.roles.join(', ')}</td>
                              <td>
                                <span className={done ? 'soft-pill' : 'unread-pill'}>
                                  {done ? 'Implemented' : 'Not yet'}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="card">
            <span className="section-kicker">OTHER BACKEND ENDPOINTS</span>
            <h3>Not part of the clinical API</h3>
            {status.data.other.length === 0 ? (
              <EmptyState title="None" />
            ) : (
              <ul className="api-other">
                {status.data.other.map((op) => (
                  <li key={`${op.method} ${op.path}`}>
                    <code>
                      {op.method} {op.path}
                    </code>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </>
      )}
    </>
  )
}
