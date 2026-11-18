# SimCare nursing simulation frontend

A React and TypeScript prototype for a simplified patient management system used in nursing simulation. It uses fictional sample data and is separate from the earlier static HTML mockup in `../nursing-simulation-ui`.

## Run it in VS Code

1. Open the `nursing-simulation-frontend` folder in VS Code.
2. Open **Terminal > New Terminal**.
3. Install Node.js if `node --version` does not work. Vite 8 requires Node.js 20.19+ or 22.12+.
4. Run `npm install` once, then `npm run dev`.
5. Open the Local URL printed in the terminal, usually `http://localhost:5173/`.
6. Keep the terminal open while using the app. Press Ctrl+C to stop.

The development environment used pnpm. If you have pnpm, `pnpm install` and `pnpm dev` also work.

### If `pnpm` is not found

You do not need to install pnpm globally. Run `npx pnpm install` once, then `npx pnpm dev`. Your terminal output showed that both commands worked and Vite started at `http://localhost:5173/`. Keep that terminal running while the page is open; entering `q` stops the server.

## Candidate screens

- **Dashboard (`/candidate/dashboard`):** the student home page. Shows the active case and the next step, progress through the six workflow steps, recent activity and the latest feedback. All of it is worked out from data the app already stores; activity has no timestamps yet, so it is listed in workflow order.
- **Profile (`/candidate/profile`):** edit full name, nursing programme, year of study and course/paper. Student ID, email and role are read-only.
- **Cases and overview:** open a published fictional case and review the scenario.
- **Demographics:** enter name, date of birth, address, and one or more self-described ethnicities.
- **Medical history:** add any number of conditions or classifications and family history entries.
- **Medications:** add any number of medicines with name, dose, route, frequency, indication, status, and notes. There is no fixed global catalogue.
- **Clinical notes:** enter subjective, objective, assessment, and plan (SOAP) text, then submit the note.
- **Inbox:** see an unread flag when an educator releases a result, open it, and submit a linked response. Opened and responded are separate states.
- **Referral:** complete a proforma with recipient, reason, clinical question, relevant history, findings, and requested action.
- **Vital signs:** add dated blood pressure, weight, heart rate, and temperature entries. A chronological table and first-to-latest weight change show trends.
- **Feedback:** read comments after educator release.

## Educator screens

- Edit and publish the fictional case.
- Prepare and release a result or correspondence item to candidate inboxes.
- Review each candidate's note, response, record entries, referral, and vital signs separately.
- Draft and release feedback to one candidate.

Candidate 01 and Candidate 02 remain as example browser-stored workspaces. Newly registered student nurses receive separate local workspaces keyed by student ID. Entries persist through browser local storage in the same browser.

## Demo sign-in and sign-up

The home page opens `/login` when signed out. Use `/signup` to create a **Student nurse** account or an **Educator demo account**.

- **Student nurse:** full name, student ID (6 to 10 digits, for example `1686173`), student email ending in `@students.waikato.ac.nz`, nursing programme, year of study, course/paper, and a practice password. The email is trimmed and lower-cased; only the format is checked, which does not prove the person owns the address. Year and course dropdowns depend on the programme and year, and reset when their parent changes. Errors appear beside each field and in a summary at the top.
- **Educator demo account:** full name, any valid email address, staff ID, and a practice password (unchanged).

Programme and paper data is in `src/student/programmes.ts`, taken from the University of Waikato website on 18 November 2026. Paper codes and titles are official; **which year each paper belongs to is provisional, pending supervisor approval** (the university pages do not state it). The form says so when a provisional list is shown. Accounts created before student profiles existed still sign in and are asked to complete their profile. Sign-in uses the registered email and password; the header has **Sign out**. The selected account role controls which section of the UI it can open.

These are **local demo accounts**, not server authentication. They are stored only in the browser, cannot be shared across machines, and do not establish real permissions. Educator self-registration is for demonstration only; the backend must approve educator accounts and enforce access before real use. See `docs/AUTH_FRONTEND.md` for the flow and backend handoff.

## Design sources

The requested tabs come from the nursing lecturer's 17 November 2026 message. The supplied _Medtech Evolution User Guide: Setup_ (August 2023) informed selected interface concepts: patient register ethnicity configuration (p. 128), diagnosis classification (p. 78), medication status (p. 77), outbox/referral setup (pp. 85, 90-92), inbox status and folders (pp. 93-94), and screening terms (p. 149). This project is an original simplified simulation interface, not a Medtech implementation.

