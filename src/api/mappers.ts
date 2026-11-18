/**
 * Converts between API shapes (contracts.ts) and the UI's existing model
 * (model.ts). When an endpoint goes live, screens can load API data through
 * these functions without changing their components.
 */
import type {
  CandidateWork,
  Demographics,
  FamilyHistory,
  MedicalCondition,
  Medication,
  PatientCase,
  Referral,
  ScenarioEvent,
  SoapNote,
  VitalSigns,
} from '../model'
import type {
  CaseDto,
  DemographicsDto,
  FamilyHistoryDto,
  FeedbackDto,
  MedicalConditionDto,
  SaveDemographicsRequest,
  SaveFamilyHistoryRequest,
  SaveMedicalConditionRequest,
  SaveVitalSignsRequest,
  VitalSignsDto,
  ConsultationNoteDto,
  LabResultDto,
  PrescriptionDto,
  ReferralDto,
  ResultType,
  SaveConsultationNoteRequest,
  SaveLabResultRequest,
  SavePrescriptionRequest,
  SaveReferralRequest,
  UpdateCaseRequest,
  UpdatePatientRequest,
} from './contracts'

export function toPatientCase(dto: CaseDto): PatientCase {
  return {
    caseKey: dto.id,
    id: dto.patient.simulationId,
    name: dto.patient.fullName,
    age: dto.patient.ageYears,
    pronouns: dto.patient.pronouns,
    scenario: dto.title,
    history: dto.patient.pastHistory,
    medicines: dto.patient.baselineMedicines,
    context: dto.patient.communicationContext,
    opening: dto.openingBrief,
    published: dto.status === 'published',
  }
}

export const toUpdatePatientRequest = (c: PatientCase): UpdatePatientRequest => ({
  simulationId: c.id,
  fullName: c.name,
  ageYears: c.age,
  pronouns: c.pronouns,
  communicationContext: c.context,
  pastHistory: c.history,
  baselineMedicines: c.medicines,
})

export const toUpdateCaseRequest = (c: PatientCase, patientId: string): UpdateCaseRequest => ({
  title: c.scenario,
  openingBrief: c.opening,
  patientId,
})

export const toSoapNote = (dto: ConsultationNoteDto): SoapNote => ({
  subjective: dto.subjective,
  objective: dto.objective,
  assessment: dto.assessment,
  plan: dto.plan,
})

export const toConsultationNoteRequest = (note: SoapNote): SaveConsultationNoteRequest => ({
  ...note,
})

const kindByResultType: Record<ResultType, ScenarioEvent['kind']> = {
  laboratory: 'Laboratory result',
  // The UI has no radiology option yet, so radiology shows as a laboratory result.
  radiology: 'Laboratory result',
  correspondence: 'Correspondence',
  'condition-update': 'Condition update',
}

const resultTypeByKind: Record<ScenarioEvent['kind'], ResultType> = {
  'Laboratory result': 'laboratory',
  Correspondence: 'correspondence',
  'Condition update': 'condition-update',
}

export const toScenarioEvent = (dto: LabResultDto): ScenarioEvent => ({
  title: dto.title,
  content: dto.content,
  kind: kindByResultType[dto.resultType],
  released: dto.released,
})

export const toLabResultRequest = (event: ScenarioEvent): SaveLabResultRequest => ({
  title: event.title,
  content: event.content,
  resultType: resultTypeByKind[event.kind],
})

export const toMedication = (dto: PrescriptionDto): Medication => ({
  id: dto.id,
  name: dto.medicineName,
  dose: dto.dose,
  route: dto.route,
  frequency: dto.frequency,
  indication: dto.indication,
  status: dto.status,
  notes: dto.notes,
})

export const toPrescriptionRequest = (medication: Medication): SavePrescriptionRequest => ({
  medicineName: medication.name,
  dose: medication.dose,
  route: medication.route,
  frequency: medication.frequency,
  indication: medication.indication,
  status: medication.status,
  notes: medication.notes,
})

export const toReferral = (dto: ReferralDto): Referral => ({
  recipient: dto.recipient,
  reason: dto.reasonOrPriority,
  clinicalQuestion: dto.clinicalQuestion,
  relevantHistory: dto.relevantHistory,
  investigations: dto.investigations,
  requestedAction: dto.requestedAction,
  submitted: dto.status === 'submitted',
})

export const toReferralRequest = (referral: Referral): SaveReferralRequest => ({
  recipient: referral.recipient,
  reasonOrPriority: referral.reason,
  clinicalQuestion: referral.clinicalQuestion,
  relevantHistory: referral.relevantHistory,
  investigations: referral.investigations,
  requestedAction: referral.requestedAction,
})

// ---------------------------------------------------------------- v1.1 draft

export const toDemographics = (dto: DemographicsDto): Demographics => ({
  name: dto.fullName,
  dateOfBirth: dto.dateOfBirth ?? '',
  address: dto.address,
  ethnicities: dto.ethnicities,
})

export const toDemographicsRequest = (d: Demographics): SaveDemographicsRequest => ({
  fullName: d.name,
  dateOfBirth: d.dateOfBirth || null,
  address: d.address,
  ethnicities: d.ethnicities,
})

export const toMedicalCondition = (dto: MedicalConditionDto): MedicalCondition => ({
  id: dto.id,
  condition: dto.condition,
  classification: dto.classification,
  onset: dto.onset,
  status: dto.status,
  notes: dto.notes,
})

export const toMedicalConditionRequest = (c: MedicalCondition): SaveMedicalConditionRequest => ({
  condition: c.condition,
  classification: c.classification,
  onset: c.onset,
  status: c.status,
  notes: c.notes,
})

export const toFamilyHistory = (dto: FamilyHistoryDto): FamilyHistory => ({
  id: dto.id,
  relationship: dto.relationship,
  condition: dto.condition,
  notes: dto.notes,
})

export const toFamilyHistoryRequest = (f: FamilyHistory): SaveFamilyHistoryRequest => ({
  relationship: f.relationship,
  condition: f.condition,
  notes: f.notes,
})

/** UI inputs hold text; the API uses numbers, with null for "not recorded". */
const toNumber = (value: string): number | null => {
  if (value.trim() === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}
const toText = (value: number | null) => (value === null ? '' : String(value))

export const toVitalSigns = (dto: VitalSignsDto): VitalSigns => ({
  id: dto.id,
  date: dto.recordedOn,
  systolic: toText(dto.systolicMmHg),
  diastolic: toText(dto.diastolicMmHg),
  weight: toText(dto.weightKg),
  heartRate: toText(dto.heartRateBpm),
  temperature: toText(dto.temperatureC),
})

export const toVitalSignsRequest = (v: VitalSigns): SaveVitalSignsRequest => ({
  recordedOn: v.date,
  systolicMmHg: toNumber(v.systolic),
  diastolicMmHg: toNumber(v.diastolic),
  weightKg: toNumber(v.weight),
  heartRateBpm: toNumber(v.heartRate),
  temperatureC: toNumber(v.temperature),
})

/** Feedback fields of the UI's candidate work. `undefined` means nothing released (204). */
export const toFeedbackState = (
  dto: FeedbackDto | undefined,
): Pick<CandidateWork, 'feedback' | 'feedbackReleased'> => ({
  feedback: dto?.comments ?? '',
  feedbackReleased: dto?.status === 'released',
})
