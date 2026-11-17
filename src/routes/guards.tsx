import { useEffect } from 'react'
import { Outlet, useParams } from 'react-router'
import { isCandidateId } from '../model'
import type { Role } from '../model'
import { useSession } from '../auth/session'
import { AccessDeniedView } from '../views/AccessDeniedView'
import { NotFoundView } from '../views/NotFoundView'
import { useApp } from './appContext'
import { patientRouteId } from './paths'

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
  const { demo } = useApp()
  return caseId === demo.patient.caseKey ? <Outlet /> : <NotFoundView />
}

/** Shows child routes only if :patientId matches the case's patient. */
export function PatientRoute() {
  const { patientId } = useParams()
  const { demo } = useApp()
  return patientId === patientRouteId(demo.patient) ? <Outlet /> : <NotFoundView />
}

/** Shows child routes only if :candidateId is a known candidate, and remembers it. */
export function ReviewRoute() {
  const { candidateId } = useParams()
  const { setReviewCandidate } = useApp()
  const valid = isCandidateId(candidateId)

  useEffect(() => {
    if (isCandidateId(candidateId)) setReviewCandidate(candidateId)
  }, [candidateId, setReviewCandidate])

  return valid ? <Outlet /> : <NotFoundView />
}
