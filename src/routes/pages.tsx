import type { ComponentType } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { isCandidateId } from '../model'
import type { CandidateId } from '../model'
import type { CandidateFlowProps } from '../views/types'
import type { EducatorViewProps } from '../views/educator/types'
import { useApp } from './appContext'
import { paths, patientRouteId } from './paths'

/** Renders a candidate screen with the signed-in candidate's workspace. */
export function CandidatePage({
  component: Screen,
}: {
  component: ComponentType<CandidateFlowProps>
}) {
  const app = useApp()
  return (
    <Screen
      patient={app.demo.patient}
      event={app.demo.event}
      work={app.demo.candidates[app.candidateId]}
      onNavigate={app.goTo}
      onUpdate={(patch) => app.updateCandidate(app.candidateId, patch)}
      onNotice={app.notify}
    />
  )
}

/** Renders an educator screen. On review routes the candidate comes from the URL. */
export function EducatorPage({
  component: Screen,
}: {
  component: ComponentType<EducatorViewProps>
}) {
  const app = useApp()
  const navigate = useNavigate()
  const { candidateId } = useParams()
  const selected = isCandidateId(candidateId) ? candidateId : app.reviewCandidate

  const openCandidate = (id: CandidateId) => {
    app.setReviewCandidate(id)
    navigate(paths.educator.review(app.demo.patient.caseKey, id))
  }

  return (
    <Screen
      patient={app.demo.patient}
      event={app.demo.event}
      candidates={app.demo.candidates}
      selectedCandidate={selected}
      onCandidateChange={openCandidate}
      onPatientChange={app.updatePatient}
      onEventChange={app.updateEvent}
      onCandidateUpdate={(patch) => app.updateCandidate(selected, patch)}
      onNavigate={app.goTo}
      onNotice={app.notify}
    />
  )
}

/** /candidate/cases/:caseId/consultation opens the SOAP clinical note. */
export function ConsultationRedirect() {
  const { demo } = useApp()
  const { caseKey } = demo.patient
  return (
    <Navigate
      to={paths.candidate.record(caseKey, patientRouteId(demo.patient), 'clinical-notes')}
      replace
    />
  )
}

/** /educator/cases/:caseId/review opens the most recently reviewed candidate. */
export function ReviewIndexRedirect() {
  const { demo, reviewCandidate } = useApp()
  return <Navigate to={paths.educator.review(demo.patient.caseKey, reviewCandidate)} replace />
}