## Boundaries

This is a frontend prototype. Demo sign-in is browser-local; there is no backend login, clinical API, PostgreSQL database, or server-enforced permission system. Browser local storage is unsuitable for real patient information. Do not enter real patient data. The sample result is placeholder text until the academic team supplies an approved fictional case.

Medicine, condition, ethnicity, route, and classification fields accept free text so users can record any appropriate fictional entry. No interface can responsibly claim to list every medication, ethnicity, or health condition worldwide. This prototype does not verify medicine doses or give clinical guidance. Clinical terminology catalogues, validation, and safety rules require separate academic and technical decisions.

## Routes

Routing uses React Router 7 (`src/routes/`). `case-1` is the case's fixed URL key; `SIM-1042` is the patient's Simulation ID (if an educator changes it, links use the new ID).

| URL                                                           | Screen                                             |
| ------------------------------------------------------------- | -------------------------------------------------- |
| `/`                                                           | Redirects to sign-in or the signed-in role's home  |
| `/login`                                                      | Demo sign-in                                       |
| `/signup`                                                     | Demo account registration                          |
| `/candidate`                                                  | Redirects to `/candidate/dashboard`                |
| `/candidate/dashboard`                                        | Student dashboard (home after sign-in)             |
| `/candidate/profile`                                          | Student profile                                    |
| `/candidate/cases`                                            | My cases (assigned cases)                          |
| `/candidate/cases/:caseId`                                    | Patient overview                                   |
| `/candidate/cases/:caseId/background`                         | Patient background                                 |
| `/candidate/cases/:caseId/consultation`                       | Redirects to the patient's clinical notes          |
| `/candidate/cases/:caseId/inbox`                              | Clinical inbox                                     |
| `/candidate/cases/:caseId/feedback`                           | Educator feedback                                  |
| `/candidate/cases/:caseId/patients/:patientId`                | Redirects to demographics                          |
| `/candidate/cases/:caseId/patients/:patientId/demographics`   | Demographics                                       |
| `/candidate/cases/:caseId/patients/:patientId/history`        | Medical and family history                         |
| `/candidate/cases/:caseId/patients/:patientId/medications`    | Medications                                        |
| `/candidate/cases/:caseId/patients/:patientId/clinical-notes` | SOAP clinical note (consultation)                  |
| `/candidate/cases/:caseId/patients/:patientId/referral`       | Referral                                           |
| `/candidate/cases/:caseId/patients/:patientId/vitals`         | Vital signs                                        |
| `/educator`                                                   | Educator dashboard; redirects to `/educator/cases` |
| `/educator/cases`                                             | Case management                                    |
| `/educator/cases/:caseId`                                     | Redirects to the case editor                       |
| `/educator/cases/:caseId/edit`                                | Case editor                                        |
| `/educator/cases/:caseId/release`                             | Event release                                      |
| `/educator/cases/:caseId/review`                              | Redirects to the last reviewed candidate           |
| `/educator/cases/:caseId/review/:candidateId`                 | Candidate's record, responses, and feedback        |
| anything else, or an unknown case, patient, or candidate ID   | 404 page                                           |

Example: `/candidate/cases/case-1/patients/SIM-1042/vitals`.

**Roles and access.** The role comes from the signed-in demo account. Each section is wrapped in `RequireRole`, which checks that account's role. This only shapes the interface and is **not security**: the backend must check every request.

**Hosting.** URLs are real paths, so the web server must return `index.html` for unknown paths (SPA fallback). `npm run dev` and `npm run preview` already do this.

## Backend API

The backend is the ASP.NET Core project in `../backend`. In development, Vite proxies `/api`, `/weatherforecast` and `/openapi` to `http://localhost:5035`, so start the backend with `dotnet run --launch-profile http` before using API features.

