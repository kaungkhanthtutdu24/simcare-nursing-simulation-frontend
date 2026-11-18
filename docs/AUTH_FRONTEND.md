# SimCare sign-in and sign-up frontend

## What was added

- `/login` has email and password fields and a link to registration.
- `/signup` asks for a full name, email, password confirmation, and a role. Student nurses (also called candidates in the code) enter a numeric student ID, such as `1686173`. Educators enter a staff ID.
- After registration or sign-in, a student nurse goes to `/candidate/dashboard` and an educator goes to `/educator/cases`. The header shows the account name and provides **Sign out**.
- Signed-out visitors are redirected to `/login`. The route guard shows an access-denied page if a signed-in user opens the other role's URL.
- Each registered student nurse gets a separate browser-local candidate workspace keyed by their student ID. The educator review list includes those local workspaces.

## Student registration rules (added 18 November 2026)

- Students must use an email matching `^[a-z0-9._%+-]+@students\.waikato\.ac\.nz$` after trimming and lower-casing. Educator demo accounts keep the generic email rule. The check is a format check only and does not verify ownership; the backend must add email verification before real use.
- Students also choose a nursing programme, year of study and course/paper (`src/student/programmes.ts`). The same validation (`src/student/validation.ts`) runs in the form and in `localAccounts.ts`, so a bypassed form cannot store an invalid student account.
- The student profile page can change only the name and programme details. `updateDemoProfile` never reads `role`, email or student ID from its input, so a student cannot give themselves educator permissions there.
- Profile fields are **demo-only**: they are stored with the browser-local demo account and are not sent anywhere.
- Accounts created earlier (no profile, any email) still sign in. The rule applies to new student registrations.
- Open decisions: confirm the provisional course-to-year mapping with the supervisor; decide whether public educator self-registration should be removed (this would change auth rules, so it has not been done); add server-side validation of the student email domain when backend registration exists.

## Current demo behavior

The ASP.NET backend currently has no authentication endpoints. These pages therefore use a **browser-only demonstration account store** in `src/auth/localAccounts.ts`. Account profiles and salted password hashes are kept in this browser's local storage; the active account ID is kept in session storage. Plaintext passwords are not saved. Accounts, patient entries, and educator reviews do not sync to teammates or other devices. The two original candidate workspaces remain for the existing demo case.

This local mechanism is **not a security boundary**. Someone with access to the browser can change its stored data, and the frontend cannot prove that a person is an educator. Use practice passwords and fictional patient information only.

## Backend work needed before shared use

1. Agree with the team on account fields and identity rules: name, email, student or staff ID, and role. Confirm the exact student ID format with the school; the current demo accepts 6–10 digits.
2. Add backend registration, sign-in, current-user, and sign-out endpoints. Store passwords using a server-side password hashing scheme and issue a secure session. Do not trust a role sent by the browser.
3. Decide how educator accounts are approved or provisioned. Public self-registration must not grant educator access in a real deployment.
4. Return the authenticated user's role and student identity from the backend. Replace `DemoSessionProvider` and `localAccounts.ts` with API-backed authentication and connect the existing `setAccessTokenProvider` hook if bearer tokens are chosen.
5. Enforce role permissions and student record isolation on **every backend endpoint**, including case viewing, notes, results, referrals, and feedback. Test with at least two students and one educator.
6. Migrate browser-local demo data only if the academic team explicitly wants it; it is fictional prototype data and is not a shared database.

## Quick manual check

1. Run `npm run dev` in `frontend/`, then open the Local URL.
2. Open **Create an account**, choose **Student nurse**, and register with a fictional name, a seven-digit ID, an email such as `test.student@students.waikato.ac.nz`, a programme, year and paper, and a practice password. Try `test@gmail.com` first and confirm the field shows the student-email error.
3. Confirm that the **Dashboard** opens and shows your programme, year and paper. Try `/educator/cases` and confirm that access is denied.
4. Sign out and sign in with the same email and password. Confirm that the student workspace opens again.
5. In the same browser, create a separate educator demo account and confirm that educator pages open while candidate pages are denied.
