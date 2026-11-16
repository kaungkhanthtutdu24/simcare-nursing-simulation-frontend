export type Role = 'candidate' | 'educator'
export type View =
  | 'cases'
  | 'overview'
  | 'demographics'
  | 'history'
  | 'medications'
  | 'clinical-notes'
  | 'consultation'
  | 'background'
  | 'inbox'
  | 'referrals'
  | 'vitals'
  | 'feedback'
  | 'case-editor'
  | 'release'
  | 'review'
export type CandidateId = 'candidate-01' | 'candidate-02'

export interface PatientCase {
  id: string
  name: string
  age: number
  pronouns: string
  scenario: string
  history: string
  medicines: string
  context: string
  opening: string
  published: boolean
}
export interface ScenarioEvent {
  title: string
  content: string
  kind: 'Laboratory result' | 'Correspondence' | 'Condition update'
  released: boolean
}
export interface Demographics {
  name: string
  dateOfBirth: string
  address: string
  ethnicities: string
}
export interface MedicalCondition {
  id: string
  condition: string
  classification: string
  onset: string
  status: string
  notes: string
}
export interface FamilyHistory {
  id: string
  relationship: string
  condition: string
  notes: string
}
export interface Medication {
  id: string
  name: string
  dose: string
  route: string
  frequency: string
  indication: string
  status: string
  notes: string
}
export interface SoapNote {
  subjective: string
  objective: string
  assessment: string
  plan: string
}
export interface Referral {
  recipient: string
  reason: string
  clinicalQuestion: string
  relevantHistory: string
  investigations: string
  requestedAction: string
  submitted: boolean
}
export interface VitalSigns {
  id: string
  date: string
  systolic: string
  diastolic: string
  weight: string
  heartRate: string
  temperature: string
}
export interface CandidateWork {
  demographics: Demographics
  conditions: MedicalCondition[]
  familyHistory: FamilyHistory[]
  medications: Medication[]
  soap: SoapNote
  referral: Referral
  vitals: VitalSigns[]
  note: string
  noteSubmitted: boolean
  inboxOpened: boolean
  response: string
  responseSubmitted: boolean
  feedback: string
  feedbackReleased: boolean
}
export interface DemoState {
  patient: PatientCase
  event: ScenarioEvent
  candidates: Record<CandidateId, CandidateWork>
}
export const candidateNames: Record<CandidateId, string> = {
  'candidate-01': 'Candidate 01',
  'candidate-02': 'Candidate 02',
}
export const newCondition = (): MedicalCondition => ({
  id: crypto.randomUUID(),
  condition: '',
  classification: '',
  onset: '',
  status: 'Active',
  notes: '',
})
export const newFamilyHistory = (): FamilyHistory => ({
  id: crypto.randomUUID(),
  relationship: '',
  condition: '',
  notes: '',
})
export const newMedication = (): Medication => ({
  id: crypto.randomUUID(),
  name: '',
  dose: '',
  route: '',
  frequency: '',
  indication: '',
  status: 'Current',
  notes: '',
})
export const newVitalSigns = (): VitalSigns => ({
  id: crypto.randomUUID(),
  date: new Date().toISOString().slice(0, 10),
  systolic: '',
  diastolic: '',
  weight: '',
  heartRate: '',
  temperature: '',
})
const emptyCandidate = (name: string): CandidateWork => ({
  demographics: { name, dateOfBirth: '', address: '', ethnicities: '' },
  conditions: [],
  familyHistory: [],
  medications: [],
  soap: { subjective: '', objective: '', assessment: '', plan: '' },
  referral: {
    recipient: '',
    reason: '',
    clinicalQuestion: '',
    relevantHistory: '',
    investigations: '',
    requestedAction: '',
    submitted: false,
  },
  vitals: [],
  note: '',
  noteSubmitted: false,
  inboxOpened: false,
  response: '',
  responseSubmitted: false,
  feedback: '',
  feedbackReleased: false,
})
export const initialDemoState: DemoState = {
  patient: {
    id: 'SIM-1042',
    name: 'Aroha Williams',
    age: 54,
    pronouns: 'She / her',
    scenario: 'Follow-up consultation',
    history: 'Fictional clinical history for the approved teaching case will be added here.',
    medicines: 'No baseline medicines documented in this sample.',
    context: 'Would like whānau present for important discussions.',
    opening:
      'Review the fictional patient background, document the consultation, and explain your next steps.',
    published: true,
  },
  event: {
    title: 'Follow-up report',
    content:
      'This is a placeholder report. The academic team will provide approved fictional findings and values.',
    kind: 'Laboratory result',
    released: true,
  },
  candidates: {
    'candidate-01': emptyCandidate('Aroha Williams'),
    'candidate-02': emptyCandidate('Aroha Williams'),
  },
}
const storageKey = 'simcare-react-demo-v1'
function mergeCandidate(saved: Partial<CandidateWork> | undefined, name: string): CandidateWork {
  const empty = emptyCandidate(name)
  return {
    ...empty,
    ...saved,
    demographics: { ...empty.demographics, ...saved?.demographics },
    conditions: Array.isArray(saved?.conditions) ? saved.conditions : [],
    familyHistory: Array.isArray(saved?.familyHistory) ? saved.familyHistory : [],
    medications: Array.isArray(saved?.medications) ? saved.medications : [],
    soap: {
      ...empty.soap,
      ...saved?.soap,
      subjective: saved?.soap?.subjective ?? saved?.note ?? '',
    },
    referral: { ...empty.referral, ...saved?.referral },
    vitals: Array.isArray(saved?.vitals) ? saved.vitals : [],
  }
}
export function loadDemoState(): DemoState {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return initialDemoState
    const saved = JSON.parse(raw) as Partial<DemoState>
    const patient = { ...initialDemoState.patient, ...saved.patient }
    return {
      patient,
      event: { ...initialDemoState.event, ...saved.event },
      candidates: {
        'candidate-01': mergeCandidate(saved.candidates?.['candidate-01'], patient.name),
        'candidate-02': mergeCandidate(saved.candidates?.['candidate-02'], patient.name),
      },
    }
  } catch {
    return initialDemoState
  }
}
export function saveDemoState(state: DemoState): boolean {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}
