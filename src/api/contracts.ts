/**
 * Proposed request and response shapes for the SimCare backend API.
 *
 * STATUS: PROPOSED. None of these endpoints exist in the backend yet. The
 * backend currently exposes only the scaffold sample `GET /weatherforecast`.
 * See docs/API_CONTRACT.md for the full contract to agree with the backend team.
 *
 * Conventions (match ASP.NET Core defaults):
 * - JSON property names are camelCase.
 * - IDs are GUID strings.
 * - Enums are sent as the strings listed here (JsonStringEnumConverter with a
 *   kebab-case naming policy).
 * - `IsoDate` is a `DateOnly` ("2026-11-17"); `IsoDateTime` is a UTC
 *   `DateTimeOffset` ("2026-11-17T02:30:00Z").
 */

export type Guid = string
export type IsoDate = string
export type IsoDateTime = string

// ---------------------------------------------------------------- errors

/** RFC 7807 problem response, as produced by ASP.NET Core `ProblemDetails`. */
export interface ProblemDetails {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  traceId?: string
  /** Present on validation errors (`ValidationProblemDetails`): field name to messages. */
  errors?: Record<string, string[]>
}

// ---------------------------------------------------------------- system

export interface HealthDto {
  status: 'ok'
  /** Optional build or version label. */
  version?: string
}

// ---------------------------------------------------------------- patients

/** Fictional patient authored by an educator. */
export interface PatientDto {
  id: Guid
  /** Human-readable simulation ID, e.g. "SIM-1042". Unique. */
  simulationId: string
  fullName: string
  ageYears: number
  pronouns: string
  /** Communication preferences and care context. */
  communicationContext: string
  pastHistory: string
  baselineMedicines: string
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
}

export type CreatePatientRequest = Omit<PatientDto, 'id' | 'createdAt' | 'updatedAt'>
export type UpdatePatientRequest = CreatePatientRequest

// ---------------------------------------------------------------- cases

export type CaseStatus = 'draft' | 'published'

export interface CaseSummaryDto {
  id: Guid
  title: string
  status: CaseStatus
  patientId: Guid
  patientName: string
  patientSimulationId: string
  updatedAt: IsoDateTime
}

export interface CaseDto {
  id: Guid
  /** Scenario title, e.g. "Follow-up consultation". */
  title: string
  /** Opening brief shown to candidates. */
  openingBrief: string
  status: CaseStatus
  patient: PatientDto
  publishedAt: IsoDateTime | null
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
}

export interface CreateCaseRequest {
  title: string
  openingBrief: string
  patientId: Guid
}
export type UpdateCaseRequest = CreateCaseRequest

// ---------------------------------------------------------------- consultation notes

export type SubmissionStatus = 'draft' | 'submitted'

/** A candidate's SOAP consultation note for a case. */
export interface ConsultationNoteDto {
  id: Guid
  caseId: Guid
  candidateId: Guid
  subjective: string
  objective: string
  assessment: string
  plan: string
  status: SubmissionStatus
  submittedAt: IsoDateTime | null
  updatedAt: IsoDateTime
}

export interface SaveConsultationNoteRequest {
  subjective: string
  objective: string
  assessment: string
  plan: string
}

// ---------------------------------------------------------------- lab results

export type ResultType = 'laboratory' | 'radiology' | 'correspondence' | 'condition-update'

/** The signed-in candidate's progress on a released result. */
export interface CandidateResultStatusDto {
  openedAt: IsoDateTime | null
  response: string
  responseSubmittedAt: IsoDateTime | null
}

/** A result or correspondence item an educator prepares and releases to candidate inboxes. */
export interface LabResultDto {
  id: Guid
  caseId: Guid
  title: string
  resultType: ResultType
  /** Result text. Placeholder until approved fictional findings are supplied. */
  content: string
  released: boolean
  releasedAt: IsoDateTime | null
  /** Only on candidate requests: that candidate's own progress. */
  candidateStatus?: CandidateResultStatusDto
}

export interface SaveLabResultRequest {
  title: string
  resultType: ResultType
  content: string
}

export interface SaveResultResponseRequest {
  response: string
}

// ---------------------------------------------------------------- prescriptions

