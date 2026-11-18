import { useState } from 'react'
import type { FormEvent } from 'react'
import { Info } from 'lucide-react'
import { useAuth, useSession } from '../../auth/session'
import { PageHead } from '../../components/PageHead'
import { Card } from '../../components/ui/Card'
import { ErrorSummary } from '../../components/ui/ErrorSummary'
import type { FieldError } from '../../components/ui/ErrorSummary'
import { TextField } from '../../components/ui/Field'
import { useApp } from '../../routes/appContext'
import { ProgrammeFields } from '../../student/StudentProfileFields'
import { emptySelection } from '../../student/selection'
import type { ProgrammeSelection } from '../../student/selection'
import { validateStudentEmail, validateStudentProfile } from '../../student/validation'
import type { StudentProfileErrors } from '../../student/validation'

type EditableField = 'name' | keyof ProgrammeSelection

const fieldIds: Record<EditableField, string> = {
  name: 'profile-name',
  programme: 'profile-programme',
  yearOfStudy: 'profile-year',
  paperCode: 'profile-paper',
}
const fieldOrder = Object.keys(fieldIds) as EditableField[]

/**
 * A student's own details. Name and programme can be edited; student ID,
 * email and role cannot, because they identify the account and its permissions.
 */
export function ProfileView() {
  const session = useSession()
  const { updateProfile } = useAuth()
  const { notify } = useApp()
  const [name, setName] = useState(session.name)
  const [selection, setSelection] = useState<ProgrammeSelection>(
    session.profile
      ? {
          programme: session.profile.programme,
          yearOfStudy: String(session.profile.yearOfStudy),
          paperCode: session.profile.paperCode,
        }
      : emptySelection,
  )
  const [touched, setTouched] = useState<Set<EditableField>>(new Set())
  const [summary, setSummary] = useState<FieldError[]>([])
  const [saveError, setSaveError] = useState('')
  const [busy, setBusy] = useState(false)

  const errors: StudentProfileErrors = validateStudentProfile(
    { name, email: session.email, studentId: session.institutionId, ...selection },
    { requireIdentity: false },
  )
  const shown = (field: EditableField) => (touched.has(field) ? errors[field] : undefined)
  const touch = (field: EditableField) => setTouched((prev) => new Set(prev).add(field))
  const legacyEmail = validateStudentEmail(session.email) !== null

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaveError('')
    const problems = fieldOrder
      .filter((field) => errors[field])
      .map((field) => ({ fieldId: fieldIds[field], message: errors[field]! }))
    setTouched(new Set(fieldOrder))
    setSummary(problems)
    if (problems.length > 0) return

    setBusy(true)
    try {
      await updateProfile({
        name,
        profile: {
          programme: selection.programme,
          yearOfStudy: Number(selection.yearOfStudy),
          paperCode: selection.paperCode,
        },
      })
      notify('Profile saved.')
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : 'Could not save your profile.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHead
        title="Student profile"
        description="Keep your programme details up to date so your educator knows your course."
        breadcrumb={['My learning', 'Profile']}
      />
      <form className="profile-form" onSubmit={submit} noValidate>
        <ErrorSummary errors={summary} />
        <div className="profile-grid">
          <Card title="Account details">
            <TextField
              id="profile-student-id"
              label="Student ID"
              value={session.institutionId}
              readOnly
            />
            <TextField
              id="profile-email"
              label="Student email"
              value={session.email}
              readOnly
              hint={
                legacyEmail
                  ? 'This demo account was created before student emails were required. New student accounts must use @students.waikato.ac.nz.'
                  : 'Your email and student ID identify your account and cannot be changed here.'
              }
            />
            <TextField
              id={fieldIds.name}
              label="Full name"
              autoComplete="name"
              required
              value={name}
              error={shown('name')}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => touch('name')}
            />
          </Card>

          <Card title="Programme">
            {!session.profile && (
              <p className="ui-note">
                <Info aria-hidden="true" size={16} />
                <span>
                  Programme details: Not set. Choose your programme, year and course to complete
                  your profile.
                </span>
              </p>
            )}
            <ProgrammeFields
              idPrefix="profile"
              value={selection}
              errors={{
                programme: shown('programme'),
                yearOfStudy: shown('yearOfStudy'),
                paperCode: shown('paperCode'),
              }}
              onChange={setSelection}
              onBlurField={touch}
            />
          </Card>
        </div>

        {saveError && (
          <div className="auth-error" role="alert">
            {saveError}
          </div>
        )}
        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save profile'}
          </button>
        </div>
        <p className="demo-note">
          <Info aria-hidden="true" size={16} />
          <span>
            Demo only: your profile is stored only in this browser with your demo account. It is not
            sent to the university or shared with other devices.
          </span>
        </p>
      </form>
    </>
  )
}
