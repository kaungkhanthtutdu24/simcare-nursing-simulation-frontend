import type { CandidateId, Role } from '../model'
import {
  validateEducatorEmail,
  validateStudentProfile,
  normaliseEmail,
} from '../student/validation'
import type { StudentProfileErrors } from '../student/validation'
import type { ProfileUpdate, Session, SignUpInput, StudentProfile } from './session'

/** Browser-only demonstration accounts. The server must replace this entire store. */
interface StoredAccount {
  id: string
  name: string
  email: string
  institutionId: string
  role: Role
  candidateId: CandidateId
  salt: string
  passwordHash: string
  /** Students only; absent on accounts saved before profiles existed. Demo-only data. */
  profile?: StudentProfile
}

const accountsKey = 'simcare-demo-accounts-v1'
const signedInKey = 'simcare-demo-signed-in-v1'

function loadAccounts(): StoredAccount[] {
  try {
    const value = JSON.parse(localStorage.getItem(accountsKey) ?? '[]') as unknown
    return Array.isArray(value) ? (value as StoredAccount[]) : []
  } catch {
    return []
  }
}

function toSession(account: StoredAccount): Session {
  return {
    accountId: account.id,
    name: account.name,
    email: account.email,
    institutionId: account.institutionId,
    role: account.role,
    roles: [account.role],
    candidateId: account.candidateId,
    ...(account.profile ? { profile: { ...account.profile } } : {}),
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(accountsKey, JSON.stringify(accounts))
}

/** Field order used to report the first problem as one message. */
const errorOrder: (keyof StudentProfileErrors)[] = [
  'name',
  'studentId',
  'email',
  'programme',
  'yearOfStudy',
  'paperCode',
]

function throwFirstError(errors: StudentProfileErrors) {
  const field = errorOrder.find((key) => errors[key])
  if (field) throw new Error(errors[field])
}

/** Checks a student's programme selection; throws the first problem. */
function checkStudent(
  fields: { name: string; email: string; studentId: string; profile?: StudentProfile },
  requireIdentity: boolean,
) {
  throwFirstError(
    validateStudentProfile(
      {
        name: fields.name,
        email: fields.email,
        studentId: fields.studentId,
        programme: fields.profile?.programme ?? '',
        yearOfStudy: fields.profile ? String(fields.profile.yearOfStudy) : '',
        paperCode: fields.profile?.paperCode ?? '',
      },
      { requireIdentity },
    ),
  )
}

/** Copies only the known profile fields, so nothing else can be smuggled in. */
const cleanProfile = (profile: StudentProfile): StudentProfile => ({
  programme: profile.programme,
  yearOfStudy: Number(profile.yearOfStudy),
  paperCode: profile.paperCode,
})

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
}

async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', iterations: 150_000, salt: new Uint8Array(salt) },
    key,
    256,
  )
  return toBase64(new Uint8Array(bits))
}

function equalHashes(left: string, right: string): boolean {
  if (left.length !== right.length) return false
  let difference = 0
  for (let i = 0; i < left.length; i += 1) difference |= left.charCodeAt(i) ^ right.charCodeAt(i)
  return difference === 0
}

export function restoreSession(): Session | null {
  try {
    const id = sessionStorage.getItem(signedInKey)
    const account = loadAccounts().find((item) => item.id === id)
    return account ? toSession(account) : null
  } catch {
    return null
  }
}

export async function registerDemoAccount(input: SignUpInput): Promise<Session> {
  const name = input.name.trim()
  const email = normaliseEmail(input.email)
  const institutionId = input.institutionId.trim()
  if (input.role !== 'candidate' && input.role !== 'educator') throw new Error('Choose a role.')
  if (input.role === 'candidate') {
    checkStudent({ name, email, studentId: institutionId, profile: input.profile }, true)
  } else {
    if (!name) throw new Error('Enter your full name.')
    const emailError = validateEducatorEmail(email)
    if (emailError) throw new Error(emailError)
  }
  if (input.role === 'educator' && !/^[a-zA-Z0-9-]{3,20}$/.test(institutionId)) {
    throw new Error('Staff ID must contain 3 to 20 letters, numbers, or hyphens.')
  }
  if (input.password.length < 8) throw new Error('Password must have at least 8 characters.')

  const accounts = loadAccounts()
  if (accounts.some((account) => account.email === email)) {
    throw new Error('An account with this email already exists. Sign in instead.')
  }
  if (
    accounts.some(
      (account) => account.role === input.role && account.institutionId === institutionId,
    )
  ) {
    throw new Error('An account with this ID already exists. Sign in instead.')
  }

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const account: StoredAccount = {
    id: crypto.randomUUID(),
    name,
    email,
    institutionId,
    role: input.role,
    candidateId: input.role === 'candidate' ? `student-${institutionId}` : 'candidate-01',
    salt: toBase64(salt),
    passwordHash: await hashPassword(input.password, salt),
    ...(input.role === 'candidate' && input.profile
      ? { profile: cleanProfile(input.profile) }
      : {}),
  }
  try {
    saveAccounts([...accounts, account])
    sessionStorage.setItem(signedInKey, account.id)
  } catch {
    throw new Error('This browser could not save the demo account. Check storage settings.')
  }
  return toSession(account)
}

export async function signInDemoAccount(emailInput: string, password: string): Promise<Session> {
  const email = emailInput.trim().toLowerCase()
  const account = loadAccounts().find((item) => item.email === email)
  const invalid = 'Email or password is incorrect.'
  if (!account) throw new Error(invalid)
  const hash = await hashPassword(password, fromBase64(account.salt))
  if (!equalHashes(hash, account.passwordHash)) throw new Error(invalid)
  try {
    sessionStorage.setItem(signedInKey, account.id)
  } catch {
    throw new Error('This browser could not start a demo session. Check storage settings.')
  }
  return toSession(account)
}

/**
 * Saves a student's name and programme details. Role, email and student ID are
 * never read from the update, so a student cannot change their permissions here.
 */
export function updateDemoProfile(accountId: string, update: ProfileUpdate): Session {
  const accounts = loadAccounts()
  const index = accounts.findIndex((item) => item.id === accountId)
  if (index === -1) throw new Error('Your demo account could not be found. Sign in again.')
  const account = accounts[index]
  if (account.role !== 'candidate') throw new Error('Only student accounts have a student profile.')

  const name = update.name.trim()
  checkStudent(
    { name, email: account.email, studentId: account.institutionId, profile: update.profile },
    false,
  )

  const updated: StoredAccount = { ...account, name, profile: cleanProfile(update.profile) }
  const next = [...accounts]
  next[index] = updated
  try {
    saveAccounts(next)
  } catch {
    throw new Error('This browser could not save your profile. Check storage settings.')
  }
  return toSession(updated)
}

export function signOutDemoAccount() {
  sessionStorage.removeItem(signedInKey)
}

export function candidateDisplayName(id: CandidateId): string {
  if (id === 'candidate-01') return 'Candidate 01'
  if (id === 'candidate-02') return 'Candidate 02'
  const account = loadAccounts().find((item) => item.candidateId === id)
  return account?.name ?? id
}
