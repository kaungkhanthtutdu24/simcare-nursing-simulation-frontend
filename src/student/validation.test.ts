import { describe, expect, it } from 'vitest'
import {
  normaliseEmail,
  validateEducatorEmail,
  validateFullName,
  validateStudentEmail,
  validateStudentId,
  validateStudentProfile,
} from './validation'
import type { StudentProfileInput } from './validation'

const STUDENT_EMAIL_MESSAGE =
  'Use your University of Waikato student email, ending in @students.waikato.ac.nz.'

const valid: StudentProfileInput = {
  name: 'Aroha Williams',
  email: 'aroha.w@students.waikato.ac.nz',
  studentId: '1686173',
  programme: 'bnurs',
  yearOfStudy: '2',
  paperCode: 'NURSE204',
}

describe('normaliseEmail', () => {
  it('trims surrounding whitespace and lower-cases', () => {
    expect(normaliseEmail('  A.B@Students.Waikato.ac.nz ')).toBe('a.b@students.waikato.ac.nz')
  })
})

describe('validateStudentEmail', () => {
  it.each([
    'aroha.w@students.waikato.ac.nz',
    '  A.B@Students.Waikato.ac.nz ',
    'ab12+sim@students.waikato.ac.nz',
  ])('accepts %s', (email) => {
    expect(validateStudentEmail(email)).toBeNull()
  })

  it.each([
    'x@students.waikato.ac.nz.evil.com',
    'x@waikato.ac.nz',
    'x@students-waikato.ac.nz',
    'x@studentswaikato.ac.nz',
    '@students.waikato.ac.nz',
    'a b@students.waikato.ac.nz',
    'x@gmail.com',
    '',
  ])('rejects %j with a helpful message', (email) => {
    expect(validateStudentEmail(email)).toBe(STUDENT_EMAIL_MESSAGE)
  })
})

describe('validateEducatorEmail', () => {
  it('accepts a staff address on any domain', () => {
    expect(validateEducatorEmail('lecturer@waikato.ac.nz')).toBeNull()
  })

  it('rejects text that is not an email', () => {
    expect(validateEducatorEmail('nope')).toBe('Enter a valid email address.')
  })
})

describe('validateStudentId', () => {
  it('accepts 6 to 10 digits', () => {
    expect(validateStudentId(' 1686173 ')).toBeNull()
  })

  it.each(['12345', '12a4567', '12345678901'])('rejects %s', (id) => {
    expect(validateStudentId(id)).toBe('Student ID must contain 6 to 10 digits, such as 1686173.')
  })
})

describe('validateFullName', () => {
  it('rejects a blank name', () => {
    expect(validateFullName('   ')).toBe('Enter your full name.')
  })

  it('accepts a name with surrounding spaces', () => {
    expect(validateFullName('  Aroha Williams ')).toBeNull()
  })
})

describe('validateStudentProfile', () => {
  it('returns no errors for a valid profile', () => {
    expect(validateStudentProfile(valid)).toEqual({})
  })

  it('reports every missing selection', () => {
    expect(
      validateStudentProfile({ ...valid, programme: '', yearOfStudy: '', paperCode: '' }),
    ).toEqual({
      programme: 'Choose your nursing programme.',
      yearOfStudy: 'Choose your year of study.',
      paperCode: 'Choose a course or paper.',
    })
  })

  it('rejects a year that the programme does not have', () => {
    expect(validateStudentProfile({ ...valid, yearOfStudy: '4' }).yearOfStudy).toBe(
      'Choose your year of study.',
    )
  })

  it('rejects a paper that is not offered in the chosen year', () => {
    expect(
      validateStudentProfile({ ...valid, yearOfStudy: '1', paperCode: 'NURSE204' }).paperCode,
    ).toBe('Choose a course or paper.')
  })

  it('skips email and student ID when identity is not required', () => {
    expect(
      validateStudentProfile(
        { ...valid, email: 'old@gmail.com', studentId: '' },
        { requireIdentity: false },
      ),
    ).toEqual({})
  })
})
