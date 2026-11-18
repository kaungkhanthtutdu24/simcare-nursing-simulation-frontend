/**
 * Typed client functions for the proposed clinical simulation endpoints.
 *
 * STATUS: PROPOSED. Every function here will currently fail with an ApiError
 * of kind "not-implemented", because the backend has no such routes yet. The
 * UI does not call these yet; it still uses the local demo data in model.ts.
 *
 * The v1.1 draft functions (demographics, medical history, vital signs and
 * feedback) are at the end of this file.
 *
 * Candidate identity is never sent by candidates: the backend must take it
 * from the signed-in user. Only educators pass `candidateId` to read a
 * particular candidate's work.
 */
import type {
  CaseDto,
  CaseSummaryDto,
  ConsultationNoteDto,
  CreateCaseRequest,
  DemographicsDto,
  FamilyHistoryDto,
  FeedbackDto,
  MedicalConditionDto,
  SaveDemographicsRequest,
  SaveFamilyHistoryRequest,
  SaveFeedbackRequest,
  SaveMedicalConditionRequest,
  SaveVitalSignsRequest,
  VitalSignsDto,
  CreatePatientRequest,
  Guid,
  HealthDto,
  LabResultDto,
  PatientDto,
  PrescriptionDto,
  ReferralDto,
  SaveConsultationNoteRequest,
  SaveLabResultRequest,
  SavePrescriptionRequest,
  SaveReferralRequest,
  SaveResultResponseRequest,
  UpdateCaseRequest,
  UpdatePatientRequest,
} from './contracts'
import { callEndpoint } from './endpoints'

type Opts = { signal?: AbortSignal }

export const systemApi = {
  health: (o?: Opts) => callEndpoint<HealthDto>('health', {}, o),
}

export const patientsApi = {
  list: (o?: Opts) => callEndpoint<PatientDto[]>('patients.list', {}, o),
  get: (patientId: Guid, o?: Opts) => callEndpoint<PatientDto>('patients.get', { patientId }, o),
  create: (body: CreatePatientRequest, o?: Opts) =>
    callEndpoint<PatientDto>('patients.create', {}, { ...o, body }),
  update: (patientId: Guid, body: UpdatePatientRequest, o?: Opts) =>
    callEndpoint<PatientDto>('patients.update', { patientId }, { ...o, body }),
}

export const casesApi = {
  list: (o?: Opts) => callEndpoint<CaseSummaryDto[]>('cases.list', {}, o),
  get: (caseId: Guid, o?: Opts) => callEndpoint<CaseDto>('cases.get', { caseId }, o),
  create: (body: CreateCaseRequest, o?: Opts) =>
    callEndpoint<CaseDto>('cases.create', {}, { ...o, body }),
  update: (caseId: Guid, body: UpdateCaseRequest, o?: Opts) =>
    callEndpoint<CaseDto>('cases.update', { caseId }, { ...o, body }),
  publish: (caseId: Guid, o?: Opts) => callEndpoint<CaseDto>('cases.publish', { caseId }, o),
  unpublish: (caseId: Guid, o?: Opts) => callEndpoint<CaseDto>('cases.unpublish', { caseId }, o),
}

/** Educators may pass candidateId; candidates leave it out. */
type CandidateFilter = Opts & { candidateId?: Guid }
const filterQuery = (f?: CandidateFilter) => ({
  signal: f?.signal,
  query: { candidateId: f?.candidateId },
})

export const consultationNotesApi = {
  list: (caseId: Guid, f?: CandidateFilter) =>
    callEndpoint<ConsultationNoteDto[]>('notes.list', { caseId }, filterQuery(f)),
  create: (caseId: Guid, body: SaveConsultationNoteRequest, o?: Opts) =>
    callEndpoint<ConsultationNoteDto>('notes.create', { caseId }, { ...o, body }),
  update: (noteId: Guid, body: SaveConsultationNoteRequest, o?: Opts) =>
    callEndpoint<ConsultationNoteDto>('notes.update', { noteId }, { ...o, body }),
  submit: (noteId: Guid, o?: Opts) =>
    callEndpoint<ConsultationNoteDto>('notes.submit', { noteId }, o),
}

export const labResultsApi = {
  list: (caseId: Guid, o?: Opts) => callEndpoint<LabResultDto[]>('labResults.list', { caseId }, o),
  create: (caseId: Guid, body: SaveLabResultRequest, o?: Opts) =>
    callEndpoint<LabResultDto>('labResults.create', { caseId }, { ...o, body }),
  update: (labResultId: Guid, body: SaveLabResultRequest, o?: Opts) =>
    callEndpoint<LabResultDto>('labResults.update', { labResultId }, { ...o, body }),
  release: (labResultId: Guid, o?: Opts) =>
    callEndpoint<LabResultDto>('labResults.release', { labResultId }, o),
  hold: (labResultId: Guid, o?: Opts) =>
    callEndpoint<LabResultDto>('labResults.hold', { labResultId }, o),
  open: (labResultId: Guid, o?: Opts) =>
    callEndpoint<LabResultDto>('labResults.open', { labResultId }, o),
  saveResponse: (labResultId: Guid, body: SaveResultResponseRequest, o?: Opts) =>
    callEndpoint<LabResultDto>('labResults.saveResponse', { labResultId }, { ...o, body }),
  submitResponse: (labResultId: Guid, o?: Opts) =>
    callEndpoint<LabResultDto>('labResults.submitResponse', { labResultId }, o),
}

