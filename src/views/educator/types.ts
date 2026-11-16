import type { CandidateId, CandidateWork, PatientCase, ScenarioEvent, View } from '../../model'

export interface EducatorViewProps {
  patient: PatientCase
  event: ScenarioEvent
  candidates: Record<CandidateId, CandidateWork>
  selectedCandidate: CandidateId
  onCandidateChange: (id: CandidateId) => void
  onPatientChange: (patch: Partial<PatientCase>) => void
  onEventChange: (patch: Partial<ScenarioEvent>) => void
  onCandidateUpdate: (patch: Partial<CandidateWork>) => void
  onNavigate: (view: View) => void
  onNotice: (message: string) => void
}
