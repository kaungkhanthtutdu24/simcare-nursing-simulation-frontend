import { findProgramme, papersFor, yearsFor } from './programmes'

/**
 * Field validation for student accounts. Shared by the forms and by the demo
 * account store, so a bypassed form still cannot save an invalid account.
 *
 * Checking the email format does NOT prove the person owns the address. Real
 * ownership needs a verification step on the backend.
 */

export const STUDENT_EMAIL_DOMAIN = 'students.waikato.ac.nz'

const studentEmailPattern = /^[a-z0-9._%+-]+@students\.waikato\.ac\.nz$/
const genericEmailPattern = /^\S+@\S+\.\S+$/
const studentIdPattern = /^\d{6,10}$/

export const messages = {
  name: 'Enter your full name.',
  studentId: 'Student ID must contain 6 to 10 digits, such as 1686173.',
  studentEmail: 'Use your University of Waikato student email, ending in @students.waikato.ac.nz.',
  educatorEmail: 'Enter a valid email address.',
  programme: 'Choose your nursing programme.',
  yearOfStudy: 'Choose your year of study.',
  paperCode: 'Choose a course or paper.',
} as const

export function normaliseEmail(value: string): string {
  return value.trim().toLowerCase()
}

export function validateFullName(value: string): string | null {
  const length = value.trim().length
  return length >= 2 && length <= 100 ? null : messages.name
}

export function validateStudentId(value: string): string | null {
  return studentIdPattern.test(value.trim()) ? null : messages.studentId
}

export function validateStudentEmail(value: string): string | null {
  return studentEmailPattern.test(normaliseEmail(value)) ? null : messages.studentEmail
}

export function validateEducatorEmail(value: string): string | null {
  return genericEmailPattern.test(normaliseEmail(value)) ? null : messages.educatorEmail
}

export interface StudentProfileInput {
  name: string
  email: string
  studentId: string
  programme: string
  yearOfStudy: string
  paperCode: string
}

export type StudentProfileErrors = Partial<Record<keyof StudentProfileInput, string>>

export function validateStudentProfile(
  input: StudentProfileInput,
  { requireIdentity = true }: { requireIdentity?: boolean } = {},
): StudentProfileErrors {
  const errors: StudentProfileErrors = {}
  const add = (field: keyof StudentProfileInput, message: string | null) => {
    if (message) errors[field] = message
  }

  add('name', validateFullName(input.name))
  if (requireIdentity) {
    add('studentId', validateStudentId(input.studentId))
    add('email', validateStudentEmail(input.email))
  }

  const programmeOk = Boolean(findProgramme(input.programme))
  const yearOk =
    programmeOk && yearsFor(input.programme).some((y) => String(y.year) === input.yearOfStudy)
  const paperOk =
    yearOk && papersFor(input.programme, input.yearOfStudy).some((p) => p.code === input.paperCode)

  if (!programmeOk) errors.programme = messages.programme
  if (!yearOk) errors.yearOfStudy = messages.yearOfStudy
  if (!paperOk) errors.paperCode = messages.paperCode
  return errors
}
