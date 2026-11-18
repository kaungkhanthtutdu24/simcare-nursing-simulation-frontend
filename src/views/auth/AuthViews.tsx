import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { GraduationCap, ShieldCheck, Stethoscope } from 'lucide-react'
import { useAuth } from '../../auth/session'
import { ErrorSummary } from '../../components/ui/ErrorSummary'
import type { FieldError } from '../../components/ui/ErrorSummary'
import { TextField } from '../../components/ui/Field'
import type { Role } from '../../model'
import { paths, roleHome } from '../../routes/paths'
import { ProgrammeFields } from '../../student/StudentProfileFields'
import { emptySelection } from '../../student/selection'
import type { ProgrammeSelection } from '../../student/selection'
import {
  validateEducatorEmail,
  validateFullName,
  validateStudentProfile,
} from '../../student/validation'

function AuthShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="auth-page">
      <section className="auth-intro" aria-label="About SimCare">
        <div className="auth-brand">
          <span className="brand-mark" aria-hidden="true">
            <Stethoscope size={20} />
          </span>
          <strong>SimCare</strong>
        </div>
        <p className="auth-eyebrow">University of Waikato · Nursing simulation</p>
        <h1>A safe place to practise clinical decisions.</h1>
        <p>
          Work through fictional patient cases, document your reasoning, and receive educator
          feedback in one learning workspace.
        </p>
        <ul className="auth-points">
          <li>
            <GraduationCap aria-hidden="true" size={18} /> Built for BNurs and MNursPrac students
          </li>
          <li>
            <ShieldCheck aria-hidden="true" size={18} /> Fictional patient data only
          </li>
        </ul>
      </section>
      <main className="auth-main">
        <div className="auth-card">
          <h2>{title}</h2>
          <p className="auth-description">{description}</p>
          {children}
          <p className="auth-demo-note">
            <strong>Demo only.</strong> Accounts and profiles are saved only in this browser. Use a
            practice password and fictional patient information. The backend will need to verify
            accounts and roles before real use.
          </p>
        </div>
      </main>
    </div>
  )
}

function StoreError({ message }: { message: string }) {
  return message ? (
    <div className="auth-error" role="alert">
      {message}
    </div>
  ) : null
}

export function SignInView() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={roleHome(user.role)} replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const session = await signIn(email, password)
      navigate(roleHome(session.role), { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sign in.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell title="Sign in" description="Continue to your student nurse or educator workspace.">
      <form className="auth-form" onSubmit={submit} noValidate>
        <TextField
          id="login-email"
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          id="login-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <StoreError message={error} />
        <button className="primary-button auth-submit" disabled={busy} type="submit">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="auth-link-row">
        New to SimCare? <Link to={paths.signUp}>Create an account</Link>
      </p>
    </AuthShell>
  )
}

type SignUpField =
  | 'name'
  | 'email'
  | 'institutionId'
  | 'programme'
  | 'yearOfStudy'
  | 'paperCode'
  | 'password'
  | 'confirmPassword'

interface SignUpValues extends ProgrammeSelection {
  name: string
  email: string
  institutionId: string
  password: string
  confirmPassword: string
}

const fieldIds: Record<SignUpField, string> = {
  name: 'signup-name',
  institutionId: 'signup-id',
  email: 'signup-email',
  programme: 'signup-programme',
  yearOfStudy: 'signup-year',
  paperCode: 'signup-paper',
  password: 'signup-password',
  confirmPassword: 'signup-confirm',
}

const fieldOrder = Object.keys(fieldIds) as SignUpField[]

const staffIdPattern = /^[a-zA-Z0-9-]{3,20}$/

/** Every problem with the form, for the chosen account type. */
function validateSignUp(role: Role, v: SignUpValues): Partial<Record<SignUpField, string>> {
  const errors: Partial<Record<SignUpField, string>> = {}
  if (role === 'candidate') {
    const student = validateStudentProfile({
      name: v.name,
      email: v.email,
      studentId: v.institutionId,
      programme: v.programme,
      yearOfStudy: v.yearOfStudy,
      paperCode: v.paperCode,
    })
    Object.assign(errors, {
      name: student.name,
      email: student.email,
      institutionId: student.studentId,
      programme: student.programme,
      yearOfStudy: student.yearOfStudy,
      paperCode: student.paperCode,
    })
  } else {
    errors.name = validateFullName(v.name) ?? undefined
    errors.email = validateEducatorEmail(v.email) ?? undefined
    if (!staffIdPattern.test(v.institutionId.trim())) {
      errors.institutionId = 'Staff ID must contain 3 to 20 letters, numbers, or hyphens.'
    }
  }
  if (v.password.length < 8) errors.password = 'Password must have at least 8 characters.'
  if (v.confirmPassword !== v.password) errors.confirmPassword = 'Passwords do not match.'
  for (const key of fieldOrder) if (!errors[key]) delete errors[key]
  return errors
}

const emptyValues: SignUpValues = {
  ...emptySelection,
  name: '',
  email: '',
  institutionId: '',
  password: '',
  confirmPassword: '',
}

