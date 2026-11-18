import type { CandidateId, CandidateWork, PatientCase, ScenarioEvent, View } from '../../model'
import type { DataSourceName } from '../../data/sources'

export interface EducatorViewProps {
  patient: PatientCase
  event: ScenarioEvent
  candidates: Record<CandidateId, CandidateWork>
  selectedCandidate: CandidateId
  onCandidateChange: (id: CandidateId) => void
  onPatientChange: (patch: Partial<PatientCase>) => void
  /** Where the case is stored: browser demo data or the backend. */
  caseSource: DataSourceName
  /** The case has edits not yet saved to the backend. */
  caseDirty: boolean
  onSaveCase: () => Promise<void>
  onSetPublished: (published: boolean) => Promise<void>
  onEventChange: (patch: Partial<ScenarioEvent>) => void
  onCandidateUpdate: (patch: Partial<CandidateWork>) => void
  onNavigate: (view: View) => void
  onNotice: (message: string) => void
}
