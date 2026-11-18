import type { ComponentType } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import type { CandidateId } from '../model'
import type { CandidateFlowProps } from '../views/types'
import type { EducatorViewProps } from '../views/educator/types'
import { useApp } from './appContext'
import type { AppContextValue } from './appContext'
import { paths, patientRouteId } from './paths'

/** The current case. Only call inside CasesGate, which guarantees one is loaded. */
function currentCase(app: AppContextValue) {
  if (!app.cases.current) throw new Error('No case loaded; render inside CasesGate')
  return app.cases.current
}

/** Renders a candidate screen with the signed-in candidate's workspace. */
export function CandidatePage({
  component: Screen,
}: {
  component: ComponentType<CandidateFlowProps>
}) {
  const app = useApp()
  return (
    <Screen
      patient={currentCase(app)}
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
  const selected =
    candidateId && Object.hasOwn(app.demo.candidates, candidateId)
      ? candidateId
      : app.reviewCandidate
  const patient = currentCase(app)

  const openCandidate = (id: CandidateId) => {
    app.setReviewCandidate(id)
    navigate(paths.educator.review(patient.caseKey, id))
  }

  return (
    <Screen
      patient={patient}
      event={app.demo.event}
      candidates={app.demo.candidates}
      selectedCandidate={selected}
      onCandidateChange={openCandidate}
      onPatientChange={app.cases.edit}
      caseSource={app.cases.source}
      caseDirty={app.cases.dirty}
      onSaveCase={app.cases.save}
      onSetPublished={app.cases.setPublished}
      onEventChange={app.updateEvent}
      onCandidateUpdate={(patch) => app.updateCandidate(selected, patch)}
      onNavigate={app.goTo}
      onNotice={app.notify}
    />
  )
}

/** /candidate/cases/:caseId/consultation opens the SOAP clinical note. */
export function ConsultationRedirect() {
  const patient = currentCase(useApp())
  return (
    <Navigate
      to={paths.candidate.record(patient.caseKey, patientRouteId(patient), 'clinical-notes')}
      replace
    />
  )
}

/** /educator/cases/:caseId/review opens the most recently reviewed candidate. */
export function ReviewIndexRedirect() {
  const app = useApp()
  return (
    <Navigate to={paths.educator.review(currentCase(app).caseKey, app.reviewCandidate)} replace />
  )
}