- **Current state:** the backend only has the scaffold sample `GET /weatherforecast`. No clinical endpoints exist yet, so every screen still uses the local demo data.
- **Typed client (`src/api/`):** the proposed requests for patients, cases, consultation notes, lab results, prescriptions and referrals are ready to use but are not called by the screens yet. Calling one today fails with a clear "not available on the backend yet" error.
- **Contract:** `docs/API_CONTRACT.md` lists the endpoints, shapes, error format and access rules for the backend team to implement.
- **Backend status page:** `/backend-status` (linked from the status bar) reads the backend's OpenAPI document and shows which proposed endpoints exist. This needs the backend running in Development.
- **Loading, error and empty states:** `src/components/AsyncState.tsx`, used with the `useApiResource` hook.
- **Switching to the API, one area at a time:** each area reads from demo data unless switched explicitly. Cases and patients switch with `VITE_CASES_SOURCE=api` in `.env.local` (restart `npm run dev`). In API mode the app loads `GET /api/cases` and `GET /api/cases/{id}`, saves edits with `PUT /api/patients/{id}` and `PUT /api/cases/{id}`, and publishes with `POST /api/cases/{id}/publish` or `/unpublish`, showing loading, error and empty states. Until those endpoints exist, API mode shows "Not available on the backend yet", so keep the default (`demo`). Notes, results, prescriptions, referrals and feedback still use demo data in both modes. The code is in `src/data/`.
- **Other origins:** to call a backend on another origin, set `VITE_API_BASE_URL` (see `.env.example`); the backend then needs CORS.

## Design system

- Colours, type scale, spacing and focus styles are CSS variables at the top of `src/index.css` (navy, teal and white). `src/styles.contrast.test.ts` checks that every text colour on a white background reaches WCAG AA (4.5:1); rules on navy or teal backgrounds and decorative icons are listed as exceptions in that test. Colour pairs on tinted backgrounds (for example warning text on the warning tint) are not checked automatically.
- Shared accessible components are in `src/components/ui/`: `TextField`, `SelectField` (label, hint, error and `aria-describedby` wiring), `ErrorSummary`, `Card`, `StatCard`, `StatusBadge`. Icons come from `lucide-react` and are always paired with a text label.
- Layout: full sidebar from 1200px, an icon rail from 768px, and a slide-out menu (Escape or backdrop closes it) below 768px. The case information panel becomes a collapsible "Case info" section below 1200px. A "Skip to main content" link appears on keyboard focus.

## Development checks

- `npm test`: Vitest and React Testing Library unit, component, routing and axe accessibility tests (`npm run test:watch` to re-run on save).
- `npm run build`: TypeScript compilation (app and tests) and Vite production bundle.
- `npm run lint`: Oxlint.
- `npm run format`: format all files with Prettier (`npm run format:check` only checks).

## Main files

- `src/main.tsx`: creates the router and the demo account provider.
- `src/routes/`: route table (`routes.tsx`), URL builders (`paths.ts`), the app shell and shared state (`AppLayout.tsx`, `appContext.ts`), route guards, and page wrappers.
- `src/auth/`: session type, local demo account store, and provider (to be replaced by backend authentication).
- `src/api/`: HTTP client and errors (`http.ts`), proposed API shapes (`contracts.ts`), endpoint catalogue (`endpoints.ts`), typed client functions (`clinical.ts`), mappers to the UI model (`mappers.ts`), backend status check (`backendStatus.ts`), and the `useApiResource` hook.
- `src/components/AsyncState.tsx`: loading, error and empty states.
- `src/data/`: data-source settings (`sources.ts`) and the cases and patients source (`useCases.ts`, demo or API).
- `src/model.ts`: typed records, demo data, and local storage migration.
- `src/components/`: shared layout pieces (title bar, ribbon, patient banner, sidebar, right panel, status bar), navigation config, and small building blocks (`PageHead`, `RepeatCard`).
- `src/views/NotFoundView.tsx`, `src/views/AccessDeniedView.tsx`: 404 and no-access pages.
- `src/views/candidate/`: cases, overview, consultation, inbox, feedback, and background screens.
- `src/views/record/`: demographics, history, medications, SOAP note, referral, and vital signs screens.
- `src/views/educator/`: case management, case editor, event release, and candidate review screens.
- `src/index.css`: visual design and responsive layout.
- `docs/`: API contract (`API_CONTRACT.md`), architecture/run guide and implementation report (Word documents).

## Backend integration order

1. Agree on API contracts for case, event, demographics, histories, medications, notes, referral, vitals, response, and feedback.
2. Replace local storage with API reads/writes plus loading and error states.
3. Replace browser-local demo accounts with backend authentication; let the C# backend determine role and candidate identity.
4. Enforce candidate isolation, publication state, event release, and feedback visibility on the backend.
5. Verify drafts, submissions, immutable review states, and two-candidate access with integration tests.
6. Replace placeholder content with academically approved fictional scenarios.
