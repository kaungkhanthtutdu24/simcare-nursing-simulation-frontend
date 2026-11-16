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

Candidate 01 and Candidate 02 have independent browser-stored workspaces. The top-right role switch and candidate selector exist for demonstration only. Entries persist through browser local storage in the same browser.

## Design sources

The requested tabs come from the nursing lecturer's 17 November 2026 message. The supplied _Medtech Evolution User Guide: Setup_ (August 2023) informed selected interface concepts: patient register ethnicity configuration (p. 128), diagnosis classification (p. 78), medication status (p. 77), outbox/referral setup (pp. 85, 90-92), inbox status and folders (pp. 93-94), and screening terms (p. 149). This project is an original simplified simulation interface, not a Medtech implementation.

## Boundaries

This is a frontend prototype. There is no real login, server, API, PostgreSQL database, or server-enforced permission system. Browser local storage is unsuitable for real patient information. Do not enter real patient data. The sample result is placeholder text until the academic team supplies an approved fictional case.

Medicine, condition, ethnicity, route, and classification fields accept free text so users can record any appropriate fictional entry. No interface can responsibly claim to list every medication, ethnicity, or health condition worldwide. This prototype does not verify medicine doses or give clinical guidance. Clinical terminology catalogues, validation, and safety rules require separate academic and technical decisions.

## Development checks

- `npm run build`: TypeScript compilation and Vite production bundle.
- `npm run lint`: Oxlint.
- `npm run format`: format all files with Prettier (`npm run format:check` only checks).

## Main files

- `src/App.tsx`: application state, role switch, and page layout.
- `src/model.ts`: typed records, demo data, and local storage migration.
- `src/components/`: shared layout pieces (title bar, ribbon, patient banner, sidebar, right panel, status bar), navigation config, and small building blocks (`PageHead`, `RepeatCard`).
- `src/views/CandidateRouter.tsx` and `src/views/EducatorRouter.tsx`: choose the screen for the current view.
- `src/views/candidate/`: cases, overview, consultation, inbox, feedback, and background screens.
- `src/views/record/`: demographics, history, medications, SOAP note, referral, and vital signs screens.
- `src/views/educator/`: case management, case editor, event release, and candidate review screens.
- `src/index.css`: visual design and responsive layout.
- `docs/`: architecture/run guide and implementation report (Word documents).

## Backend integration order

1. Agree on API contracts for case, event, demographics, histories, medications, notes, referral, vitals, response, and feedback.
2. Replace local storage with API reads/writes plus loading and error states.
3. Add authentication; let the C# backend determine role and candidate identity.
4. Enforce candidate isolation, publication state, event release, and feedback visibility on the backend.
5. Verify drafts, submissions, immutable review states, and two-candidate access with integration tests.
6. Replace placeholder content with academically approved fictional scenarios.