/** A medicine a candidate records for the fictional patient. Free text; no clinical validation. */
export interface PrescriptionDto {
  id: Guid
  caseId: Guid
  candidateId: Guid
  medicineName: string
  dose: string
  route: string
  frequency: string
  indication: string
  /** Free text, e.g. "Current", "As needed", "Stopped". */
  status: string
  notes: string
  updatedAt: IsoDateTime
}

export type SavePrescriptionRequest = Pick<
  PrescriptionDto,
  'medicineName' | 'dose' | 'route' | 'frequency' | 'indication' | 'status' | 'notes'
>

// ---------------------------------------------------------------- referrals

export interface ReferralDto {
  id: Guid
  caseId: Guid
  candidateId: Guid
  recipient: string
  reasonOrPriority: string
  clinicalQuestion: string
  relevantHistory: string
  investigations: string
  requestedAction: string
  status: SubmissionStatus
  submittedAt: IsoDateTime | null
  updatedAt: IsoDateTime
}

export type SaveReferralRequest = Pick<
  ReferralDto,
  | 'recipient'
  | 'reasonOrPriority'
  | 'clinicalQuestion'
  | 'relevantHistory'
  | 'investigations'
  | 'requestedAction'
>

// ================================================================ v1.1 DRAFT
// Candidate-entered patient record and educator feedback. Proposed for review;
// not implemented in the backend. All records below belong to one candidate
// and one case; candidates only ever see their own.

// ---------------------------------------------------------------- demographics

/**
 * The candidate's entry of the patient's identifying details.
 * One per candidate per case. If the candidate has not saved one yet, GET
 * returns an empty record (all fields "", dateOfBirth null) rather than 404.
 */
export interface DemographicsDto {
  caseId: Guid
  candidateId: Guid
  fullName: string
  dateOfBirth: IsoDate | null
  /** Fictional address, free text. */
  address: string
  /** Self-described, free text; may list several. No fixed list is imposed. */
  ethnicities: string
  updatedAt: IsoDateTime | null
}

export type SaveDemographicsRequest = Pick<
  DemographicsDto,
  'fullName' | 'dateOfBirth' | 'address' | 'ethnicities'
>

// ---------------------------------------------------------------- medical history

export interface MedicalConditionDto {
  id: Guid
  caseId: Guid
  candidateId: Guid
  /** Free text, e.g. "Type 2 diabetes". */
  condition: string
  /** Optional classification or code, free text (no coding system enforced). */
  classification: string
  /** Free text, e.g. "2019" or "childhood". */
  onset: string
  /** Free text, e.g. "Active", "Resolved". */
  status: string
  notes: string
  updatedAt: IsoDateTime
}

export type SaveMedicalConditionRequest = Pick<
  MedicalConditionDto,
  'condition' | 'classification' | 'onset' | 'status' | 'notes'
>

export interface FamilyHistoryDto {
  id: Guid
  caseId: Guid
  candidateId: Guid
  /** Free text, e.g. "Mother". */
  relationship: string
  condition: string
  notes: string
  updatedAt: IsoDateTime
}

export type SaveFamilyHistoryRequest = Pick<
  FamilyHistoryDto,
  'relationship' | 'condition' | 'notes'
>

// ---------------------------------------------------------------- vital signs

/**
 * One dated set of observations. Every measurement is optional (null when not
 * recorded). The backend stores what is entered and does not judge whether
 * values are clinically normal.
 */
export interface VitalSignsDto {
  id: Guid
  caseId: Guid
  candidateId: Guid
  recordedOn: IsoDate
  systolicMmHg: number | null
  diastolicMmHg: number | null
  /** Kilograms, one decimal place. */
  weightKg: number | null
  heartRateBpm: number | null
  /** Degrees Celsius, one decimal place. */
  temperatureC: number | null
  updatedAt: IsoDateTime
}

export type SaveVitalSignsRequest = Pick<
  VitalSignsDto,
  'recordedOn' | 'systolicMmHg' | 'diastolicMmHg' | 'weightKg' | 'heartRateBpm' | 'temperatureC'
>

// ---------------------------------------------------------------- feedback

export type FeedbackStatus = 'draft' | 'released'

/** An educator's formative feedback for one candidate on one case. */
export interface FeedbackDto {
  caseId: Guid
  candidateId: Guid
  comments: string
  status: FeedbackStatus
  releasedAt: IsoDateTime | null
  updatedAt: IsoDateTime | null
}

export interface SaveFeedbackRequest {
  comments: string
}