export const prescriptionsApi = {
  list: (caseId: Guid, f?: CandidateFilter) =>
    callEndpoint<PrescriptionDto[]>('prescriptions.list', { caseId }, filterQuery(f)),
  create: (caseId: Guid, body: SavePrescriptionRequest, o?: Opts) =>
    callEndpoint<PrescriptionDto>('prescriptions.create', { caseId }, { ...o, body }),
  update: (prescriptionId: Guid, body: SavePrescriptionRequest, o?: Opts) =>
    callEndpoint<PrescriptionDto>('prescriptions.update', { prescriptionId }, { ...o, body }),
  remove: (prescriptionId: Guid, o?: Opts) =>
    callEndpoint<void>('prescriptions.delete', { prescriptionId }, o),
}

export const referralsApi = {
  list: (caseId: Guid, f?: CandidateFilter) =>
    callEndpoint<ReferralDto[]>('referrals.list', { caseId }, filterQuery(f)),
  create: (caseId: Guid, body: SaveReferralRequest, o?: Opts) =>
    callEndpoint<ReferralDto>('referrals.create', { caseId }, { ...o, body }),
  update: (referralId: Guid, body: SaveReferralRequest, o?: Opts) =>
    callEndpoint<ReferralDto>('referrals.update', { referralId }, { ...o, body }),
  submit: (referralId: Guid, o?: Opts) =>
    callEndpoint<ReferralDto>('referrals.submit', { referralId }, o),
}

// ================================================================ v1.1 DRAFT

export const demographicsApi = {
  get: (caseId: Guid, f?: CandidateFilter) =>
    callEndpoint<DemographicsDto>('demographics.get', { caseId }, filterQuery(f)),
  save: (caseId: Guid, body: SaveDemographicsRequest, o?: Opts) =>
    callEndpoint<DemographicsDto>('demographics.save', { caseId }, { ...o, body }),
}

export const medicalConditionsApi = {
  list: (caseId: Guid, f?: CandidateFilter) =>
    callEndpoint<MedicalConditionDto[]>('conditions.list', { caseId }, filterQuery(f)),
  create: (caseId: Guid, body: SaveMedicalConditionRequest, o?: Opts) =>
    callEndpoint<MedicalConditionDto>('conditions.create', { caseId }, { ...o, body }),
  update: (conditionId: Guid, body: SaveMedicalConditionRequest, o?: Opts) =>
    callEndpoint<MedicalConditionDto>('conditions.update', { conditionId }, { ...o, body }),
  remove: (conditionId: Guid, o?: Opts) =>
    callEndpoint<void>('conditions.delete', { conditionId }, o),
}

export const familyHistoryApi = {
  list: (caseId: Guid, f?: CandidateFilter) =>
    callEndpoint<FamilyHistoryDto[]>('familyHistory.list', { caseId }, filterQuery(f)),
  create: (caseId: Guid, body: SaveFamilyHistoryRequest, o?: Opts) =>
    callEndpoint<FamilyHistoryDto>('familyHistory.create', { caseId }, { ...o, body }),
  update: (entryId: Guid, body: SaveFamilyHistoryRequest, o?: Opts) =>
    callEndpoint<FamilyHistoryDto>('familyHistory.update', { entryId }, { ...o, body }),
  remove: (entryId: Guid, o?: Opts) => callEndpoint<void>('familyHistory.delete', { entryId }, o),
}

export const vitalSignsApi = {
  list: (caseId: Guid, f?: CandidateFilter) =>
    callEndpoint<VitalSignsDto[]>('vitals.list', { caseId }, filterQuery(f)),
  create: (caseId: Guid, body: SaveVitalSignsRequest, o?: Opts) =>
    callEndpoint<VitalSignsDto>('vitals.create', { caseId }, { ...o, body }),
  update: (vitalSignsId: Guid, body: SaveVitalSignsRequest, o?: Opts) =>
    callEndpoint<VitalSignsDto>('vitals.update', { vitalSignsId }, { ...o, body }),
  remove: (vitalSignsId: Guid, o?: Opts) =>
    callEndpoint<void>('vitals.delete', { vitalSignsId }, o),
}

export const feedbackApi = {
  /** Candidate: own feedback once released; undefined (204) before release. */
  mine: (caseId: Guid, o?: Opts) =>
    callEndpoint<FeedbackDto | undefined>('feedback.mine', { caseId }, o),
  /** Educator: a candidate's feedback, draft or released. */
  get: (caseId: Guid, candidateId: Guid, o?: Opts) =>
    callEndpoint<FeedbackDto>('feedback.get', { caseId, candidateId }, o),
  save: (caseId: Guid, candidateId: Guid, body: SaveFeedbackRequest, o?: Opts) =>
    callEndpoint<FeedbackDto>('feedback.save', { caseId, candidateId }, { ...o, body }),
  release: (caseId: Guid, candidateId: Guid, o?: Opts) =>
    callEndpoint<FeedbackDto>('feedback.release', { caseId, candidateId }, o),
}
