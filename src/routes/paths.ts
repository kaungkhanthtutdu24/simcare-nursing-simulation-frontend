import type { CandidateId, PatientCase, Role, View } from '../model'

export type RecordSection =
  'demographics' | 'history' | 'medications' | 'clinical-notes' | 'referral' | 'vitals'

export type CaseSection = 'inbox' | 'feedback' | 'background' | 'consultation'

const enc = encodeURIComponent

/** The patient identifier used in URLs (the editable Simulation ID, with a fallback). */
export const patientRouteId = (patient: PatientCase) => patient.id.trim() || 'patient'

/** True if every ID in the URL (:caseId, :patientId, :candidateId) refers to something that exists. */
export function routeParamsExist(
  params: Record<string, string | undefined>,
  {
    caseKeys,
    patient,
    candidateIds,
  }: { caseKeys: string[]; patient: PatientCase | null; candidateIds: CandidateId[] },
): boolean {
  if (params.caseId !== undefined && !caseKeys.includes(params.caseId)) return false
  if (params.patientId !== undefined && (!patient || params.patientId !== patientRouteId(patient)))
    return false
  if (params.candidateId !== undefined && !candidateIds.includes(params.candidateId)) return false
  return true
}

/** Builds every URL in the app, so paths are defined in one place. */
export const paths = {
  home: '/',
  signIn: '/login',
  signUp: '/signup',
  /** Developer page. Not under /api, which the dev server proxies to the backend. */
  backendStatus: '/backend-status',
  candidate: {
    home: '/candidate',
    dashboard: '/candidate/dashboard',
    profile: '/candidate/profile',
    cases: '/candidate/cases',
    case: (caseKey: string) => `/candidate/cases/${enc(caseKey)}`,
    caseSection: (caseKey: string, section: CaseSection) =>
      `/candidate/cases/${enc(caseKey)}/${section}`,
    record: (caseKey: string, patientId: string, section: RecordSection) =>
      `/candidate/cases/${enc(caseKey)}/patients/${enc(patientId)}/${section}`,
  },
  educator: {
    home: '/educator',
    cases: '/educator/cases',
    editor: (caseKey: string) => `/educator/cases/${enc(caseKey)}/edit`,
    release: (caseKey: string) => `/educator/cases/${enc(caseKey)}/release`,
    review: (caseKey: string, candidateId: CandidateId) =>
      `/educator/cases/${enc(caseKey)}/review/${candidateId}`,
  },
}

/** Where each role lands after signing in. */
export const roleHome = (role: Role) =>
  role === 'educator' ? paths.educator.cases : paths.candidate.dashboard

const caseList = (role: Role) =>
  role === 'educator' ? paths.educator.cases : paths.candidate.cases

const recordSections: Partial<Record<View, RecordSection>> = {
  demographics: 'demographics',
  history: 'history',
  medications: 'medications',
  'clinical-notes': 'clinical-notes',
  referrals: 'referral',
  vitals: 'vitals',
}

const caseSections: Partial<Record<View, CaseSection>> = {
  inbox: 'inbox',
  feedback: 'feedback',
  background: 'background',
  consultation: 'consultation',
}

export interface PathContext {
  /** The current case, or null if none is loaded (links then go to the case list). */
  patient: PatientCase | null
  reviewCandidate: CandidateId
}

/** Maps a screen name (as used by navigation and buttons) to its URL for a role. */
export function viewPath(role: Role, view: View, { patient, reviewCandidate }: PathContext) {
  if (role === 'candidate' && view === 'dashboard') return paths.candidate.dashboard
  if (role === 'candidate' && view === 'profile') return paths.candidate.profile
  if (!patient) return caseList(role)
  const { caseKey } = patient
  if (role === 'educator') {
    switch (view) {
      case 'case-editor':
        return paths.educator.editor(caseKey)
      case 'release':
        return paths.educator.release(caseKey)
      case 'review':
        return paths.educator.review(caseKey, reviewCandidate)
      default:
        return paths.educator.cases
    }
  }
  if (view === 'overview') return paths.candidate.case(caseKey)
  const record = recordSections[view]
  if (record) return paths.candidate.record(caseKey, patientRouteId(patient), record)
  const section = caseSections[view]
  if (section) return paths.candidate.caseSection(caseKey, section)
  return paths.candidate.cases
}