export function SignUpView() {
  const { user, signUp } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('candidate')
  const [values, setValues] = useState<SignUpValues>(emptyValues)
  const [touched, setTouched] = useState<Set<SignUpField>>(new Set())
  const [summary, setSummary] = useState<FieldError[]>([])
  const [storeError, setStoreError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={roleHome(user.role)} replace />

  const errors = validateSignUp(role, values)
  const shown = (field: SignUpField) => (touched.has(field) ? errors[field] : undefined)
  const touch = (field: SignUpField) => setTouched((prev) => new Set(prev).add(field))
  const set = (field: SignUpField) => (e: { target: { value: string } }) =>
    setValues((prev) => ({ ...prev, [field]: e.target.value }))

  function chooseRole(next: Role) {
    setRole(next)
    setValues((prev) => ({ ...prev, ...emptySelection, institutionId: '', email: '' }))
    setTouched(new Set())
    setSummary([])
    setStoreError('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStoreError('')
    const problems = fieldOrder
      .filter((field) => errors[field])
      .map((field) => ({ fieldId: fieldIds[field], message: errors[field]! }))
    setTouched(new Set(fieldOrder))
    setSummary(problems)
    if (problems.length > 0) return

    setBusy(true)
    try {
      const session = await signUp({
        role,
        name: values.name,
        email: values.email,
        institutionId: values.institutionId,
        password: values.password,
        ...(role === 'candidate'
          ? {
              profile: {
                programme: values.programme,
                yearOfStudy: Number(values.yearOfStudy),
                paperCode: values.paperCode,
              },
            }
          : {}),
      })
      navigate(roleHome(session.role), { replace: true })
    } catch (cause) {
      setStoreError(cause instanceof Error ? cause.message : 'Could not create your account.')
    } finally {
      setBusy(false)
    }
  }

  const student = role === 'candidate'

  return (
    <AuthShell
      title="Create an account"
      description="Choose how you will use the nursing simulation."
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        <ErrorSummary errors={summary} />
        <fieldset className="auth-role-fieldset">
          <legend>Account type</legend>
          <div className="auth-role-options">
            <label className={`auth-role-option ${student ? 'selected' : ''}`}>
              <input
                type="radio"
                name="role"
                value="candidate"
                checked={student}
                onChange={() => chooseRole('candidate')}
              />
              <span>
                <strong>Student nurse</strong>
                <small>Complete cases and receive feedback</small>
              </span>
            </label>
            <label className={`auth-role-option ${!student ? 'selected' : ''}`}>
              <input
                type="radio"
                name="role"
                value="educator"
                checked={!student}
                onChange={() => chooseRole('educator')}
              />
              <span>
                <strong>Educator demo account</strong>
                <small>Prepare cases and review students</small>
              </span>
            </label>
          </div>
        </fieldset>

        <TextField
          id={fieldIds.name}
          label="Full name"
          autoComplete="name"
          required
          value={values.name}
          error={shown('name')}
          onChange={set('name')}
          onBlur={() => touch('name')}
        />
        <TextField
          id={fieldIds.institutionId}
          label={student ? 'Student ID' : 'Staff ID'}
          hint={student ? '6 to 10 digits, for example 1686173' : 'For example EDU-102'}
          inputMode={student ? 'numeric' : 'text'}
          autoComplete="off"
          required
          value={values.institutionId}
          error={shown('institutionId')}
          onChange={set('institutionId')}
          onBlur={() => touch('institutionId')}
        />
        <TextField
          id={fieldIds.email}
          label={student ? 'Student email' : 'Email address'}
          hint={
            student ? (
              <>
                Use your university address, for example{' '}
                <span className="nowrap">username@students.waikato.ac.nz</span>.{' '}
                <span>
                  We check the format only. This does not verify that you own the address.
                </span>
              </>
            ) : undefined
          }
          type="email"
          autoComplete="email"
          required
          value={values.email}
          error={shown('email')}
          onChange={set('email')}
          onBlur={() => touch('email')}
        />

        {student && (
          <ProgrammeFields
            idPrefix="signup"
            value={values}
            errors={{
              programme: shown('programme'),
              yearOfStudy: shown('yearOfStudy'),
              paperCode: shown('paperCode'),
            }}
            onChange={(selection) => setValues((prev) => ({ ...prev, ...selection }))}
            onBlurField={touch}
          />
        )}

        <TextField
          id={fieldIds.password}
          label="Password"
          hint="At least 8 characters. Use a practice password for this demo."
          type="password"
          autoComplete="new-password"
          required
          value={values.password}
          error={shown('password')}
          onChange={set('password')}
          onBlur={() => touch('password')}
        />
        <TextField
          id={fieldIds.confirmPassword}
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          value={values.confirmPassword}
          error={shown('confirmPassword')}
          onChange={set('confirmPassword')}
          onBlur={() => touch('confirmPassword')}
        />
        <StoreError message={storeError} />
        <button className="primary-button auth-submit" disabled={busy} type="submit">
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="auth-link-row">
        Already have an account? <Link to={paths.signIn}>Sign in</Link>
      </p>
    </AuthShell>
  )
}
