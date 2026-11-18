# SimCare API contract (proposed)

**Status:** proposal for discussion between the frontend and backend teams. **None of these endpoints exist yet.** On 17 November 2026 the backend exposed only the scaffold sample `GET /WeatherForecast` (confirmed from `/openapi/v1.json`).

The frontend already has a typed client for everything below (`frontend/src/api/`). Until an endpoint exists, the screens keep using local demo data. The **Backend status** page (`/backend-status`, also linked from the status bar) reads the backend's OpenAPI document and shows which of these endpoints are implemented, so progress can be checked without guessing.

When the contract changes, update this file, `frontend/src/api/contracts.ts` (shapes) and `frontend/src/api/endpoints.ts` (paths) together.

## Frontend integration order

The frontend switches one area at a time, each behind an explicit setting, with demo data as the default.

| Area                                                 | Frontend setting        | Endpoints the frontend calls                                                                                                                                                      | Frontend status                          |
| ---------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Cases and patients                                   | `VITE_CASES_SOURCE=api` | `GET /api/cases`, `GET /api/cases/{caseId}`, `PUT /api/patients/{patientId}`, `PUT /api/cases/{caseId}`, `POST /api/cases/{caseId}/publish`, `POST /api/cases/{caseId}/unpublish` | Ready; waiting for the backend           |
| Lab results, notes, prescriptions, referrals         | not yet                 | see below                                                                                                                                                                         | Client functions only                    |
| Demographics, medical history, vital signs, feedback | not yet                 | see section 8 (v1.1 draft)                                                                                                                                                        | Client functions only; contract in draft |

Please implement the cases and patients endpoints first. Notes for that area:

- `GET /api/cases` returns `CaseSummaryDto[]`; the frontend then loads the selected case with `GET /api/cases/{caseId}`.
- Saving the case editor sends `PUT /api/patients/{patientId}` then `PUT /api/cases/{caseId}`. The frontend uses the `CaseDto` returned by the second call.
- Publishing sends any unsaved edits first, then `POST …/publish` or `…/unpublish`, and uses the returned `CaseDto`.
- A `409` with a ProblemDetails `detail` is shown in the editor, e.g. "This case cannot be published yet".

## 1. Conventions

| Topic          | Agreement                                                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Base path      | Every endpoint starts with `/api`. The Vite dev server proxies `/api` to `http://localhost:5035`.                                               |
| Format         | JSON request and response bodies (`application/json`).                                                                                          |
| Property names | camelCase (the ASP.NET Core default).                                                                                                           |
| IDs            | GUID strings. The patient's human-readable `simulationId` (e.g. `SIM-1042`) is a separate, unique field.                                        |
| Enums          | Strings, exactly as listed below (e.g. `"draft"`, `"condition-update"`). Suggested: `JsonStringEnumConverter(JsonNamingPolicy.KebabCaseLower)`. |
| Dates          | `DateOnly` as `"2026-11-17"`; timestamps as UTC `DateTimeOffset`, e.g. `"2026-11-17T02:30:00Z"`.                                                |
| Create         | `201 Created` with the created object in the body and a `Location` header.                                                                      |
| Update         | `PUT` replaces the editable fields and returns `200` with the updated object.                                                                   |
| Actions        | State changes (`publish`, `submit`, `release`, …) are `POST` to a sub-path and return `200` with the updated object.                            |
| Delete         | `204 No Content`.                                                                                                                               |
| Errors         | RFC 7807 `ProblemDetails` (`application/problem+json`). Suggested: `builder.Services.AddProblemDetails()`.                                      |

### Error responses the frontend handles

