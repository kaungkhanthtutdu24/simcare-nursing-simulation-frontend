import { apiRequest } from './http'
import type { HttpMethod, RequestOptions } from './http'

export type ApiResource =
  | 'System'
  | 'Patients'
  | 'Cases'
  | 'Consultation notes'
  | 'Lab results'
  | 'Prescriptions'
  | 'Referrals'
  | 'Demographics'
  | 'Medical history'
  | 'Vital signs'
  | 'Feedback'

export type ApiRole = 'candidate' | 'educator'

export interface EndpointSpec {
  method: HttpMethod
  /** Path template; `{name}` segments are filled from params. */
  path: string
  resource: ApiResource
  summary: string
  roles: readonly ApiRole[]
  /** Contract version: v1 is under review; v1.1 is a later draft. */
  version?: 'v1.1'
}

/**
 * Every endpoint the frontend expects. All are PROPOSED: none exist in the
 * backend yet. Entries marked `version: 'v1.1'` are a later draft.
 * Keep this list in step with docs/API_CONTRACT.md.
 */
export const endpoints = {
  health: {
    method: 'GET',
    path: '/api/health',
    resource: 'System',
    summary: 'Liveness check',
    roles: ['candidate', 'educator'],
  },

  'patients.list': {
    method: 'GET',
    path: '/api/patients',
    resource: 'Patients',
    summary: 'List fictional patients',
    roles: ['educator'],
  },
  'patients.get': {
    method: 'GET',
    path: '/api/patients/{patientId}',
    resource: 'Patients',
    summary: 'Get one patient',
    roles: ['educator', 'candidate'],
  },
  'patients.create': {
    method: 'POST',
    path: '/api/patients',
    resource: 'Patients',
    summary: 'Create a patient',
    roles: ['educator'],
  },
  'patients.update': {
    method: 'PUT',
    path: '/api/patients/{patientId}',
    resource: 'Patients',
    summary: 'Update a patient',
    roles: ['educator'],
  },

  'cases.list': {
    method: 'GET',
    path: '/api/cases',
    resource: 'Cases',
    summary: 'List cases (candidates: published cases only)',
    roles: ['educator', 'candidate'],
  },
  'cases.get': {
    method: 'GET',
    path: '/api/cases/{caseId}',
    resource: 'Cases',
    summary: 'Get one case with its patient',
    roles: ['educator', 'candidate'],
  },
  'cases.create': {
    method: 'POST',
    path: '/api/cases',
    resource: 'Cases',
    summary: 'Create a draft case',
    roles: ['educator'],
  },
  'cases.update': {
    method: 'PUT',
    path: '/api/cases/{caseId}',
    resource: 'Cases',
    summary: 'Update a case',
    roles: ['educator'],
  },
  'cases.publish': {
    method: 'POST',
    path: '/api/cases/{caseId}/publish',
    resource: 'Cases',
    summary: 'Publish a case to candidates',
    roles: ['educator'],
  },
  'cases.unpublish': {
    method: 'POST',
    path: '/api/cases/{caseId}/unpublish',
    resource: 'Cases',
    summary: 'Move a case back to draft',
    roles: ['educator'],
  },

  'notes.list': {
    method: 'GET',
    path: '/api/cases/{caseId}/consultation-notes',
    resource: 'Consultation notes',
    summary: 'List notes (candidates: own; educators: filter by candidateId)',
    roles: ['candidate', 'educator'],
  },
  'notes.create': {
    method: 'POST',
    path: '/api/cases/{caseId}/consultation-notes',
    resource: 'Consultation notes',
    summary: 'Start a draft note',
    roles: ['candidate'],
  },
  'notes.update': {
    method: 'PUT',
    path: '/api/consultation-notes/{noteId}',
    resource: 'Consultation notes',
    summary: 'Save a draft note',
    roles: ['candidate'],
  },
  'notes.submit': {
    method: 'POST',
    path: '/api/consultation-notes/{noteId}/submit',
    resource: 'Consultation notes',
    summary: 'Submit a note (becomes read-only)',
    roles: ['candidate'],
  },

  'labResults.list': {
    method: 'GET',
    path: '/api/cases/{caseId}/lab-results',
    resource: 'Lab results',
    summary: 'List results (candidates: released only, with own status)',
    roles: ['candidate', 'educator'],
  },
  'labResults.create': {
    method: 'POST',
    path: '/api/cases/{caseId}/lab-results',
    resource: 'Lab results',
    summary: 'Prepare a result',
    roles: ['educator'],
  },
  'labResults.update': {
    method: 'PUT',
    path: '/api/lab-results/{labResultId}',
    resource: 'Lab results',
    summary: 'Edit an unreleased result',
    roles: ['educator'],
  },
  'labResults.release': {
    method: 'POST',
    path: '/api/lab-results/{labResultId}/release',
    resource: 'Lab results',
    summary: 'Release to candidate inboxes',
    roles: ['educator'],
  },
  'labResults.hold': {
    method: 'POST',
    path: '/api/lab-results/{labResultId}/hold',
    resource: 'Lab results',
    summary: 'Withdraw from candidate inboxes',
    roles: ['educator'],
  },
  'labResults.open': {
    method: 'POST',
    path: '/api/lab-results/{labResultId}/open',
    resource: 'Lab results',
    summary: 'Mark as opened by the candidate',
    roles: ['candidate'],
  },
  'labResults.saveResponse': {
    method: 'PUT',
    path: '/api/lab-results/{labResultId}/response',
    resource: 'Lab results',
    summary: "Save the candidate's draft response",
    roles: ['candidate'],
  },
  'labResults.submitResponse': {
    method: 'POST',
    path: '/api/lab-results/{labResultId}/response/submit',
    resource: 'Lab results',
    summary: "Submit the candidate's response",
    roles: ['candidate'],
  },

  'prescriptions.list': {
    method: 'GET',
    path: '/api/cases/{caseId}/prescriptions',
    resource: 'Prescriptions',
    summary: 'List medicines (candidates: own; educators: filter by candidateId)',
    roles: ['candidate', 'educator'],
  },
  'prescriptions.create': {
    method: 'POST',
    path: '/api/cases/{caseId}/prescriptions',
    resource: 'Prescriptions',
    summary: 'Add a medicine',
    roles: ['candidate'],
  },
  'prescriptions.update': {
    method: 'PUT',
    path: '/api/prescriptions/{prescriptionId}',
    resource: 'Prescriptions',
    summary: 'Edit a medicine',
    roles: ['candidate'],
  },
  'prescriptions.delete': {
    method: 'DELETE',
    path: '/api/prescriptions/{prescriptionId}',
    resource: 'Prescriptions',
    summary: 'Remove a medicine',
    roles: ['candidate'],
  },

  'referrals.list': {
    method: 'GET',
    path: '/api/cases/{caseId}/referrals',
    resource: 'Referrals',
    summary: 'List referrals (candidates: own; educators: filter by candidateId)',
    roles: ['candidate', 'educator'],
  },
  'referrals.create': {
    method: 'POST',
    path: '/api/cases/{caseId}/referrals',
    resource: 'Referrals',
    summary: 'Start a draft referral',
    roles: ['candidate'],
  },
  'referrals.update': {
    method: 'PUT',
    path: '/api/referrals/{referralId}',
    resource: 'Referrals',
    summary: 'Save a draft referral',
    roles: ['candidate'],
  },
  'referrals.submit': {
    method: 'POST',
    path: '/api/referrals/{referralId}/submit',
    resource: 'Referrals',
    summary: 'Submit a referral (becomes read-only)',
    roles: ['candidate'],
  },

  // ---------------- v1.1 draft: candidate-entered record and feedback
  'demographics.get': {
    method: 'GET',
    path: '/api/cases/{caseId}/demographics',
    resource: 'Demographics',
    summary: 'Get demographics (candidates: own; educators: ?candidateId=)',
    roles: ['candidate', 'educator'],
    version: 'v1.1',
  },
  'demographics.save': {
    method: 'PUT',
    path: '/api/cases/{caseId}/demographics',
    resource: 'Demographics',
    summary: 'Save own demographics',
    roles: ['candidate'],
    version: 'v1.1',
  },
  'conditions.list': {
    method: 'GET',
    path: '/api/cases/{caseId}/medical-conditions',
    resource: 'Medical history',
    summary: 'List conditions (candidates: own; educators: ?candidateId=)',
    roles: ['candidate', 'educator'],
    version: 'v1.1',
  },
  'conditions.create': {
    method: 'POST',
    path: '/api/cases/{caseId}/medical-conditions',
    resource: 'Medical history',
    summary: 'Add a condition',
    roles: ['candidate'],
    version: 'v1.1',
  },
  'conditions.update': {
    method: 'PUT',
    path: '/api/medical-conditions/{conditionId}',
    resource: 'Medical history',
    summary: 'Edit a condition',
    roles: ['candidate'],
    version: 'v1.1',
  },
  'conditions.delete': {
    method: 'DELETE',
    path: '/api/medical-conditions/{conditionId}',
    resource: 'Medical history',
    summary: 'Remove a condition',
    roles: ['candidate'],
    version: 'v1.1',
  },
  'familyHistory.list': {
    method: 'GET',
    path: '/api/cases/{caseId}/family-history',
    resource: 'Medical history',
    summary: 'List family history (candidates: own; educators: ?candidateId=)',
    roles: ['candidate', 'educator'],
    version: 'v1.1',
  },
  'familyHistory.create': {
    method: 'POST',
    path: '/api/cases/{caseId}/family-history',
    resource: 'Medical history',
    summary: 'Add a family history entry',
    roles: ['candidate'],
    version: 'v1.1',
  },
  'familyHistory.update': {
    method: 'PUT',
    path: '/api/family-history/{entryId}',
    resource: 'Medical history',
    summary: 'Edit a family history entry',
    roles: ['candidate'],
    version: 'v1.1',
  },
  'familyHistory.delete': {
    method: 'DELETE',
    path: '/api/family-history/{entryId}',
    resource: 'Medical history',
    summary: 'Remove a family history entry',
    roles: ['candidate'],
    version: 'v1.1',
  },
  'vitals.list': {
    method: 'GET',
    path: '/api/cases/{caseId}/vital-signs',
    resource: 'Vital signs',
    summary: 'List observations, oldest first (candidates: own; educators: ?candidateId=)',
    roles: ['candidate', 'educator'],
    version: 'v1.1',
  },
  'vitals.create': {
    method: 'POST',
    path: '/api/cases/{caseId}/vital-signs',
    resource: 'Vital signs',
    summary: 'Add a set of observations',
    roles: ['candidate'],
    version: 'v1.1',
  },
  'vitals.update': {
    method: 'PUT',
    path: '/api/vital-signs/{vitalSignsId}',
    resource: 'Vital signs',
    summary: 'Edit a set of observations',
    roles: ['candidate'],
    version: 'v1.1',
  },
  'vitals.delete': {
    method: 'DELETE',
    path: '/api/vital-signs/{vitalSignsId}',
    resource: 'Vital signs',
    summary: 'Remove a set of observations',
    roles: ['candidate'],
    version: 'v1.1',
  },
  'feedback.mine': {
    method: 'GET',
    path: '/api/cases/{caseId}/feedback/mine',
    resource: 'Feedback',
    summary: 'Own released feedback (204 if none released)',
    roles: ['candidate'],
    version: 'v1.1',
  },
  'feedback.get': {
    method: 'GET',
    path: '/api/cases/{caseId}/candidates/{candidateId}/feedback',
    resource: 'Feedback',
    summary: "Get a candidate's feedback (draft or released)",
    roles: ['educator'],
    version: 'v1.1',
  },
  'feedback.save': {
    method: 'PUT',
    path: '/api/cases/{caseId}/candidates/{candidateId}/feedback',
    resource: 'Feedback',
    summary: 'Save feedback as a draft (hides it if released)',
    roles: ['educator'],
    version: 'v1.1',
  },
  'feedback.release': {
    method: 'POST',
    path: '/api/cases/{caseId}/candidates/{candidateId}/feedback/release',
    resource: 'Feedback',
    summary: 'Release feedback to the candidate',
    roles: ['educator'],
    version: 'v1.1',
  },
} as const satisfies Record<string, EndpointSpec>

export type EndpointId = keyof typeof endpoints

/** Fills `{name}` segments in a path template, URL-encoding each value. */
export function fillPath(template: string, params: Record<string, string> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = params[name]
    if (value === undefined) throw new Error(`Missing path parameter "${name}" for ${template}`)
    return encodeURIComponent(value)
  })
}

/** Calls a catalogued endpoint. */
export function callEndpoint<T>(
  id: EndpointId,
  params: Record<string, string> = {},
  options?: RequestOptions,
): Promise<T> {
  const spec = endpoints[id]
  return apiRequest<T>(spec.method, fillPath(spec.path, params), options)
}
