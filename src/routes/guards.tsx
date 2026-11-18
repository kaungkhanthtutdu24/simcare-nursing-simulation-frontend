import { useEffect } from 'react'
import { Link, Navigate, Outlet, useParams } from 'react-router'
import type { Role } from '../model'
import { useAuth, useSession } from '../auth/session'
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState'
import { PageHead } from '../components/PageHead'
import { AccessDeniedView } from '../views/AccessDeniedView'
import { NotFoundView } from '../views/NotFoundView'
import { useApp } from './appContext'
import { paths, patientRouteId, roleHome } from './paths'

export function RequireAuth() {
  const { user } = useAuth()
  return user ? <Outlet /> : <Navigate to={paths.signIn} replace />
}

export function HomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? roleHome(user.role) : paths.signIn} replace />
}

/**
 * Shows child routes only if the session includes the role.
 *
 * This is a user-interface convenience, not security: it stops people
 * wandering into screens that are not meant for them, but the backend must
 * still check permissions on every request.
 */
export function RequireRole({ role }: { role: Role }) {
  const session = useSession()
  return session.roles.includes(role) ? <Outlet /> : <AccessDeniedView />
}

/** Shows child routes only if :caseId matches a known case. */
export function CaseRoute() {
  const { caseId } = useParams()
  const { cases } = useApp()
  return caseId && cases.caseKeys.includes(caseId) ? <Outlet /> : <NotFoundView />
}

/** Shows child routes only if :patientId matches the case's patient. */
export function PatientRoute() {
  const { patientId } = useParams()
  const { cases } = useApp()
  const valid = cases.current && patientId === patientRouteId(cases.current)
  return valid ? <Outlet /> : <NotFoundView />
}

/** Shows child routes only if :candidateId is a known candidate, and remembers it. */
export function ReviewRoute() {
  const { candidateId } = useParams()
  const { demo, setReviewCandidate } = useApp()
  const valid = candidateId !== undefined && Object.hasOwn(demo.candidates, candidateId)

  useEffect(() => {
    if (valid && candidateId) setReviewCandidate(candidateId)
  }, [candidateId, valid, setReviewCandidate])

  return valid ? <Outlet /> : <NotFoundView />
}

/**
 * Waits for cases to load before showing case screens. With demo data this
 * passes straight through; with the API it shows loading, error and empty states.
 */
export function CasesGate() {
  const { cases, role } = useApp()
  const heading = (
    <PageHead
      title={role === 'educator' ? 'Case management' : 'My cases'}
      description="Cases and patients are loaded from the backend."
      breadcrumb={[role === 'educator' ? 'Educator' : 'Cases', 'Loading']}
    />
  )

  if (cases.status === 'loading') {
    return (
      <>
        {heading}
        <LoadingState label="Loading cases…" />
      </>
    )
  }
  if (cases.status === 'error' && cases.error) {
    return (
      <>
        {heading}
        <ErrorState error={cases.error} onRetry={cases.reload} />
        <p className="muted">
          See <Link to={paths.backendStatus}>Backend status</Link> for which endpoints exist, or set{' '}
          <code>VITE_CASES_SOURCE=demo</code> to use the demo case.
        </p>
      </>
    )
  }
  if (!cases.current) {
    return (
      <>
        {heading}
        <EmptyState title={role === 'educator' ? 'No cases yet' : 'No published cases yet'}>
          {role === 'educator'
            ? 'The backend has no cases. Creating cases from this screen is not built yet.'
            : 'Your educator will make a case available here.'}
        </EmptyState>
      </>
    )
  }
  return <Outlet />
}