| Status | Meaning                                                                                     | Body                                                                                               |
| ------ | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `400`  | Validation failed                                                                           | `ValidationProblemDetails` with `errors: { "Field": ["message"] }` (the `[ApiController]` default) |
| `401`  | Not signed in                                                                               | ProblemDetails                                                                                     |
| `403`  | Signed in but not allowed (e.g. a candidate reading another candidate's work)               | ProblemDetails                                                                                     |
| `404`  | Resource does not exist                                                                     | ProblemDetails with a `title`, e.g. `"Case not found"`                                             |
| `409`  | Not allowed in the current state (e.g. editing a submitted note, editing a released result) | ProblemDetails with a `detail` the UI can show                                                     |
| `5xx`  | Server error                                                                                | ProblemDetails if possible                                                                         |

The frontend treats a **404 with no body** as "this route is not implemented yet" and a **404 with a ProblemDetails body** as "this record does not exist". Please return ProblemDetails from controllers for missing records (e.g. `return Problem(title: "Case not found", statusCode: 404)` or `NotFound(new ProblemDetails { ... })`), so the UI can tell the two apart.

## 2. Roles and access rules

These rules must be enforced **by the backend**. The frontend hides screens by role, but that is not security.

- Two roles: `candidate` and `educator`.
- A candidate's identity comes from the signed-in user, never from the request. Candidate endpoints must not accept a candidate ID from candidates.
- Educators may pass `?candidateId={id}` on list endpoints to read one candidate's work. Candidates who send it get `403`, or the parameter is ignored (team to decide).
- Candidates must never see another candidate's notes, prescriptions, referrals, or result responses.
- Candidates only see **published** cases and **released** results.
- Candidates cannot change cases, patients or results.
- Submitted notes, referrals and result responses are read-only (`409` on change).

## 3. Endpoints

`C` = candidate, `E` = educator.

### System

| Method | Path          | Roles | Response    |
| ------ | ------------- | ----- | ----------- |
| GET    | `/api/health` | any   | `HealthDto` |

Replaces the use of `/weatherforecast` as a connectivity check.

### Patients

| Method | Path                        | Roles | Request                | Response         |
| ------ | --------------------------- | ----- | ---------------------- | ---------------- |
| GET    | `/api/patients`             | E     |                        | `PatientDto[]`   |
| GET    | `/api/patients/{patientId}` | E, C* |                        | `PatientDto`     |
| POST   | `/api/patients`             | E     | `CreatePatientRequest` | `201 PatientDto` |
| PUT    | `/api/patients/{patientId}` | E     | `UpdatePatientRequest` | `PatientDto`     |

\* Candidates only for a patient in a published case.

### Cases

| Method | Path                            | Roles | Request             | Response                         |
| ------ | ------------------------------- | ----- | ------------------- | -------------------------------- |
| GET    | `/api/cases`                    | E, C* |                     | `CaseSummaryDto[]`               |
| GET    | `/api/cases/{caseId}`           | E, C* |                     | `CaseDto` (includes the patient) |
| POST   | `/api/cases`                    | E     | `CreateCaseRequest` | `201 CaseDto` (status `draft`)   |
| PUT    | `/api/cases/{caseId}`           | E     | `UpdateCaseRequest` | `CaseDto`                        |
| POST   | `/api/cases/{caseId}/publish`   | E     |                     | `CaseDto`                        |
| POST   | `/api/cases/{caseId}/unpublish` | E     |                     | `CaseDto`                        |

\* Candidates see published cases only; an unpublished case returns `404`.

### Consultation notes (SOAP)

| Method | Path                                      | Roles                        | Request                       | Response                                          |
| ------ | ----------------------------------------- | ---------------------------- | ----------------------------- | ------------------------------------------------- |
| GET    | `/api/cases/{caseId}/consultation-notes`  | C (own), E (`?candidateId=`) |                               | `ConsultationNoteDto[]`                           |
| POST   | `/api/cases/{caseId}/consultation-notes`  | C                            | `SaveConsultationNoteRequest` | `201 ConsultationNoteDto` (status `draft`)        |
| PUT    | `/api/consultation-notes/{noteId}`        | C (own draft)                | `SaveConsultationNoteRequest` | `ConsultationNoteDto`; `409` if submitted         |
| POST   | `/api/consultation-notes/{noteId}/submit` | C (own)                      |                               | `ConsultationNoteDto`; `409` if already submitted |

### Lab results (results and correspondence released to candidate inboxes)

| Method | Path                                             | Roles                      | Request                     | Response                                           |
| ------ | ------------------------------------------------ | -------------------------- | --------------------------- | -------------------------------------------------- |
| GET    | `/api/cases/{caseId}/lab-results`                | E (all), C (released only) |                             | `LabResultDto[]`                                   |
| POST   | `/api/cases/{caseId}/lab-results`                | E                          | `SaveLabResultRequest`      | `201 LabResultDto` (unreleased)                    |
| PUT    | `/api/lab-results/{labResultId}`                 | E                          | `SaveLabResultRequest`      | `LabResultDto`; `409` if released                  |
| POST   | `/api/lab-results/{labResultId}/release`         | E                          |                             | `LabResultDto`                                     |
| POST   | `/api/lab-results/{labResultId}/hold`            | E                          |                             | `LabResultDto` (withdrawn from inboxes)            |
| POST   | `/api/lab-results/{labResultId}/open`            | C                          |                             | `LabResultDto` with `candidateStatus.openedAt` set |
| PUT    | `/api/lab-results/{labResultId}/response`        | C                          | `SaveResultResponseRequest` | `LabResultDto`; `409` if submitted                 |
| POST   | `/api/lab-results/{labResultId}/response/submit` | C                          |                             | `LabResultDto`                                     |

For candidates, each `LabResultDto` includes `candidateStatus` with **that candidate's** opened time and response. "Opened" and "responded" are separate states.

**Decision needed:** in the current demo, releasing an item again resets every candidate's opened and response state. Please confirm whether the backend should do the same.

### Prescriptions (medicines a candidate records)

| Method | Path                                  | Roles                        | Request                   | Response              |
| ------ | ------------------------------------- | ---------------------------- | ------------------------- | --------------------- |
| GET    | `/api/cases/{caseId}/prescriptions`   | C (own), E (`?candidateId=`) |                           | `PrescriptionDto[]`   |
| POST   | `/api/cases/{caseId}/prescriptions`   | C                            | `SavePrescriptionRequest` | `201 PrescriptionDto` |
| PUT    | `/api/prescriptions/{prescriptionId}` | C (own)                      | `SavePrescriptionRequest` | `PrescriptionDto`     |
| DELETE | `/api/prescriptions/{prescriptionId}` | C (own)                      |                           | `204`                 |

All fields are free text. The backend must **not** check doses or give clinical guidance; that needs a separate academic decision.

### Referrals

| Method | Path                                 | Roles                        | Request               | Response                                                               |
| ------ | ------------------------------------ | ---------------------------- | --------------------- | ---------------------------------------------------------------------- |
| GET    | `/api/cases/{caseId}/referrals`      | C (own), E (`?candidateId=`) |                       | `ReferralDto[]`                                                        |
| POST   | `/api/cases/{caseId}/referrals`      | C                            | `SaveReferralRequest` | `201 ReferralDto` (status `draft`)                                     |
| PUT    | `/api/referrals/{referralId}`        | C (own draft)                | `SaveReferralRequest` | `ReferralDto`; `409` if submitted                                      |
| POST   | `/api/referrals/{referralId}/submit` | C (own)                      |                       | `ReferralDto`; requires `recipient` and `clinicalQuestion`, else `400` |

## 4. Data shapes

These are the TypeScript types in `frontend/src/api/contracts.ts`. `?` marks an optional field. `| null` means the field is always present but may be `null`.

```ts
type Guid = string // "3fa85f64-5717-4562-b3fc-2c963f66afa6"
type IsoDate = string // "2026-11-17"
type IsoDateTime = string // "2026-11-17T02:30:00Z"

interface HealthDto {
  status: 'ok'
  version?: string
}

interface PatientDto {
  id: Guid
  simulationId: string // "SIM-1042", unique
  fullName: string
  ageYears: number
  pronouns: string
  communicationContext: string
  pastHistory: string
  baselineMedicines: string
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
}
// CreatePatientRequest = UpdatePatientRequest = PatientDto without id, createdAt, updatedAt

type CaseStatus = 'draft' | 'published'

interface CaseSummaryDto {
  id: Guid
  title: string
  status: CaseStatus
  patientId: Guid
  patientName: string
  patientSimulationId: string
  updatedAt: IsoDateTime
}

interface CaseDto {
  id: Guid
  title: string // "Follow-up consultation"
  openingBrief: string
  status: CaseStatus
  patient: PatientDto
  publishedAt: IsoDateTime | null
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
}
interface CreateCaseRequest {
  title: string
  openingBrief: string
  patientId: Guid
} // = UpdateCaseRequest

type SubmissionStatus = 'draft' | 'submitted'

interface ConsultationNoteDto {
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
interface SaveConsultationNoteRequest {
  subjective: string
  objective: string
  assessment: string
  plan: string
}

type ResultType = 'laboratory' | 'radiology' | 'correspondence' | 'condition-update'

interface LabResultDto {
  id: Guid
  caseId: Guid
  title: string
  resultType: ResultType
  content: string
  released: boolean
  releasedAt: IsoDateTime | null
  candidateStatus?: {
    // candidate requests only
    openedAt: IsoDateTime | null
    response: string
    responseSubmittedAt: IsoDateTime | null
  }
}
interface SaveLabResultRequest {
  title: string
  resultType: ResultType
  content: string
}
interface SaveResultResponseRequest {
  response: string
}

interface PrescriptionDto {
  id: Guid
  caseId: Guid
  candidateId: Guid
  medicineName: string
  dose: string
  route: string
  frequency: string
  indication: string
  status: string
  notes: string // all free text
  updatedAt: IsoDateTime
}
// SavePrescriptionRequest = medicineName, dose, route, frequency, indication, status, notes

interface ReferralDto {
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
// SaveReferralRequest = recipient, reasonOrPriority, clinicalQuestion, relevantHistory, investigations, requestedAction
```

### Example: `GET /api/cases/{caseId}`

```json
{
  "id": "6b1f0f8e-3c1a-4f0e-9b7a-2f4d6a1c9e10",
  "title": "Follow-up consultation",
  "openingBrief": "Review the fictional patient background, document the consultation, and explain your next steps.",
  "status": "published",
  "patient": {
    "id": "0d6c2b54-8a7e-4f1b-a1f3-5b9e2c7d4a11",
    "simulationId": "SIM-1042",
    "fullName": "Aroha Williams",
    "ageYears": 54,
    "pronouns": "She / her",
    "communicationContext": "Would like whānau present for important discussions.",
    "pastHistory": "Fictional clinical history for the approved teaching case will be added here.",
    "baselineMedicines": "No baseline medicines documented in this sample.",
    "createdAt": "2026-11-17T01:00:00Z",
    "updatedAt": "2026-11-17T01:00:00Z"
  },
  "publishedAt": "2026-11-17T01:05:00Z",
  "createdAt": "2026-11-17T01:00:00Z",
  "updatedAt": "2026-11-17T01:05:00Z"
}
```

### Suggested C# shape (for reference only)

```csharp
// Services/Shared/DTOs/ConsultationNoteDto.cs
public enum SubmissionStatus { Draft, Submitted }   // serialised as "draft" / "submitted"

public sealed record ConsultationNoteDto(
    Guid Id, Guid CaseId, Guid CandidateId,
    string Subjective, string Objective, string Assessment, string Plan,
    SubmissionStatus Status, DateTimeOffset? SubmittedAt, DateTimeOffset UpdatedAt);

// Program.cs
builder.Services.AddControllers().AddJsonOptions(o =>
    o.JsonSerializerOptions.Converters.Add(
        new JsonStringEnumConverter(JsonNamingPolicy.KebabCaseLower)));
builder.Services.AddProblemDetails();
```

## 5. Demo data

The demo case below should be seeded so the frontend can switch over without losing content:

- One case, "Follow-up consultation", status `published`, with patient `SIM-1042` Aroha Williams (54, She / her). The exact text is in `frontend/src/model.ts` (`initialDemoState`).
- One lab result, "Follow-up report", type `laboratory`, released, with placeholder content.
- Two candidate accounts and one educator account (README "First Deliverable").

All data must stay fictional.

## 6. Local development notes

- Frontend: `http://localhost:5174` (Vite). Backend: `http://localhost:5035` (`dotnet run --launch-profile http`).
- The Vite proxy forwards `/api`, `/weatherforecast` and `/openapi` to the backend, so the browser stays on one origin and CORS is not needed in development.
- Run the backend with the **http** profile. With the **https** profile, `app.UseHttpsRedirection()` redirects proxied requests to `https://localhost:7268`, which the browser treats as another origin, and the calls fail.
- Keep `app.MapOpenApi()` enabled in Development; the Backend status page depends on it.
- A deployed frontend can call a separate backend origin by setting `VITE_API_BASE_URL` at build time; that setup would need CORS on the backend.

## 7. Open decisions

1. **Authentication:** cookie or bearer token, and how role and candidate identity are issued. The frontend has a hook for a bearer token (`setAccessTokenProvider` in `src/api/http.ts`).
2. **Assignment:** do candidates see all published cases or only cases assigned to them?
3. **One or many:** the UI currently keeps one SOAP note and one referral per candidate per case. The API allows several. Confirm whether to restrict to one.
4. **Release reset:** should re-releasing a result reset candidates' opened and response state (current demo behaviour)?
5. **Candidate-entered record:** demographics, medical and family history, and vital signs are now drafted as v1.1 in section 8.
6. **Feedback:** now drafted as v1.1 in section 8.

## 8. Draft v1.1: candidate-entered record and feedback

**Status:** draft for a second review, after v1 is agreed. Nothing here is implemented. The TypeScript types are at the end of `frontend/src/api/contracts.ts`; the endpoints are marked `version: 'v1.1'` in `frontend/src/api/endpoints.ts` and labelled "v1.1 draft" on the Backend status page.

All records in this section belong to **one candidate and one case**. The same rules as section 2 apply: candidates only see and change their own records; educators read a candidate's records with `?candidateId=`; the backend takes the candidate's identity from the login. Every text field is free text. The backend stores what candidates enter and does not judge whether it is clinically correct.

### Demographics (one record per candidate per case)

| Method | Path                               | Roles                        | Request                   | Response          |
| ------ | ---------------------------------- | ---------------------------- | ------------------------- | ----------------- |
| GET    | `/api/cases/{caseId}/demographics` | C (own), E (`?candidateId=`) |                           | `DemographicsDto` |
| PUT    | `/api/cases/{caseId}/demographics` | C                            | `SaveDemographicsRequest` | `DemographicsDto` |

- If the candidate has not saved anything yet, `GET` returns an empty record (text fields `""`, `dateOfBirth: null`, `updatedAt: null`) rather than `404`, so the form can open straight away.
- `PUT` creates or replaces the record (an upsert).
- `ethnicities` is the patient's own description, as free text that can list several. Do not impose a fixed list.

```ts
interface DemographicsDto {
  caseId: Guid
  candidateId: Guid
  fullName: string
  dateOfBirth: IsoDate | null
  address: string // fictional, free text
  ethnicities: string // self-described, free text
  updatedAt: IsoDateTime | null
}
// SaveDemographicsRequest = fullName, dateOfBirth, address, ethnicities
```

### Medical history: conditions and family history

| Method | Path                                     | Roles                        | Request                       | Response                  |
| ------ | ---------------------------------------- | ---------------------------- | ----------------------------- | ------------------------- |
| GET    | `/api/cases/{caseId}/medical-conditions` | C (own), E (`?candidateId=`) |                               | `MedicalConditionDto[]`   |
| POST   | `/api/cases/{caseId}/medical-conditions` | C                            | `SaveMedicalConditionRequest` | `201 MedicalConditionDto` |
| PUT    | `/api/medical-conditions/{conditionId}`  | C (own)                      | `SaveMedicalConditionRequest` | `MedicalConditionDto`     |
| DELETE | `/api/medical-conditions/{conditionId}`  | C (own)                      |                               | `204`                     |
| GET    | `/api/cases/{caseId}/family-history`     | C (own), E (`?candidateId=`) |                               | `FamilyHistoryDto[]`      |
| POST   | `/api/cases/{caseId}/family-history`     | C                            | `SaveFamilyHistoryRequest`    | `201 FamilyHistoryDto`    |
| PUT    | `/api/family-history/{entryId}`          | C (own)                      | `SaveFamilyHistoryRequest`    | `FamilyHistoryDto`        |
| DELETE | `/api/family-history/{entryId}`          | C (own)                      |                               | `204`                     |

Lists return entries in the order they were added.

```ts
interface MedicalConditionDto {
  id: Guid
  caseId: Guid
  candidateId: Guid
  condition: string // e.g. "Type 2 diabetes"
  classification: string // optional code or classification, free text; no coding system enforced
  onset: string // free text, e.g. "2019"
  status: string // free text, e.g. "Active", "Resolved"
  notes: string
  updatedAt: IsoDateTime
}
// SaveMedicalConditionRequest = condition, classification, onset, status, notes

interface FamilyHistoryDto {
  id: Guid
  caseId: Guid
  candidateId: Guid
  relationship: string // e.g. "Mother"
  condition: string
  notes: string
  updatedAt: IsoDateTime
}
// SaveFamilyHistoryRequest = relationship, condition, notes
```

### Vital signs

| Method | Path                              | Roles                        | Request                 | Response                                     |
| ------ | --------------------------------- | ---------------------------- | ----------------------- | -------------------------------------------- |
| GET    | `/api/cases/{caseId}/vital-signs` | C (own), E (`?candidateId=`) |                         | `VitalSignsDto[]`, oldest `recordedOn` first |
| POST   | `/api/cases/{caseId}/vital-signs` | C                            | `SaveVitalSignsRequest` | `201 VitalSignsDto`                          |
| PUT    | `/api/vital-signs/{vitalSignsId}` | C (own)                      | `SaveVitalSignsRequest` | `VitalSignsDto`                              |
| DELETE | `/api/vital-signs/{vitalSignsId}` | C (own)                      |                         | `204`                                        |

- Measurements are **numbers** with the unit in the field name. Each is `null` when not recorded.
- `recordedOn` is required. Return `400` with field errors if it is missing, or if a number is negative or not a number.
- Do not reject values as clinically abnormal. Range checks would need a separate academic decision.
- The weight trend shown in the UI is calculated by the frontend from this list.

```ts
interface VitalSignsDto {
  id: Guid
  caseId: Guid
  candidateId: Guid
  recordedOn: IsoDate
  systolicMmHg: number | null
  diastolicMmHg: number | null
  weightKg: number | null // one decimal place
  heartRateBpm: number | null
  temperatureC: number | null // one decimal place
  updatedAt: IsoDateTime
}
// SaveVitalSignsRequest = recordedOn, systolicMmHg, diastolicMmHg, weightKg, heartRateBpm, temperatureC
```

C# suggestion: `DateOnly RecordedOn`, `int? SystolicMmHg`, `int? DiastolicMmHg`, `decimal? WeightKg`, `int? HeartRateBpm`, `decimal? TemperatureC`.

### Feedback (one per candidate per case)

| Method | Path                                                            | Roles | Request               | Response                                                          |
| ------ | --------------------------------------------------------------- | ----- | --------------------- | ----------------------------------------------------------------- |
| GET    | `/api/cases/{caseId}/feedback/mine`                             | C     |                       | `FeedbackDto` when released; `204 No Content` before release      |
| GET    | `/api/cases/{caseId}/candidates/{candidateId}/feedback`         | E     |                       | `FeedbackDto` (draft or released; empty draft if none yet)        |
| PUT    | `/api/cases/{caseId}/candidates/{candidateId}/feedback`         | E     | `SaveFeedbackRequest` | `FeedbackDto` with status `draft`                                 |
| POST   | `/api/cases/{caseId}/candidates/{candidateId}/feedback/release` | E     |                       | `FeedbackDto` with status `released`; `400` if comments are empty |

- Candidates must never see draft feedback. Before release, `…/feedback/mine` returns `204` (in ASP.NET Core, `return NoContent();`), not the draft and not `404`.
- Feedback uses a candidate path segment instead of `?candidateId=`, because an educator always writes it _for_ a specific candidate.
- **Matches the current demo:** saving feedback that was already released (`PUT`) moves it back to `draft` and hides it from the candidate until it is released again.

```ts
type FeedbackStatus = 'draft' | 'released'

interface FeedbackDto {
  caseId: Guid
  candidateId: Guid
  comments: string
  status: FeedbackStatus
  releasedAt: IsoDateTime | null
  updatedAt: IsoDateTime | null
}
interface SaveFeedbackRequest {
  comments: string
}
```

### Decisions for v1.1

1. **Editing released feedback:** move it back to draft (current demo, proposed above), or keep it visible and update it in place, or block edits with `409`?
2. **Locking:** should the candidate's record (demographics, history, vitals) become read-only at some point, for example when the consultation note is submitted? The demo never locks it.
3. **Pre-filled name:** the demo pre-fills the demographics name with the case patient's name. Should the empty `GET` response do the same, or should the frontend fill it in?
4. **Vital sign units:** are mmHg, kg, bpm and °C enough, or do cases need others (e.g. respiratory rate, SpO₂)? Adding fields later is backwards compatible.
5. **Candidate IDs:** the demo uses `candidate-01` and `candidate-02`; the API uses GUIDs from the login. The mapping is part of the authentication work.
