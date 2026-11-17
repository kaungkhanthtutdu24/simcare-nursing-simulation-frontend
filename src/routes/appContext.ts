import { createContext, useContext } from 'react'
import type {
  CandidateId,
  CandidateWork,
  DemoState,
  PatientCase,
  Role,
  ScenarioEvent,
  View,
} from '../model'

/** Shared app state and actions, provided by AppLayout to every route. */
export interface AppContextValue {
  demo: DemoState
  /** Role of the section being viewed, taken from the URL (/candidate or /educator). */
  role: Role
  /** Candidate whose workspace the candidate screens show. */
  candidateId: CandidateId
  /** Candidate most recently opened in the educator review screen. */
  reviewCandidate: CandidateId
  setReviewCandidate: (id: CandidateId) => void
  updatePatient: (patch: Partial<PatientCase>) => void
  updateEvent: (patch: Partial<ScenarioEvent>) => void
  updateCandidate: (id: CandidateId, patch: Partial<CandidateWork>) => void
  notify: (message: string) => void
  /** Navigate to a screen for the current role. */
  goTo: (view: View) => void
  /** URL of a screen for the current role (for links). */
  pathFor: (view: View) => string
}

export const AppContext = createContext<AppContextValue | null>(null)

export function useApp(): AppContextValue {
  const value = useContext(AppContext)
  if (!value) throw new Error('useApp must be used inside AppLayout')
  return value
}
